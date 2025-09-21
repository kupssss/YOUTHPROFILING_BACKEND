from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.index, name='index'),
    path('announcement/', views.announcement, name='announcement'),
    path('the-project/', views.the_project, name='the_project'),
    path('the-community/', views.the_community, name='the_community'),
    path('contact/', views.contact, name='contact'),
    
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('api/login/', views.login_user, name='api_login'),
    path('api/logout/', views.logout_user, name='api_logout'),
    path('api/check-auth/', views.check_auth, name='api_check_auth'),
    path('api/generate-otp/', views.generate_otp, name='generate_otp'),
    path('api/verify-otp/', views.verify_otp, name='verify_otp'),
    path('api/check-username/', views.check_username, name='check_username'),
    path('api/check-email/', views.check_email, name='check_email'),
    path('api/register_user_with_files/', views.register_user_with_files, name='register_user_with_files'),
    path('api/resend-otp/', views.resend_otp, name='resend_otp'),


    path('logout/', views.logout_view, name='logout'),


    path('mainpage/', views.mainpage, name='mainpage'),
    path('userannouncement/', views.userannouncement, name='userannouncement'),
    path('myevents/', views.my_events, name='myevents'),

    path('userprofile/', views.user_profile, name='userprofile'),
    path('api/update-profile/', views.update_profile, name='update_profile'),


    path('usercontact/', views.usercontact, name='usercontact'),
    path('contact/send-message/', views.send_contact_message, name='send_contact_message'),
    path('contact/file-complaint/', views.file_complaint, name='file_complaint'),
    path('contact/make-suggestion/', views.make_suggestion, name='make_suggestion'),
    path('support/tickets/', views.support_tickets, name='support_tickets'),

    path('community/', views.user_community, name='usercommunity'),
    path('community/posts/create/', views.create_post, name='create_post'),
    path('community/posts/<int:post_id>/like/', views.like_post, name='like_post'),
    path('community/posts/<int:post_id>/comment/', views.comment_on_post, name='comment_on_post'),

    path('event/register/<int:event_id>/', views.event_register, name='event_register'),
    path('api/event/register/<int:event_id>/', views.SubmitRegistrationView.as_view(), name='submit_registration'),
    path('myevents/', views.my_events, name='myevents'),
    path('event/<int:event_id>/', views.usereventdetails, name='usereventdetails'),


    path('serverlogin/', views.server_login_page, name='server_login_page'),
    path('server/auth/login/', views.server_login_api, name='server_login_api'),
    path('server/logout/', views.server_logout, name='server_logout'),
    path('server/dashboard/', views.server_dashboard, name='server_dashboard'),
    path('server/user-management/', views.server_user_management, name='server_user_management'),
    path('server/auth/verify-encryption-key/', views.verify_encryption_key, name='verify_encryption_key'),

    path('server/user-management/user/<int:user_id>/verify/', views.verify_user, name='verify_user'),
    path('server/user-management/user/<int:user_id>/toggle-status/', views.toggle_user_status, name='toggle_user_status'),
    path('server/user-management/user/<int:user_id>/details/', views.get_user_details, name='get_user_details'),

    path('server/announcement-management/', views.server_announcement_management, name='server_announcement_management'),
    path('server/announcements/create/', views.create_announcement, name='create_announcement'),
    path('server/announcements/<int:announcement_id>/update/', views.update_announcement, name='update_announcement'),
    path('server/announcements/<int:announcement_id>/toggle-status/', views.toggle_announcement_status, name='toggle_announcement_status'),
    path('server/announcements/<int:announcement_id>/delete/', views.delete_announcement, name='delete_announcement'),

    path('server/events-management/', views.server_events_management, name='server_events_management'),
    path('server/events/create/', views.create_event, name='create_event'),
    path('server/events/<int:event_id>/update/', views.update_event, name='update_event'),
    path('server/events/<int:event_id>/toggle-status/', views.toggle_event_status, name='toggle_event_status'),
    path('server/events/<int:event_id>/delete/', views.delete_event, name='delete_event'),

    path('server/events-participants/', views.server_events_participants, name='server_events_participants'),
    path('server/registrations/<int:registration_id>/update-status/', views.update_registration_status, name='update_registration_status'),
    path('server/registrations/<int:registration_id>/update-attendance/', views.update_attendance, name='update_attendance'),
    path('server/events/<int:event_id>/registrations/', views.get_event_registrations, name='get_event_registrations'),
    path('server/events/<int:event_id>/attendance/', views.get_event_attendance, name='get_event_attendance'),
    path('server/events/<int:event_id>/attendees/', views.get_event_attendees, name='get_event_attendees'),
    path('server/registrations/<int:registration_id>/user-documents/', views.get_user_documents, name='get_user_documents'),

    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)