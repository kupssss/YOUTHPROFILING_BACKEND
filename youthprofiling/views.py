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
from .models import YouthUser, OTPVerification, UserLog, UserArchive
from datetime import timedelta
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Q
import json
from django.shortcuts import render
from .models import FAQ

# ____________________
# |  index pages      |
# --------------------





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


from django.urls import reverse
from django.conf import settings
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.utils import timezone
from user_agents import parse
import os
from .models import APKDownload, APKVersion

def track_download(request, download_method='direct'):
    user_agent_string = request.META.get('HTTP_USER_AGENT', '')
    ip_address = get_client_ip(request)
    user_agent = parse(user_agent_string)

    apk_download = APKDownload(
        ip_address=ip_address,
        user_agent=user_agent_string,
        device_type=get_device_type(user_agent),
        device_brand=user_agent.device.brand or '',
        device_model=user_agent.device.model or '',
        os_name=user_agent.os.family,
        os_version=user_agent.os.version_string,
        browser_name=user_agent.browser.family,
        browser_version=user_agent.browser.version_string,
        is_mobile=user_agent.is_mobile,
        is_tablet=user_agent.is_tablet,
        is_desktop=user_agent.is_pc,
        download_method=download_method,
        download_source=request.META.get('HTTP_REFERER', '')
    )
    apk_download.save()

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_device_type(user_agent):
    if user_agent.is_mobile:
        return 'mobile'
    elif user_agent.is_tablet:
        return 'tablet'
    elif user_agent.is_pc:
        return 'desktop'
    else:
        return 'other'

def mobile_apk(request):
    qr_download_url = request.build_absolute_uri(reverse('download_apk_qr'))
    current_version = APKVersion.objects.filter(is_active=True).first()
    total_downloads = APKDownload.objects.count()

    if current_version:
        app_version = current_version.version
        file_size = current_version.file_size
        release_date = current_version.release_date.year
        download_count = current_version.download_count
    else:
        app_version = "1.0.0"
        file_size = "15.2 MB"
        release_date = "2025"
        download_count = total_downloads

    context = {
        'page_title': 'Mobile APK Download',
        'app_version': app_version,
        'release_date': release_date,
        'file_size': file_size,
        'download_count': f"{download_count:,}+",
        'total_downloads': total_downloads,
        'qr_download_url': qr_download_url,
    }
    return render(request, 'index/mobile_apk.html', context)

def download_apk(request, method='direct'):
    file_path = os.path.join(settings.STATIC_ROOT, 'downloads', 'sk-mambugan.apk')
    
    if not os.path.exists(file_path):
        file_path = os.path.join(settings.BASE_DIR, 'static', 'downloads', 'sk-mambugan.apk')
    
    if os.path.exists(file_path):
        track_download(request, method)
        
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/vnd.android.package-archive')
            response['Content-Disposition'] = 'attachment; filename="sk-mambugan.apk"'
            return response
    else:
        track_download(request, method)
        placeholder_content = b'Placeholder APK file - Replace with actual APK'
        response = HttpResponse(placeholder_content, content_type='application/vnd.android.package-archive')
        response['Content-Disposition'] = 'attachment; filename="sk-mambugan.apk"'
        return response

def download_apk_qr(request):
    return download_apk(request, 'qr_code')

def download_apk_button(request):
    return download_apk(request, 'button')







def contact(request):
    faqs = FAQ.objects.filter(is_active=True).order_by('order', 'created_at')
    
    context = {
        'faqs': faqs,
    }
    
    return render(request, 'index/contact.html', context)






# _________________
# |  userside auth   |
# --------------------

otp_storage = {}

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




from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from django.core.files.storage import FileSystemStorage
import json
import random
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

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
            age = int(request.POST.get('age', 0))
            contact_number = request.POST.get('contactNumber')
            civil_status = request.POST.get('civilStatus')
            age_group = request.POST.get('ageGroup')
            education = request.POST.get('education')
            youth_classification = request.POST.get('youthClassification')
            work_status = request.POST.get('workStatus')
            sk_voter = request.POST.get('skVoter') == 'Yes'
            id_type = request.POST.get('idType')
            
            if age < 15:
                return JsonResponse({
                    'success': False, 
                    'message': 'You are under the legal age to register. Registration is only available for youth aged 15-30 years old.'
                })
            elif age > 30:
                return JsonResponse({
                    'success': False, 
                    'message': 'You exceed the maximum age allowed to register. The system is designed for youth aged 15-30 years old only.'
                })
            
            if 'profilePicture' not in request.FILES:
                return JsonResponse({'success': False, 'message': 'Profile picture is required.'})
            
            if 'idPicture' not in request.FILES:
                return JsonResponse({'success': False, 'message': 'ID picture is required.'})
            
            if 'birthCertificate' not in request.FILES:
                return JsonResponse({'success': False, 'message': 'Birth certificate is required.'})
            
            # Parent consent validation for ages 15-17
            if 15 <= age <= 17:
                if 'parentConsentLetter' not in request.FILES:
                    return JsonResponse({'success': False, 'message': 'Parent consent letter is required for youth aged 15-17.'})
                
                if 'parentIdPicture' not in request.FILES:
                    return JsonResponse({'success': False, 'message': 'Parent ID picture is required for youth aged 15-17.'})
                
                # Validate parent information fields
                parent_fields = ['parentName', 'parentRelationship', 'parentContactNumber', 'consentDate']
                for field in parent_fields:
                    if field not in request.POST or not request.POST[field]:
                        return JsonResponse({'success': False, 'message': f'Parent {field} is required for youth aged 15-17.'})
            
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
            
            if 15 <= age <= 17:
                user.parent_name = request.POST.get('parentName')
                user.parent_relationship = request.POST.get('parentRelationship')
                user.parent_contact_number = request.POST.get('parentContactNumber')
                user.consent_date = request.POST.get('consentDate')
                
                if 'parentConsentLetter' in request.FILES:
                    user.parent_consent_letter = request.FILES['parentConsentLetter']
                
                if 'parentIdPicture' in request.FILES:
                    user.parent_id_picture = request.FILES['parentIdPicture']
            
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
        

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Q
import json
from .models import YouthUser, UserLog


@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            identifier = data.get('username')
            password = data.get('password')
            remember_me = data.get('rememberMe', False)

            ip_address = get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]

            user = YouthUser.objects.filter(Q(username=identifier) | Q(email=identifier)).first()

            if not user:
                UserLog.objects.create(
                    username=identifier,
                    login_type='LOGIN_FAILED',
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                    failure_reason='User not registered'
                )
                return JsonResponse({'success': False, 'message': 'User is not registered.'}, status=404)

            if not user.check_password(password):
                UserLog.objects.create(
                    youth_user=user,
                    username=user.username,
                    login_type='LOGIN_FAILED',
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                    failure_reason='Wrong password'
                )
                return JsonResponse({'success': False, 'message': 'Incorrect username or password.'}, status=401)

            if not user.is_email_verified:
                UserLog.objects.create(
                    youth_user=user,
                    username=user.username,
                    login_type='LOGIN_FAILED',
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                    failure_reason='Email not verified'
                )
                return JsonResponse({'success': False, 'message': 'Email not verified. Please verify your email first.'}, status=403)

            if not user.is_admin_verified:
                UserLog.objects.create(
                    youth_user=user,
                    username=user.username,
                    login_type='LOGIN_FAILED',
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                    failure_reason='Waiting for admin approval'
                )
                return JsonResponse({'success': False, 'message': 'Account not yet approved by administrator. Please wait for approval.'}, status=403)

            if not user.is_active:
                UserLog.objects.create(
                    youth_user=user,
                    username=user.username,
                    login_type='LOGIN_FAILED',
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                    failure_reason='Account deactivated'
                )
                return JsonResponse({'success': False, 'message': 'Your account has been deactivated. Please contact support.'}, status=403)

            # ✅ Successful login
            request.session['user_id'] = user.id
            request.session['username'] = user.username
            request.session['is_authenticated'] = True

            user.last_login = timezone.now()
            user.save()

            if not remember_me:
                request.session.set_expiry(0)  # Session ends on browser close
            else:
                request.session.set_expiry(1209600)  # 2 weeks

            UserLog.objects.create(
                youth_user=user,
                username=user.username,
                login_type='LOGIN',
                ip_address=ip_address,
                user_agent=user_agent,
                success=True
            )

            # ✅ Fixed indentation here
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'redirect': '/mainpage/',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
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
                    'profile_picture': user.profile_picture.url if user.profile_picture else None,
                    'id_type': user.id_type,

                    # Extra ID-related fields
                    'id_picture': user.id_picture.url if user.id_picture else None,
                    'birth_certificate': user.birth_certificate.url if user.birth_certificate else None,
                    'parent_consent_letter': user.parent_consent_letter.url if user.parent_consent_letter else None,
                    'parent_id_picture': user.parent_id_picture.url if user.parent_id_picture else None,

                    'is_email_verified': user.is_email_verified,
                    'is_admin_verified': user.is_admin_verified,
                    'parent_name': user.parent_name,
                    'parent_relationship': user.parent_relationship,
                    'parent_contact_number': user.parent_contact_number,
                    'consent_date': user.consent_date.isoformat() if user.consent_date else None,
                    'created_at': user.created_at.isoformat(),
                }
            })

        except Exception as e:
            UserLog.objects.create(
                username=identifier if 'identifier' in locals() else 'unknown',
                login_type='LOGIN_FAILED',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                success=False,
                failure_reason=f'System error: {str(e)}'
            )
            return JsonResponse({'success': False, 'message': f'Login error: {str(e)}'}, status=500)

    return JsonResponse({'success': False, 'message': 'Invalid request method'})



