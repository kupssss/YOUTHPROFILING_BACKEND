# models.py
from django.db import models
from django.conf import settings
from cryptography.fernet import Fernet
import base64
import os
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password


def get_encryption_key():
    key = getattr(settings, 'ENCRYPTION_KEY', None)
    if key is None:
        key = Fernet.generate_key()
    return key

fernet = Fernet(get_encryption_key())

class EncryptedField(models.TextField):
    """Custom field for encrypted data storage"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def get_prep_value(self, value):
        """Encrypt value before saving to database"""
        if value is None:
            return value
        if isinstance(value, str):
            value = value.encode()
        encrypted_value = fernet.encrypt(value)
        return base64.urlsafe_b64encode(encrypted_value).decode()
    
    def from_db_value(self, value, expression, connection):
        """Decrypt value when retrieving from database"""
        if value is None:
            return value
        try:
            decoded_value = base64.urlsafe_b64decode(value)
            decrypted_value = fernet.decrypt(decoded_value)
            return decrypted_value.decode()
        except Exception:
            return value
        
class YouthUser(models.Model):
    """Main user model for youth members - NO connection to Django admin users"""
    
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128) 
    
    first_name = EncryptedField(max_length=100)
    last_name = EncryptedField(max_length=100)
    middle_name = EncryptedField(max_length=100, blank=True, null=True)
    suffix = EncryptedField(max_length=10, blank=True, null=True)
    address = EncryptedField(max_length=255)
    
    PUROK_ZONE_CHOICES = [
        ('AgnesVille', 'AgnesVille'),
        ('Bagong Bayan', 'Bagong Bayan'),
        ('Balon/Labajan', 'Balon/Labajan'),
        ('Cavite', 'Cavite'),
        ('Everlast Comp.', 'Everlast Comp.'),
        ('Josefina Subd.', 'Josefina Subd.'),
        ('Kamias I', 'Kamias I'),
        ('Kamias I-A', 'Kamias I-A'),
        ('Kamias II', 'Kamias II'),
        ('Kamias III', 'Kamias III'),
        ('Kapihan', 'Kapihan'),
        ('Kasoy I', 'Kasoy I'),
        ('Kasoy II', 'Kasoy II'),
        ('Labangan', 'Labangan'),
        ('Little Valley', 'Little Valley'),
        ('Mabolo', 'Mabolo'),
        ('Maligaya I-A', 'Maligaya I-A'),
        ('Maligaya I-B', 'Maligaya I-B'),
        ('Maligaya II', 'Maligaya II'),
        ('Marco Comp.', 'Marco Comp.'),
        ('Monte Carlo Homes', 'Monte Carlo Homes'),
        ('Munting-Pook', 'Munting-Pook'),
        ('Palomar Homes', 'Palomar Homes'),
        ('Ruhat III - Grotto', 'Ruhat III - Grotto'),
        ('Ruhat III- Lower', 'Ruhat III- Lower'),
        ('Ruhat III - Upper', 'Ruhat III - Upper'),
        ('Ruhat III -Upper A & B', 'Ruhat III -Upper A & B'),
        ('Ruhat IV', 'Ruhat IV'),
        ('Ruhat IV-A', 'Ruhat IV-A'),
        ('Ruhat V-Lower', 'Ruhat V-Lower'),
        ('Ruhat V-Upper', 'Ruhat V-Upper'),
        ('Salvador Drive', 'Salvador Drive'),
        ('San Rafael', 'San Rafael'),
        ('Sangley Comp.', 'Sangley Comp.'),
        ('Santos Comp.', 'Santos Comp.'),
        ('Shineville', 'Shineville'),
        ('Siruna PH.1', 'Siruna PH.1'),
        ('Siruna PH.2', 'Siruna PH.2'),
        ('Siruna PH.3', 'Siruna PH.3'),
        ('Siruna PH.4', 'Siruna PH.4'),
        ('Sitio Josefina', 'Sitio Josefina'),
        ('Soriano Comp.', 'Soriano Comp.'),
        ('Sucaben', 'Sucaben'),
        ('Summerville', 'Summerville'),
        ('Teremil Subd.', 'Teremil Subd.'),
        ('Tinago', 'Tinago'),
    ]
    purok_zone = models.CharField(max_length=50, choices=PUROK_ZONE_CHOICES, default='AgnesVille')
    
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    
    birthdate = EncryptedField(max_length=10)  
    age = models.PositiveIntegerField(default=0)
    contact_number = EncryptedField(max_length=15)
    
    CIVIL_STATUS_CHOICES = [
        ('Single', 'Single'),
        ('Married', 'Married'),
        ('Widowed', 'Widowed'),
        ('Separated', 'Separated'),
    ]
    civil_status = models.CharField(max_length=10, choices=CIVIL_STATUS_CHOICES, default='Single')
    
    AGE_GROUP_CHOICES = [
        ('15-17', '15-17 years'),
        ('18-21', '18-21 years'),
        ('22-25', '22-25 years'),
        ('26-30', '26-30 years'),
    ]
    age_group = models.CharField(max_length=10, choices=AGE_GROUP_CHOICES, default='15-17')
    
    EDUCATION_CHOICES = [
        ('Elementary', 'Elementary'),
        ('High School', 'High School'),
        ('College', 'College'),
        ('Vocational', 'Vocational/Tech'),
        ('Postgraduate', 'Postgraduate'),
    ]
    education = models.CharField(max_length=20, choices=EDUCATION_CHOICES, default='High School')
    
    YOUTH_CLASS_CHOICES = [
        ('Student', 'Student'),
        ('Working', 'Working'),
        ('Out-of-School', 'Out-of-School Youth'),
        ('NEET', 'Not in Education, Employment or Training'),
    ]
    youth_classification = models.CharField(max_length=20, choices=YOUTH_CLASS_CHOICES, default='Student')
    
    WORK_STATUS_CHOICES = [
        ('Employed', 'Employed'),
        ('Unemployed', 'Unemployed'),
        ('Self-Employed', 'Self-Employed'),
        ('Student', 'Student'),
    ]
    work_status = models.CharField(max_length=15, choices=WORK_STATUS_CHOICES, default='Student')
    
    sk_voter = models.BooleanField(default=False)
    
    registration_no = models.CharField(max_length=20, unique=True)
    
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    
    ID_TYPE_CHOICES = [
        ('Passport', 'Passport'),
        ('Driver\'s License', 'Driver\'s License'),
        ('UMID', 'Unified Multi-Purpose ID'),
        ('Student ID', 'Student ID'),
        ('Postal ID', 'Postal ID'),
        ('PhilHealth ID', 'PhilHealth ID'),
        ('SSS ID', 'SSS ID'),
        ('PRC ID', 'PRC ID'),
        ('Voter\'s ID', 'Voter\'s ID'),
        ('Senior Citizen ID', 'Senior Citizen ID'),
        ('Other', 'Other Government ID'),
    ]
    id_type = models.CharField(max_length=50, choices=ID_TYPE_CHOICES, default='Student ID')
    id_picture = models.ImageField(upload_to='id_pictures/')
    birth_certificate = models.FileField(upload_to='birth_certificates/', blank=True, null=True)

    # Parent consent fields (for ages 15-17)
    parent_consent_letter = models.FileField(upload_to='parent_consents/', blank=True, null=True)
    parent_id_picture = models.ImageField(upload_to='parent_ids/', blank=True, null=True)
    parent_name = EncryptedField(max_length=255, blank=True, null=True)
    parent_contact_number = EncryptedField(max_length=15, blank=True, null=True)
    parent_relationship = models.CharField(max_length=50, blank=True, null=True)
    consent_date = models.DateField(blank=True, null=True)

    is_email_verified = models.BooleanField(default=False)
    email_verification_date = models.DateTimeField(blank=True, null=True)
    
    is_admin_verified = models.BooleanField(default=False)
    admin_verification_date = models.DateTimeField(blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Youth User"
        verbose_name_plural = "Youth Users"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.registration_no}"
    
    def get_full_name(self):
        """Return full name with suffix if available"""
        name_parts = [self.first_name]
        if self.middle_name:
            name_parts.append(self.middle_name)
        if self.last_name:
            name_parts.append(self.last_name)
        if self.suffix:
            name_parts.append(self.suffix)
        return " ".join(name_parts)
    
    def get_encrypted_data(self):
        """Return a dictionary of encrypted field values (for admin purposes)"""
        return {
            'first_name': self.first_name,
            'last_name': self.last_name,
            'middle_name': self.middle_name,
            'suffix': self.suffix,
            'address': self.address,
            'birthdate': self.birthdate,
            'contact_number': self.contact_number,
        }
    
    def verify_email(self):
        """Mark email as verified"""
        self.is_email_verified = True
        self.email_verification_date = timezone.now()
        self.save()
    
    def verify_by_admin(self):
        """Mark account as verified by admin"""
        self.is_admin_verified = True
        self.admin_verification_date = timezone.now()
        self.save()
    
    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password = make_password(raw_password)
        self.save()
    
    def check_password(self, raw_password):
        """Check if the password is correct"""
        return check_password(raw_password, self.password)
    

    
    @classmethod
    def get_admin_user(cls):
        """Get or create a special admin user for auto-posting announcements"""
        try:
            admin_user = cls.objects.get(username='sk_mambugan_admin')
        except cls.DoesNotExist:
            admin_user = cls.objects.create(
                username='sk_mambugan_admin',
                email='admin@skmambugan.ph',
                first_name='Sangguniang Kabataan',
                last_name='ng Barangay Mambugan',
                address='Barangay Mambugan',
                password='admin_auto_post_password_123',
                gender='Male',
                birthdate='2000-01-01',
                age=25,
                contact_number='00000000000',
                civil_status='Single',
                age_group='26-30',
                education='College',
                youth_classification='Working',
                work_status='Employed',
                sk_voter=True,
                registration_no='SK-ADMIN-001',
                id_type='Other',
                is_email_verified=True,
                is_admin_verified=True
            )
        return admin_user

class OTPVerification(models.Model):
    """Model for storing OTP verification attempts for email verification"""
    email = models.EmailField()
    otp_code = EncryptedField(max_length=6)  
    is_verified = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  
    
    class Meta:
        verbose_name = "OTP Verification"
        verbose_name_plural = "OTP Verifications"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.email} - {self.created_at}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at

class AuditLog(models.Model):
    """Model for tracking access to encrypted data"""
    admin_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    youth_user = models.ForeignKey(YouthUser, on_delete=models.CASCADE)
    action = models.CharField(max_length=50, choices=[
        ('VIEW', 'View Encrypted Data'),
        ('UPDATE', 'Update Encrypted Data'),
        ('DECRYPT', 'Decrypt Data'),
    ], default='VIEW')
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ['-timestamp']
    
    def __str__(self):
        username = self.admin_user.username if self.admin_user else 'System'
        return f"{self.action} on {self.youth_user} by {username} at {self.timestamp}"

class UserLog(models.Model):
    """Model to track user login activities"""
    
    LOGIN_TYPES = [
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('LOGIN_FAILED', 'Login Failed'),
    ]
    
    youth_user = models.ForeignKey('YouthUser', on_delete=models.CASCADE, null=True, blank=True)
    username = models.CharField(max_length=150)  
    login_type = models.CharField(max_length=20, choices=LOGIN_TYPES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False)
    failure_reason = models.TextField(blank=True)  
    
    class Meta:
        verbose_name = "User Log"
        verbose_name_plural = "User Logs"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.username} - {self.login_type} - {self.timestamp}"

class UserArchive(models.Model):
    """Model to archive user data when deleted"""
    
    original_user_id = models.IntegerField()  
    archived_at = models.DateTimeField(auto_now_add=True)
    archived_by = models.CharField(max_length=150, blank=True)  
    
    user_data = models.JSONField()
    
    profile_picture_path = models.CharField(max_length=500, blank=True)
    id_picture_path = models.CharField(max_length=500, blank=True)
    birth_certificate_path = models.CharField(max_length=500, blank=True)
    parent_consent_letter_path = models.CharField(max_length=500, blank=True)
    parent_id_picture_path = models.CharField(max_length=500, blank=True)
    
    deletion_reason = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "User Archive"
        verbose_name_plural = "User Archives"
        ordering = ['-archived_at']
    
    def __str__(self):
        return f"Archived User {self.original_user_id} - {self.archived_at}"
    

class PasswordResetToken(models.Model):
    """Model to store password reset tokens"""
    user = models.ForeignKey(YouthUser, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Password Reset Token"
        verbose_name_plural = "Password Reset Tokens"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reset token for {self.user.email}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at





    
    

class YouthAdmin(models.Model):
    """Server-side admin model for SK Mambugan management - separate from Django admin"""
    
    ADMIN_ROLE_CHOICES = [
        ('super_admin', 'Super Administrator'),
        ('sk_chairman', 'SK Chairman'),
        ('sk_secretary', 'SK Secretary'),
        ('sk_treasurer', 'SK Treasurer'),
        ('sk_councilor', 'SK Councilor'),
        ('staff', 'Staff Member'),
    ]
    
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    
    first_name = EncryptedField(max_length=100)
    last_name = EncryptedField(max_length=100)
    middle_name = EncryptedField(max_length=100, blank=True, null=True)
    
    role = models.CharField(max_length=20, choices=ADMIN_ROLE_CHOICES, default='staff')
    department = models.CharField(max_length=100, blank=True, null=True)
    contact_number = EncryptedField(max_length=15)
    
    profile_picture = models.ImageField(upload_to='admin_profiles/', blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    is_super_admin = models.BooleanField(default=False)
    
    last_login = models.DateTimeField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    can_manage_users = models.BooleanField(default=False)
    can_manage_announcements = models.BooleanField(default=False)
    can_manage_events = models.BooleanField(default=False)
    can_view_reports = models.BooleanField(default=False)
    can_manage_settings = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Youth Administrator"
        verbose_name_plural = "Youth Administrators"
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.get_role_display()}"
    
    def get_full_name(self):
        """Return full name with middle name if available"""
        name_parts = [self.first_name]
        if self.middle_name:
            name_parts.append(self.middle_name)
        name_parts.append(self.last_name)
        return " ".join(name_parts)
    
    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password = make_password(raw_password)
        self.save()
    
    def check_password(self, raw_password):
        """Check if the password is correct"""
        return check_password(raw_password, self.password)
    
    def has_perm(self, perm_codename):
        """Check if admin has specific permission"""
        if self.is_super_admin:
            return True
            
        perm_map = {
            'manage_users': self.can_manage_users,
            'manage_announcements': self.can_manage_announcements,
            'manage_events': self.can_manage_events,
            'view_reports': self.can_view_reports,
            'manage_settings': self.can_manage_settings,
        }
        
        return perm_map.get(perm_codename, False)
    

class EncryptionKeyAttempt(models.Model):
    """Model to track encryption key attempts"""
    admin_user = models.ForeignKey(YouthAdmin, on_delete=models.CASCADE)
    attempted_key = models.CharField(max_length=255)
    is_successful = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Encryption Key Attempt"
        verbose_name_plural = "Encryption Key Attempts"
        ordering = ['-timestamp']
    
    def __str__(self):
        status = "Success" if self.is_successful else "Failed"
        return f"{self.admin_user} - {status} - {self.timestamp}"
    
    




    



from django.db import models
from django.conf import settings
from django.utils import timezone

class Gender(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class CivilStatus(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class AgeGroup(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class EducationLevel(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class YouthClassification(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class WorkStatus(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class Announcement(models.Model):
    ANNOUNCEMENT_CATEGORIES = [
        ('important', 'Important'),
        ('sports', 'Sports'),
        ('education', 'Education'),
        ('environment', 'Environment'),
        ('health', 'Health'),
        ('general', 'General'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    excerpt = models.CharField(max_length=300, blank=True)
    category = models.CharField(max_length=20, choices=ANNOUNCEMENT_CATEGORIES, default='general')
    image = models.ImageField(upload_to='announcements/', blank=True, null=True)
    publish_date = models.DateTimeField(auto_now_add=True)
    effective_date = models.DateTimeField(blank=True, null=True)
    deadline = models.DateTimeField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True)
    is_important = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(YouthAdmin, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-publish_date']

class Event(models.Model):
    EVENT_CATEGORIES = [
        ('sports', 'Sports'),
        ('education', 'Education'),
        ('health', 'Health'),
        ('community', 'Community'),
        ('cultural', 'Cultural'),
        ('environment', 'Environment'),
    ]
    
    ACCESS_ALL = 'all'
    ACCESS_NONE = 'none'
    ACCESS_SPECIFIC = 'specific'
    ACCESS_CHOICES = [
        (ACCESS_ALL, 'Everyone in this group can join'),
        (ACCESS_NONE, 'Nobody in this group can join'),
        (ACCESS_SPECIFIC, 'Specific selection only'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    excerpt = models.CharField(max_length=300, blank=True)
    category = models.CharField(max_length=20, choices=EVENT_CATEGORIES)
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    location = models.CharField(max_length=100)
    maximum_participants = models.PositiveIntegerField(blank=True, null=True)
    current_participants = models.PositiveIntegerField(default=0)
    registration_deadline = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    requires_registration = models.BooleanField(default=False)
    
    gender_access = models.CharField(max_length=10, choices=ACCESS_CHOICES, default=ACCESS_ALL)
    target_genders = models.ManyToManyField(Gender, blank=True)
    
    civil_status_access = models.CharField(max_length=10, choices=ACCESS_CHOICES, default=ACCESS_ALL)
    target_civil_statuses = models.ManyToManyField(CivilStatus, blank=True)
    
    age_group_access = models.CharField(max_length=10, choices=ACCESS_CHOICES, default=ACCESS_ALL)
    target_age_groups = models.ManyToManyField(AgeGroup, blank=True)
    
    education_access = models.CharField(max_length=10, choices=ACCESS_CHOICES, default=ACCESS_ALL)
    target_education_levels = models.ManyToManyField(EducationLevel, blank=True)
    
    youth_classification_access = models.CharField(max_length=10, choices=ACCESS_CHOICES, default=ACCESS_ALL)
    target_youth_classifications = models.ManyToManyField(YouthClassification, blank=True)
    
    work_status_access = models.CharField(max_length=10, choices=ACCESS_CHOICES, default=ACCESS_ALL)
    target_work_statuses = models.ManyToManyField(WorkStatus, blank=True)
    
    age_min = models.PositiveIntegerField(blank=True, null=True)
    age_max = models.PositiveIntegerField(blank=True, null=True)
    
    points_reward = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(YouthAdmin, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.title
    
    @property
    def is_upcoming(self):
        return self.start_date > timezone.now()
    
    @property
    def seats_available(self):
        if self.maximum_participants:
            return self.maximum_participants - self.current_participants
        return None
    
    def is_eligible(self, user):
        """
        Check if a user is eligible to register for this event
        based on the target audience specifications
        """
        if not self._check_eligibility_for_field(
            self.gender_access, 
            self.target_genders.all(), 
            user.gender if hasattr(user, 'gender') else None
        ):
            return False
        
        if not self._check_eligibility_for_field(
            self.civil_status_access, 
            self.target_civil_statuses.all(), 
            user.civil_status if hasattr(user, 'civil_status') else None
        ):
            return False
        
        if not self._check_eligibility_for_field(
            self.age_group_access, 
            self.target_age_groups.all(), 
            user.age_group if hasattr(user, 'age_group') else None
        ):
            return False
        
        if not self._check_eligibility_for_field(
            self.education_access, 
            self.target_education_levels.all(), 
            user.education if hasattr(user, 'education') else None
        ):
            return False
        
        if not self._check_eligibility_for_field(
            self.youth_classification_access, 
            self.target_youth_classifications.all(), 
            user.youth_classification if hasattr(user, 'youth_classification') else None
        ):
            return False
        
        if not self._check_eligibility_for_field(
            self.work_status_access, 
            self.target_work_statuses.all(), 
            user.work_status if hasattr(user, 'work_status') else None
        ):
            return False
        
        if self.age_min and hasattr(user, 'age') and user.age < self.age_min:
            return False
        
        if self.age_max and hasattr(user, 'age') and user.age > self.age_max:
            return False
        
        return True
    
    def _check_eligibility_for_field(self, access_type, target_items, user_value):
        """
        Helper method to check eligibility for a specific field
        """
        if access_type == self.ACCESS_ALL:
            return True
        elif access_type == self.ACCESS_NONE:
            return False
        elif access_type == self.ACCESS_SPECIFIC:
            if not user_value:
                return False
            return any(target_item.name.lower() == user_value.lower() for target_item in target_items)
        return True
    
    class Meta:
        ordering = ['start_date']



class AnnouncementInteraction(models.Model):
    INTERACTION_TYPES = [
        ('saved', 'Saved'),
        ('attending', 'Plan to Attend'),
        ('applied', 'Application Started'),
        ('volunteered', 'Volunteered'),
    ]
    
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE)
    user = models.ForeignKey('YouthUser', on_delete=models.CASCADE)
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['announcement', 'user', 'interaction_type']

class EventRegistration(models.Model):
    REGISTRATION_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('waitlisted', 'Waitlisted'),
        ('cancelled', 'Cancelled'),
        ('attended', 'Attended'),
        ('no_show', 'No Show'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    user = models.ForeignKey(YouthUser, on_delete=models.CASCADE)
    registration_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=REGISTRATION_STATUS, default='pending')
    check_in_time = models.DateTimeField(blank=True, null=True)
    points_earned = models.PositiveIntegerField(default=0)
    feedback_provided = models.BooleanField(default=False)
    rating = models.PositiveIntegerField(blank=True, null=True, choices=[(i, f'{i} Star') for i in range(1, 6)])  
    certificate_issued = models.BooleanField(default=False)  # Remove the duplicate line
    
    emergency_contact_name = EncryptedField(max_length=100, blank=True, null=True)
    emergency_contact_number = EncryptedField(max_length=15, blank=True, null=True)
    dietary_restrictions = models.TextField(blank=True, null=True)
    special_accommodations = models.TextField(blank=True, null=True)
    skills_interests = models.TextField(blank=True, null=True)  
    how_heard = models.CharField(max_length=100, blank=True, null=True, choices=[
        ('social_media', 'Social Media'),
        ('friend', 'Friend'),
        ('email', 'Email'),
        ('website', 'Website'),
        ('community_board', 'Community Board'),
        ('other', 'Other'),
    ])
    agree_to_terms = models.BooleanField(default=False)
    agree_to_photos = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['event', 'user']
        ordering = ['-registration_date']
    
    def __str__(self):
        return f"{self.user} - {self.event}"
    
    @property
    def can_check_in(self):
        return self.status == 'confirmed' and not self.check_in_time
    
    @property
    def is_active(self):
        return self.status in ['pending', 'confirmed', 'waitlisted']
    
    def generate_qr_code(self):
        pass

class EventQuestion(models.Model):
    QUESTION_TYPES = [
        ('text', 'Short Text'),
        ('textarea', 'Long Text'),
        ('radio', 'Single Choice'),
        ('checkbox', 'Multiple Choice'),
        ('dropdown', 'Dropdown'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='questions')
    question_text = models.CharField(max_length=255)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='text')
    is_required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    options = models.TextField(blank=True, null=True)  

    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.event}: {self.question_text}"

class EventRegistrationResponse(models.Model):
    registration = models.ForeignKey(EventRegistration, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(EventQuestion, on_delete=models.CASCADE)
    response = models.TextField()
    
    class Meta:
        unique_together = ['registration', 'question']
    
    def __str__(self):
        return f"{self.registration} - {self.question}"
    

class EventEvaluation(models.Model):
    RATING_CHOICES = [
        (1, '1 Star - Poor'),
        (2, '2 Stars - Fair'),
        (3, '3 Stars - Good'),
        (4, '4 Stars - Very Good'),
        (5, '5 Stars - Excellent'),
    ]
    
    registration = models.OneToOneField(
        'EventRegistration', 
        on_delete=models.CASCADE,
        related_name='evaluation'
    )
    rating = models.PositiveIntegerField(choices=RATING_CHOICES)
    comments = models.TextField(blank=True, null=True)
    suggestions = models.TextField(blank=True, null=True)
    would_attend_again = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Event Evaluation'
        verbose_name_plural = 'Event Evaluations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Evaluation for {self.registration.event.title} by {self.registration.user.get_full_name()}"
    








class CommunityPost(models.Model):
    POST_TYPES = [
        ('text', 'Text Post'),
        ('image', 'Image Post'),
    ]
    
    user = models.ForeignKey(YouthUser, on_delete=models.CASCADE, related_name='community_posts')
    content = models.TextField()
    post_type = models.CharField(max_length=10, choices=POST_TYPES, default='text')
    image = models.ImageField(upload_to='community_posts/images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    privacy = models.CharField(max_length=10, choices=[
        ('public', 'Public'),
        ('community', 'SK Members Only'),
    ], default='public')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Post by {self.user} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def like_count(self):
        return self.likes.filter(is_active=True).count()
    
    @property
    def comment_count(self):
        return self.comments.filter(is_active=True).count()


class PostLike(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(YouthUser, on_delete=models.CASCADE, related_name='post_likes')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['post', 'user']
    
    def __str__(self):
        return f"{self.user} liked {self.post}"


class PostComment(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(YouthUser, on_delete=models.CASCADE, related_name='post_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user} on {self.post}"
    
    @property
    def like_count(self):
        return self.comment_likes.filter(is_active=True).count()


class CommentLike(models.Model):
    comment = models.ForeignKey(PostComment, on_delete=models.CASCADE, related_name='comment_likes')
    user = models.ForeignKey(YouthUser, on_delete=models.CASCADE, related_name='comment_likes')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['comment', 'user']
    
    def __str__(self):
        return f"{self.user} liked comment by {self.comment.user}"


class TrendingTopic(models.Model):
    name = models.CharField(max_length=100)
    post_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-post_count']
    
    def __str__(self):
        return f"#{self.name} ({self.post_count} posts)"


class CommunityGuideline(models.Model):
    content = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Guideline {self.order}"
    

class ContactMessage(models.Model):
    SUBJECT_CHOICES = [
        ('general', 'General Inquiry'),
        ('technical', 'Technical Support'),
        ('event', 'Event Registration'),
        ('complaint', 'Complaint'),
        ('suggestion', 'Suggestion'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(YouthUser, on_delete=models.CASCADE, related_name='contact_messages')
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_subject_display()} from {self.user}"


class Complaint(models.Model):
    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    user = models.ForeignKey(YouthUser, on_delete=models.CASCADE, related_name='complaints')
    title = models.CharField(max_length=200)
    description = models.TextField()
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Complaint: {self.title}"


class Suggestion(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('under_consideration', 'Under Consideration'),
        ('implemented', 'Implemented'),
        ('rejected', 'Not Feasible'),
    ]
    
    user = models.ForeignKey(YouthUser, on_delete=models.CASCADE, related_name='suggestions')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    implemented_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Suggestion: {self.title}"


class SupportTicket(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    user = models.ForeignKey(YouthUser, on_delete=models.CASCADE, related_name='support_tickets')
    subject = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Support Ticket: {self.subject}"


class CallbackRequest(models.Model):
    TIME_CHOICES = [
        ('morning', 'Morning (8AM-12PM)'),
        ('afternoon', 'Afternoon (1PM-5PM)'),
        ('evening', 'Evening (6PM-8PM)'),
    ]
    
    user = models.ForeignKey(YouthUser, on_delete=models.CASCADE, related_name='callback_requests')
    phone_number = models.CharField(max_length=15)
    preferred_time = models.CharField(max_length=10, choices=TIME_CHOICES)
    reason = models.TextField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Callback for {self.user}"


class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=50, default='General')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return self.question
    

class UserRegistrationAnalytics(models.Model):
    """Model to track user registration statistics for analytics"""
    date = models.DateField(unique=True)
    registrations_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User Registration Analytics"
        verbose_name_plural = "User Registration Analytics"
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.date}: {self.registrations_count} registrations"

class EventParticipationAnalytics(models.Model):
    """Model to track event participation statistics"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    category = models.CharField(max_length=20)
    participation_count = models.PositiveIntegerField(default=0)
    date_recorded = models.DateField()
    
    class Meta:
        verbose_name = "Event Participation Analytics"
        verbose_name_plural = "Event Participation Analytics"
        ordering = ['-date_recorded']
    
    def __str__(self):
        return f"{self.event.title}: {self.participation_count} participants"
    



