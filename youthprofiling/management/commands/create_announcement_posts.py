from django.core.management.base import BaseCommand
from youthprofiling.signals import create_posts_for_existing_announcements

class Command(BaseCommand):
    help = 'Create community posts for all existing announcements'

    def handle(self, *args, **options):
        self.stdout.write('Creating community posts for existing announcements...')
        create_posts_for_existing_announcements()
        self.stdout.write(self.style.SUCCESS('Successfully created posts for all existing announcements'))