def get_client_ip(request):
    """Get the client's IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


    
@csrf_exempt
def logout_view(request):
    if request.session.get('is_authenticated'):
        user_id = request.session.get('user_id')
        username = request.session.get('username')
        
        if user_id:
            try:
                user = YouthUser.objects.get(id=user_id)
                UserLog.objects.create(
                    youth_user=user,
                    username=username,
                    login_type='LOGOUT',
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                    success=True
                )
            except YouthUser.DoesNotExist:
                UserLog.objects.create(
                    username=username,
                    login_type='LOGOUT',
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                    success=True
                )
    
    logout(request)
    request.session.flush() 

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True, 'message': 'Logout successful', 'redirect': '/login'})
    else:
        return redirect('login')  



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
            profile_picture_path=user.profile_picture.path if user.profile_picture else '',
            id_picture_path=user.id_picture.path if user.id_picture else '',
            birth_certificate_path=user.birth_certificate.path if user.birth_certificate else '',
            parent_consent_letter_path=user.parent_consent_letter.path if user.parent_consent_letter else '',
            parent_id_picture_path=user.parent_id_picture.path if user.parent_id_picture else '',
            deletion_reason=reason
        )
        
        return archive
    except Exception as e:
        print(f"Error archiving user {user.id}: {str(e)}")
        return None


import json
import random
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import YouthUser, OTPVerification, PasswordResetToken

@csrf_exempt
def forgot_password_view(request):
    """Render the forgot password page"""
    return render(request, 'auth/forgotpassword.html')

@csrf_exempt
def initiate_password_reset(request):
    """Initiate password reset process by sending OTP"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({'success': False, 'message': 'Email is required'})
            
            # Check if email exists and is verified
            try:
                user = YouthUser.objects.get(email=email)
                if not user.is_email_verified:
                    return JsonResponse({'success': False, 'message': 'Email not verified. Please contact support.'})
                if not user.is_active:
                    return JsonResponse({'success': False, 'message': 'Account is deactivated. Please contact support.'})
            except YouthUser.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Email not found in our system'})
            
            # Generate OTP
            otp_code = str(random.randint(100000, 999999))
            
            # Delete existing OTPs for this email
            OTPVerification.objects.filter(email=email).delete()
            
            # Create new OTP record (without purpose field)
            expires_at = timezone.now() + timedelta(minutes=10)
            otp_record = OTPVerification.objects.create(
                email=email,
                otp_code=otp_code,
                expires_at=expires_at
            )
            
            # Send OTP email
            subject = "Password Reset Verification - SK Mambugan Youth Management System"
            html_content = render_to_string('auth/password_reset_email.html', {
                'otp_code': otp_code,
                'user': user,
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
                'message': 'Verification code sent to your email'
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def verify_reset_otp(request):
    """Verify OTP for password reset"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            otp_attempt = data.get('otp')
            
            if not email or not otp_attempt:
                return JsonResponse({'success': False, 'message': 'Email and OTP are required'})
            
            try:
                # Get the latest OTP record for this email (without purpose filter)
                otp_record = OTPVerification.objects.filter(email=email).latest('created_at')
            except OTPVerification.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'No verification code found'})
            
            if otp_record.is_expired():
                otp_record.delete()
                return JsonResponse({'success': False, 'message': 'Verification code has expired'})
            
            if otp_record.attempts >= 5:
                otp_record.delete()
                return JsonResponse({'success': False, 'message': 'Too many failed attempts'})
            
            if otp_attempt == otp_record.otp_code:
                # OTP verified successfully
                otp_record.is_verified = True
                otp_record.save()
                
                # Create password reset token
                reset_token = PasswordResetToken.objects.create(
                    user=YouthUser.objects.get(email=email),
                    token=str(random.randint(100000, 999999)) + str(random.randint(100000, 999999)),
                    expires_at=timezone.now() + timedelta(hours=1)
                )
                
                return JsonResponse({
                    'success': True, 
                    'message': 'Verification successful',
                    'token': reset_token.token
                })
            else:
                otp_record.attempts += 1
                otp_record.save()
                remaining_attempts = 5 - otp_record.attempts
                return JsonResponse({
                    'success': False, 
                    'message': f'Invalid code. {remaining_attempts} attempts remaining.'
                })
                
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def reset_password(request):
    """Reset user password after verification"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            new_password = data.get('newPassword')
            token = data.get('token')
            
            if not email or not new_password or not token:
                return JsonResponse({'success': False, 'message': 'All fields are required'})
            
            # Validate token
            try:
                reset_token = PasswordResetToken.objects.get(
                    token=token,
                    user__email=email,
                    expires_at__gt=timezone.now(),
                    is_used=False
                )
            except PasswordResetToken.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'Invalid or expired reset token'})
            
            # Validate password strength
            if len(new_password) < 8:
                return JsonResponse({'success': False, 'message': 'Password must be at least 8 characters long'})
            
            # Update user password
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.is_used = True
            reset_token.save()
            
            # Log the password reset
            UserLog.objects.create(
                youth_user=user,
                username=user.username,
                login_type='PASSWORD_RESET',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                success=True
            )
            
            return JsonResponse({
                'success': True, 
                'message': 'Password reset successfully!'
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def resend_reset_otp(request):
    """Resend OTP for password reset"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({'success': False, 'message': 'Email is required'})
            
            return initiate_password_reset(request)
            
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})















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
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import YouthUser
import os
from django.conf import settings

def user_profile(request):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        return render(request, 'mainpage/userprofile.html', {'user': user})
    except YouthUser.DoesNotExist:
        request.session.flush()
        return redirect('login')

@csrf_exempt
@require_POST
def update_profile(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        # Update basic fields
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
        user.id_type = request.POST.get('id_type', user.id_type)
        
        # Update parent consent fields (for ages 15-17)
        user.parent_name = request.POST.get('parent_name', user.parent_name)
        user.parent_relationship = request.POST.get('parent_relationship', user.parent_relationship)
        user.parent_contact_number = request.POST.get('parent_contact_number', user.parent_contact_number)
        user.consent_date = request.POST.get('consent_date', user.consent_date)
        
        # Handle file uploads
        if 'profile_picture' in request.FILES:
            # Delete old profile picture if exists
            if user.profile_picture:
                old_path = user.profile_picture.path
                if os.path.exists(old_path):
                    os.remove(old_path)
            user.profile_picture = request.FILES['profile_picture']
        
        if 'id_picture' in request.FILES:
            if user.id_picture:
                old_path = user.id_picture.path
                if os.path.exists(old_path):
                    os.remove(old_path)
            user.id_picture = request.FILES['id_picture']
        
        if 'birth_certificate' in request.FILES:
            if user.birth_certificate:
                old_path = user.birth_certificate.path
                if os.path.exists(old_path):
                    os.remove(old_path)
            user.birth_certificate = request.FILES['birth_certificate']
        
        if 'parent_consent_letter' in request.FILES:
            if user.parent_consent_letter:
                old_path = user.parent_consent_letter.path
                if os.path.exists(old_path):
                    os.remove(old_path)
            user.parent_consent_letter = request.FILES['parent_consent_letter']
        
        if 'parent_id_picture' in request.FILES:
            if user.parent_id_picture:
                old_path = user.parent_id_picture.path
                if os.path.exists(old_path):
                    os.remove(old_path)
            user.parent_id_picture = request.FILES['parent_id_picture']
        
        user.save()
        
        return JsonResponse({'success': True, 'message': 'Profile updated successfully'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@csrf_exempt
@require_POST
def delete_profile_picture(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        if user.profile_picture:
            old_path = user.profile_picture.path
            if os.path.exists(old_path):
                os.remove(old_path)
            user.profile_picture.delete(save=False)
            user.profile_picture = None
            user.save()
        
        return JsonResponse({'success': True, 'message': 'Profile picture deleted successfully'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})
    



    

def my_events(request):
    if not request.session.get('is_authenticated'):
        return redirect('login')
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        # Get all user registrations with related event data
        user_registrations = EventRegistration.objects.filter(user=user).select_related('event')
        
        now = timezone.now()
        upcoming_events = []
        past_events = []
        
        for registration in user_registrations:
            # For upcoming events: events that haven't ended yet AND user is registered/waitlisted
            if registration.event.end_date >= now and registration.status in ['confirmed', 'pending', 'waitlisted']:
                upcoming_events.append(registration)
            # For past events: events that have ended OR events with status 'attended' (regardless of date)
            elif registration.event.end_date < now or registration.status == 'attended':
                past_events.append(registration)
        
        # Calculate real statistics
        events_attended = user_registrations.filter(status='attended').count()
        upcoming_count = len(upcoming_events)
        
        # Calculate total points from attended events
        total_points = sum(
            reg.event.points_reward for reg in user_registrations 
            if reg.status == 'attended' and reg.event.points_reward
        )
        
        # Real achievements based on actual participation
        achievements = []
        if events_attended >= 10:
            achievements.append('Community Champion')
        elif events_attended >= 5:
            achievements.append('Active Participant')
        elif events_attended >= 1:
            achievements.append('Event Enthusiast')
        
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
    
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
from .models import EventEvaluation

@csrf_exempt
def event_registration_detail_api(request, registration_id):
    if request.method == 'GET':
        try:
            registration = EventRegistration.objects.select_related('event').get(id=registration_id)
            
            data = {
                'success': True,
                'registration': {
                    'event_id': registration.event.id,  # Add this line
                    'event_title': registration.event.title,
                    'event_date': registration.event.start_date.strftime('%B %d, %Y'),
                    'event_time': f"{registration.event.start_date.strftime('%I:%M %p')} - {registration.event.end_date.strftime('%I:%M %p')}",
                    'event_location': registration.event.location,
                    'event_description': registration.event.description,
                    'current_participants': registration.event.current_participants,
                    'max_participants': registration.event.maximum_participants,
                    'points_reward': registration.event.points_reward,
                    'registration_date': registration.registration_date.strftime('%B %d, %Y'),
                    'emergency_contact': f"{registration.emergency_contact_name} - {registration.emergency_contact_number}" if registration.emergency_contact_name else None,
                    'feedback_provided': registration.feedback_provided,
                    'certificate_issued': registration.certificate_issued,
                }
            }
            return JsonResponse(data)
        except EventRegistration.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Registration not found'})

@csrf_exempt
def cancel_registration_api(request, registration_id):
    if request.method == 'POST':
        try:
            registration = EventRegistration.objects.get(id=registration_id)
            if registration.status in ['confirmed', 'pending', 'waitlisted']:
                registration.status = 'cancelled'
                registration.save()

                if registration.status == 'confirmed':
                    registration.event.current_participants = max(0, registration.event.current_participants - 1)
                    registration.event.save()
                
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False, 'error': 'Cannot cancel this registration'})
        except EventRegistration.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Registration not found'})

@csrf_exempt
def submit_evaluation_api(request, registration_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            registration = EventRegistration.objects.get(id=registration_id)
            
            # Create evaluation
            evaluation = EventEvaluation.objects.create(
                registration=registration,
                rating=data.get('rating'),
                comments=data.get('comments'),
                suggestions=data.get('suggestions'),
                would_attend_again=data.get('would_attend_again', True)
            )
            
            # Update registration
            registration.feedback_provided = True
            registration.rating = data.get('rating')
            registration.save()
            
            return JsonResponse({'success': True})
        except EventRegistration.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Registration not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})







    

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
                status = 'pending'
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

















    

# _________________
# |  MOBILE APP   |
# --------------------


from django.http import JsonResponse
from django.utils import timezone
from .models import YouthUser, Announcement, Event, EventRegistration, AnnouncementInteraction, EventQuestion
import json

@csrf_exempt
def get_user_dashboard_data(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'}, status=401)
    
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
        
        announcements_data = []
        for announcement in announcements:
            announcements_data.append({
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'excerpt': announcement.content[:100] + '...' if len(announcement.content) > 100 else announcement.content,
                'publish_date': announcement.publish_date.isoformat() if announcement.publish_date else None,
                'image_url': announcement.image.url if announcement.image else None
            })
        
        events_data = []
        for event in upcoming_events:
            events_data.append({
                'id': event.id,
                'title': event.title,
                'location': event.location or 'TBA',
                'start_date': event.start_date.isoformat() if event.start_date else None,
                'end_date': event.end_date.isoformat() if event.end_date else None,
                'image_url': event.image.url if event.image else None,
                'maximum_participants': event.maximum_participants,
                'current_participants': event.current_participants or 0,
                'is_registered': event.id in user_registered_event_ids
            })
        
        response_data = {
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name or 'Youth',
                'last_name': user.last_name or 'Member',
                'email': user.email
            },
            'statistics': {
                'upcoming_events_count': upcoming_events.count(),
                'user_registered_events_count': user_registered_events_count,
                'user_volunteer_count': user_volunteer_count,
                'user_points': user.points if hasattr(user, 'points') else 0
            },
            'announcements': announcements_data,  
            'upcoming_events': events_data 
        }
        
        print("Sending dashboard data:", response_data) 
        return JsonResponse(response_data)
        
    except YouthUser.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User not found'}, status=404)
    except Exception as e:
        print("Error in dashboard data:", str(e))  
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@csrf_exempt
def register_for_event(request, event_id):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'}, status=401)
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        event = Event.objects.get(id=event_id)
        
        if EventRegistration.objects.filter(user=user, event=event).exists():
            return JsonResponse({'success': False, 'message': 'Already registered for this event'})
        
        if event.maximum_participants and event.current_participants >= event.maximum_participants:
            return JsonResponse({'success': False, 'message': 'Event is fully booked'})
        
        registration = EventRegistration(user=user, event=event)
        registration.save()
        
        event.current_participants += 1
        event.save()
        
        return JsonResponse({'success': True, 'message': 'Successfully registered for event'})
        
    except Event.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Event not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@csrf_exempt
def get_events_data(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'}, status=401)
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        now = timezone.now()
        
        upcoming_events = Event.objects.filter(
            is_active=True,
            start_date__gte=now
        ).order_by('start_date')
        
        user_registrations = EventRegistration.objects.filter(user=user)
        registered_events = Event.objects.filter(
            id__in=[reg.event.id for reg in user_registrations],
            is_active=True
        ).order_by('start_date')
        
        recommended_events = Event.objects.filter(
            is_active=True,
            start_date__gte=now
        )
        
        if user.age_group and user.gender:
            recommended_events = recommended_events.filter(
                Q(age_group_access='all') | 
                Q(target_age_groups__name__icontains=user.age_group)
            )[:3]
        else:
            recommended_events = recommended_events[:3]
        
        announcements = Announcement.objects.filter(
            is_active=True
        ).order_by('-publish_date')[:5] 
        
        def format_event_data(events, user):
            events_data = []
            for event in events:
                events_data.append({
                    'id': event.id,
                    'title': event.title,
                    'description': event.description,
                    'excerpt': event.excerpt or event.description[:100] + '...' if len(event.description) > 100 else event.description,
                    'category': event.category,
                    'image_url': event.image.url if event.image else None,
                    'start_date': event.start_date.isoformat() if event.start_date else None,
                    'end_date': event.end_date.isoformat() if event.end_date else None,
                    'location': event.location,
                    'maximum_participants': event.maximum_participants,
                    'current_participants': event.current_participants or 0,
                    'requires_registration': event.requires_registration,
                    'is_registered': event.id in [reg.event.id for reg in user_registrations],
                    'is_eligible': event.is_eligible(user) if hasattr(event, 'is_eligible') else True,
                    'points_reward': event.points_reward
                })
            return events_data
        
        def format_announcement_data(announcements):
            announcements_data = []
            for announcement in announcements:
                announcements_data.append({
                    'id': announcement.id,
                    'title': announcement.title,
                    'content': announcement.content,
                    'excerpt': announcement.excerpt or announcement.content[:150] + '...' if len(announcement.content) > 150 else announcement.content,
                    'publish_date': announcement.publish_date.isoformat(),
                    'image_url': announcement.image.url if announcement.image else None,
                })
            return announcements_data
        
        response_data = {
            'success': True,
            'statistics': {
                'upcoming_events_count': upcoming_events.count(),
                'user_registered_events_count': user_registrations.count(),
                'user_volunteer_count': 0, 
                'user_points': user.points if hasattr(user, 'points') else 0
            },
            'upcoming_events': format_event_data(upcoming_events, user),
            'registered_events': format_event_data(registered_events, user),
            'recommended_events': format_event_data(recommended_events, user),
            'announcements': format_announcement_data(announcements)
        }
        
        return JsonResponse(response_data)
        
    except YouthUser.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

from django.views.decorators.http import require_GET


from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

@csrf_exempt
@require_http_methods(["GET"])
def mobile_user_profile(request):
    """Mobile-specific user profile API"""
    print("📱 [Django Mobile] user_profile endpoint called")
    
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user_id = request.session.get('user_id')
        user = YouthUser.objects.get(id=user_id)
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name if user.first_name else '',
            'last_name': user.last_name if user.last_name else '',
            'middle_name': user.middle_name if user.middle_name else '',
            'suffix': user.suffix if user.suffix else '',
            'address': user.address if user.address else '',
            'purok_zone': user.purok_zone if user.purok_zone else 'AgnesVille',
            'gender': user.gender if user.gender else 'Male',
            'birthdate': str(user.birthdate) if user.birthdate else '',
            'age': user.age if user.age else 0,
            'contact_number': user.contact_number if user.contact_number else '',
            'civil_status': user.civil_status if user.civil_status else 'Single',
            'age_group': user.age_group if user.age_group else '15-17',
            'education': user.education if user.education else 'High School',
            'youth_classification': user.youth_classification if user.youth_classification else 'Student',
            'work_status': user.work_status if user.work_status else 'Student',
            'sk_voter': bool(user.sk_voter),
            'registration_no': user.registration_no if user.registration_no else '',
            'profile_picture': user.profile_picture.url if user.profile_picture else None,
            'id_type': user.id_type if user.id_type else 'Student ID',
            'is_email_verified': bool(user.is_email_verified),
            'is_admin_verified': bool(user.is_admin_verified),
            'parent_name': user.parent_name if user.parent_name else '',
            'parent_relationship': user.parent_relationship if user.parent_relationship else '',
            'parent_contact_number': user.parent_contact_number if user.parent_contact_number else '',
            'consent_date': str(user.consent_date) if user.consent_date else '',
            'created_at': user.created_at.isoformat() if user.created_at else timezone.now().isoformat(),
            'id_picture': user.id_picture.url if user.id_picture else None,
            'birth_certificate': user.birth_certificate.url if user.birth_certificate else None,
            'parent_consent_letter': user.parent_consent_letter.url if user.parent_consent_letter else None,
            'parent_id_picture': user.parent_id_picture.url if user.parent_id_picture else None,
        }
        
        print(f"📱 [Django Mobile] User data prepared with files:")
        print(f"   - Profile Picture: {user_data['profile_picture']}")
        print(f"   - ID Picture: {user_data['id_picture']}")
        print(f"   - Birth Certificate: {user_data['birth_certificate']}")
        print(f"   - Parent Consent: {user_data['parent_consent_letter']}")
        print(f"   - Parent ID: {user_data['parent_id_picture']}")
        
        return JsonResponse({'success': True, 'user': user_data})
        
    except YouthUser.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User not found'})
    except Exception as e:
        print(f"💥 [Django Mobile] Error: {str(e)}")
        return JsonResponse({'success': False, 'message': f'Server error: {str(e)}'})
    
@csrf_exempt
@require_http_methods(["POST"])
def mobile_update_profile(request):
    """Mobile-specific profile update"""
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        update_fields = [
            'first_name', 'last_name', 'middle_name', 'suffix', 'address',
            'purok_zone', 'gender', 'birthdate', 'contact_number', 
            'civil_status', 'education', 'youth_classification', 'work_status',
            'id_type', 'parent_name', 'parent_relationship', 'parent_contact_number',
            'consent_date'
        ]
        
        for field in update_fields:
            if field in request.POST:
                setattr(user, field, request.POST[field])
        
        if 'birthdate' in request.POST:
            birthdate = request.POST['birthdate']
            if birthdate:
                user.birthdate = birthdate
                from datetime import date
                birth_date = date.fromisoformat(birthdate)
                today = date.today()
                age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
                user.age = age
                
                if 15 <= age <= 17:
                    user.age_group = '15-17'
                elif 18 <= age <= 21:
                    user.age_group = '18-21'
                elif 22 <= age <= 25:
                    user.age_group = '22-25'
                elif 26 <= age <= 30:
                    user.age_group = '26-30'
        
        user.sk_voter = request.POST.get('sk_voter') == 'true'
        
        user.save()
        
        return JsonResponse({'success': True, 'message': 'Profile updated successfully'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})
    

@csrf_exempt
@require_http_methods(["POST"])
def mobile_upload_file(request):
    """Handle file uploads for mobile"""
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        field_name = None
        uploaded_file = None
        
        for key in request.FILES:
            field_name = key
            uploaded_file = request.FILES[key]
            break
        
        if not field_name or not uploaded_file:
            return JsonResponse({'success': False, 'message': 'No file provided'})
        
        valid_fields = ['profile_picture', 'id_picture', 'birth_certificate', 'parent_consent_letter', 'parent_id_picture']
        if field_name not in valid_fields:
            return JsonResponse({'success': False, 'message': 'Invalid field name'})
        
        old_file = getattr(user, field_name)
        if old_file:
            if default_storage.exists(old_file.name):
                default_storage.delete(old_file.name)
            setattr(user, field_name, None)
        
        setattr(user, field_name, uploaded_file)
        user.save()
        
        user.refresh_from_db()
        new_file = getattr(user, field_name)
        file_url = new_file.url if new_file else None
        
        print(f"📱 [Django Mobile] File uploaded successfully: {field_name} -> {file_url}")
        
        return JsonResponse({
            'success': True, 
            'message': 'File uploaded successfully',
            'file_url': file_url
        })
    
    except Exception as e:
        print(f"💥 [Django Mobile] Upload error: {str(e)}")
        return JsonResponse({'success': False, 'message': str(e)})

@csrf_exempt
@require_http_methods(["POST"])
def mobile_delete_file(request):
    """Handle file deletion for mobile"""
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        data = json.loads(request.body)
        field_name = data.get('field')
        
        if not field_name:
            return JsonResponse({'success': False, 'message': 'No field specified'})
        
        valid_fields = ['profile_picture', 'id_picture', 'birth_certificate', 'parent_consent_letter', 'parent_id_picture']
        if field_name not in valid_fields:
            return JsonResponse({'success': False, 'message': 'Invalid field name'})
        
        file_field = getattr(user, field_name)
        if file_field:
            file_field.delete(save=False)
            setattr(user, field_name, None)
            user.save()
        
        return JsonResponse({'success': True, 'message': 'File deleted successfully'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@csrf_exempt
@require_http_methods(["POST"])
def mobile_change_password(request):
    """Handle password change for mobile"""
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        data = json.loads(request.body)
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return JsonResponse({'success': False, 'message': 'Current password and new password are required'})
        
        if not user.check_password(current_password):
            return JsonResponse({'success': False, 'message': 'Current password is incorrect'})
        
        user.set_password(new_password)
        user.save()
        
        return JsonResponse({'success': True, 'message': 'Password changed successfully'})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})



from django.http import JsonResponse
from django.utils import timezone

@csrf_exempt
@require_GET
def event_details(request, event_id):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'error': 'Not authenticated'}, status=401)

    try:
        event = Event.objects.get(id=event_id, is_active=True)
        user_id = request.session.get('user_id')
        user = YouthUser.objects.get(id=user_id)

        event_data = {
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'category': event.category,
            'image_url': event.image.url if event.image else None,
            'start_date': event.start_date,
            'end_date': event.end_date,
            'location': event.location,
            'location_details': event.location_details,
            'maximum_participants': event.maximum_participants,
            'current_participants': event.current_participants,
            'requires_registration': event.requires_registration,
            'is_registered': EventRegistration.objects.filter(user=user, event=event).exists(),
            'is_eligible': True,  
            'points_reward': event.points_reward,
            'age_requirement': event.age_requirement,
            'registration_deadline': event.registration_deadline,
            'objectives_list': event.objectives.split(';') if event.objectives else [],
            'images': [img.image.url for img in event.images.all()] if hasattr(event, 'images') else []
        }

        related_events = Event.objects.filter(
            is_active=True,
            category=event.category
        ).exclude(id=event.id)[:3]

        related_events_data = [
            {
                'id': rel.id,
                'title': rel.title,
                'image_url': rel.image.url if rel.image else None,
                'start_date': rel.start_date,
                'location': rel.location,
            }
            for rel in related_events
        ]

        return JsonResponse({
            'event': event_data,
            'related_events': related_events_data
        })

    except Event.DoesNotExist:
        return JsonResponse({'error': 'Event not found'}, status=404)
    except YouthUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET

@csrf_exempt
@require_GET
def related_events(request, event_id):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'error': 'Not authenticated'}, status=401)

    try:
        current_event = Event.objects.get(id=event_id, is_active=True)
        
        related_events = Event.objects.filter(
            is_active=True,
            category=current_event.category
        ).exclude(id=event_id)[:3]

        related_events_data = [
            {
                'id': event.id,
                'title': event.title,
                'image_url': event.image.url if event.image else None,
                'start_date': event.start_date,
                'location': event.location,
                'category': event.category,
                'description': event.description,
                'excerpt': event.description[:100] + '...' if len(event.description) > 100 else event.description,
                'end_date': event.end_date,
                'maximum_participants': event.maximum_participants,
                'current_participants': event.current_participants,
                'requires_registration': event.requires_registration,
                'is_registered': False, 
                'is_eligible': True,  
                'points_reward': event.points_reward,
            }
            for event in related_events
        ]

        return JsonResponse({
            'related_events': related_events_data
        })

    except Event.DoesNotExist:
        return JsonResponse({'error': 'Event not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from django.shortcuts import get_object_or_404

@csrf_exempt
@require_GET
def mobile_event_register_data(request, event_id):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        user_id = request.session.get('user_id')
        user = YouthUser.objects.get(id=user_id)
        event = get_object_or_404(Event, id=event_id, is_active=True)
        
        existing_registration = EventRegistration.objects.filter(
            event=event, user=user, status__in=['pending', 'confirmed', 'waitlisted']
        ).first()
        
        if existing_registration:
            return JsonResponse({
                'error': 'Already registered for this event',
                'is_registered': True
            }, status=400)
        
        is_eligible = event.is_eligible(user)
        if not is_eligible:
            return JsonResponse({
                'error': 'Not eligible for this event',
                'is_eligible': False
            }, status=400)
        
        questions_data = []
        for question in event.questions.all():
            questions_data.append({
                'id': question.id,
                'question_text': question.question_text,
                'question_type': question.question_type,
                'is_required': question.is_required,
                'options': question.options.split(';') if question.options else []
            })
        
   
        response_data = {
            'event': {
                'id': event.id,
                'title': event.title,
                'description': event.description,
                'category': event.category,
                'image_url': event.image.url if event.image else None,
                'start_date': event.start_date.isoformat(),
                'end_date': event.end_date.isoformat(),
                'location': event.location,
                'maximum_participants': event.maximum_participants,
                'current_participants': event.current_participants,
                'requires_registration': event.requires_registration,
                'is_registered': False,
                'is_eligible': is_eligible,
                'points_reward': event.points_reward,
                'registration_deadline': event.registration_deadline.isoformat() if event.registration_deadline else None,
            },
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
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
                'profile_picture': user.profile_picture.url if user.profile_picture else None,
                'id_type': user.id_type,
                'is_email_verified': user.is_email_verified,
                'is_admin_verified': user.is_admin_verified,
                'parent_name': user.parent_name,
                'parent_relationship': user.parent_relationship,
                'parent_contact_number': user.parent_contact_number,
                'consent_date': user.consent_date.isoformat() if user.consent_date else None,
                'created_at': user.created_at.isoformat(),
            },
            'questions': questions_data
        }
        return JsonResponse(response_data)
        
    except YouthUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Event.DoesNotExist:
        return JsonResponse({'error': 'Event not found'}, status=404)


@csrf_exempt
@require_POST
def mobile_submit_registration(request, event_id):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'error': 'Not authenticated'}, status=401)
    
    try:
        user_id = request.session.get('user_id')
        user = YouthUser.objects.get(id=user_id)
        event = get_object_or_404(Event, id=event_id, is_active=True)
        
        if EventRegistration.objects.filter(
            event=event, user=user, status__in=['pending', 'confirmed', 'waitlisted']
        ).exists():
            return JsonResponse({
                'success': False, 
                'error': 'You have already registered for this event'
            })
        
        if not event.is_eligible(user):
            return JsonResponse({
                'success': False, 
                'error': 'You are not eligible to register for this event'
            })
        
        if event.maximum_participants and event.current_participants >= event.maximum_participants:
            status = 'waitlisted'
            message = f'Successfully added to waitlist for {event.title}! You will be notified if a spot becomes available.'
        else:
            status = 'pending'
            event.current_participants += 1
            event.save()
            message = f'Successfully registered for {event.title}!'
        
        data = json.loads(request.body.decode('utf-8')) if request.body else {}
        
        registration = EventRegistration.objects.create(
            event=event,
            user=user,
            status=status,
            emergency_contact_name=data.get('emergency_contact_name', ''),
            emergency_contact_number=data.get('emergency_contact_number', ''),
            special_accommodations=data.get('special_accommodations', ''),
            how_heard=data.get('how_heard', ''),
            agree_to_terms=data.get('agree_to_terms', False),
            agree_to_photos=data.get('agree_to_photos', False),
        )
        
        question_responses = data.get('question_responses', {})
        for question_id, response in question_responses.items():
            try:
                question_id_int = int(str(question_id).replace('question_', ''))
                question = EventQuestion.objects.get(id=question_id_int, event=event)
                if isinstance(response, list):
                    response_str = ', '.join(response)
                else:
                    response_str = str(response)
                EventRegistrationResponse.objects.create(
                    registration=registration,
                    question=question,
                    response=response_str
                )
            except (EventQuestion.DoesNotExist, ValueError):
                continue
        
        return JsonResponse({
            'success': True, 
            'status': status,
            'message': message,
            'registration_id': registration.id
        })
        
    except YouthUser.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
    except Event.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Event not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class MobileUserEventsView(View):
    def get(self, request, user_id):
        try:
            user = YouthUser.objects.get(id=user_id)
            user_registrations = EventRegistration.objects.filter(user=user).select_related('event')
            
            now = timezone.now()
            upcoming_events = []
            past_events = []
            
            for registration in user_registrations:
                if registration.event.end_date >= now and registration.status in ['confirmed', 'pending', 'waitlisted']:
                    upcoming_events.append(registration)
                elif registration.event.end_date < now or registration.status == 'attended':
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
            elif events_attended >= 5:
                achievements.append('Active Participant')
            elif events_attended >= 1:
                achievements.append('Event Enthusiast')
            
            registrations_data = []
            for reg in user_registrations:
                registrations_data.append({
                    'id': reg.id,
                    'event': {
                        'id': reg.event.id,
                        'title': reg.event.title,
                        'description': reg.event.description,
                        'start_date': reg.event.start_date.isoformat(),
                        'end_date': reg.event.end_date.isoformat(),
                        'location': reg.event.location,
                        'points_reward': reg.event.points_reward,
                    },
                    'registration_date': reg.registration_date.isoformat(),
                    'status': reg.status,
                    'emergency_contact_name': reg.emergency_contact_name,
                    'emergency_contact_number': reg.emergency_contact_number,
                    'feedback_provided': reg.feedback_provided,
                    'certificate_issued': reg.certificate_issued,
                    'rating': reg.rating,
                })
            
            return JsonResponse({
                'success': True,
                'registrations': registrations_data,
                'events_attended': events_attended,
                'upcoming_count': upcoming_count,
                'total_points': total_points,
                'achievements': achievements,
            })
            
        except YouthUser.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'})

@csrf_exempt
def mobile_cancel_registration_api(request, registration_id):
    if request.method == 'POST':
        try:
            registration = EventRegistration.objects.get(id=registration_id)
            if registration.status in ['confirmed', 'pending', 'waitlisted']:
                registration.status = 'cancelled'
                registration.save()

                if registration.status == 'confirmed':
                    registration.event.current_participants = max(0, registration.event.current_participants - 1)
                    registration.event.save()
                
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False, 'error': 'Cannot cancel this registration'})
        except EventRegistration.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Registration not found'})

@csrf_exempt
def mobile_submit_evaluation_api(request, registration_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            registration = EventRegistration.objects.get(id=registration_id)
            
            evaluation = EventEvaluation.objects.create(
                registration=registration,
                rating=data.get('rating'),
                comments=data.get('comments'),
                suggestions=data.get('suggestions'),
                would_attend_again=data.get('would_attend_again', True)
            )
            
            registration.feedback_provided = True
            registration.rating = data.get('rating')
            registration.save()
            
            return JsonResponse({'success': True})
        except EventRegistration.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Registration not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

@csrf_exempt
def mobile_event_registration_detail_api(request, registration_id):
    if request.method == 'GET':
        try:
            registration = EventRegistration.objects.select_related('event').get(id=registration_id)
            
            data = {
                'success': True,
                'registration': {
                    'id': registration.id,
                    'event_id': registration.event.id,
                    'event_title': registration.event.title,
                    'event_date': registration.event.start_date.strftime('%B %d, %Y'),
                    'event_time': f"{registration.event.start_date.strftime('%I:%M %p')} - {registration.event.end_date.strftime('%I:%M %p')}",
                    'event_location': registration.event.location,
                    'event_description': registration.event.description,
                    'current_participants': registration.event.current_participants,
                    'max_participants': registration.event.maximum_participants,
                    'points_reward': registration.event.points_reward,
                    'registration_date': registration.registration_date.strftime('%B %d, %Y'),
                    'emergency_contact': f"{registration.emergency_contact_name} - {registration.emergency_contact_number}" if registration.emergency_contact_name else None,
                    'feedback_provided': registration.feedback_provided,
                    'certificate_issued': registration.certificate_issued,
                }
            }
            return JsonResponse(data)
        except EventRegistration.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Registration not found'})

@csrf_exempt
def mobile_community(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'}, status=401)
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        posts = CommunityPost.objects.filter(is_active=True).order_by('-created_at')[:20]
        
        posts_data = []
        for post in posts:
            is_liked = PostLike.objects.filter(
                post=post, 
                user=user, 
                is_active=True
            ).exists()
            
            recent_comments = PostComment.objects.filter(
                post=post, 
                is_active=True
            ).select_related('user').order_by('created_at')[:3]
            
            comments_data = []
            for comment in recent_comments:
                comments_data.append({
                    'id': comment.id,
                    'user': {
                        'id': comment.user.id,
                        'first_name': comment.user.first_name,
                        'last_name': comment.user.last_name,
                        'profile_picture': comment.user.profile_picture.url if comment.user.profile_picture else None,
                    },
                    'content': comment.content,
                    'created_at': comment.created_at.isoformat(),
                    'like_count': comment.like_count,
                })
            
            posts_data.append({
                'id': post.id,
                'user': {
                    'id': post.user.id,
                    'first_name': post.user.first_name,
                    'last_name': post.user.last_name,
                    'profile_picture': post.user.profile_picture.url if post.user.profile_picture else None,
                },
                'content': post.content,
                'post_type': post.post_type,
                'image_url': post.image.url if post.image else None,
                'created_at': post.created_at.isoformat(),
                'like_count': post.like_count,
                'comment_count': post.comment_count,
                'is_liked': is_liked,
                'comments': comments_data,
            })
        
        trending_topics = TrendingTopic.objects.filter(is_active=True).order_by('-post_count')[:4]
        trending_data = [{
            'id': topic.id,
            'name': topic.name,
            'post_count': topic.post_count,
        } for topic in trending_topics]
        
        upcoming_events = Event.objects.filter(
            is_active=True, 
            start_date__gte=timezone.now()
        ).order_by('start_date')[:2]
        events_data = [{
            'id': event.id,
            'title': event.title,
            'start_date': event.start_date.isoformat(),
            'location': event.location,
        } for event in upcoming_events]
        
        guidelines = CommunityGuideline.objects.filter(is_active=True).order_by('order')
        guidelines_data = [{
            'id': guideline.id,
            'content': guideline.content,
        } for guideline in guidelines]
        
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
        
        response_data = {
            'success': True,
            'posts': posts_data,
            'trending_topics': trending_data,
            'upcoming_events': events_data,
            'guidelines': guidelines_data,
            'total_members': total_members,
            'events_this_month': events_this_month,
            'posts_this_week': posts_this_week,
        }
        
        return JsonResponse(response_data)
        
    except YouthUser.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@csrf_exempt
@require_POST
def mobile_create_post(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        data = json.loads(request.body)
        user = YouthUser.objects.get(id=request.session['user_id'])
        content = data.get('content', '')
        privacy = data.get('privacy', 'public')
        
        if not content:
            return JsonResponse({'success': False, 'message': 'Content is required'})
        
        post = CommunityPost.objects.create(
            user=user,
            content=content,
            post_type='text',
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
def mobile_like_post(request, post_id):
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
def mobile_comment_on_post(request, post_id):
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



@csrf_exempt
@require_GET
def contact_data(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        faqs = FAQ.objects.filter(is_active=True).order_by('order', 'created_at')
        faq_data = [
            {
                'id': faq.id,
                'question': faq.question,
                'answer': faq.answer,
                'category': faq.category,
                'order': faq.order
            }
            for faq in faqs
        ]
        
        complaint_count = Complaint.objects.filter(user=user).count()
        resolved_complaints = Complaint.objects.filter(user=user, status='resolved').count()
        suggestion_count = Suggestion.objects.filter(user=user).count()
        implemented_suggestions = Suggestion.objects.filter(user=user, status='implemented').count()
        open_tickets = SupportTicket.objects.filter(user=user, status='open').count()
        resolved_tickets = SupportTicket.objects.filter(user=user, status='resolved').count()
        
        stats = {
            'complaint_count': complaint_count,
            'resolved_complaints': resolved_complaints,
            'suggestion_count': suggestion_count,
            'implemented_suggestions': implemented_suggestions,
            'open_tickets': open_tickets,
            'resolved_tickets': resolved_tickets,
        }
        
        return JsonResponse({
            'success': True,
            'faqs': faq_data,
            'stats': stats
        })
        
    except YouthUser.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User not found'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@csrf_exempt
@require_POST
def send_contact_message(request):
    if not request.session.get('is_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        data = json.loads(request.body)
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        ContactMessage.objects.create(
            user=user,
            subject=data.get('subject'),
            message=data.get('message')
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
        data = json.loads(request.body)
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        Complaint.objects.create(
            user=user,
            title=data.get('title'),
            description=data.get('details'),
            urgency=data.get('urgency', 'medium')
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
        data = json.loads(request.body)
        user = YouthUser.objects.get(id=request.session['user_id'])
        
        Suggestion.objects.create(
            user=user,
            title=data.get('title'),
            description=data.get('details')
        )
        return JsonResponse({'success': True})
    
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})


































# _________________
# |  ADMIN SIDE    |
# --------------------

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
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.hashers import check_password
import json
from django.db.models import Q
from .models import YouthAdmin
from django.utils import timezone

def server_login_page(request):
    
    return render(request, 'server/serverauth/serverlogin.html')

@csrf_exempt
def server_login_api(request):
    """Handle server login authentication (API endpoint)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            remember_me = data.get('rememberMe', False)

            admin_user = YouthAdmin.objects.filter(
                Q(username=username) | Q(email=username),
                is_active=True
            ).first()

            if not admin_user:
                return JsonResponse({
                    'success': False, 
                    'message': 'Invalid administrator credentials or account inactive.'
                }, status=401)

            if not admin_user.check_password(password):
                return JsonResponse({
                    'success': False, 
                    'message': 'Invalid security key.'
                }, status=401)

            request.session['admin_id'] = admin_user.id  
            request.session['admin_username'] = admin_user.username
            request.session['admin_role'] = admin_user.role
            request.session['is_server_authenticated'] = True
            
            if not remember_me:
                request.session.set_expiry(0)  
            else:
                request.session.set_expiry(1209600) 

            admin_user.last_login = timezone.now()
            admin_user.save()

            return JsonResponse({
                'success': True, 
                'message': 'Server authentication successful',
                'redirect': '/server/dashboard/',
                'user': {
                    'username': admin_user.username,
                    'role': admin_user.get_role_display(),
                    'full_name': admin_user.get_full_name()
                }
            })

        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Server authentication error: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False, 
        'message': 'Invalid request method'
    }, status=400)

