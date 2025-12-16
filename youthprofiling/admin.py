from django.contrib import admin
from django import forms
from django.conf import settings
from django.utils.html import format_html
from cryptography.fernet import Fernet, InvalidToken
import base64
from .models import YouthUser, OTPVerification, AuditLog, UserLog, UserArchive
from django.utils import timezone
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django import forms
from cryptography.fernet import Fernet, InvalidToken
import base64
from .models import YouthUser, UserLog, UserArchive, AuditLog, CommunityPoints, PointsHistory, UserNotification,AttendanceViolation

fernet = Fernet(settings.ENCRYPTION_KEY)

class DecryptionForm(forms.Form):
    """Form for entering decryption key in admin"""
    decryption_key = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Enter decryption key'}),
        help_text="Enter the decryption key to view clean data"
    )

class YouthUserAdmin(admin.ModelAdmin):
    # Fixed list_display: All methods are defined in the admin class
    list_display = ('registration_no', 'get_full_name', 'email', 'get_age_group', 
                    'get_waitlist_status', 'get_email_verified', 'get_admin_verified', 
                    'get_is_active', 'get_community_points', 'get_no_show_count', 
                    'get_last_no_show_date', 'admin_verification_actions')
    
    # Fixed list_filter: Using proper Django admin lookup strings
    list_filter = ('waitlist_status', 'is_email_verified', 'is_admin_verified', 
                   'is_active', 'age_group', 'civil_status', 'work_status', 
                   'gender', 'purok_zone', 'no_show_count')
    
    search_fields = ('username', 'email', 'first_name', 'last_name', 'registration_no')
    
    # Fixed readonly_fields: Only include actual model fields or custom admin methods
    readonly_fields = ('registration_no', 'created_at', 'updated_at', 'last_login',
                      'email_verification_date', 'admin_verification_date',
                      'no_show_count', 'last_no_show_date', 'waitlist_date',
                      'get_encrypted_data_display', 'get_community_points_admin',
                      'get_violation_count', 'get_violation_history',
                      'get_is_email_verified', 'get_is_admin_verified')
    
    fieldsets = (
        ('Login Credentials', {
            'fields': ('username', 'email', 'password')
        }),
        ('Personal Information', {
            'fields': ('registration_no', 'get_encrypted_data_display')
        }),
        ('Demographic Information', {
            'fields': ('gender', 'age', 'age_group', 'civil_status', 'education', 
                      'youth_classification', 'work_status', 'sk_voter')
        }),
        ('Contact Information', {
            'fields': ('purok_zone', 'contact_number')
        }),
        ('Waitlist Status', {
            'fields': ('waitlist_status', 'waitlist_reason', 'waitlist_date')
        }),
        ('Attendance Tracking', {
            'fields': ('no_show_count', 'last_no_show_date', 'get_violation_count', 'get_violation_history'),
            'classes': ('collapse',)
        }),
        ('Parent Consent Information (Ages 15-17)', {
            'fields': ('parent_name', 'parent_relationship', 'parent_contact_number', 
                      'consent_date', 'parent_consent_letter', 'parent_id_picture'),
            'classes': ('collapse',)
        }),
        ('Verification Status', {
            'fields': ('is_email_verified', 'email_verification_date', 
                      'is_admin_verified', 'admin_verification_date', 'is_active')
        }),
        ('Community Points', {
            'fields': ('get_community_points_admin',)
        }),
        ('Documents', {
            'fields': ('profile_picture', 'id_type', 'id_picture', 'birth_certificate')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_login')
        }),
    )
    
    actions = ['verify_selected_users', 'unverify_selected_users', 
               'activate_selected_users', 'deactivate_selected_users',
               'archive_and_delete_selected_users', 'add_points_to_users',
               'deduct_points_from_users', 'reset_no_show_counts',
               'add_to_waitlist', 'remove_from_waitlist', 'approve_waitlist',
               'reject_waitlist', 'request_more_info_waitlist',
               'add_no_show_offense', 'clear_attendance_violations']
    
    # Custom methods for list_display
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'
    get_full_name.admin_order_field = 'first_name'
    
    def get_age_group(self, obj):
        return obj.age_group
    get_age_group.short_description = 'Age Group'
    get_age_group.admin_order_field = 'age_group'
    
    def get_waitlist_status(self, obj):
        if obj.waitlist_status:
            status_display = dict(obj.WAITLIST_STATUS_CHOICES).get(obj.waitlist_status, obj.waitlist_status)
            colors = {
                'pending': 'orange',
                'approved': 'green',
                'rejected': 'red',
                'needs_info': 'blue'
            }
            color = colors.get(obj.waitlist_status, 'black')
            return format_html('<span style="color: {};">{}</span>', color, status_display)
        return '-'
    get_waitlist_status.short_description = 'Waitlist Status'
    get_waitlist_status.admin_order_field = 'waitlist_status'
    
    def get_email_verified(self, obj):
        color = 'green' if obj.is_email_verified else 'red'
        text = 'Yes' if obj.is_email_verified else 'No'
        return format_html('<span style="color: {};">{}</span>', color, text)
    get_email_verified.short_description = 'Email Verified'
    get_email_verified.admin_order_field = 'is_email_verified'
    
    def get_admin_verified(self, obj):
        color = 'green' if obj.is_admin_verified else 'red'
        text = 'Yes' if obj.is_admin_verified else 'No'
        return format_html('<span style="color: {};">{}</span>', color, text)
    get_admin_verified.short_description = 'Admin Verified'
    get_admin_verified.admin_order_field = 'is_admin_verified'
    
    def get_is_active(self, obj):
        color = 'green' if obj.is_active else 'red'
        text = 'Active' if obj.is_active else 'Inactive'
        return format_html('<span style="color: {};">{}</span>', color, text)
    get_is_active.short_description = 'Status'
    get_is_active.admin_order_field = 'is_active'
    
    def get_community_points(self, obj):
        points = obj.community_points
        color = 'green' if points >= 0 else 'red'
        return format_html('<span style="color: {};">{}</span>', color, points)
    get_community_points.short_description = 'Points'
    
    def get_no_show_count(self, obj):
        color = 'red' if obj.no_show_count > 0 else 'green'
        return format_html('<span style="color: {};">{}</span>', color, obj.no_show_count)
    get_no_show_count.short_description = 'No-Show Count'
    get_no_show_count.admin_order_field = 'no_show_count'
    
    def get_last_no_show_date(self, obj):
        if obj.last_no_show_date:
            return obj.last_no_show_date.strftime('%Y-%m-%d %H:%M')
        return '-'
    get_last_no_show_date.short_description = 'Last No-Show'
    get_last_no_show_date.admin_order_field = 'last_no_show_date'
    
    def get_is_email_verified(self, obj):
        return 'Yes' if obj.is_email_verified else 'No'
    get_is_email_verified.short_description = 'Email Verified (Display)'
    
    def get_is_admin_verified(self, obj):
        return 'Yes' if obj.is_admin_verified else 'No'
    get_is_admin_verified.short_description = 'Admin Verified (Display)'
    
    def get_community_points_admin(self, obj):
        points = obj.community_points
        color = 'green' if points >= 0 else 'red'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, points)
    get_community_points_admin.short_description = 'Community Points'
    
    def get_violation_count(self, obj):
        count = AttendanceViolation.objects.filter(user=obj).count()
        return format_html(
            '<span style="color: {};">{}</span>',
            'red' if count > 0 else 'green',
            count
        )
    get_violation_count.short_description = 'Attendance Violations'
    
    def get_violation_history(self, obj):
        violations = AttendanceViolation.objects.filter(user=obj).order_by('-violation_date')
        if not violations:
            return "No attendance violations"
        
        html = '<div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px;">'
        html += '<table style="width: 100%; font-size: 0.9em;">'
        html += '<tr><th>Date</th><th>Type</th><th>Event</th></tr>'
        
        for violation in violations:
            event_info = violation.event_registration.event.title if violation.event_registration and violation.event_registration.event else "N/A"
            html += f'<tr>'
            html += f'<td>{violation.created_at.strftime("%Y-%m-%d %H:%M")}</td>'
            html += f'<td><span style="color: {"orange" if violation.violation_type == "first_offense" else "red" if violation.violation_type == "second_offense" else "darkred"}">{violation.get_violation_type_display()}</span></td>'
            html += f'<td>{event_info}</td>'
            html += f'</tr>'
        
        html += '</table></div>'
        return format_html(html)
    get_violation_history.short_description = 'Violation History'
    
    def admin_verification_actions(self, obj):
        return format_html(
            '<div class="verification-actions">'
            '<form method="post" action="" style="display:inline;">'
            '<input type="hidden" name="action" value="verify_user">'
            '<input type="hidden" name="user_id" value="{}">'
            '<button type="submit" class="button" {}>Verify</button>'
            '</form>'
            '<form method="post" action="" style="display:inline; margin-left:5px;">'
            '<input type="hidden" name="action" value="unverify_user">'
            '<input type="hidden" name="user_id" value="{}">'
            '<button type="submit" class="button" {}>Unverify</button>'
            '</form>'
            '</div>',
            obj.id,
            'disabled' if obj.is_admin_verified else '',
            obj.id,
            'disabled' if not obj.is_admin_verified else ''
        )
    admin_verification_actions.short_description = 'Verification Actions'
    
    def get_encrypted_data_display(self, obj):
        decryption_key = getattr(self, '_decryption_key', None)
        
        if decryption_key:
            try:
                temp_fernet = Fernet(decryption_key.encode())
                decrypted_data = {}
                encrypted_fields = ['first_name', 'last_name', 'middle_name', 'suffix', 'address', 'birthdate', 'contact_number', 'parent_name', 'parent_contact_number']
                
                for field in encrypted_fields:
                    value = getattr(obj, field)
                    if value:
                        try:
                            if not value.startswith('gAAAAA'):
                                decrypted_data[field] = value
                            else:
                                decoded_value = base64.urlsafe_b64decode(value)
                                decrypted_value = temp_fernet.decrypt(decoded_value).decode()
                                decrypted_data[field] = decrypted_value
                        except (InvalidToken, ValueError, TypeError):
                            decrypted_data[field] = "Decryption failed"
                    else:
                        decrypted_data[field] = "Not provided"
                
                result = "<div style='background-color: #f0f8ff; padding: 10px; border-radius: 5px;'>"
                result += "<h4>Decrypted Data (Using Provided Key)</h4>"
                field_labels = {
                    'first_name': 'First Name',
                    'last_name': 'Last Name',
                    'middle_name': 'Middle Name',
                    'suffix': 'Suffix',
                    'address': 'Address',
                    'birthdate': 'Birthdate',
                    'contact_number': 'Contact Number',
                    'parent_name': 'Parent Name',
                    'parent_contact_number': 'Parent Contact',
                }
                
                for field, value in decrypted_data.items():
                    result += f"<p><strong>{field_labels[field]}:</strong> {value}</p>"
                result += "</div>"
                return format_html(result)
                
            except Exception as e:
                return format_html(f"<div style='color: red;'>Decryption error: {str(e)}</div>")
        else:
            form = DecryptionForm()
            return format_html(f"""
            <div style='background-color: #fff3cd; padding: 10px; border-radius: 5px;'>
                <h4>Encrypted Data</h4>
                <p>Data is encrypted for security. To view decrypted data:</p>
                <form method="post" action="">
                    <input type="hidden" name="action" value="decrypt">
                    {form.as_p()}
                    <button type="submit" class="button">Decrypt Data</button>
                </form>
                <p style='margin-top: 10px; font-size: 0.9em; color: #856404;'>
                    <strong>Note:</strong> You need the correct decryption key to view clean data.
                </p>
            </div>
            """)
    get_encrypted_data_display.short_description = 'Encrypted Personal Data'
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        if request.method == 'POST':
            if 'action' in request.POST:
                action = request.POST.get('action')
                user_id = request.POST.get('user_id')
                
                if action == 'verify_user' and user_id:
                    try:
                        user = YouthUser.objects.get(id=user_id)
                        user.is_admin_verified = True
                        user.admin_verification_date = timezone.now()
                        user.save()
                        self.message_user(request, f"User {user.registration_no} has been verified.")
                    except YouthUser.DoesNotExist:
                        self.message_user(request, "User not found.", level='error')
                
                elif action == 'unverify_user' and user_id:
                    try:
                        user = YouthUser.objects.get(id=user_id)
                        user.is_admin_verified = False
                        user.admin_verification_date = None
                        user.save()
                        self.message_user(request, f"User {user.registration_no} has been unverified.")
                    except YouthUser.DoesNotExist:
                        self.message_user(request, "User not found.", level='error')
                
                elif action == 'decrypt':
                    decryption_key = request.POST.get('decryption_key', '')
                    if decryption_key:
                        self._decryption_key = decryption_key
                        self.message_user(request, "Decryption key applied. Data will be decrypted on page refresh.")
        
        return super().change_view(request, object_id, form_url, extra_context=extra_context)
    
    def verify_selected_users(self, request, queryset):
        updated = queryset.update(is_admin_verified=True, admin_verification_date=timezone.now())
        self.message_user(request, f"{updated} users have been verified.")
    verify_selected_users.short_description = "Verify selected users"
    
    def unverify_selected_users(self, request, queryset):
        updated = queryset.update(is_admin_verified=False, admin_verification_date=None)
        self.message_user(request, f"{updated} users have been unverified.")
    unverify_selected_users.short_description = "Unverify selected users"
    
    def activate_selected_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} users have been activated.")
    activate_selected_users.short_description = "Activate selected users"
    
    def deactivate_selected_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} users have been deactivated.")
    deactivate_selected_users.short_description = "Deactivate selected users"
    
    def add_no_show_offense(self, request, queryset):
        count = 0
        for user in queryset:
            user.add_no_show_offense()
            count += 1
        self.message_user(request, f"Added no-show offense to {count} users.")
    add_no_show_offense.short_description = "Add no-show offense to selected users"
    
    def clear_attendance_violations(self, request, queryset):
        count = 0
        for user in queryset:
            user.no_show_count = 0
            user.last_no_show_date = None
            user.save()
            AttendanceViolation.objects.filter(user=user).delete()
            count += 1
        self.message_user(request, f"Cleared attendance violations for {count} users.")
    clear_attendance_violations.short_description = "Clear attendance violations for selected users"
    
    def add_to_waitlist(self, request, queryset):
        reason = request.POST.get('waitlist_reason', 'Added to waitlist by admin')
        count = 0
        for user in queryset:
            user.add_to_waitlist(reason=reason)
            count += 1
        self.message_user(request, f"{count} users have been added to waitlist.")
    add_to_waitlist.short_description = "Add to waitlist"
    
    def remove_from_waitlist(self, request, queryset):
        count = 0
        for user in queryset:
            user.remove_from_waitlist()
            count += 1
        self.message_user(request, f"{count} users have been removed from waitlist.")
    remove_from_waitlist.short_description = "Remove from waitlist"
    
    def approve_waitlist(self, request, queryset):
        count = 0
        for user in queryset:
            if user.is_on_waitlist:
                user.approve_waitlist()
                count += 1
        self.message_user(request, f"{count} waitlisted users have been approved.")
    approve_waitlist.short_description = "Approve waitlisted users"
    
    def reject_waitlist(self, request, queryset):
        reason = request.POST.get('rejection_reason', 'Rejected by admin')
        count = 0
        for user in queryset:
            if user.is_on_waitlist:
                user.reject_waitlist(reason=reason)
                count += 1
        self.message_user(request, f"{count} waitlisted users have been rejected.")
    reject_waitlist.short_description = "Reject waitlisted users"
    
    def request_more_info_waitlist(self, request, queryset):
        reason = request.POST.get('info_request_reason', 'More information needed')
        count = 0
        for user in queryset:
            if user.is_on_waitlist:
                user.request_more_info_waitlist(reason=reason)
                count += 1
        self.message_user(request, f"{count} waitlisted users have been requested for more information.")
    request_more_info_waitlist.short_description = "Request more info for waitlisted users"
    
    def add_points_to_users(self, request, queryset):
        points = request.POST.get('points', 100)
        try:
            points = int(points)
            for user in queryset:
                community_points, created = CommunityPoints.objects.get_or_create(
                    user=user,
                    defaults={'points': 100}
                )
                community_points.add_points(points, "Added by admin")
            self.message_user(request, f"Added {points} points to {queryset.count()} users.")
        except ValueError:
            self.message_user(request, "Invalid points value.", level='error')
    add_points_to_users.short_description = "Add points to selected users"
    
    def deduct_points_from_users(self, request, queryset):
        points = request.POST.get('points', 10)
        try:
            points = int(points)
            success_count = 0
            for user in queryset:
                try:
                    community_points = CommunityPoints.objects.get(user=user)
                    community_points.deduct_points(points, "Deducted by admin")
                    success_count += 1
                except CommunityPoints.DoesNotExist:
                    pass
            self.message_user(request, f"Deducted {points} points from {success_count} users.")
        except ValueError:
            self.message_user(request, "Invalid points value.", level='error')
    deduct_points_from_users.short_description = "Deduct points from selected users"
    
    def reset_no_show_counts(self, request, queryset):
        updated = queryset.update(no_show_count=0, last_no_show_date=None)
        AttendanceViolation.objects.filter(user__in=queryset).delete()
        self.message_user(request, f"Reset no-show counts and cleared violations for {updated} users.")
    reset_no_show_counts.short_description = "Reset no-show counts for selected users"
    
    def delete_model(self, request, obj):
        from .utils import archive_user_before_deletion
        archive_user_before_deletion(obj, deleted_by=request.user.username, reason='Deleted by admin')
        super().delete_model(request, obj)
    
    def delete_queryset(self, request, queryset):
        from .utils import archive_user_before_deletion
        for obj in queryset:
            archive_user_before_deletion(obj, deleted_by=request.user.username, reason='Bulk deleted by admin')
        super().delete_queryset(request, queryset)
    
    def archive_and_delete_selected_users(self, request, queryset):
        from .utils import archive_user_before_deletion
        count = 0
        for user in queryset:
            try:
                archive_user_before_deletion(user, deleted_by=request.user.username, reason='Archived and deleted by admin')
                user.delete()
                count += 1
            except Exception as e:
                self.message_user(request, f"Error archiving user {user.username}: {str(e)}", level='error')
        
        self.message_user(request, f"{count} users have been archived and deleted.")
    archive_and_delete_selected_users.short_description = "Archive and delete selected users"
    
    def save_model(self, request, obj, form, change):
        if change:
            action = 'UPDATE'
        else:
            action = 'CREATE'
            
        AuditLog.objects.create(
            admin_user=request.user,
            youth_user=obj,
            action=action,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        super().save_model(request, obj, form, change)


admin.site.register(YouthUser, YouthUserAdmin)
    


@admin.register(CommunityPoints)
class CommunityPointsAdmin(admin.ModelAdmin):
    list_display = ('user', 'points', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'points')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(PointsHistory)
class PointsHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'points_change', 'new_balance', 'reason', 'created_at')
    list_filter = ('created_at', 'points_change')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'reason')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Transaction Information', {
            'fields': ('user', 'points_change', 'new_balance', 'reason')
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )

