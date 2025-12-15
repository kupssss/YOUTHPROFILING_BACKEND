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

    path('mobile-apk/', views.mobile_apk, name='mobile_apk'),
    path('download-apk/direct/', views.download_apk, name='download_apk_direct'),
    path('download-apk/qr/', views.download_apk_qr, name='download_apk_qr'),
    path('download-apk/button/', views.download_apk_button, name='download_apk_button'),
    
    path('login/', views.login_view, name='login'),
    path('api/login/', views.login_user, name='api_login'),
    path('api/logout/', views.logout_user, name='api_logout'),

    path('signup/', views.signup_view, name='signup'),


   
    path('api/check-auth/', views.check_auth, name='api_check_auth'),
    path('api/generate-otp/', views.generate_otp, name='generate_otp'),
    path('api/verify-otp/', views.verify_otp, name='verify_otp'),
    path('api/check-username/', views.check_username, name='check_username'),
    path('api/check-email/', views.check_email, name='check_email'),
    path('api/register_user_with_files/', views.register_user_with_files, name='register_user_with_files'),
    path('api/resend-otp/', views.resend_otp, name='resend_otp'),

    path('api/check-waitlist/', views.check_waitlist, name='check_waitlist'),
    path('api/update-waitlist-user/', views.update_waitlist_user, name='update_waitlist_user'),

    path('forgot-password/', views.forgot_password_view, name='forgot_password'),
    path('api/initiate-password-reset/', views.initiate_password_reset, name='initiate_password_reset'),
    path('api/verify-reset-otp/', views.verify_reset_otp, name='verify_reset_otp'),
    path('api/reset-password/', views.reset_password, name='reset_password'),
    path('api/resend-reset-otp/', views.resend_reset_otp, name='resend_reset_otp'),


    path('logout/', views.logout_view, name='logout'),


    path('mainpage/', views.mainpage, name='mainpage'),
    path('userannouncement/', views.userannouncement, name='userannouncement'),


    path('myevents/', views.my_events, name='myevents'),
    path('api/event-registration/<int:registration_id>/', views.event_registration_detail_api, name='event_registration_detail_api'),
    path('api/cancel-registration/<int:registration_id>/', views.cancel_registration_api, name='cancel_registration_api'),
    path('api/submit-evaluation/<int:registration_id>/', views.submit_evaluation_api, name='submit_evaluation_api'),

    path('profile/', views.user_profile, name='userprofile'),
    path('api/update-profile/', views.update_profile, name='update_profile'),
    path('api/delete-profile-picture/', views.delete_profile_picture, name='delete_profile_picture'),


    path('usercontact/', views.usercontact, name='usercontact'),
    path('contact/send-message/', views.send_contact_message, name='send_contact_message'),
    path('contact/file-complaint/', views.file_complaint, name='file_complaint'),
    path('contact/make-suggestion/', views.make_suggestion, name='make_suggestion'),
    path('support/tickets/', views.support_tickets, name='support_tickets'),


    path('community/', views.user_community, name='usercommunity'),
    path('community/posts/create/', views.create_post, name='create_post'),
    path('community/posts/<int:post_id>/like/', views.like_post, name='like_post'),
    path('community/posts/<int:post_id>/comment/', views.comment_on_post, name='comment_on_post'),
    path('community/posts/<int:post_id>/delete/', views.delete_post, name='delete_post'),

    path('event/register/<int:event_id>/', views.event_register, name='event_register'),
    path('api/event/register/<int:event_id>/', views.SubmitRegistrationView.as_view(), name='submit_registration'),
    path('event/<int:event_id>/', views.usereventdetails, name='usereventdetails'),





    path('api/dashboard-data/', views.get_user_dashboard_data, name='dashboard_data'),
    path('api/register-event/<int:event_id>/', views.register_for_event, name='register_event'),
    path('api/events-data/', views.get_events_data, name='events_data'),

    path('api/mobile/user-profile/', views.mobile_user_profile, name='mobile_user_profile'),
    path('api/mobile/update-profile/', views.mobile_update_profile, name='mobile_update_profile'),
    path('api/mobile/upload-file/', views.mobile_upload_file, name='mobile_upload_file'),
    path('api/mobile/delete-file/', views.mobile_delete_file, name='mobile_delete_file'),
    path('api/mobile/change-password/', views.mobile_change_password, name='mobile_change_password'),

    path('api/event/<int:event_id>/', views.event_details, name='event_details'),
    path('api/related-events/<int:event_id>/', views.related_events, name='related_events'),
    path('api/mobile/event-register/<int:event_id>/', views.mobile_event_register_data, name='mobile_event_register_data'),
    path('api/mobile/submit-registration/<int:event_id>/', views.mobile_submit_registration, name='mobile_submit_registration'),

    path('api/mobile/user-events/<int:user_id>/', views.MobileUserEventsView.as_view(), name='mobile_user_events'),
    path('api/mobile/cancel-registration/<int:registration_id>/', views.mobile_cancel_registration_api, name='mobile_cancel_registration_api'),
    path('api/mobile/submit-evaluation/<int:registration_id>/', views.mobile_submit_evaluation_api, name='mobile_submit_evaluation_api'),
    path('api/mobile/event-registration/<int:registration_id>/', views.mobile_event_registration_detail_api, name='mobile_event_registration_detail_api'),

    path('api/mobile/community/', views.mobile_community, name='mobile_community'),
    path('api/mobile/community/posts/create/', views.mobile_create_post, name='mobile_create_post'),
    path('api/mobile/community/posts/<int:post_id>/like/', views.mobile_like_post, name='mobile_like_post'),
    path('api/mobile/community/posts/<int:post_id>/comment/', views.mobile_comment_on_post, name='mobile_comment_on_post'),

    path('api/contact-data/', views.contact_data, name='contact_data'),
    path('api/send-contact-message/', views.send_contact_message, name='api_send_contact_message'),
    path('api/file-complaint/', views.file_complaint, name='api_file_complaint'),
    path('api/make-suggestion/', views.make_suggestion, name='api_make_suggestion'),










    path('serverlogin/', views.server_login_page, name='server_login_page'),
    path('server/auth/login/', views.server_login_api, name='server_login_api'),
    path('server/logout/', views.server_logout, name='server_logout'),
    path('server/dashboard/', views.server_dashboard, name='server_dashboard'),

    path('server/user-management/', views.server_user_management, name='server_user_management'),
    path('server/auth/verify-encryption-key/', views.verify_encryption_key, name='verify_encryption_key'),
    path('server/user-management/user/<int:user_id>/verify/', views.verify_user, name='verify_user'),
    path('server/user-management/user/<int:user_id>/toggle-status/', views.toggle_user_status, name='toggle_user_status'),
    path('server/user-management/user/<int:user_id>/details/', views.get_user_details, name='get_user_details'),
    path('server/user-management/user/<int:user_id>/reject/', views.reject_user, name='reject_user'),


    path('user/<int:user_id>/approve-waitlist/', views.approve_waitlist_user, name='approve_waitlist_user'),
    path('user/<int:user_id>/request-info/', views.request_more_info, name='request_more_info'),

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


    path('server/community-management/', views.server_community_management, name='server_community_management'),
    path('server/community/posts/approve/', views.server_approve_post, name='server_approve_post'),
    path('server/community/posts/reject/', views.server_reject_post, name='server_reject_post'),
    path('server/community/complaints/update/', views.server_update_complaint, name='server_update_complaint'),
    path('server/community/suggestions/update/', views.server_update_suggestion, name='server_update_suggestion'),
    path('server/community/messages/mark-read/', views.server_mark_message_read, name='server_mark_message_read'),
    path('server/community/posts/details/', views.server_get_post_details, name='server_get_post_details'),

    path('server/logs/', views.server_logs_management, name='server_logs_management'),


    path('server/demographics-management/', views.server_demographics_management, name='server_demographics_management'),
    path('server/demographics/add/', views.server_add_demographic_option, name='server_add_demographic_option'),
    path('server/demographics/update/', views.server_update_demographic_option, name='server_update_demographic_option'),
    path('server/demographics/delete/', views.server_delete_demographic_option, name='server_delete_demographic_option'),

    path('server/user-archives/', views.server_user_archives_management, name='server_user_archives_management'),



    path('server/faq-guidelines-management/', views.server_faq_guidelines_management, name='server_faq_guidelines_management'),
    path('server/faq-guidelines/add/', views.server_add_faq_guideline, name='server_add_faq_guideline'),
    path('server/faq-guidelines/update/', views.server_update_faq_guideline, name='server_update_faq_guideline'),
    path('server/faq-guidelines/delete/', views.server_delete_faq_guideline, name='server_delete_faq_guideline'),
    path('server/faq-guidelines/toggle-status/', views.server_toggle_faq_guideline_status, name='server_toggle_faq_guideline_status'),
    path('server/faq-guidelines/update-order/', views.server_update_faq_guideline_order, name='server_update_faq_guideline_order'),


    path('server/admins/', views.server_admins_management, name='server_admins_management'),
    path('server/admins/create/', views.create_admin, name='create_admin'),
    path('server/admins/<str:action>/<int:admin_id>/', views.toggle_admin_status, name='toggle_admin_status'),
    path('server/admins/update/<int:admin_id>/', views.update_admin, name='update_admin'),








    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    
    
    path('api/notifications/', views.get_user_notifications, name='get_user_notifications'),
    path('api/notifications/mark-read/', views.mark_notification_read, name='mark_notification_read'),
    path('api/notifications/mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    path('api/notifications/delete/', views.delete_notification, name='delete_notification'),
    path('api/notifications/unread-count/', views.get_unread_count, name='get_unread_count'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)