def server_logout(request):
    """Logout from server admin session"""
    request.session.flush()
    return redirect('/serverlogin/')

from django.shortcuts import render, redirect
from django.utils import timezone
from datetime import timedelta
import json
from django.db.models import Count, Q
from .models import YouthUser, Event, Announcement, EventRegistration, YouthAdmin, UserRegistrationAnalytics, EventParticipationAnalytics

def server_dashboard(request):
    if not request.session.get('is_server_authenticated'):
        return redirect('server_login_page')
    
    admin_id = request.session.get('admin_id')
    try:
        admin_user = YouthAdmin.objects.get(id=admin_id)
    except YouthAdmin.DoesNotExist:
        request.session.flush()
        return redirect('server_login_page')
    
    total_users = YouthUser.objects.count()
    total_events = Event.objects.count()
    total_announcements = Announcement.objects.count()
    active_registrations = EventRegistration.objects.filter(
        status__in=['pending', 'confirmed', 'waitlisted']
    ).count()
    
    recent_users = YouthUser.objects.order_by('-created_at')[:5]
    
    upcoming_events = Event.objects.filter(
        start_date__gte=timezone.now()
    ).order_by('start_date')[:5]
    
    today = timezone.now().date()
    last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    
    registration_data = []
    for date in last_7_days:
        try:
            analytics = UserRegistrationAnalytics.objects.get(date=date)
            registration_data.append(analytics.registrations_count)
        except UserRegistrationAnalytics.DoesNotExist:
            count = YouthUser.objects.filter(
                created_at__date=date
            ).count()
            UserRegistrationAnalytics.objects.create(
                date=date,
                registrations_count=count
            )
            registration_data.append(count)
    
    user_registration_data = {
        'labels': [date.strftime("%b %d") for date in last_7_days],
        'data': registration_data
    }
    
    event_categories = dict(Event.EVENT_CATEGORIES)
    event_participation_data = {
        'labels': list(event_categories.values()),
        'data': []
    }
    
    for category_value, category_label in event_categories.items():
        participation_count = EventRegistration.objects.filter(
            event__category=category_value,
            status__in=['confirmed', 'attended']
        ).count()
        event_participation_data['data'].append(participation_count)
    
    today = timezone.now().date()
    current_period_start = today - timedelta(days=30)
    previous_period_start = current_period_start - timedelta(days=30)
    
    current_period_registrations = YouthUser.objects.filter(
        created_at__date__gte=current_period_start
    ).count()
    
    previous_period_registrations = YouthUser.objects.filter(
        created_at__date__gte=previous_period_start,
        created_at__date__lt=current_period_start
    ).count()
    
    if previous_period_registrations > 0:
        user_registration_trend = ((current_period_registrations - previous_period_registrations) / previous_period_registrations) * 100
    else:
        user_registration_trend = 100 if current_period_registrations > 0 else 0
    
    current_period_events = Event.objects.filter(
        start_date__date__gte=current_period_start
    ).count()
    
    previous_period_events = Event.objects.filter(
        start_date__date__gte=previous_period_start,
        start_date__date__lt=current_period_start
    ).count()
    
    if previous_period_events > 0:
        event_trend = ((current_period_events - previous_period_events) / previous_period_events) * 100
    else:
        event_trend = 100 if current_period_events > 0 else 0
    
    current_period_announcements = Announcement.objects.filter(
        publish_date__date__gte=current_period_start
    ).count()
    
    previous_period_announcements = Announcement.objects.filter(
        publish_date__date__gte=previous_period_start,
        publish_date__date__lt=current_period_start
    ).count()
    
    if previous_period_announcements > 0:
        announcement_trend = ((current_period_announcements - previous_period_announcements) / previous_period_announcements) * 100
    else:
        announcement_trend = 100 if current_period_announcements > 0 else 0
    
    current_period_registrations_count = EventRegistration.objects.filter(
        registration_date__date__gte=current_period_start
    ).count()
    
    previous_period_registrations_count = EventRegistration.objects.filter(
        registration_date__date__gte=previous_period_start,
        registration_date__date__lt=current_period_start
    ).count()
    
    if previous_period_registrations_count > 0:
        registration_trend = ((current_period_registrations_count - previous_period_registrations_count) / previous_period_registrations_count) * 100
    else:
        registration_trend = 100 if current_period_registrations_count > 0 else 0
    
    context = {
        'admin_user': admin_user,
        'total_users': total_users,
        'total_events': total_events,
        'total_announcements': total_announcements,
        'active_registrations': active_registrations,
        'recent_users': recent_users,
        'upcoming_events': upcoming_events,
        'user_registration_data': json.dumps(user_registration_data),
        'event_participation_data': json.dumps(event_participation_data),
        'user_registration_trend': user_registration_trend,
        'event_trend': event_trend,
        'announcement_trend': announcement_trend,
        'registration_trend': registration_trend,
    }
    
    return render(request, 'server/serverdashboard.html', context)


