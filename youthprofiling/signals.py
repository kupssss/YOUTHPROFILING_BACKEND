# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Announcement, CommunityPost, YouthUser

skip_announcement_signal = False

@receiver(post_save, sender=Announcement)
def create_announcement_post(sender, instance, created, **kwargs):
    from .signals import skip_announcement_signal
    if skip_announcement_signal:
        return
    if created and instance.is_active:
        admin_user = YouthUser.get_admin_user()
        content = f"📢 {instance.title}\n\n"
        content += f"{instance.excerpt}\n\n" if instance.excerpt else f"{instance.content[:200]}...\n\n"
        content += f"#Announcement #{instance.category}"
        if not CommunityPost.objects.filter(user=admin_user, content__startswith=f"📢 {instance.title}").exists():
            CommunityPost.objects.create(
                user=admin_user,
                content=content,
                post_type='image' if instance.image else 'text',
                image=instance.image if instance.image else None,
                privacy='public'
            )

def create_posts_for_existing_announcements():
    global skip_announcement_signal
    skip_announcement_signal = True
    admin_user = YouthUser.get_admin_user()
    for announcement in Announcement.objects.filter(is_active=True):
        content = f"📢 {announcement.title}\n\n"
        content += f"{announcement.excerpt}\n\n" if announcement.excerpt else f"{announcement.content[:200]}...\n\n"
        content += f"#Announcement #{announcement.category}"
        if not CommunityPost.objects.filter(user=admin_user, content__startswith=f"📢 {announcement.title}").exists():
            CommunityPost.objects.create(
                user=admin_user,
                content=content,
                post_type='image' if announcement.image else 'text',
                image=announcement.image if announcement.image else None,
                privacy='public',
                created_at=announcement.publish_date
            )
    skip_announcement_signal = False




    # signals.py
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from django.utils import timezone
from .models import (
    Announcement, Event, CommunityPoints, PointsHistory, 
    YouthUser, UserNotification, EventRegistration
)
from django.db.models import Q

# ============================================
# ANNOUNCEMENT SIGNALS
# ============================================
@receiver(post_save, sender=Announcement)
def create_announcement_notifications(sender, instance, created, **kwargs):
    """Create notifications for all active users when a new announcement is created"""
    if created and instance.is_active:
        # Send to all active users
        active_users = YouthUser.objects.filter(is_active=True, is_admin_verified=True)
        
        for user in active_users:
            UserNotification.objects.create(
                user=user,
                notification_type='announcement',
                title="New Announcement",
                message=f"New announcement: {instance.title}",
                related_announcement=instance
            )

# ============================================
# EVENT SIGNALS
# ============================================
@receiver(post_save, sender=Event)
def create_event_notifications(sender, instance, created, **kwargs):
    """Create notifications for eligible users when a new event is created"""
    if created and instance.is_active:
        # Get all active, verified users
        all_users = YouthUser.objects.filter(is_active=True, is_admin_verified=True)
        
        for user in all_users:
            # Check if user is eligible for this event
            if instance.is_eligible(user):
                UserNotification.objects.create(
                    user=user,
                    notification_type='event',
                    title="New Event Available",
                    message=f"A new event '{instance.title}' has been posted. Register now!",
                    related_event=instance
                )

# ============================================
# POINTS SIGNALS
# ============================================
@receiver(post_save, sender=PointsHistory)
def create_points_notification(sender, instance, created, **kwargs):
    """Create notification when points change"""
    if created:
        if instance.points_change > 0:
            title = "Points Earned!"
            message = f"You earned {instance.points_change} points. {instance.reason}"
        elif instance.points_change < 0:
            title = "Points Deducted"
            message = f"You lost {abs(instance.points_change)} points. {instance.reason}"
        else:
            return  # No change, no notification
        
        UserNotification.objects.create(
            user=instance.user,
            notification_type='points',
            title=title,
            message=message,
            points_change=instance.points_change
        )

# ============================================
# EVENT REGISTRATION SIGNALS
# ============================================
@receiver(post_save, sender=EventRegistration)
def create_registration_notification(sender, instance, created, **kwargs):
    """Create notification when event registration status changes"""
    if created:
        # Initial registration notification
        UserNotification.objects.create(
            user=instance.user,
            notification_type='registration',
            title=f"Event Registration Submitted - {instance.event.title}",
            message="Your registration has been submitted and is pending confirmation.",
            related_event=instance.event
        )
    else:
        # Status change notification (only send for certain status changes)
        old_status = getattr(instance, '_old_status', None)
        
        if old_status != instance.status:
            status_messages = {
                'confirmed': "Your registration has been confirmed!",
                'waitlisted': "You've been added to the waitlist.",
                'cancelled': "Your registration has been cancelled.",
                'attended': "Thank you for attending the event!",
                'no_show': "You were marked as a no-show for the event.",
            }
            
            if instance.status in status_messages:
                UserNotification.objects.create(
                    user=instance.user,
                    notification_type='registration',
                    title=f"Event Registration Update - {instance.event.title}",
                    message=status_messages[instance.status],
                    related_event=instance.event
                )

def save_old_status(sender, instance, **kwargs):
    """Store the old status before saving"""
    if instance.pk:
        try:
            old_instance = EventRegistration.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except EventRegistration.DoesNotExist:
            instance._old_status = None

# Connect the pre_save signal
from django.db.models.signals import pre_save
pre_save.connect(save_old_status, sender=EventRegistration)

# ============================================
# REMINDER SIGNALS (Event starting soon)
# ============================================
@receiver(post_save, sender=Event)
def check_event_reminders(sender, instance, created, **kwargs):
    """Check if event is starting soon and send reminders"""
    if not created and instance.is_active:
        now = timezone.now()
        time_until_start = instance.start_date - now
        
        # If event starts in the next 24 hours
        if time_until_start.total_seconds() > 0 and time_until_start.total_seconds() <= 86400:  # 24 hours
            # Get all confirmed registrations
            registrations = EventRegistration.objects.filter(
                event=instance,
                status='confirmed'
            )
            
            for registration in registrations:
                UserNotification.objects.create(
                    user=registration.user,
                    notification_type='event',
                    title="Event Reminder",
                    message=f"Reminder: {instance.title} starts soon at {instance.start_date.strftime('%Y-%m-%d %H:%M')}",
                    related_event=instance
                )

# ============================================
# BULK ANNOUNCEMENT/EVENT CREATION SIGNAL
# ============================================
def send_bulk_notifications_for_new_content(content_type, instance):
    """Helper function to send notifications to all eligible users"""
    active_users = YouthUser.objects.filter(is_active=True, is_admin_verified=True)
    
    for user in active_users:
        if content_type == 'announcement':
            # Send announcement to all active users
            UserNotification.objects.create(
                user=user,
                notification_type='announcement',
                title="New Announcement",
                message=f"New announcement: {instance.title}",
                related_announcement=instance
            )
        elif content_type == 'event':
            # Send event only to eligible users
            if instance.is_eligible(user):
                UserNotification.objects.create(
                    user=user,
                    notification_type='event',
                    title="New Event Available",
                    message=f"A new event '{instance.title}' has been posted. Register now!",
                    related_event=instance
                )
