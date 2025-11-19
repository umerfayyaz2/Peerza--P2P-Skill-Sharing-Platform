from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Tell Django: "If the URL starts with /api/, go look at users/urls.py"
    path('api/', include('users.urls')),
]