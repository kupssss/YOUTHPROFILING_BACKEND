import os
import django
from django.core.management.base import BaseCommand
from django.utils import timezone
from youthprofiling.models import Event, EventRegistration

class Command(BaseCommand):
    help = 'Automatically update event registration statuses based on event dates'
    
    def handle(self, *args, **options):
        now = timezone.now()
        
        # Mark no-shows for past events where users didn't check in
        past_events = Event.objects.filter(end_date__lt=now, is_active=True)
        
        for event in past_events:
            registrations = EventRegistration.objects.filter(
                event=event,
                status__in=['confirmed', 'pending'],
                check_in_time__isnull=True
            )
            
            for registration in registrations:
                registration.mark_no_show()
                self.stdout.write(f"Marked {registration.user.username} as no-show for {event.title}")
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {past_events.count()} past events')
        )