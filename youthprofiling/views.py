from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import random
import time
from django.urls import reverse
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from .models import YouthUser, OTPVerification
from datetime import timedelta
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Q
import json



otp_storage = {}


def index(request):
    now = timezone.now()
    
    announcements = Announcement.objects.filter(
        is_active=True, 
        publish_date__lte=now
    ).order_by('-publish_date')[:3]
    
    upcoming_events = Event.objects.filter(
        is_active=True,
        start_date__gte=now
    ).order_by('start_date')[:3]
    
    total_members = YouthUser.objects.count() if hasattr(YouthUser, 'objects') else 5000
    total_events = Event.objects.count() if Event.objects.exists() else 120
    total_programs = 35  
    satisfaction_rate = 98  

    context = {
        'announcements': announcements,
        'upcoming_events': upcoming_events,
        'total_members': total_members,
        'total_events': total_events,
        'total_programs': total_programs,
        'satisfaction_rate': satisfaction_rate,
    }
    
    return render(request, 'index.html', context)



def announcement(request):
    now = timezone.now()
    
    announcements = Announcement.objects.filter(
        is_active=True, 
        publish_date__lte=now
    ).order_by('-publish_date')
    
    events = Event.objects.filter(
        is_active=True,
        end_date__gte=now - timedelta(days=1)
    ).order_by('start_date')
    
    upcoming_events = Event.objects.filter(
        is_active=True,
        start_date__gte=now
    ).order_by('start_date')[:5]
    
    announcements_count = announcements.count()
    upcoming_events_count = upcoming_events.count()
    
    current_month = now.strftime("%B")
    current_year = now.year
    
    event_days = []
    for event in events:
        if event.start_date:
            event_days.append(event.start_date.day)
    
    announcement_days = []
    for announcement in announcements.filter(is_important=True):
        if announcement.publish_date:
            announcement_days.append(announcement.publish_date.day)
    
    first_day = now.replace(day=1)
    weekday_of_first = first_day.weekday()
    days_in_month = 31  
    
    calendar_days = []
    for i in range(weekday_of_first):
        calendar_days.append(0)
    
    for day in range(1, days_in_month + 1):
        calendar_days.append(day)
    
    context = {
        'announcements': announcements,
        'events': events,
        'upcoming_events': upcoming_events,
        'announcements_count': announcements_count,
        'upcoming_events_count': upcoming_events_count,
        'current_month': current_month,
        'current_year': current_year,
        'calendar_days': calendar_days,
        'event_days': event_days,
        'announcement_days': announcement_days,
    }
    
    return render(request, 'index/announcement.html', context)

def the_project(request):
    return render(request, 'index/theproject.html')

def the_community(request):
    return render(request, 'index/thecommunity.html')

from django.shortcuts import render
from .models import FAQ

def contact(request):
    faqs = FAQ.objects.filter(is_active=True).order_by('order', 'created_at')
    
    context = {
        'faqs': faqs,
    }
    
    return render(request, 'index/contact.html', context)


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember_me = request.POST.get('remember')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            if user.is_active:
                if user.is_email_verified:
                    if user.is_admin_verified:
                        login(request, user)
                        
                        if not remember_me:
                            request.session.set_expiry(0)  

                        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                            return JsonResponse({
                                'success': True,
                                'redirect': reverse('user_dashboard')
                            })
                        else:
                            return redirect('user_dashboard')
                    else:
                        message = 'Your account is pending admin verification. Please wait for approval.'
                else:
                    message = 'Please verify your email address before logging in.'
            else:
                message = 'Your account has been deactivated. Please contact support.'
        else:
            message = 'Invalid username or password.'

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'message': message
            })
        else:
            messages.error(request, message)
    
    return render(request, 'auth/login.html')




@csrf_exempt
def logout_user(request):
    logout(request)
    request.session.flush() 
    return JsonResponse({'success': True, 'message': 'Logout successful', 'redirect': '/'})

