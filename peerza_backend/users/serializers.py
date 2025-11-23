from rest_framework import serializers
from .models import User, Skill, UserSkill, Meeting, Notification, Message,FriendRequest, Friendship # ✅ added Message


# 1. Skill Serializer
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


# 2. User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'bio', 'is_pro', 'avatar']


# 3. UserSkill Serializer
class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserSkill
        fields = ['id', 'user', 'skill', 'proficiency', 'skill_type']


# 4. Registration Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email']  # email is optional

    def create(self, validated_data):
        username = validated_data['username']
        raw_email = validated_data.get('email')
        email = raw_email or None  # turn "" into None

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password']
        )
        return user


# 5. Meeting Serializer
class MeetingSerializer(serializers.ModelSerializer):
    host = UserSerializer(read_only=True)
    guest = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Meeting
        fields = [
            'id',
            'host',
            'guest',
            'topic',
            'start_datetime',
            'end_datetime',
            'status',
            'jitsi_room',
            'created_at'
        ]


# 6. Notification Serializer
class NotificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    actor = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'actor',
            'type',
            'data',
            'is_read',
            'created_at'
        ]


# 7. Message Serializer ✅ (NEW)
class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "receiver", "content", "timestamp", "is_read"]

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user   = UserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ["id", "from_user", "to_user", "status", "created_at"]

class FriendshipSerializer(serializers.ModelSerializer):
    friend = UserSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = ["id", "friend", "created_at"]