from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Auth Routes
    path('register/', views.register_user, name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App Routes
    path('profile/', views.get_my_profile, name='profile'),
    path('my-skills/', views.my_skills, name='my_skills'),

    # Searching
    path('search/', views.search_peers, name='search_peers'),

    # Delete Skill
    path('delete-skill/<int:skill_id>/', views.delete_skill, name='delete_skill'),

    # Public Profile Route
    path('users/<int:pk>/', views.get_public_profile, name='public_profile'),

    # Password Change
    path('change-password/', views.change_password, name='change_password'),

    # ==========================================
    # --- NEW CALL SIGNALING ROUTES (Step 2) ---
    # ==========================================
    path('call/start/<int:receiver_id>/', views.start_call, name='start_call'),
    path('call/check/', views.check_calls, name='check_calls'),
    path('call/end/<int:receiver_id>/', views.end_call, name='end_call'),
]