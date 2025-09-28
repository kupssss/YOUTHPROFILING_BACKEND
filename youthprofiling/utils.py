# utils.py
import os
from django.utils import timezone
from .models import UserArchive

def archive_user_before_deletion(user, deleted_by='system', reason=''):
    """Archive user data before deletion"""
    try:
        user_data = {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'middle_name': user.middle_name,
            'suffix': user.suffix,
            'address': user.address,
            'purok_zone': user.purok_zone,
            'gender': user.gender,
            'birthdate': user.birthdate,
            'age': user.age,
            'contact_number': user.contact_number,
            'civil_status': user.civil_status,
            'age_group': user.age_group,
            'education': user.education,
            'youth_classification': user.youth_classification,
            'work_status': user.work_status,
            'sk_voter': user.sk_voter,
            'registration_no': user.registration_no,
            'id_type': user.id_type,
            'parent_name': user.parent_name,
            'parent_relationship': user.parent_relationship,
            'parent_contact_number': user.parent_contact_number,
            'consent_date': str(user.consent_date) if user.consent_date else None,
            'is_email_verified': user.is_email_verified,
            'email_verification_date': str(user.email_verification_date) if user.email_verification_date else None,
            'is_admin_verified': user.is_admin_verified,
            'admin_verification_date': str(user.admin_verification_date) if user.admin_verification_date else None,
            'is_active': user.is_active,
            'created_at': str(user.created_at),
            'updated_at': str(user.updated_at),
            'last_login': str(user.last_login) if user.last_login else None,
        }
        
        archive = UserArchive.objects.create(
            original_user_id=user.id,
            archived_by=deleted_by,
            user_data=user_data,
            profile_picture_path=user.profile_picture.path if user.profile_picture and os.path.exists(user.profile_picture.path) else '',
            id_picture_path=user.id_picture.path if user.id_picture and os.path.exists(user.id_picture.path) else '',
            birth_certificate_path=user.birth_certificate.path if user.birth_certificate and os.path.exists(user.birth_certificate.path) else '',
            parent_consent_letter_path=user.parent_consent_letter.path if user.parent_consent_letter and os.path.exists(user.parent_consent_letter.path) else '',
            parent_id_picture_path=user.parent_id_picture.path if user.parent_id_picture and os.path.exists(user.parent_id_picture.path) else '',
            deletion_reason=reason
        )
        
        return archive
    except Exception as e:
        print(f"Error archiving user {user.id if user else 'unknown'}: {str(e)}")
        return None