from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

# 1. USER MODEL
class User(AbstractUser):
    email = models.EmailField(unique=True, null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_pro = models.BooleanField(default=False)
    last_active = models.DateTimeField(default=timezone.now)

    # REQUIRED for 1-on-1 chat + presence
    firebase_uid = models.CharField(max_length=200, blank=True, null=True, unique=True)

    def is_online(self):
        return (timezone.now() - self.last_active).total_seconds() < 300

    def __str__(self):
        return self.username


# 2. SKILL
class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


# 3. USER-SKILL
class UserSkill(models.Model):
    SKILL_TYPES = (
        ('TEACH', 'Can Teach'),
        ('LEARN', 'Wants to Learn'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    proficiency = models.CharField(max_length=50, default="Beginner")
    skill_type = models.CharField(max_length=10, choices=SKILL_TYPES)

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.skill_type})"


# 4. CALL MODEL
class Call(models.Model):
    caller = models.ForeignKey(User, related_name='calls_made', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='calls_received', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.caller.username} calling {self.receiver.username}"


# 5. MESSAGE MODEL
class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Msg from {self.sender.username} to {self.receiver.username}"

# 6. AVAILABILITY (per-user weekly slots)
class Availability(models.Model):
    DAY_CHOICES = [
        ('MONDAY', 'Monday'),
        ('TUESDAY', 'Tuesday'),
        ('WEDNESDAY', 'Wednesday'),
        ('THURSDAY', 'Thursday'),
        ('FRIDAY', 'Friday'),
        ('SATURDAY', 'Saturday'),
        ('SUNDAY', 'Sunday'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="availability_slots")
    day_of_week = models.CharField(max_length=9, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.user.username} — {self.day_of_week} {self.start_time}–{self.end_time}"


# 6. MEETING MODEL (Scheduler)
class Meeting(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined'),
        ('CANCELLED', 'Cancelled'),
    ]

    host = models.ForeignKey(User, related_name='hosted_meetings', on_delete=models.CASCADE)
    guest = models.ForeignKey(User, related_name='invited_meetings', on_delete=models.CASCADE)
    availability = models.ForeignKey('Availability', null=True, blank=True, on_delete=models.SET_NULL)

    topic = models.CharField(max_length=255, blank=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    jitsi_room = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Meeting: {self.topic} ({self.status})"


# 7. NOTIFICATION MODEL
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    type = models.CharField(max_length=50)
    data = models.JSONField(default=dict)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Notification to {self.user.username} ({self.type})"


# 8. FRIEND REQUEST MODEL ✅
class FriendRequest(models.Model):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (ACCEPTED, "Accepted"),
        (DECLINED, "Declined"),
    ]

    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend_requests_sent")
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend_requests_received")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("from_user", "to_user")

    def __str__(self):
        return f"Friend request from {self.from_user} to {self.to_user} ({self.status})"


# 9. FRIENDSHIP MODEL ✅
class Friendship(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friends")
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend_of")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "friend")

    def __str__(self):
        return f"{self.user.username} ↔ {self.friend.username}"