from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q
import json
from .models import YouthUser, AuditLog, YouthAdmin, EncryptionKeyAttempt
from django.conf import settings
import base64
from cryptography.fernet import Fernet, InvalidToken
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.views.decorators.csrf import csrf_exempt

fernet = Fernet(settings.ENCRYPTION_KEY.encode())

def server_user_management(request):
    """User management page with encryption key verification"""
    if not request.session.get('is_server_authenticated'):
        return redirect('server_login_page')
    
    admin_id = request.session.get('admin_id')
    try:
        admin_user = YouthAdmin.objects.get(id=admin_id)
    except YouthAdmin.DoesNotExist:
        request.session.flush()
        return redirect('server_login_page')
    
    encryption_verified = request.session.get('encryption_verified', False)
    
    all_users = YouthUser.objects.all().order_by('-created_at')
    pending_verification = YouthUser.objects.filter(
        is_admin_verified=False, 
        is_active=True
    ).order_by('-created_at')
    verified_users = YouthUser.objects.filter(
        is_admin_verified=True
    ).order_by('-created_at')
    
    context = {
        'admin_user': admin_user,
        'all_users': all_users,
        'pending_verification': pending_verification,
        'verified_users': verified_users,
        'encryption_verified': encryption_verified,
    }
    
    return render(request, 'server/serverusermanagement.html', context)