class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_verified', 'attempts', 'created_at', 'expires_at', 'is_expired')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('email',)
    readonly_fields = ('otp_code', 'created_at', 'expires_at', 'is_expired')
    
    def is_expired(self, obj):
        return obj.is_expired()
    is_expired.boolean = True
    is_expired.short_description = 'Expired'

class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'youth_user', 'youth_admin', 'admin_user', 'timestamp', 'ip_address')
    list_filter = ('action', 'timestamp')
    search_fields = (
        'youth_user__username',
        'youth_admin__username',
        'admin_user__username',
    )
    readonly_fields = (
        'youth_user',
        'youth_admin',
        'admin_user',
        'action',
        'timestamp',
        'ip_address',
        'user_agent',
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    


@admin.register(UserLog)
class UserLogAdmin(admin.ModelAdmin):
    list_display = ('username', 'login_type', 'success', 'ip_address', 'timestamp')
    list_filter = ('login_type', 'success', 'timestamp')
    search_fields = ('username', 'ip_address')
    readonly_fields = ('youth_user', 'username', 'login_type', 'ip_address', 
                      'user_agent', 'timestamp', 'success', 'failure_reason')
    date_hierarchy = 'timestamp'

@admin.register(UserArchive)
class UserArchiveAdmin(admin.ModelAdmin):
    list_display = ('original_user_id', 'archived_by', 'archived_at')
    list_filter = ('archived_by', 'archived_at')
    search_fields = ('original_user_id', 'archived_by')
    readonly_fields = ('original_user_id', 'archived_by', 'archived_at', 
                      'user_data', 'profile_picture_path', 'id_picture_path',
                      'birth_certificate_path', 'parent_consent_letter_path',
                      'parent_id_picture_path', 'deletion_reason')
    date_hierarchy = 'archived_at'

from django.contrib import admin
from .models import PasswordResetToken, OTPVerification

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at', 'expires_at', 'is_used', 'is_expired')
    list_filter = ('is_used', 'created_at', 'expires_at')
    search_fields = ('user__email', 'token')
    readonly_fields = ('created_at', 'expires_at', 'token')

    def is_expired(self, obj):
        return obj.is_expired()
    is_expired.boolean = True
    is_expired.short_description = 'Expired?'








admin.site.register(OTPVerification, OTPVerificationAdmin)
admin.site.register(AuditLog, AuditLogAdmin)

from .models import YouthAdmin

class YouthAdminAdmin(admin.ModelAdmin):
    list_display = ('username', 'get_full_name', 'email', 'role', 'is_active', 'last_login')
    list_filter = ('role', 'is_active', 'is_super_admin', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    readonly_fields = ('date_joined', 'last_login', 'get_encrypted_data_display')
    
    fieldsets = (
        ('Login Credentials', {
            'fields': ('username', 'email', 'password')
        }),
        ('Personal Information', {
            'fields': ('get_encrypted_data_display', 'first_name', 'last_name', 'middle_name')
        }),
        ('Admin Details', {
            'fields': ('role', 'department', 'contact_number', 'profile_picture')
        }),
        ('Permissions', {
            'fields': ('is_super_admin', 'can_manage_users', 'can_manage_announcements', 
                      'can_manage_events', 'can_view_reports', 'can_manage_settings')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('date_joined', 'last_login')
        }),
    )
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'
    
    def get_encrypted_data_display(self, obj):
        """Display encrypted data with decryption option (similar to YouthUser)"""
        decryption_key = getattr(self, '_decryption_key', None)
        
        if decryption_key:
            try:
                temp_fernet = Fernet(decryption_key.encode())
                decrypted_data = {}
                encrypted_fields = ['first_name', 'last_name', 'middle_name', 'contact_number']
                
                for field in encrypted_fields:
                    value = getattr(obj, field)
                    if value:
                        try:
                            if not value.startswith('gAAAAA'):
                                decrypted_data[field] = value
                            else:
                                decoded_value = base64.urlsafe_b64decode(value)
                                decrypted_value = temp_fernet.decrypt(decoded_value).decode()
                                decrypted_data[field] = decrypted_value
                        except (InvalidToken, ValueError, TypeError):
                            decrypted_data[field] = "Decryption failed"
                    else:
                        decrypted_data[field] = "Not provided"
                
                result = "<div style='background-color: #f0f8ff; padding: 10px; border-radius: 5px;'>"
                result += "<h4>Decrypted Data (Using Provided Key)</h4>"
                field_labels = {
                    'first_name': 'First Name',
                    'last_name': 'Last Name',
                    'middle_name': 'Middle Name',
                    'contact_number': 'Contact Number',
                }
                
                for field, value in decrypted_data.items():
                    result += f"<p><strong>{field_labels[field]}:</strong> {value}</p>"
                result += "</div>"
                return format_html(result)
                
            except Exception as e:
                return format_html(f"<div style='color: red;'>Decryption error: {str(e)}</div>")
        else:
            form = DecryptionForm()
            return format_html(f"""
            <div style='background-color: #fff3cd; padding: 10px; border-radius: 5px;'>
                <h4>Encrypted Data</h4>
                <p>Data is encrypted for security. To view decrypted data:</p>
                <form method="post" action="">
                    <input type="hidden" name="action" value="decrypt">
                    {form.as_p()}
                    <button type="submit" class="button">Decrypt Data</button>
                </form>
                <p style='margin-top: 10px; font-size: 0.9em; color: #856404;'>
                    <strong>Note:</strong> You need the correct decryption key to view clean data.
                </p>
            </div>
            """)
    get_encrypted_data_display.short_description = 'Encrypted Personal Data'

    def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
            obj.set_password(form.cleaned_data['password'])
        
        super().save_model(request, obj, form, change)

admin.site.register(YouthAdmin, YouthAdminAdmin)









from django.contrib import admin
from django import forms
from django.utils.html import format_html
from .models import (
    Gender, CivilStatus, AgeGroup, EducationLevel, YouthClassification, WorkStatus,
    Announcement, Event, EventRegistration, AnnouncementInteraction
)
from .models import CommunityPost, PostLike, PostComment

class GenderAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

class CivilStatusAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

class AgeGroupAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

class EducationLevelAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

class YouthClassificationAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

class WorkStatusAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


class AnnouncementAdminForm(forms.ModelForm):
    class Meta:
        model = Announcement
        fields = '__all__'
        widgets = {
            'excerpt': forms.Textarea(attrs={'rows': 3}),
        }

class EventAdminForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = '__all__'
        widgets = {
            'excerpt': forms.Textarea(attrs={'rows': 3}),
            'description': forms.Textarea(attrs={'rows': 5}),
        }

class AnnouncementAdmin(admin.ModelAdmin):
    form = AnnouncementAdminForm
    list_display = ('title', 'category', 'is_important', 'is_active', 'publish_date', 'created_by')
    list_filter = ('category', 'is_important', 'is_active', 'publish_date')
    search_fields = ('title', 'content', 'excerpt')
    readonly_fields = ('publish_date', 'created_by', 'announcement_image_preview')
    
    exclude = ('created_by',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'content', 'excerpt', 'category', 'image', 'announcement_image_preview')
        }),
        ('Details', {
            'fields': ('location', 'is_important', 'effective_date', 'deadline')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    def announcement_image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 200px; max-width: 200px;" />', obj.image.url)
        return "No image uploaded"
    announcement_image_preview.short_description = 'Image Preview'
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            from .models import YouthAdmin
            try:
                youth_admin = YouthAdmin.objects.get(username=request.user.username)
            except YouthAdmin.DoesNotExist:
                youth_admin = YouthAdmin.objects.create(
                    username=request.user.username,
                    email=request.user.email or f"{request.user.username}@skmambugan.ph",
                    first_name=request.user.first_name or 'Admin',
                    last_name=request.user.last_name or 'User',
                    role='staff',
                    contact_number='00000000000',
                    is_active=True
                )
                youth_admin.set_password('temporary_password_123') 
                youth_admin.save()
            
            obj.created_by = youth_admin
        super().save_model(request, obj, form, change)

class EventAdmin(admin.ModelAdmin):
    form = EventAdminForm
    list_display = ('title', 'category', 'start_date', 'end_date', 'location', 'is_active', 'created_by', 'points_reward')
    list_filter = ('category', 'is_active', 'start_date', 'requires_registration')
    search_fields = ('title', 'description', 'excerpt')
    readonly_fields = ('created_by', 'current_participants', 'event_image_preview', 'seats_available_display')
    
    filter_horizontal = (
        'target_genders', 'target_civil_statuses', 'target_age_groups',
        'target_education_levels', 'target_youth_classifications', 'target_work_statuses'
    )
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'excerpt', 'category', 'image', 'event_image_preview')
        }),
        ('Event Details', {
            'fields': ('start_date', 'end_date', 'location', 'registration_deadline')
        }),
        ('Registration', {
            'fields': ('requires_registration', 'maximum_participants', 'current_participants', 'seats_available_display')
        }),
        ('Target Audience - Gender', {
            'fields': ('gender_access', 'target_genders'),
            'classes': ('collapse',)
        }),
        ('Target Audience - Civil Status', {
            'fields': ('civil_status_access', 'target_civil_statuses'),
            'classes': ('collapse',)
        }),
        ('Target Audience - Age Group', {
            'fields': ('age_group_access', 'target_age_groups'),
            'classes': ('collapse',)
        }),
        ('Target Audience - Education', {
            'fields': ('education_access', 'target_education_levels'),
            'classes': ('collapse',)
        }),
        ('Target Audience - Youth Classification', {
            'fields': ('youth_classification_access', 'target_youth_classifications'),
            'classes': ('collapse',)
        }),
        ('Target Audience - Work Status', {
            'fields': ('work_status_access', 'target_work_statuses'),
            'classes': ('collapse',)
        }),
        ('Age Range', {
            'fields': ('age_min', 'age_max'),
            'classes': ('collapse',)
        }),
        ('Rewards', {
            'fields': ('points_reward',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    def event_image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 200px; max-width: 200px;" />', obj.image.url)
        return "No image uploaded"
    event_image_preview.short_description = 'Image Preview'
    
    def seats_available_display(self, obj):
        seats = obj.seats_available
        if seats is None:
            return "No limit"
        elif seats > 0:
            return format_html('<span style="color: green;">{} seats available</span>', seats)
        else:
            return format_html('<span style="color: red;">Event full</span>')
    seats_available_display.short_description = 'Seats Available'
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            from .models import YouthAdmin
            try:
                youth_admin = YouthAdmin.objects.get(username=request.user.username)
            except YouthAdmin.DoesNotExist:
                youth_admin = YouthAdmin.objects.create(
                    username=request.user.username,
                    email=request.user.email,
                    first_name=request.user.first_name or 'Admin',
                    last_name=request.user.last_name or 'User',
                    role='staff',
                    is_active=True
                )
                youth_admin.set_password('temporary_password')  
                youth_admin.save()
            
            obj.created_by = youth_admin
        super().save_model(request, obj, form, change)

class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ['user', 'event', 'status', 'points_earned', 'registration_date', 'no_show_action']
    list_filter = ['status', 'event']
    actions = ['mark_attended', 'mark_no_show']
    
    def no_show_action(self, obj):
        if obj.status != 'no_show':
            return format_html(
                '<a class="button" href="{}">Mark No Show</a>',
                f"{obj.id}/mark_no_show/"
            )
        return "No Show"
    no_show_action.short_description = 'No Show Action'

    def mark_attended(self, request, queryset):
        for registration in queryset:
            if registration.status != 'attended':
                registration.mark_attended()
        self.message_user(request, f"Marked {queryset.count()} registrations as attended")
    mark_attended.short_description = "Mark selected as attended"

    def mark_no_show(self, request, queryset):
        for registration in queryset:
            if registration.status != 'no_show':
                registration.mark_no_show()
        self.message_user(request, f"Marked {queryset.count()} registrations as no-show")
    mark_no_show.short_description = "Mark selected as no-show"

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('<path:object_id>/mark_no_show/', self.mark_no_show_view, name='mark_no_show'),
        ]
        return custom_urls + urls

    def mark_no_show_view(self, request, object_id):
        from django.http import HttpResponseRedirect
        try:
            registration = EventRegistration.objects.get(id=object_id)
            if registration.status != 'no_show':
                registration.mark_no_show()
                self.message_user(request, f"Marked {registration} as no-show")
            else:
                self.message_user(request, "Registration is already marked as no-show", level='warning')
        except EventRegistration.DoesNotExist:
            self.message_user(request, "Registration not found", level='error')
        
        return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/admin/app/eventregistration/'))

    def save_model(self, request, obj, form, change):
        if change:
            old_obj = EventRegistration.objects.get(pk=obj.pk)
            if old_obj.status != 'attended' and obj.status == 'attended':
                obj.check_in_time = timezone.now()
                if obj.points_earned == 0 and obj.event.points_reward > 0:
                    obj.points_earned = obj.event.points_reward
                    community_points, created = CommunityPoints.objects.get_or_create(
                        user=obj.user,
                        defaults={'points': 100}
                    )
                    community_points.add_points(obj.event.points_reward, f"Event attendance: {obj.event.title}")
            elif old_obj.status == 'attended' and obj.status != 'attended':
                if obj.points_earned > 0:
                    try:
                        community_points = CommunityPoints.objects.get(user=obj.user)
                        community_points.deduct_points(obj.points_earned, f"Status changed from attended: {obj.event.title}")
                    except CommunityPoints.DoesNotExist:
                        pass
                    obj.points_earned = 0
            elif old_obj.status != 'no_show' and obj.status == 'no_show':
                obj.mark_no_show()
                return
            elif old_obj.status == 'no_show' and obj.status != 'no_show':
                no_show_key = f"no_show_{obj.id}"
                if no_show_key in obj.user.shown_modals:
                    del obj.user.shown_modals[no_show_key]
                    obj.user.save()
        super().save_model(request, obj, form, change)

from django.contrib import admin
from .models import EventEvaluation

@admin.register(EventEvaluation)
class EventEvaluationAdmin(admin.ModelAdmin):
    list_display = ['registration', 'rating', 'would_attend_again', 'created_at']
    list_filter = ['rating', 'would_attend_again', 'created_at']
    search_fields = ['registration__user__first_name', 'registration__user__last_name', 'registration__event__title']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('registration__user', 'registration__event')

    


class AnnouncementInteractionAdmin(admin.ModelAdmin):
    list_display = ('announcement', 'user', 'interaction_type', 'created_at')
    list_filter = ('interaction_type', 'created_at')
    search_fields = ('announcement__title', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at',)

class PostLikeInline(admin.TabularInline):
    model = PostLike
    extra = 0
    fields = ('user', 'is_active', 'created_at')
    readonly_fields = ('created_at',)


class PostCommentInline(admin.TabularInline):
    model = PostComment
    extra = 0
    fields = ('user', 'content', 'parent', 'is_active', 'created_at')
    readonly_fields = ('created_at',)


from django.contrib import admin
from django.http import HttpResponseRedirect
from django.contrib import messages

@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'short_content', 'post_type', 'status', 'privacy', 'like_count', 'comment_count', 'created_at')
    list_filter = ('post_type', 'privacy', 'status', 'created_at')
    search_fields = ('content', 'user__first_name', 'user__last_name', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    actions = ['approve_posts', 'reject_posts']

    def short_content(self, obj):
        return (obj.content[:50] + '...') if len(obj.content) > 50 else obj.content
    short_content.short_description = 'Content'

    def approve_posts(self, request, queryset):
        for post in queryset:
            post.status = 'accepted'
            post.save()
            request.session['post_approved'] = True
        self.message_user(request, f"Successfully approved {queryset.count()} posts.")
    approve_posts.short_description = "Approve selected posts"

    def reject_posts(self, request, queryset):
        for post in queryset:
            post.status = 'rejected'
            post.rejection_reason = 'Post violated community guidelines'
            post.save()
            request.session['post_rejected'] = True
            request.session['rejection_reason'] = 'Post violated community guidelines'
        self.message_user(request, f"Successfully rejected {queryset.count()} posts.")
    reject_posts.short_description = "Reject selected posts"

    def response_change(self, request, obj):
        if 'status' in request.POST:
            if request.POST['status'] == 'accepted':
                request.session['post_approved'] = True
            elif request.POST['status'] == 'rejected':
                request.session['post_rejected'] = True
                request.session['rejection_reason'] = obj.rejection_reason or 'Post violated community guidelines'
        return super().response_change(request, obj)


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'user', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('post__content', 'user__username')
    readonly_fields = ('created_at',)


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'user', 'short_content', 'parent', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('content', 'user__username', 'post__content')
    readonly_fields = ('created_at', 'updated_at')

    def short_content(self, obj):
        return (obj.content[:50] + '...') if len(obj.content) > 50 else obj.content
    short_content.short_description = 'Content'

    
admin.site.register(Gender, GenderAdmin)
admin.site.register(CivilStatus, CivilStatusAdmin)
admin.site.register(AgeGroup, AgeGroupAdmin)
admin.site.register(EducationLevel, EducationLevelAdmin)
admin.site.register(YouthClassification, YouthClassificationAdmin)
admin.site.register(WorkStatus, WorkStatusAdmin)
admin.site.register(Announcement, AnnouncementAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(EventRegistration, EventRegistrationAdmin)
admin.site.register(AnnouncementInteraction, AnnouncementInteractionAdmin)


from django.contrib import admin
from .models import (
    EventQuestion, EventRegistrationResponse,
    TrendingTopic, CommunityGuideline, CommentLike
)

@admin.register(EventQuestion)
class EventQuestionAdmin(admin.ModelAdmin):
    list_display = ('event', 'question_text', 'question_type', 'is_required', 'order')
    list_filter = ('question_type', 'is_required')
    search_fields = ('event__title', 'question_text')
    ordering = ('event', 'order')

@admin.register(EventRegistrationResponse)
class EventRegistrationResponseAdmin(admin.ModelAdmin):
    list_display = ('registration', 'question', 'short_response')
    search_fields = ('registration__user__username', 'question__question_text', 'response')
    
    def short_response(self, obj):
        return (obj.response[:50] + '...') if len(obj.response) > 50 else obj.response
    short_response.short_description = "Response"

@admin.register(TrendingTopic)
class TrendingTopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'post_count', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(CommunityGuideline)
class CommunityGuidelineAdmin(admin.ModelAdmin):
    list_display = ('order', 'short_content', 'is_active')
    list_filter = ('is_active',)
    ordering = ('order',)

    def short_content(self, obj):
        return (obj.content[:75] + '...') if len(obj.content) > 75 else obj.content
    short_content.short_description = "Content"

@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'comment', 'user', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('comment__content', 'user__username')
    readonly_fields = ('created_at',)

from django.contrib import admin
from .models import (
    ContactMessage, Complaint, Suggestion,
    SupportTicket, CallbackRequest, FAQ
)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'subject', 'short_message', 'is_read', 'is_archived', 'created_at')
    list_filter = ('subject', 'is_read', 'is_archived', 'created_at')
    search_fields = ('user__username', 'message')
    ordering = ('-created_at',)

    def short_message(self, obj):
        return (obj.message[:50] + "...") if len(obj.message) > 50 else obj.message
    short_message.short_description = "Message"

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user_display', 'urgency', 'status', 'is_anonymous', 'created_at', 'resolved_at')
    list_filter = ('urgency', 'status', 'is_anonymous')
    search_fields = ('title', 'description', 'user__username')
    ordering = ('-created_at',)

    def user_display(self, obj):
        return "Anonymous" if obj.is_anonymous else obj.user.username
    user_display.short_description = "Submitted By"

@admin.register(Suggestion)
class SuggestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user_display', 'status', 'is_anonymous', 'created_at', 'implemented_at')
    list_filter = ('status', 'is_anonymous')
    search_fields = ('title', 'description', 'user__username')
    ordering = ('-created_at',)

    def user_display(self, obj):
        return "Anonymous" if obj.is_anonymous else obj.user.username
    user_display.short_description = "Submitted By"

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'user', 'status', 'priority', 'created_at', 'resolved_at')
    list_filter = ('status', 'priority', 'created_at')
    search_fields = ('subject', 'description', 'user__username')
    ordering = ('-created_at',)

@admin.register(CallbackRequest)
class CallbackRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'phone_number', 'preferred_time', 'is_completed', 'created_at', 'completed_at')
    list_filter = ('preferred_time', 'is_completed')
    search_fields = ('user__username', 'phone_number', 'reason')
    ordering = ('-created_at',)

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'category', 'is_active', 'order', 'created_at')
    list_filter = ('is_active', 'category')
    search_fields = ('question', 'answer')
    ordering = ('order',)


