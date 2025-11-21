from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

# 1. The Custom User Model
class User(AbstractUser):
    # We REMOVE unique=True so the database stops screaming
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_pro = models.BooleanField(default=False)
    last_active = models.DateTimeField(default=timezone.now)

    def is_online(self):
        return (timezone.now() - self.last_active).total_seconds() < 300

    def __str__(self):
        return self.username

# 2. The Skill Model
class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# 3. The User-Skill Link (Matchmaking)
class UserSkill(models.Model):
    SKILL_TYPES = (
        ('TEACH', 'Can Teach'),
        ('LEARN', 'Wants to Learn'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    # We kept proficiency to avoid breaking your existing data if you have any
    proficiency = models.CharField(max_length=50, default="Beginner") 
    skill_type = models.CharField(max_length=10, choices=SKILL_TYPES)

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.skill_type})"

# 4. The Call Model (Video Signaling)
class Call(models.Model):
    caller = models.ForeignKey(User, related_name='calls_made', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='calls_received', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.caller.username} calling {self.receiver.username}"

# --- NEW SYSTEM 1: MESSAGES (Chat) ---
class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp'] # Oldest messages first

    def __str__(self):
        return f"Msg from {self.sender.username} to {self.receiver.username}"

# --- NEW SYSTEM 2: MEETINGS (Scheduler) ---
class Meeting(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'), 
        ('CONFIRMED', 'Confirmed'), 
        ('DECLINED', 'Declined')
    ]
    
    host = models.ForeignKey(User, related_name='meetings_hosted', on_delete=models.CASCADE)
    guest = models.ForeignKey(User, related_name='meetings_invited', on_delete=models.CASCADE)
    date_time = models.DateTimeField()
    topic = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Meeting: {self.topic} ({self.status})"

# --- NEW SYSTEM 3: NOTIFICATIONS ---
class Notification(models.Model):
    recipient = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional link: This notification might be about a specific Meeting
    meeting = models.ForeignKey(Meeting, null=True, blank=True, on_delete=models.CASCADE) 
    
    class Meta:
        ordering = ['-created_at'] # Newest notifications first