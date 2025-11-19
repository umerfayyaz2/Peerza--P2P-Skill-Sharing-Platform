from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Auth Routes
    path('register/', views.register_user, name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Built-in JWT Login!
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App Routes
    path('profile/', views.get_my_profile, name='profile'),
    path('my-skills/', views.my_skills, name='my_skills'),

    #Searching
    path('search/', views.search_peers, name='search_peers'),

    #Delete Skill
    path('delete-skill/<int:skill_id>/', views.delete_skill, name='delete_skill'),

    # Public Profile Route
    path('users/<int:pk>/', views.get_public_profile, name='public_profile'),
]