from django.contrib import admin
from .models import UserRegistrationAnalytics, EventParticipationAnalytics


@admin.register(UserRegistrationAnalytics)
class UserRegistrationAnalyticsAdmin(admin.ModelAdmin):
    list_display = ("date", "registrations_count", "created_at", "updated_at")
    list_filter = ("date",)
    search_fields = ("date",)
    ordering = ("-date",)
    date_hierarchy = "date"
    readonly_fields = ("created_at", "updated_at")


@admin.register(EventParticipationAnalytics)
class EventParticipationAnalyticsAdmin(admin.ModelAdmin):
    list_display = ("event", "category", "participation_count", "date_recorded")
    list_filter = ("category", "date_recorded")
    search_fields = ("event__title", "category")
    ordering = ("-date_recorded",)
    date_hierarchy = "date_recorded"


from django.contrib import admin
from .models import EncryptionKeyAttempt


@admin.register(EncryptionKeyAttempt)
class EncryptionKeyAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "admin_user",
        "attempted_key",
        "is_successful",
        "ip_address",
        "timestamp",
    )
    list_filter = ("is_successful", "timestamp")
    search_fields = ("admin_user__username", "attempted_key", "ip_address")
    ordering = ("-timestamp",)
    readonly_fields = ("timestamp",)






