from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Skill, UserSkill, Meeting, Notification, Message, FriendRequest, Friendship , Availability


# 1. Register the Custom User
admin.site.register(User, UserAdmin)

# 2. Register other core models
admin.site.register(Skill)
admin.site.register(UserSkill)
admin.site.register(Meeting)
admin.site.register(Message)


# 3. ✅ Register Notifications with custom admin view
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "actor", "type", "is_read", "created_at")
    list_filter = ("type", "is_read")
    search_fields = ("user__username", "actor__username")


# 4. ✅ Register Friend Request & Friendship models
admin.site.register(FriendRequest)
admin.site.register(Friendship)

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ('user', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('day_of_week',)
