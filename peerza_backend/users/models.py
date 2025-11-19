from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. The Custom User Model
# We extend the default Django user to add Peerza-specific fields.
class User(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    is_pro = models.BooleanField(default=False) # For the Freemium Logic [cite: 33]
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # We will add avatar/profile_pic later if needed.
    
    def __str__(self):
        return self.username

# 2. The Skill Model
# This is just the name of the skill (e.g., "Python").
class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# 3. The User-Skill Link (The Matchmaking Engine)
# This connects a User to a Skill and defines the relationship type.
class UserSkill(models.Model):
    SKILL_TYPES = (
        ('TEACH', 'Can Teach'),
        ('LEARN', 'Wants to Learn'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    proficiency = models.CharField(max_length=50, default="Beginner") # e.g., Beginner, Expert
    skill_type = models.CharField(max_length=10, choices=SKILL_TYPES)

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.skill_type})"