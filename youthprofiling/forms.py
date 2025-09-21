from django import forms
from .models import Event

class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'excerpt', 'category', 'image',
            'start_date', 'end_date', 'location', 'maximum_participants',
            'registration_deadline', 'is_active', 'requires_registration',
            'gender_access', 'target_genders',
            'civil_status_access', 'target_civil_statuses',
            'age_group_access', 'target_age_groups',
            'education_access', 'target_education_levels',
            'youth_classification_access', 'target_youth_classifications',
            'work_status_access', 'target_work_statuses',
            'age_min', 'age_max', 'points_reward'
        ]
        widgets = {
            'start_date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'end_date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'registration_deadline': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'description': forms.Textarea(attrs={'rows': 4}),
            'excerpt': forms.Textarea(attrs={'rows': 2}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make fields not required
        for field in ['maximum_participants', 'registration_deadline', 'image', 'excerpt']:
            self.fields[field].required = False
        
        # Set CSS classes for styling
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
            
    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')
        registration_deadline = cleaned_data.get('registration_deadline')
        
        if start_date and end_date and start_date >= end_date:
            raise forms.ValidationError('End date must be after start date.')
        
        if registration_deadline and start_date and registration_deadline >= start_date:
            raise forms.ValidationError('Registration deadline must be before the event start date.')
        
        return cleaned_data