@csrf_exempt
def verify_encryption_key(request):
    """Verify encryption key and store attempt in database"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            entered_key = data.get('encryption_key', '')
            
            admin_id = request.session.get('admin_id')
            admin_user = YouthAdmin.objects.get(id=admin_id)
            
            attempt = EncryptionKeyAttempt.objects.create(
                admin_user=admin_user,
                attempted_key=entered_key,
                is_successful=False,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            if entered_key == settings.ENCRYPTION_KEY:
                attempt.is_successful = True
                attempt.save()
                
                request.session['encryption_verified'] = True
                request.session.modified = True
                
                return JsonResponse({
                    'success': True, 
                    'message': 'Encryption key verified successfully'
                })
            else:
                failed_attempts = request.session.get('encryption_failed_attempts', 0) + 1
                request.session['encryption_failed_attempts'] = failed_attempts
                request.session.modified = True
                
                return JsonResponse({
                    'success': False, 
                    'message': 'Invalid encryption key',
                    'failed_attempts': failed_attempts
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Error: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

def send_verification_email(user):
    """Send verification email to user"""
    subject = "Your Account Has Been Verified - SK Mambugan Youth Management System"
    
    html_content = render_to_string('emails/account_verified.html', {
        'user': user,
        'verification_date': timezone.now().strftime("%B %d, %Y"),
    })
    
    text_content = strip_tags(html_content)
    
    email = EmailMultiAlternatives(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        [user.email]
    )
    email.attach_alternative(html_content, "text/html")
    
    email.send()

def send_account_status_email(user, is_active):
    """Send account status email to user"""
    status = "activated" if is_active else "deactivated"
    subject = f"Your Account Has Been {status.capitalize()} - SK Mambugan Youth Management System"
    
    html_content = render_to_string('emails/account_status_changed.html', {
        'user': user,
        'status': status,
        'status_date': timezone.now().strftime("%B %d, %Y"),
    })
    
    text_content = strip_tags(html_content)
    
    email = EmailMultiAlternatives(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        [user.email]
    )
    email.attach_alternative(html_content, "text/html")
    
    email.send()

@csrf_exempt
def verify_user(request, user_id):
    """Verify a user by admin"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    if not request.session.get('encryption_verified'):
        return JsonResponse({'success': False, 'message': 'Encryption not verified'})
    
    try:
        user = YouthUser.objects.get(id=user_id)
        user.verify_by_admin()
        
        send_verification_email(user)
        
        AuditLog.objects.create(
            admin_user=request.user if hasattr(request, 'user') else None,
            youth_user=user,
            action='UPDATE',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return JsonResponse({
            'success': True, 
            'message': f'User {user.registration_no} verified successfully and notification email sent'
        })
        
    except YouthUser.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User not found'})

@csrf_exempt
def toggle_user_status(request, user_id):
    """Toggle user active status"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    if not request.session.get('encryption_verified'):
        return JsonResponse({'success': False, 'message': 'Encryption not verified'})
    
    try:
        user = YouthUser.objects.get(id=user_id)
        new_status = not user.is_active
        user.is_active = new_status
        user.save()
        
        send_account_status_email(user, new_status)
        
        AuditLog.objects.create(
            admin_user=request.user if hasattr(request, 'user') else None,
            youth_user=user,
            action='UPDATE',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        status = "activated" if user.is_active else "deactivated"
        return JsonResponse({
            'success': True, 
            'message': f'User {user.registration_no} {status} successfully and notification email sent'
        })
        
    except YouthUser.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User not found'})

@csrf_exempt
def get_user_details(request, user_id):
    """Get decrypted user details"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    if not request.session.get('encryption_verified'):
        return JsonResponse({'success': False, 'message': 'Encryption not verified'})
    
    try:
        user = YouthUser.objects.get(id=user_id)
        
        decrypted_data = {}
        encrypted_fields = ['first_name', 'last_name', 'middle_name', 'suffix', 
                           'address', 'birthdate', 'contact_number']
        
        for field in encrypted_fields:
            value = getattr(user, field)
            if value:
                try:
                    if not value.startswith('gAAAAA'):
                        decrypted_data[field] = value
                    else:
                        decoded_value = base64.urlsafe_b64decode(value)
                        decrypted_value = fernet.decrypt(decoded_value).decode()
                        decrypted_data[field] = decrypted_value
                except (InvalidToken, ValueError, TypeError):
                    decrypted_data[field] = "Decryption failed"
            else:
                decrypted_data[field] = "Not provided"
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'registration_no': user.registration_no,
            'first_name': decrypted_data['first_name'],
            'last_name': decrypted_data['last_name'],
            'middle_name': decrypted_data['middle_name'],
            'suffix': decrypted_data['suffix'],
            'address': decrypted_data['address'],
            'purok_zone': user.purok_zone,
            'gender': user.gender,
            'birthdate': decrypted_data['birthdate'],
            'age': user.age,
            'contact_number': decrypted_data['contact_number'],
            'civil_status': user.civil_status,
            'age_group': user.age_group,
            'education': user.education,
            'youth_classification': user.youth_classification,
            'work_status': user.work_status,
            'sk_voter': user.sk_voter,
            'id_type': user.id_type,
            'is_email_verified': user.is_email_verified,
            'is_admin_verified': user.is_admin_verified,
            'is_active': user.is_active,
            'created_at': user.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'profile_picture': user.profile_picture.url if user.profile_picture else None,
            'id_picture': user.id_picture.url if user.id_picture else None,
            'birth_certificate': user.birth_certificate.url if user.birth_certificate else None,
        }
        
        AuditLog.objects.create(
            admin_user=request.user if hasattr(request, 'user') else None,
            youth_user=user,
            action='VIEW',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return JsonResponse({
            'success': True, 
            'user': user_data
        })
        
    except YouthUser.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'User not found'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    


    from django.shortcuts import render
from django.http import JsonResponse
from django.core import serializers
import json
from .models import Announcement, YouthAdmin
from django.core.paginator import Paginator
from django.db.models import Count, Q

def server_announcement_management(request):
    """Announcement management page"""
    if not request.session.get('is_server_authenticated'):
        return redirect('server_login_page')
    
    admin_id = request.session.get('admin_id')
    try:
        admin_user = YouthAdmin.objects.get(id=admin_id)
    except YouthAdmin.DoesNotExist:
        request.session.flush()
        return redirect('server_login_page')
    
    announcements_list = Announcement.objects.all().order_by('-publish_date')
    
    paginator = Paginator(announcements_list, 12)
    page_number = request.GET.get('page')
    announcements = paginator.get_page(page_number)
    
    total_announcements = Announcement.objects.count()
    important_announcements = Announcement.objects.filter(is_important=True).count()
    active_announcements = Announcement.objects.filter(is_active=True).count()
    categories_count = Announcement.objects.values('category').annotate(count=Count('category')).count()
    
    announcements_data = []
    for announcement in announcements:
        announcements_data.append({
            'id': announcement.id,
            'title': announcement.title,
            'content': announcement.content,
            'excerpt': announcement.excerpt,
            'category': announcement.category,
            'location': announcement.location,
            'is_important': announcement.is_important,
            'is_active': announcement.is_active,
            'effective_date': announcement.effective_date.isoformat() if announcement.effective_date else None,
            'deadline': announcement.deadline.isoformat() if announcement.deadline else None,
            'image': announcement.image.url if announcement.image else None,
        })
    
    context = {
        'admin_user': admin_user,
        'announcements': announcements,
        'total_announcements': total_announcements,
        'important_announcements': important_announcements,
        'active_announcements': active_announcements,
        'categories_count': categories_count,
        'announcements_json': json.dumps(announcements_data),
    }
    
    return render(request, 'server/serverannouncementmanagement.html', context)

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.core.paginator import Paginator
from django.db.models import Count
import json
from datetime import datetime
from .models import Announcement, YouthAdmin

@csrf_exempt
def create_announcement(request):
    """Create a new announcement"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    if request.method == 'POST':
        try:
            admin_id = request.session.get('admin_id')
            admin_user = YouthAdmin.objects.get(id=admin_id)
            
            announcement = Announcement.objects.create(
                title=request.POST.get('title'),
                content=request.POST.get('content'),
                excerpt=request.POST.get('excerpt', ''),
                category=request.POST.get('category'),
                location=request.POST.get('location', ''),
                is_important=request.POST.get('is_important') == 'on',
                is_active=request.POST.get('is_active') == 'on',
                created_by=admin_user
            )
            
            if 'image' in request.FILES:
                announcement.image = request.FILES['image']
            
            effective_date = request.POST.get('effective_date')
            if effective_date:
                try:
                    announcement.effective_date = timezone.make_aware(
                        datetime.strptime(effective_date, '%Y-%m-%dT%H:%M')
                    )
                except ValueError:
                    pass
            
            deadline = request.POST.get('deadline')
            if deadline:
                try:
                    announcement.deadline = timezone.make_aware(
                        datetime.strptime(deadline, '%Y-%m-%dT%H:%M')
                    )
                except ValueError:
                    pass
            
            announcement.save()
            
            return JsonResponse({
                'success': True, 
                'message': 'Announcement created successfully',
                'announcement_id': announcement.id
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Error: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

@csrf_exempt
def update_announcement(request, announcement_id):
    """Update an existing announcement"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        announcement = Announcement.objects.get(id=announcement_id)
        
        if request.method == 'POST':
            announcement.title = request.POST.get('title')
            announcement.content = request.POST.get('content')
            announcement.excerpt = request.POST.get('excerpt', '')
            announcement.category = request.POST.get('category')
            announcement.location = request.POST.get('location', '')
            announcement.is_important = request.POST.get('is_important') == 'on'
            announcement.is_active = request.POST.get('is_active') == 'on'
            
            if 'image' in request.FILES:
                announcement.image = request.FILES['image']
            
            effective_date = request.POST.get('effective_date')
            if effective_date:
                announcement.effective_date = timezone.make_aware(
                    datetime.strptime(effective_date, '%Y-%m-%dT%H:%M')
                )
            else:
                announcement.effective_date = None
            
            deadline = request.POST.get('deadline')
            if deadline:
                announcement.deadline = timezone.make_aware(
                    datetime.strptime(deadline, '%Y-%m-%dT%H:%M')
                )
            else:
                announcement.deadline = None
            
            announcement.save()
            
            return JsonResponse({
                'success': True, 
                'message': 'Announcement updated successfully'
            })
            
    except Announcement.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Announcement not found'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

@csrf_exempt
def toggle_announcement_status(request, announcement_id):
    """Toggle announcement active status"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        announcement = Announcement.objects.get(id=announcement_id)
        announcement.is_active = not announcement.is_active
        announcement.save()
        
        status = "activated" if announcement.is_active else "deactivated"
        return JsonResponse({
            'success': True, 
            'message': f'Announcement {status} successfully'
        })
        
    except Announcement.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Announcement not found'})
    

@csrf_exempt
def delete_announcement(request, announcement_id):
    """Delete an announcement"""
    print(f"Delete announcement called with ID: {announcement_id}")  
    
    if not request.session.get('is_server_authenticated'):
        print("Not authenticated")  
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        announcement = Announcement.objects.get(id=announcement_id)
        print(f"Found announcement: {announcement.title}")  
        announcement.delete()
        print("Announcement deleted successfully")  
        
        return JsonResponse({
            'success': True, 
            'message': 'Announcement deleted successfully'
        })
        
    except Announcement.DoesNotExist:
        print("Announcement not found")  
        return JsonResponse({'success': False, 'message': 'Announcement not found'})
    except Exception as e:
        print(f"Error: {str(e)}")  
        return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    




from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.core.paginator import Paginator
from django.db.models import Count, Q
import json
from datetime import datetime
from .models import Event, YouthAdmin, Gender, CivilStatus, AgeGroup, EducationLevel, YouthClassification, WorkStatus

def server_events_management(request):
    """Events management page"""
    if not request.session.get('is_server_authenticated'):
        return redirect('server_login_page')
    
    admin_id = request.session.get('admin_id')
    try:
        admin_user = YouthAdmin.objects.get(id=admin_id)
    except YouthAdmin.DoesNotExist:
        request.session.flush()
        return redirect('server_login_page')
    
    events_list = Event.objects.all().order_by('-start_date')
    
    paginator = Paginator(events_list, 12)
    page_number = request.GET.get('page')
    events = paginator.get_page(page_number)
    
    total_events = Event.objects.count()
    upcoming_events = Event.objects.filter(start_date__gt=timezone.now()).count()
    active_events = Event.objects.filter(is_active=True).count()
    total_registrations = EventRegistration.objects.count()
    
    events_data = []
    for event in events:
        events_data.append({
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'excerpt': event.excerpt,
            'category': event.category,
            'location': event.location,
            'requires_registration': event.requires_registration,
            'is_active': event.is_active,
            'is_upcoming': event.is_upcoming,
            'start_date': event.start_date.isoformat(),
            'end_date': event.end_date.isoformat(),
            'registration_deadline': event.registration_deadline.isoformat() if event.registration_deadline else None,
            'maximum_participants': event.maximum_participants,
            'current_participants': event.current_participants,
            'points_reward': event.points_reward,
            'image': event.image.url if event.image else None,
        })
    
    context = {
        'admin_user': admin_user,
        'events': events,
        'total_events': total_events,
        'upcoming_events': upcoming_events,
        'active_events': active_events,
        'total_registrations': total_registrations,
        'events_json': json.dumps(events_data),
        
        'genders': Gender.objects.all(),
        'civil_statuses': CivilStatus.objects.all(),
        'age_groups': AgeGroup.objects.all(),
        'education_levels': EducationLevel.objects.all(),
        'youth_classifications': YouthClassification.objects.all(),
        'work_statuses': WorkStatus.objects.all(),
    }
    
    return render(request, 'server/servereventstmanagement.html', context)

@csrf_exempt
def create_event(request):
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    if request.method == 'POST':
        try:
            admin_id = request.session.get('admin_id')
            admin_user = YouthAdmin.objects.get(id=admin_id)
            
            start_date_str = request.POST.get('start_date')
            end_date_str = request.POST.get('end_date')
            
            if not start_date_str or not end_date_str:
                return JsonResponse({
                    'success': False, 
                    'message': 'Start date and end date are required'
                })
            
            try:
                start_date = timezone.make_aware(datetime.strptime(start_date_str, '%Y-%m-%dT%H:%M'))
                end_date = timezone.make_aware(datetime.strptime(end_date_str, '%Y-%m-%dT%H:%M'))
            except ValueError:
                return JsonResponse({
                    'success': False, 
                    'message': 'Invalid date format. Please use YYYY-MM-DDTHH:MM format'
                })
            
            event = Event.objects.create(
                title=request.POST.get('title'),
                description=request.POST.get('description'),
                excerpt=request.POST.get('excerpt', ''),
                category=request.POST.get('category'),
                location=request.POST.get('location'),
                start_date=start_date,
                end_date=end_date,
                requires_registration=request.POST.get('requires_registration') == 'on',
                is_active=request.POST.get('is_active') == 'on',
                points_reward=int(request.POST.get('points_reward', 0)),
                created_by=admin_user,
                gender_access=request.POST.get('gender_access', 'all'),
                civil_status_access=request.POST.get('civil_status_access', 'all'),
                age_group_access=request.POST.get('age_group_access', 'all'),
                education_access=request.POST.get('education_access', 'all'),
                youth_classification_access=request.POST.get('youth_classification_access', 'all'),
                work_status_access=request.POST.get('work_status_access', 'all'),
                age_min=request.POST.get('age_min') or None,
                age_max=request.POST.get('age_max') or None
            )

            if 'image' in request.FILES:
                event.image = request.FILES['image']
            
            registration_deadline_str = request.POST.get('registration_deadline')
            if registration_deadline_str:
                try:
                    registration_deadline = timezone.make_aware(
                        datetime.strptime(registration_deadline_str, '%Y-%m-%dT%H:%M')
                    )
                    event.registration_deadline = registration_deadline
                except ValueError:
                    pass
            
            if event.requires_registration:
                max_participants = request.POST.get('maximum_participants')
                if max_participants:
                    event.maximum_participants = int(max_participants)
            
            if event.gender_access == 'specific':
                gender_ids = request.POST.getlist('target_genders')
                event.target_genders.set(gender_ids)
            
            if event.civil_status_access == 'specific':
                status_ids = request.POST.getlist('target_civil_statuses')
                event.target_civil_statuses.set(status_ids)
            
            if event.age_group_access == 'specific':
                age_group_ids = request.POST.getlist('target_age_groups')
                event.target_age_groups.set(age_group_ids)
            
            if event.education_access == 'specific':
                education_ids = request.POST.getlist('target_education_levels')
                event.target_education_levels.set(education_ids)
            
            if event.youth_classification_access == 'specific':
                classification_ids = request.POST.getlist('target_youth_classifications')
                event.target_youth_classifications.set(classification_ids)
            
            if event.work_status_access == 'specific':
                work_status_ids = request.POST.getlist('target_work_statuses')
                event.target_work_statuses.set(work_status_ids)
            
            event.save()
            
            return JsonResponse({
                'success': True, 
                'message': 'Event created successfully',
                'event_id': event.id
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False, 
                'message': f'Error: {str(e)}'
            })
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

@csrf_exempt
def update_event(request, event_id):
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        event = Event.objects.get(id=event_id)
        
        if request.method == 'POST':
            start_date_str = request.POST.get('start_date')
            end_date_str = request.POST.get('end_date')
            
            if start_date_str:
                try:
                    event.start_date = timezone.make_aware(
                        datetime.strptime(start_date_str, '%Y-%m-%dT%H:%M')
                    )
                except ValueError:
                    return JsonResponse({
                        'success': False, 
                        'message': 'Invalid start date format'
                    })
            
            if end_date_str:
                try:
                    event.end_date = timezone.make_aware(
                        datetime.strptime(end_date_str, '%Y-%m-%dT%H:%M')
                    )
                except ValueError:
                    return JsonResponse({
                        'success': False, 
                        'message': 'Invalid end date format'
                    })
            event.title = request.POST.get('title')
            event.description = request.POST.get('description')
            event.excerpt = request.POST.get('excerpt', '')
            event.category = request.POST.get('category')
            event.location = request.POST.get('location')
            event.requires_registration = request.POST.get('requires_registration') == 'on'
            event.is_active = request.POST.get('is_active') == 'on'
            event.points_reward = int(request.POST.get('points_reward', 0))
            
            if 'image' in request.FILES:
                event.image = request.FILES['image']
            
            start_date = request.POST.get('start_date')
            if start_date:
                try:
                    event.start_date = timezone.make_aware(
                        datetime.strptime(start_date, '%Y-%m-%dT%H:%M')
                    )
                except ValueError:
                    pass
            
            end_date = request.POST.get('end_date')
            if end_date:
                try:
                    event.end_date = timezone.make_aware(
                        datetime.strptime(end_date, '%Y-%m-%dT%H:%M')
                    )
                except ValueError:
                    pass
            
            if event.requires_registration:
                maximum_participants = request.POST.get('maximum_participants')
                if maximum_participants:
                    event.maximum_participants = int(maximum_participants)
                else:
                    event.maximum_participants = None
                
                registration_deadline = request.POST.get('registration_deadline')
                if registration_deadline:
                    try:
                        event.registration_deadline = timezone.make_aware(
                            datetime.strptime(registration_deadline, '%Y-%m-%dT%H:%M')
                        )
                    except ValueError:
                        pass
                else:
                    event.registration_deadline = None
            else:
                event.maximum_participants = None
                event.registration_deadline = None
            
            event.save()
            
            return JsonResponse({
                'success': True, 
                'message': 'Event updated successfully'
            })
            
    except Event.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Event not found'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

@csrf_exempt
def toggle_event_status(request, event_id):
    """Toggle event active status"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        event = Event.objects.get(id=event_id)
        event.is_active = not event.is_active
        event.save()
        
        status = "activated" if event.is_active else "deactivated"
        return JsonResponse({
            'success': True, 
            'message': f'Event {status} successfully'
        })
        
    except Event.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Event not found'})

@csrf_exempt
def delete_event(request, event_id):
    """Delete an event"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        event = Event.objects.get(id=event_id)
        event.delete()
        
        return JsonResponse({
            'success': True, 
            'message': 'Event deleted successfully'
        })
        
    except Event.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Event not found'})
    




from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.core.paginator import Paginator
from django.db.models import Count, Q, Avg, Value, FloatField
from django.db.models.functions import Coalesce
import json
from datetime import datetime
from .models import Event, EventRegistration, YouthAdmin

def server_events_participants(request):
    """Events participants management page"""
    if not request.session.get('is_server_authenticated'):
        return redirect('server_login_page')
    
    admin_id = request.session.get('admin_id')
    try:
        admin_user = YouthAdmin.objects.get(id=admin_id)
    except YouthAdmin.DoesNotExist:
        request.session.flush()
        return redirect('server_login_page')
    
    now = timezone.now()
    
    upcoming_events_list = Event.objects.filter(
        start_date__gt=now,
        is_active=True
    ).annotate(
        pending_count=Count('eventregistration', filter=Q(eventregistration__status='pending'))
    ).order_by('start_date')
    
    ongoing_events_list = Event.objects.filter(
        start_date__lte=now,
        end_date__gte=now,
        is_active=True
    ).annotate(
        confirmed_count=Count('eventregistration', filter=Q(eventregistration__status='confirmed'))
    ).order_by('end_date')
    
    completed_events_list = Event.objects.filter(
        end_date__lt=now,
        is_active=True
    ).annotate(
        attended_count=Count('eventregistration', filter=Q(eventregistration__status='attended'))
    ).order_by('-end_date')[:10]
    
    for event in completed_events_list:
        event.attended_count = EventRegistration.objects.filter(event=event, status='attended').count()
    
    pending_registrations = EventRegistration.objects.filter(status='pending').count()
    upcoming_events_count = upcoming_events_list.count()
    ongoing_events_count = ongoing_events_list.count()
    
    total_confirmed = EventRegistration.objects.filter(status='confirmed').count()
    total_attended = EventRegistration.objects.filter(status='attended').count()
    attendance_rate = round((total_attended / total_confirmed * 100) if total_confirmed > 0 else 0, 1)
    
    def prepare_event_data(events):
        data = []
        for event in events:
            data.append({
                'id': event.id,
                'title': event.title,
                'description': event.description,
                'category': event.category,
                'location': event.location,
                'start_date': event.start_date.isoformat(),
                'end_date': event.end_date.isoformat(),
                'maximum_participants': event.maximum_participants,
                'current_participants': event.current_participants,
                'image': event.image.url if event.image else None,
                'pending_count': getattr(event, 'pending_count', 0),
                'confirmed_count': getattr(event, 'confirmed_count', 0),
                'attended_count': getattr(event, 'attended_count', 0),
            })
        return data
    
    context = {
        'admin_user': admin_user,
        'upcoming_events_list': upcoming_events_list,
        'ongoing_events_list': ongoing_events_list,
        'completed_events_list': completed_events_list,
        'pending_registrations': pending_registrations,
        'upcoming_events': upcoming_events_count,
        'ongoing_events': ongoing_events_count,
        'attendance_rate': attendance_rate,
        'upcoming_events_json': json.dumps(prepare_event_data(upcoming_events_list)),
        'ongoing_events_json': json.dumps(prepare_event_data(ongoing_events_list)),
        'completed_events_json': json.dumps(prepare_event_data(completed_events_list)),
    }
    
    return render(request, 'server/servereventsparticipants.html', context)

@csrf_exempt
def get_event_registrations(request, event_id):
    """Get all registrations for an event"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        event = Event.objects.get(id=event_id)
        registrations = EventRegistration.objects.filter(event=event).select_related('user')
        
        registration_data = []
        for reg in registrations:
            registration_data.append({
                'id': reg.id,
                'user': {
                    'id': reg.user.id,
                    'name': reg.user.get_full_name(),
                    'email': reg.user.email,
                    'avatar': reg.user.profile_picture.url if reg.user.profile_picture else None,
                    'initials': f"{reg.user.first_name[0]}{reg.user.last_name[0]}",
                },
                'status': reg.status,
                'registration_date': reg.registration_date.isoformat(),
                'check_in_time': reg.check_in_time.isoformat() if reg.check_in_time else None,
            })
        
        return JsonResponse({
            'success': True, 
            'registrations': registration_data,
            'event_title': event.title
        })
        
    except Event.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Event not found'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})

@csrf_exempt
def get_event_attendance(request, event_id):
    """Get attendance data for an event"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        event = Event.objects.get(id=event_id)
        registrations = EventRegistration.objects.filter(
            event=event, 
            status__in=['confirmed', 'attended', 'no_show']
        ).select_related('user')
        
        attendance_data = []
        for reg in registrations:
            attendance_data.append({
                'id': reg.id,
                'user': {
                    'id': reg.user.id,
                    'name': reg.user.get_full_name(),
                    'avatar': reg.user.profile_picture.url if reg.user.profile_picture else None,
                    'initials': f"{reg.user.first_name[0]}{reg.user.last_name[0]}",
                },
                'present': reg.status == 'attended',
                'check_in_time': reg.check_in_time.isoformat() if reg.check_in_time else None,
            })
        
        return JsonResponse({
            'success': True, 
            'attendance': attendance_data,
            'event_title': event.title
        })
        
    except Event.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Event not found'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})

@csrf_exempt
def get_event_attendees(request, event_id):
    """Get attendees for completed events"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        event = Event.objects.get(id=event_id)
        attendees = EventRegistration.objects.filter(
            event=event, 
            status='attended'
        ).select_related('user')
        
        attendees_data = []
        for attendee in attendees:
            attendees_data.append({
                'id': attendee.id,
                'user': {
                    'id': attendee.user.id,
                    'name': attendee.user.get_full_name(),
                    'avatar': attendee.user.profile_picture.url if attendee.user.profile_picture else None,
                    'initials': f"{attendee.user.first_name[0]}{attendee.user.last_name[0]}",
                    'email': attendee.user.email,
                },
                'check_in_time': attendee.check_in_time.isoformat() if attendee.check_in_time else None,
                'points_earned': attendee.points_earned,
            })
        
        return JsonResponse({
            'success': True, 
            'attendees': attendees_data,
            'event_title': event.title
        })
        
    except Event.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Event not found'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})

@csrf_exempt
def update_registration_status(request, registration_id):
    """Update registration status and send email notification"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        registration = EventRegistration.objects.get(id=registration_id)
        
        if request.method == 'POST':
            data = json.loads(request.body)
            new_status = data.get('status')
            reason = data.get('reason', '')
            
            old_status = registration.status
            registration.status = new_status
            registration.save()
            
            if old_status != new_status:
                if new_status == 'confirmed':
                    registration.event.current_participants += 1
                    send_registration_approval_email(registration)
                elif old_status == 'confirmed':
                    registration.event.current_participants = max(0, registration.event.current_participants - 1)
                registration.event.save()
            
            return JsonResponse({
                'success': True, 
                'message': f'Registration status updated to {new_status}'
            })
            
    except EventRegistration.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Registration not found'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

def send_registration_approval_email(registration):
    """Send email notification for approved event registration"""
    from django.core.mail import EmailMultiAlternatives
    from django.template.loader import render_to_string
    from django.utils.html import strip_tags
    
    user = registration.user
    event = registration.event
    
    subject = f"🎉 Your Registration for {event.title} Has Been Approved!"
    
    context = {
        'user': user,
        'event': event,
        'registration_id': registration.id,
        'event_link': f"https://yoursite.com/events/{event.id}",
        'directions_link': f"https://maps.google.com/?q={event.location}",
    }
    
    html_content = render_to_string('emails/event_registration_approved.html', context)
    text_content = strip_tags(html_content)
    
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email="SK Mambugan Events <events@skmambugan.ph>",
        to=[user.email],
        reply_to=["events@skmambugan.ph"]
    )
    
    email.attach_alternative(html_content, "text/html")
    
    try:
        email.send()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@csrf_exempt
def update_attendance(request, registration_id):
    """Update attendance status"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        registration = EventRegistration.objects.get(id=registration_id)
        
        if request.method == 'POST':
            data = json.loads(request.body)
            is_present = data.get('present', False)
            
            if is_present:
                registration.status = 'attended'
                registration.check_in_time = timezone.now()
                registration.points_earned = registration.event.points_reward
            else:
                registration.status = 'no_show'
                registration.points_earned = 0
            
            registration.save()
            
            return JsonResponse({
                'success': True, 
                'message': f'Attendance marked as {"present" if is_present else "absent"}'
            })
            
    except EventRegistration.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Registration not found'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

@csrf_exempt
def get_user_documents(request, registration_id):
    """Get user documents and all user data for review before approval"""
    if not request.session.get('is_server_authenticated'):
        return JsonResponse({'success': False, 'message': 'Not authenticated'})
    
    try:
        registration = EventRegistration.objects.get(id=registration_id)
        user = registration.user
        
        user_data = {
            'id': user.id,
            'name': user.get_full_name(),
            'email': user.email,
            'avatar': user.profile_picture.url if user.profile_picture else None,
            'initials': f"{user.first_name[0]}{user.last_name[0]}",
            'age': user.age,
            'gender': user.get_gender_display(),
            'purok_zone': user.purok_zone,
            'address': user.address,
            'contact_number': user.contact_number,
            'civil_status': user.get_civil_status_display(),
            'age_group': user.get_age_group_display(),
            'education': user.get_education_display(),
            'youth_classification': user.get_youth_classification_display(),
            'work_status': user.get_work_status_display(),
            'sk_voter': 'Yes' if user.sk_voter else 'No',
            'registration_no': user.registration_no,
            'id_type': user.id_type,
            'id_picture': user.id_picture.url if user.id_picture else None,
            'birth_certificate': user.birth_certificate.url if user.birth_certificate else None,
            'is_email_verified': 'Yes' if user.is_email_verified else 'No',
            'is_admin_verified': 'Yes' if user.is_admin_verified else 'No',
            'created_at': user.created_at.strftime("%B %d, %Y"),
        }
        
        return JsonResponse({
            'success': True, 
            'user': user_data
        })
        
    except EventRegistration.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Registration not found'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})