from rest_framework import serializers
from .models import User, Skill, UserSkill

# 1. Skill Serializer
# Converts the simple "Skill" object to JSON
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

# 2. User Serializer
# Shows public user info. Notice we do NOT include the password here.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'bio', 'is_pro', 'avatar']

# 3. UserSkill Serializer
# This shows the link: "Umer teaches Python"
# We use 'depth=1' to automatically pull the details of the Skill and User instead of just IDs.
class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    class Meta:
        model = UserSkill
        fields = ['id', 'user', 'skill', 'proficiency', 'skill_type']

# 4. Registration Serializer (CRITICAL)
# This handles creating a new user and HASHING the password.
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def create(self, validated_data):
        # We use create_user instead of create to ensure password is hashed
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user