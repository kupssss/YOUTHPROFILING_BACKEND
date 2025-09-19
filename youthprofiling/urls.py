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



    
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)