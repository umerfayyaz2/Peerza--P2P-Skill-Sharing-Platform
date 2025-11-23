from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import mark_notification_read


urlpatterns = [
    # --- Authentication ---
    path('register/', views.register_user, name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # --- Profile Management ---
    path('profile/', views.get_my_profile, name='profile'),

    # --- Firebase ---
    path('firebase/register-uid/', views.register_firebase_uid, name='register_firebase_uid'),

    # --- Skills ---
    path('my-skills/', views.my_skills, name='my_skills'),
    path('delete-skill/<int:skill_id>/', views.delete_skill, name='delete_skill'),

    # --- Search ---
    path('search/', views.search_peers, name='search_peers'),

    # --- Call / Meeting Routes ---
    path("call/check/", views.check_calls, name="check_calls"),
    path("call/start/<int:receiver_id>/", views.call_start, name="call_start"),
    path("call/end/<int:receiver_id>/", views.call_end, name="call_end"),

    # --- Meetings & Notifications ---
    path('meetings/request/', views.request_meeting, name='request_meeting'),
    path('meetings/<int:meeting_id>/respond/', views.respond_meeting, name='respond_meeting'),
    path('meetings/my/', views.my_meetings, name='my_meetings'),
    path('notifications/', views.notifications_list, name='notifications_list'),
    # --- Notifications ---
    path("notifications/", views.notifications_list, name="notifications_list"),
    path("notifications/mark-read/<int:notification_id>/", views.mark_notification_read, name="mark_notification_read"),


    # --- Public Profile Route ---
    path("users/<int:pk>/", views.get_public_profile, name="public_profile"),

    # --- Chat (1-to-1) --- ✅ NEW
    path("chats/", views.chat_conversations),
    path("chats/<int:user_id>/messages/", views.chat_messages),
    path("chats/<int:user_id>/send/", views.chat_send),
    path("chats/<int:user_id>/read/", views.chat_mark_read),

    # --- Friends ---
    path("friends/", views.friends_list),
    path("friends/requests/", views.friend_requests_inbox),
    path("friends/request/<int:user_id>/", views.friend_request_send),
    path("friends/request/respond/<int:request_id>/", views.friend_request_respond),

    path("notifications/mark-read/<int:notification_id>/", mark_notification_read),

]
