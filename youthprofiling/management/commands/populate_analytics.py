# Create management/commands/populate_analytics.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from youthprofiling.models import YouthUser, EventRegistration, UserRegistrationAnalytics, EventParticipationAnalytics, Event

class Command(BaseCommand):
    help = 'Populate analytics data for the dashboard'
    
    def handle(self, *args, **options):
        # Populate user registration analytics for the last 30 days
        today = timezone.now().date()
        for i in range(30):
            date = today - timedelta(days=i)
            count = YouthUser.objects.filter(created_at__date=date).count()
            analytics, created = UserRegistrationAnalytics.objects.get_or_create(
                date=date,
                defaults={'registrations_count': count}
            )
            if not created:
                analytics.registrations_count = count
                analytics.save()
        
        # Populate event participation analytics
        events = Event.objects.all()
        for event in events:
            participation_count = EventRegistration.objects.filter(
                event=event,
                status__in=['confirmed', 'attended']
            ).count()
            
            analytics, created = EventParticipationAnalytics.objects.get_or_create(
                event=event,
                category=event.category,
                date_recorded=today,
                defaults={'participation_count': participation_count}
            )
            if not created:
                analytics.participation_count = participation_count
                analytics.save()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated analytics data')
        )