from django.db import models
from django.utils import timezone
import uuid
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

class APKDownload(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_type = models.CharField(max_length=50, blank=True)
    device_brand = models.CharField(max_length=100, blank=True)
    device_model = models.CharField(max_length=100, blank=True)
    os_name = models.CharField(max_length=50, blank=True)
    os_version = models.CharField(max_length=50, blank=True)
    browser_name = models.CharField(max_length=100, blank=True)
    browser_version = models.CharField(max_length=50, blank=True)
    is_mobile = models.BooleanField(default=False)
    is_tablet = models.BooleanField(default=False)
    is_desktop = models.BooleanField(default=False)
    download_method = models.CharField(max_length=20, choices=[
        ('direct', 'Direct Download'),
        ('qr_code', 'QR Code'),
        ('button', 'Download Button')
    ], default='direct')
    download_source = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'apk_downloads'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['device_type']),
        ]

    def __str__(self):
        return f"Download from {self.ip_address} at {self.created_at}"

class APKVersion(models.Model):
    version = models.CharField(max_length=20, unique=True)
    file_size = models.CharField(max_length=20)
    release_date = models.DateField()
    release_notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    download_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'apk_versions'
        ordering = ['-release_date']

    def __str__(self):
        return f"v{self.version}"

class DownloadAnalytics(models.Model):
    date = models.DateField(unique=True)
    total_downloads = models.PositiveIntegerField(default=0)
    mobile_downloads = models.PositiveIntegerField(default=0)
    desktop_downloads = models.PositiveIntegerField(default=0)
    tablet_downloads = models.PositiveIntegerField(default=0)
    qr_code_downloads = models.PositiveIntegerField(default=0)
    direct_downloads = models.PositiveIntegerField(default=0)
    button_downloads = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'download_analytics'
        ordering = ['-date']

    def __str__(self):
        return f"Analytics for {self.date}"

@receiver(post_save, sender=APKDownload)
@receiver(post_delete, sender=APKDownload)
def update_download_counts(sender, instance, **kwargs):
    total_downloads = APKDownload.objects.count()
    
    current_version = APKVersion.objects.filter(is_active=True).first()
    if current_version:
        current_version.download_count = total_downloads
        current_version.save()
    
    today = timezone.now().date()
    analytics, created = DownloadAnalytics.objects.get_or_create(date=today)
    
    analytics.total_downloads = total_downloads
    analytics.mobile_downloads = APKDownload.objects.filter(is_mobile=True).count()
    analytics.desktop_downloads = APKDownload.objects.filter(is_desktop=True).count()
    analytics.tablet_downloads = APKDownload.objects.filter(is_tablet=True).count()
    analytics.qr_code_downloads = APKDownload.objects.filter(download_method='qr_code').count()
    analytics.direct_downloads = APKDownload.objects.filter(download_method='direct').count()
    analytics.button_downloads = APKDownload.objects.filter(download_method='button').count()
    analytics.save()