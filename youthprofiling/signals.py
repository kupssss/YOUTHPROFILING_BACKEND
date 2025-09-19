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