from django.contrib import admin
from django.utils import timezone
from django.db.models import Count
from .models import APKDownload, APKVersion, DownloadAnalytics

class APKDownloadAdmin(admin.ModelAdmin):
    list_display = ['ip_address', 'device_type', 'os_name', 'browser_name', 'download_method', 'created_at']
    list_filter = ['device_type', 'os_name', 'browser_name', 'download_method', 'created_at']
    search_fields = ['ip_address', 'user_agent', 'device_brand', 'device_model']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50

class APKVersionAdmin(admin.ModelAdmin):
    list_display = ['version', 'file_size', 'release_date', 'download_count', 'is_active']
    list_filter = ['is_active', 'release_date']
    search_fields = ['version', 'release_notes']
    readonly_fields = ['created_at', 'updated_at', 'download_count']
    list_editable = ['is_active']

class DownloadAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_downloads', 'mobile_downloads', 'desktop_downloads', 'qr_code_downloads', 'button_downloads']
    readonly_fields = ['date', 'total_downloads', 'mobile_downloads', 'desktop_downloads', 'tablet_downloads', 'qr_code_downloads', 'direct_downloads', 'button_downloads']
    list_per_page = 30

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

admin.site.register(APKDownload, APKDownloadAdmin)
admin.site.register(APKVersion, APKVersionAdmin)
admin.site.register(DownloadAnalytics, DownloadAnalyticsAdmin)




