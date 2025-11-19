from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Skill, UserSkill

# 1. Register the Custom User
# We use UserAdmin so Django knows how to handle passwords correctly in the dashboard.
admin.site.register(User, UserAdmin)

# 2. Register the other tables
admin.site.register(Skill)
admin.site.register(UserSkill)