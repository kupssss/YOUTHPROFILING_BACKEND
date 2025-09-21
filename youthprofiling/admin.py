from django.contrib import admin
from django import forms
from django.conf import settings
from django.utils.html import format_html
from cryptography.fernet import Fernet, InvalidToken
import base64
from .models import YouthUser, OTPVerification, AuditLog
from django.utils import timezone

fernet = Fernet(settings.ENCRYPTION_KEY)

class DecryptionForm(forms.Form):
    """Form for entering decryption key in admin"""
    decryption_key = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Enter decryption key'}),
        help_text="Enter the decryption key to view clean data"
    )

class YouthUserAdmin(admin.ModelAdmin):
    list_display = ('registration_no', 'get_full_name', 'email', 'age_group', 'is_email_verified', 'is_admin_verified', 'is_active', 'admin_verification_actions')
    list_filter = ('is_email_verified', 'is_admin_verified', 'is_active', 'age_group', 'civil_status', 'work_status', 'gender')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'registration_no')
    readonly_fields = ('registration_no', 'created_at', 'updated_at', 'last_login', 'get_encrypted_data_display',
                      'is_email_verified', 'email_verification_date', 'admin_verification_date')
    
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
            'fields': ('purok_zone',)
        }),
        ('Verification Status', {
            'fields': ('is_email_verified', 'email_verification_date', 
                      'is_admin_verified', 'admin_verification_date', 'is_active')
        }),
        ('Documents', {
            'fields': ('profile_picture', 'id_type', 'id_picture', 'birth_certificate')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_login')
        }),
    )
    
    actions = ['verify_selected_users', 'unverify_selected_users', 'activate_selected_users', 'deactivate_selected_users']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'
    
    def admin_verification_actions(self, obj):
        return format_html(
            '<div class="verification-actions">'
            '<form method="post" action="{}" style="display:inline;">'
            '<input type="hidden" name="action" value="verify_user">'
            '<input type="hidden" name="user_id" value="{}">'
            '<button type="submit" class="button" {}>Verify</button>'
            '</form>'
            '<form method="post" action="{}" style="display:inline; margin-left:5px;">'
            '<input type="hidden" name="action" value="unverify_user">'
            '<input type="hidden" name="user_id" value="{}">'
            '<button type="submit" class="button" {}>Unverify</button>'
            '</form>'
            '</div>',
            '',  
            obj.id,
            'disabled' if obj.is_admin_verified else '',
            '',  
            obj.id,
            'disabled' if not obj.is_admin_verified else ''
        )
    admin_verification_actions.short_description = 'Verification Actions'
    
    def get_encrypted_data_display(self, obj):
        """Display encrypted data with decryption option"""
        decryption_key = getattr(self, '_decryption_key', None)
        
        if decryption_key:
            try:
                temp_fernet = Fernet(decryption_key.encode())
                decrypted_data = {}
                encrypted_fields = ['first_name', 'last_name', 'middle_name', 'suffix', 'address', 'birthdate', 'contact_number']
                
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
        
        self.request = request
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
    list_display = ('admin_user', 'youth_user', 'action', 'timestamp', 'ip_address')
    list_filter = ('action', 'timestamp')
    search_fields = ('admin_user__username', 'youth_user__registration_no')
    readonly_fields = ('admin_user', 'youth_user', 'action', 'timestamp', 'ip_address', 'user_agent')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

admin.site.register(YouthUser, YouthUserAdmin)
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
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

class EventAdmin(admin.ModelAdmin):
    form = EventAdminForm
    list_display = ('title', 'category', 'start_date', 'end_date', 'location', 'is_active', 'created_by')
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
        if obj.maximum_participants:
            return f"{obj.seats_available} / {obj.maximum_participants}"
        return "Unlimited"
    seats_available_display.short_description = 'Seats Available'
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'registration_date', 'status', 'points_earned')
    list_filter = ('status', 'points_earned', 'registration_date')
    search_fields = ('event__title', 'user__first_name', 'user__last_name')
    readonly_fields = ('registration_date',)


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


@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'short_content', 'post_type', 'privacy', 'like_count', 'comment_count', 'created_at', 'is_active')
    list_filter = ('post_type', 'privacy', 'is_active', 'created_at')
    search_fields = ('content', 'user__first_name', 'user__last_name', 'user__username')
    inlines = [PostLikeInline, PostCommentInline]
    readonly_fields = ('created_at', 'updated_at')

    def short_content(self, obj):
        return (obj.content[:50] + '...') if len(obj.content) > 50 else obj.content
    short_content.short_description = 'Content'


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