from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone

@admin.register(UserNotification)
class UserNotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'short_title', 'is_read', 'created_at', 'view_related')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__username', 'user__email', 'title', 'message')
    readonly_fields = ('created_at',)
    actions = ['mark_as_read', 'mark_as_unread']
    date_hierarchy = 'created_at'
    
    def short_title(self, obj):
        return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
    short_title.short_description = 'Title'
    
    def view_related(self, obj):
        if obj.related_event:
            return format_html(
                '<a href="/admin/app/event/{}/change/">View Event</a>',
                obj.related_event.id
            )
        elif obj.related_announcement:
            return format_html(
                '<a href="/admin/app/announcement/{}/change/">View Announcement</a>',
                obj.related_announcement.id
            )
        return '-'
    view_related.short_description = 'Related Item'
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} notifications marked as read.")
    mark_as_read.short_description = "Mark selected notifications as read"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f"{updated} notifications marked as unread.")
    mark_as_unread.short_description = "Mark selected notifications as unread"



@admin.register(AttendanceViolation)
class AttendanceViolationAdmin(admin.ModelAdmin):
    list_display = ('user', 'violation_type', 'event_info', 'violation_date', 'is_resolved', 'resolved_at')
    list_filter = ('violation_type', 'is_resolved', 'violation_date')
    search_fields = ('user__username', 'user__email', 'event_registration__event__title')
    readonly_fields = ('violation_date', 'resolved_at')
    actions = ['mark_as_resolved', 'mark_as_unresolved']
    date_hierarchy = 'violation_date' 
    
    def event_info(self, obj):
        if obj.event_registration and obj.event_registration.event:
            return format_html(
                '{}<br><small style="color: #666;">{}</small>',
                obj.event_registration.event.title,
                obj.event_registration.event.start_date.strftime('%Y-%m-%d')
            )
        return '-'
    event_info.short_description = 'Event'
    event_info.admin_order_field = 'event_registration__event__title'
    
    def mark_as_resolved(self, request, queryset):
        updated = queryset.update(is_resolved=True, resolved_at=timezone.now())
        self.message_user(request, f"{updated} violations marked as resolved.")
    mark_as_resolved.short_description = "Mark selected violations as resolved"
    
    def mark_as_unresolved(self, request, queryset):
        updated = queryset.update(is_resolved=False, resolved_at=None)
        self.message_user(request, f"{updated} violations marked as unresolved.")
    mark_as_unresolved.short_description = "Mark selected violations as unresolved"