@csrf_exempt
def check_auth(request):
    if request.session.get('is_authenticated'):
        try:
            user = YouthUser.objects.get(id=request.session['user_id'])
            return JsonResponse({
                'success': True,
                'authenticated': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
        except YouthUser.DoesNotExist:
            request.session.flush()
            return JsonResponse({'success': False, 'authenticated': False})
    return JsonResponse({'success': False, 'authenticated': False})

def signup_view(request):
    return render(request, 'auth/signup.html')


@csrf_exempt
def generate_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({'success': False, 'message': 'Email is required'})
            
            if not (email.endswith('@gmail.com') or email.endswith('@yahoo.com')):
                return JsonResponse({'success': False, 'message': 'Only Gmail or Yahoo emails are allowed'})
            
            otp_code = str(random.randint(100000, 999999))
            
            OTPVerification.objects.filter(email=email).delete()
            
            expires_at = timezone.now() + timedelta(minutes=10)
            otp_record = OTPVerification.objects.create(
                email=email,
                otp_code=otp_code,
                expires_at=expires_at
            )
            
            subject = "Email Verification - SK Mambugan Youth Management System"
            html_content = render_to_string('auth/otp_email.html', {
                'otp_code': otp_code,
                'expires_in': '10 minutes'
            })
            text_content = strip_tags(html_content)
            
            email_message = EmailMultiAlternatives(
                subject,
                text_content,
                settings.EMAIL_HOST_USER,
                [email]
            )
            email_message.attach_alternative(html_content, "text/html")
            email_message.send()
            
            return JsonResponse({
                'success': True, 
                'message': 'OTP sent successfully to your email'
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method'})



@csrf_exempt
def check_username(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            
            if not username:
                return JsonResponse({'available': False, 'message': 'Username is required'})
            
            if YouthUser.objects.filter(username=username).exists():
                return JsonResponse({'available': False, 'message': 'Username already taken'})
            else:
                return JsonResponse({'available': True, 'message': 'Username is available'})
                
        except Exception as e:
            return JsonResponse({'available': False, 'message': f'Error: {str(e)}'})
    
    return JsonResponse({'available': False, 'message': 'Invalid request method'})

@csrf_exempt
def check_email(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({'available': False, 'message': 'Email is required'})
            
            if YouthUser.objects.filter(email=email).exists():
                return JsonResponse({'available': False, 'message': 'Email already registered'})
            
            if not (email.endswith('@gmail.com') or email.endswith('@yahoo.com')):
                return JsonResponse({'available': False, 'message': 'Only Gmail or Yahoo emails are allowed'})
            
            return JsonResponse({'available': True, 'message': 'Email is available'})
                
        except Exception as e:
            return JsonResponse({'available': False, 'message': f'Error: {str(e)}'})
    
    return JsonResponse({'available': False, 'message': 'Invalid request method'})


@csrf_exempt
def register_user_with_files(request):
    if request.method == 'POST':
        try:
            username = request.POST.get('username')
            email = request.POST.get('email')
            password = request.POST.get('password')
            first_name = request.POST.get('firstName')
            last_name = request.POST.get('lastName')
            middle_name = request.POST.get('middleName', '')
            suffix = request.POST.get('suffix', '')
            address = request.POST.get('address')
            purok_zone = request.POST.get('purokZone')
            gender = request.POST.get('gender')
            birthdate = request.POST.get('birthdate')
            age = request.POST.get('age', 0)
            contact_number = request.POST.get('contactNumber')
            civil_status = request.POST.get('civilStatus')
            age_group = request.POST.get('ageGroup')
            education = request.POST.get('education')
            youth_classification = request.POST.get('youthClassification')
            work_status = request.POST.get('workStatus')
            sk_voter = request.POST.get('skVoter') == 'Yes'
            id_type = request.POST.get('idType')
            
            required_fields = [
                'username', 'email', 'password', 'firstName', 'lastName', 
                'address', 'purokZone', 'gender', 'birthdate', 'contactNumber',
                'civilStatus', 'ageGroup', 'education', 'youthClassification',
                'workStatus', 'skVoter', 'idType'
            ]
            
            for field in required_fields:
                if field not in request.POST or not request.POST[field]:
                    return JsonResponse({'success': False, 'message': f'{field} is required'})
            
            if YouthUser.objects.filter(username=username).exists():
                return JsonResponse({'success': False, 'message': 'Username already taken'})
            
            if YouthUser.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'message': 'Email already registered'})
            try:
                otp_record = OTPVerification.objects.filter(email=email, is_verified=True).latest('created_at')
                if otp_record.is_expired():
                    return JsonResponse({'success': False, 'message': 'OTP verification has expired. Please verify your email again.'})
            except OTPVerification.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Email not verified. Please complete OTP verification first.'})
            
            from datetime import datetime
            current_year = datetime.now().year
            
            last_user = YouthUser.objects.filter(
                registration_no__startswith=f'SKM-{current_year}-'
            ).order_by('-registration_no').first()
            
            if last_user and last_user.registration_no:
                try:
                    last_number = int(last_user.registration_no.split('-')[-1])
                    new_number = last_number + 1
                except (ValueError, IndexError):
                    new_number = 1
            else:
                new_number = 1
                
            registration_no = f'SKM-{current_year}-{new_number:03d}'
            
            user = YouthUser(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                middle_name=middle_name,
                suffix=suffix,
                address=address,
                purok_zone=purok_zone,
                gender=gender,
                birthdate=birthdate,
                age=age,
                contact_number=contact_number,
                civil_status=civil_status,
                age_group=age_group,
                education=education,
                youth_classification=youth_classification,
                work_status=work_status,
                sk_voter=sk_voter,
                registration_no=registration_no,
                id_type=id_type,
                is_active=False,
                is_email_verified=True 
            )
            
            if 'profilePicture' in request.FILES:
                user.profile_picture = request.FILES['profilePicture']
            
            if 'idPicture' in request.FILES:
                user.id_picture = request.FILES['idPicture']
            
            if 'birthCertificate' in request.FILES:
                user.birth_certificate = request.FILES['birthCertificate']
            
            user.set_password(password)
            user.save()
            
            return JsonResponse({
                'success': True, 
                'message': 'Registration successful! Your account will be activated after verification.',
                'registrationNo': registration_no,
                'userId': user.id
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Registration failed: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def verify_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            otp_attempt = data.get('otp')
            
            if not email or not otp_attempt:
                return JsonResponse({'success': False, 'message': 'Email and OTP are required'})
            
            try:
                otp_record = OTPVerification.objects.filter(email=email).latest('created_at')
            except OTPVerification.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'No OTP found for this email'})
            
            if otp_record.is_expired():
                otp_record.delete()
                return JsonResponse({'success': False, 'message': 'OTP has expired'})
            
            if otp_record.attempts >= 5:
                otp_record.delete()
                return JsonResponse({'success': False, 'message': 'Too many failed attempts'})
            
            if otp_attempt == otp_record.otp_code:
                otp_record.is_verified = True
                otp_record.save()
                
                try:
                    user = YouthUser.objects.get(email=email)
                    user.verify_email()
                    user.save()
                except YouthUser.DoesNotExist:
                    pass
                
                return JsonResponse({'success': True, 'message': 'OTP verified successfully'})
            else:
                otp_record.attempts += 1
                otp_record.save()
                remaining_attempts = 5 - otp_record.attempts
                return JsonResponse({
                    'success': False, 
                    'message': f'Invalid OTP. {remaining_attempts} attempts remaining.'
                })
                
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def resend_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({'success': False, 'message': 'Email is required'})
            return generate_otp(request)
            
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
        

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            identifier = data.get('username')  
            password = data.get('password')
            remember_me = data.get('rememberMe', False)

            user = YouthUser.objects.filter(Q(username=identifier) | Q(email=identifier)).first()

            if not user:
                return JsonResponse({'success': False, 'message': 'User is not registered.'}, status=404)

            if not user.check_password(password):
                return JsonResponse({'success': False, 'message': 'Incorrect username or password.'}, status=401)

            if not user.is_email_verified:
                return JsonResponse({'success': False, 'message': 'Email not verified. Please verify your email first.'}, status=403)

            if not user.is_admin_verified:
                return JsonResponse({'success': False, 'message': 'Account not yet approved by administrator. Please wait for approval.'}, status=403)

            request.session['user_id'] = user.id
            request.session['username'] = user.username
            request.session['is_authenticated'] = True
            
            if not remember_me:
                request.session.set_expiry(0)  
            else:
                request.session.set_expiry(1209600)  

            return JsonResponse({
                'success': True, 
                'message': 'Login successful',
                'redirect': '/mainpage/' 
            })

        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Login error: {str(e)}'}, status=500)
    
    return JsonResponse({'success': False, 'message': 'Invalid request method'})


    
def logout_view(request):
    request.session.flush()
    return redirect('login')


def admin_dashboard(request):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])

        if 'admin' not in user.username.lower():
            return redirect('dashboard')
        
        return render(request, 'dashboard/admin_dashboard.html', {'user': user})
    except YouthUser.DoesNotExist:
        request.session.flush()
        return redirect('login')
    





from django.shortcuts import render, redirect
from django.utils import timezone
from .models import YouthUser, Announcement, Event, EventRegistration, AnnouncementInteraction
from datetime import datetime, timedelta

def mainpage(request):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        now = timezone.now()
        
        announcements = Announcement.objects.filter(
            is_active=True, 
            publish_date__lte=now
        ).order_by('-publish_date')[:5]
        
        upcoming_events = Event.objects.filter(
            is_active=True,
            start_date__gte=now
        ).order_by('start_date')[:5]
        
        user_registrations = EventRegistration.objects.filter(user=user)
        user_registered_event_ids = [reg.event.id for reg in user_registrations]
        user_registered_events_count = user_registrations.count()
        
        user_volunteer_interactions = AnnouncementInteraction.objects.filter(
            user=user, 
            interaction_type='volunteered'
        )
        user_volunteer_count = user_volunteer_interactions.count()
        
        user_points = 24
        
        context = {
            'user': user,
            'announcements': announcements,
            'upcoming_events': upcoming_events,
            'upcoming_events_count': upcoming_events.count(),
            'user_registered_event_ids': user_registered_event_ids,
            'user_registered_events_count': user_registered_events_count,
            'user_volunteer_count': user_volunteer_count,
            'user_points': user_points,
        }
        
        return render(request, 'mainpage/mainpage.html', context)
        
    except YouthUser.DoesNotExist:
        request.session.flush()
        return redirect('login')
    

from django.shortcuts import render, redirect
from django.utils import timezone
from django.db.models import Q
from .models import YouthUser, Announcement, Event, EventRegistration, AnnouncementInteraction
from datetime import datetime, timedelta

def userannouncement(request):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        now = timezone.now()
        
        announcements = Announcement.objects.filter(
            is_active=True, 
            publish_date__lte=now
        ).order_by('-publish_date')
        
        events = Event.objects.filter(
            is_active=True,
            end_date__gte=now - timedelta(days=1)
        ).order_by('start_date')
        
        upcoming_events = Event.objects.filter(
            is_active=True,
            start_date__gte=now
        ).order_by('start_date')[:5]
        
        user_registrations = EventRegistration.objects.filter(user=user)
        user_registered_event_ids = [reg.event.id for reg in user_registrations]
        user_registered_events_count = user_registrations.count()
        
        user_announcement_interactions = AnnouncementInteraction.objects.filter(user=user)
        user_saved_announcement_ids = [
            inter.announcement.id for inter in user_announcement_interactions 
            if inter.interaction_type == 'saved'
        ]
        user_attending_announcement_ids = [
            inter.announcement.id for inter in user_announcement_interactions 
            if inter.interaction_type == 'attending'
        ]
        
        user_points = 24
        
        current_month = now.strftime("%B")
        current_year = now.year
        
        registered_event_days = []
        for registration in user_registrations:
            if registration.event.start_date:
                registered_event_days.append(registration.event.start_date.day)
        
        announcement_days = []
        for announcement in announcements.filter(is_important=True):
            if announcement.publish_date:
                announcement_days.append(announcement.publish_date.day)
        
        first_day = now.replace(day=1)
        weekday_of_first = first_day.weekday()
        days_in_month = 31
        
        calendar_days = []
        for i in range(weekday_of_first):
            calendar_days.append(0)
        
        for day in range(1, days_in_month + 1):
            calendar_days.append(day)
        
        recommended_events = Event.objects.filter(
            is_active=True,
            start_date__gte=now
        )
        
        if user.age_group and user.gender:
            recommended_events = recommended_events.filter(
                Q(age_group_access='all') | 
                Q(target_age_groups__name__icontains=user.age_group)
            )[:3]
        
        for event in events:
            event.is_eligible = event.is_eligible(user) if hasattr(event, 'is_eligible') else True
        
        context = {
            'user': user,
            'announcements': announcements,
            'events': events,
            'upcoming_events': upcoming_events,
            'announcements_count': announcements.count(),
            'upcoming_events_count': upcoming_events.count(),
            'user_registered_event_ids': user_registered_event_ids,
            'user_registered_events_count': user_registered_events_count,
            'user_saved_announcement_ids': user_saved_announcement_ids,
            'user_attending_announcement_ids': user_attending_announcement_ids,
            'user_points': user_points,
            'current_month': current_month,
            'current_year': current_year,
            'calendar_days': calendar_days,
            'registered_event_days': registered_event_days,
            'announcement_days': announcement_days,
            'recommended_events': recommended_events,
        }
        
        return render(request, 'mainpage/userannouncement.html', context)
        
    except YouthUser.DoesNotExist:
        request.session.flush()
        return redirect('login')


from django.utils import timezone
from .models import Complaint, Suggestion, SupportTicket, FAQ, CallbackRequest

def usercontact(request):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        complaint_count = Complaint.objects.filter(user=user).count()
        resolved_complaints = Complaint.objects.filter(user=user, status='resolved').count()
        
        suggestion_count = Suggestion.objects.filter(user=user).count()
        implemented_suggestions = Suggestion.objects.filter(user=user, status='implemented').count()
        
        open_tickets = SupportTicket.objects.filter(user=user, status='open').count()
        resolved_tickets = SupportTicket.objects.filter(user=user, status='resolved').count()
        
        faqs = FAQ.objects.filter(is_active=True).order_by('order', 'created_at')
        
        context = {
            'user': user,
            'complaint_count': complaint_count,
            'resolved_complaints': resolved_complaints,
            'suggestion_count': suggestion_count,
            'implemented_suggestions': implemented_suggestions,
            'open_tickets': open_tickets,
            'resolved_tickets': resolved_tickets,
            'faqs': faqs,
        }
        
        return render(request, 'mainpage/usercontact.html', context)
        
    except YouthUser.DoesNotExist:
        request.session.flush()
        return redirect('login')
    


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import ContactMessage, Complaint, Suggestion

@csrf_exempt
@require_POST
def send_contact_message(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        
        ContactMessage.objects.create(
            user=user,
            subject=subject,
            message=message
        )
        
        return JsonResponse({'success': True})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@csrf_exempt
@require_POST
def file_complaint(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        title = request.POST.get('title')
        description = request.POST.get('details')
        urgency = request.POST.get('urgency', 'medium')
        is_anonymous = request.POST.get('anonymous') == 'on'
        
        Complaint.objects.create(
            user=user if not is_anonymous else None,
            title=title,
            description=description,
            urgency=urgency,
            is_anonymous=is_anonymous
        )
        
        return JsonResponse({'success': True})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@csrf_exempt
@require_POST
def make_suggestion(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        title = request.POST.get('title')
        description = request.POST.get('details')
        is_anonymous = request.POST.get('anonymous') == 'on'
        
        Suggestion.objects.create(
            user=user if not is_anonymous else None,
            title=title,
            description=description,
            is_anonymous=is_anonymous
        )
        
        return JsonResponse({'success': True})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

def support_tickets(request):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        tickets = SupportTicket.objects.filter(user=user).order_by('-created_at')
        
        return render(request, 'mainpage/support_tickets.html', {
            'user': user,
            'tickets': tickets
        })
        
    except YouthUser.DoesNotExist:
        request.session.flush()
        return redirect('login')




from django.shortcuts import render, redirect
from .models import YouthUser

def user_profile(request):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        return render(request, 'mainpage/userprofile.html', {'user': user})
    except YouthUser.DoesNotExist:
        request.session.flush()
        return redirect('login')
    

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

@csrf_exempt
@require_POST
def update_profile(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.middle_name = request.POST.get('middle_name', user.middle_name)
        user.suffix = request.POST.get('suffix', user.suffix)
        user.address = request.POST.get('address', user.address)
        user.purok_zone = request.POST.get('purok_zone', user.purok_zone)
        user.gender = request.POST.get('gender', user.gender)
        user.birthdate = request.POST.get('birthdate', user.birthdate)
        user.age = request.POST.get('age', user.age)
        user.contact_number = request.POST.get('contact_number', user.contact_number)
        user.civil_status = request.POST.get('civil_status', user.civil_status)
        user.education = request.POST.get('education', user.education)
        user.youth_classification = request.POST.get('youth_classification', user.youth_classification)
        user.work_status = request.POST.get('work_status', user.work_status)
        user.sk_voter = request.POST.get('sk_voter') == 'on'
        
        user.save()
        
        return JsonResponse({'success': True})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})
    



    

def my_events(request):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        user_registrations = EventRegistration.objects.filter(user=user).select_related('event')
        
        now = timezone.now()
        upcoming_events = []
        past_events = []
        
        for registration in user_registrations:
            if registration.event.end_date >= now:
                upcoming_events.append(registration)
            else:
                past_events.append(registration)
        events_attended = user_registrations.filter(status='attended').count()
        upcoming_count = len(upcoming_events)
        
        total_points = sum(
            reg.event.points_reward for reg in user_registrations 
            if reg.status == 'attended' and reg.event.points_reward
        )
        
        achievements = []
        if events_attended >= 10:
            achievements.append('Community Champion')
        if events_attended >= 5:
            achievements.append('Team Player')
        if events_attended >= 3:
            achievements.append('Regular Participant')
        
        context = {
            'user': user,
            'upcoming_events': upcoming_events,
            'past_events': past_events,
            'events_attended': events_attended,
            'upcoming_count': upcoming_count,
            'total_points': total_points,
            'achievements': achievements,
        }
        
        return render(request, 'mainpage/myevents.html', context)
        
    except YouthUser.DoesNotExist:
        request.session.flush()
        return redirect('login')
    

from django.utils import timezone
from datetime import timedelta
from .models import CommunityPost, TrendingTopic, Event, CommunityGuideline

def user_community(request):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        posts = CommunityPost.objects.filter(is_active=True).order_by('-created_at')[:20]
        
        trending_topics = TrendingTopic.objects.filter(is_active=True).order_by('-post_count')[:4]
        
        upcoming_events = Event.objects.filter(
            is_active=True, 
            start_date__gte=timezone.now()
        ).order_by('start_date')[:2]
        
        guidelines = CommunityGuideline.objects.filter(is_active=True).order_by('order')
        
        total_members = YouthUser.objects.filter(is_active=True).count()
        
        start_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        events_this_month = Event.objects.filter(
            is_active=True, 
            start_date__gte=start_of_month
        ).count()
        
        week_ago = timezone.now() - timedelta(days=7)
        posts_this_week = CommunityPost.objects.filter(
            is_active=True,
            created_at__gte=week_ago
        ).count()
        
        context = {
            'user': user,
            'posts': posts,
            'trending_topics': trending_topics,
            'upcoming_events': upcoming_events,
            'guidelines': guidelines,
            'total_members': total_members,
            'events_this_month': events_this_month,
            'posts_this_week': posts_this_week,
        }
        
        return render(request, 'mainpage/usercommunity.html', context)
        
    except YouthUser.DoesNotExist:
        request.session.flush()
        return redirect('login')
    

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from .models import CommunityPost, PostLike, PostComment, TrendingTopic


@csrf_exempt
@require_POST
def create_post(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        content = request.POST.get('content', '')
        post_type = 'text'
        image = request.FILES.get('image')
        privacy = request.POST.get('privacy', 'public')
        
        if image:
            post_type = 'image'
        
        post = CommunityPost.objects.create(
            user=user,
            content=content,
            post_type=post_type,
            image=image,
            privacy=privacy
        )
        
        import re
        hashtags = re.findall(r'#(\w+)', content)
        for tag in hashtags:
            topic, created = TrendingTopic.objects.get_or_create(
                name=tag.lower(),
                defaults={'post_count': 1}
            )
            if not created:
                topic.post_count += 1
                topic.save()
        
        return JsonResponse({'success': True, 'post_id': post.id})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})


@csrf_exempt
@require_POST
def like_post(request, post_id):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        post = CommunityPost.objects.get(id=post_id)
        
        like, created = PostLike.objects.get_or_create(
            post=post,
            user=user,
            defaults={'is_active': True}
        )
        
        if not created:
            like.is_active = not like.is_active
            like.save()
        
        return JsonResponse({
            'success': True,
            'liked': like.is_active,
            'like_count': post.like_count
        })
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})


@csrf_exempt
@require_POST
def comment_on_post(request, post_id):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        data = json.loads(request.body)
        content = data.get('content', '')
        
        if not content:
            return JsonResponse({'success': False, 'message': 'Comment content is required'})
        
        user = YouthUser.objects.get(id=request.session['user_id'])
        post = CommunityPost.objects.get(id=post_id)
        
        comment = PostComment.objects.create(
            post=post,
            user=user,
            content=content
        )
        
        return JsonResponse({
            'success': True,
            'comment_id': comment.id,
            'comment_count': post.comment_count
        })
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})


