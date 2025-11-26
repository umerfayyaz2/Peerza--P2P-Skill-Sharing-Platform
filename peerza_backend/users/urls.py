from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

urlpatterns = [
    # =========================================================
    # AUTHENTICATION
    # =========================================================
    path('register/', views.register_user, name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # =========================================================
    # PROFILE MANAGEMENT
    # =========================================================
    path('profile/', views.get_my_profile, name='profile'),
    path('change-password/', views.change_password, name='change_password'),

    # =========================================================
    # FIREBASE UID
    # =========================================================
    path('firebase/register-uid/', views.register_firebase_uid, name='register_firebase_uid'),

    # =========================================================
    # SKILLS
    # =========================================================
    path('my-skills/', views.my_skills, name='my_skills'),
    path('delete-skill/<int:skill_id>/', views.delete_skill, name='delete_skill'),

    # =========================================================
    # SEARCH / PUBLIC PROFILE
    # =========================================================
    path('search/', views.search_peers, name='search_peers'),
    path('users/<int:pk>/', views.get_public_profile, name='public_profile'),

    # =========================================================
    # CALLS & MEETINGS
    # =========================================================
    path('call/check/', views.check_calls, name='check_calls'),
    path('call/start/<int:receiver_id>/', views.call_start, name='call_start'),
    path('call/end/<int:receiver_id>/', views.call_end, name='call_end'),

    path('meetings/request/', views.request_meeting, name='request_meeting'),
    path('meetings/<int:meeting_id>/respond/', views.respond_meeting, name='respond_meeting'),
    path('meetings/my/', views.my_meetings, name='my_meetings'),
    path('meetings/pending/', views.pending_meetings, name='pending_meetings'),

    # =========================================================
    # NOTIFICATIONS
    # =========================================================
    path('notifications/', views.notifications_list, name='notifications_list'),
    path('notifications/mark-read/<int:notification_id>/', views.mark_notification_read, name='mark_notification_read'),
    path('notifications/mark-read-all/', views.mark_notifications_read_all, name='mark_notifications_read_all'),

    # =========================================================
    # CHAT
    # =========================================================
    path('chats/', views.chat_conversations, name='chat_conversations'),
    path('chats/<int:user_id>/messages/', views.chat_messages, name='chat_messages'),
    path('chats/<int:user_id>/send/', views.chat_send, name='chat_send'),
    path('chats/<int:user_id>/read/', views.chat_mark_read, name='chat_mark_read'),

    # =========================================================
    # FRIENDS
    # =========================================================
    path('friends/', views.friends_list, name='friends_list'),
    path('friends/requests/', views.friend_requests_inbox, name='friend_requests_inbox'),
    path('friends/request/<int:user_id>/', views.friend_request_send, name='friend_request_send'),
    path('friends/request/respond/<int:request_id>/', views.friend_request_respond, name='friend_request_respond'),

    # =========================================================
    # AVAILABILITY
    # =========================================================
    path('availability/<int:user_id>/', views.get_user_availability, name='get_user_availability'),
    path('availability/', views.create_or_update_availability, name='create_or_update_availability'),
]