from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import EventRegistrationResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json

def event_register(request, event_id):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        event = get_object_or_404(Event, id=event_id, is_active=True)
        
        existing_registration = EventRegistration.objects.filter(
            event=event, user=user, status__in=['pending', 'confirmed', 'waitlisted']
        ).first()
        
        if existing_registration:
            messages.info(request, "You've already registered for this event!")
            return redirect('userannouncement')
        
        if not event.is_eligible(user):
            messages.error(request, "You're not eligible to register for this event.")
            return redirect('userannouncement')
        
        if event.maximum_participants and event.current_participants >= event.maximum_participants:
            messages.warning(request, "This event is currently full. You can join the waitlist.")
        
        context = {
            'user': user,
            'event': event,
            'questions': event.questions.all(),
        }
        
        return render(request, 'mainpage/eventregister.html', context)
        
    except YouthUser.DoesNotExist:
        request.session.flush()
        return redirect('login')
    except Event.DoesNotExist:
        messages.error(request, "Event not found or is no longer available.")
        return redirect('userannouncement')

@method_decorator(csrf_exempt, name='dispatch')
class SubmitRegistrationView(View):
    def post(self, request, event_id):
        if not request.session.get('is_authenticated'):
            return JsonResponse({'success': False, 'error': 'Not authenticated'})
        
        try:
            data = json.loads(request.body)
            user = YouthUser.objects.get(id=request.session['user_id'])
            event = get_object_or_404(Event, id=event_id, is_active=True)
            
            if EventRegistration.objects.filter(event=event, user=user, status__in=['pending', 'confirmed', 'waitlisted']).exists():
                return JsonResponse({'success': False, 'error': 'Already registered'})
            
            if event.maximum_participants and event.current_participants >= event.maximum_participants:
                status = 'waitlisted'
            else:
                status = 'confirmed'
                event.current_participants += 1
                event.save()
            
            registration = EventRegistration.objects.create(
                event=event,
                user=user,
                status=status,
                emergency_contact_name=data.get('emergency_contact_name'),
                emergency_contact_number=data.get('emergency_contact_number'),
                dietary_restrictions=data.get('dietary_restrictions'),
                special_accommodations=data.get('special_accommodations'),
                how_heard=data.get('how_heard'),
                agree_to_terms=data.get('agree_to_terms') == 'true',
                agree_to_photos=data.get('agree_to_photos') == 'true',
            )
            
            for question in event.questions.all():
                response_key = f"question_{question.id}"
                if response_key in data:
                    EventRegistrationResponse.objects.create(
                        registration=registration,
                        question=question,
                        response=data[response_key]
                    )
            
            return JsonResponse({
                'success': True, 
                'status': status,
                'message': f'Successfully registered for {event.title}!'
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
        
from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from .models import YouthUser, Event, EventRegistration
from datetime import datetime, timedelta

def usereventdetails(request, event_id):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        event = get_object_or_404(Event, id=event_id, is_active=True)
        
        user_registrations = EventRegistration.objects.filter(user=user)
        user_registered_event_ids = [reg.event.id for reg in user_registrations]
        
        related_events = Event.objects.filter(
            is_active=True,
            category=event.category,
            start_date__gte=timezone.now()
        ).exclude(id=event.id).order_by('start_date')[:3]
        
        if event.maximum_participants:
            event.remaining_spots = event.maximum_participants - event.current_participants
        else:
            event.remaining_spots = "Unlimited"
            
        if event.registration_deadline:
            event.registration_open = timezone.now() < event.registration_deadline
        else:
            event.registration_open = True
        event.is_eligible = True  
        
        if hasattr(event, 'objectives') and event.objectives:
            event.objectives_list = [obj.strip() for obj in event.objectives.split(';') if obj.strip()]
        else:
            event.objectives_list = []
        
        context = {
            'user': user,
            'event': event,
            'user_registered_event_ids': user_registered_event_ids,
            'related_events': related_events,
        }
        
        return render(request, 'mainpage/usereventdetails.html', context)
        
    except YouthUser.DoesNotExist:
        request.session.flush()
        return redirect('login')