from django.db import IntegrityError
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import (
    User,
    UserSkill,
    Skill,
    Call,
    Meeting,
    Notification,
    Message,
    FriendRequest,
    Friendship,
)

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserSkillSerializer,
    SkillSerializer,
    MeetingSerializer,
    NotificationSerializer,
    MessageSerializer,
    FriendRequestSerializer,
)

# =============================================================
# AUTHENTICATION
# =============================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response({"detail": "Email already in use"}, status=400)
    return Response(serializer.errors, status=400)

# =============================================================
# PROFILE MANAGEMENT
# =============================================================

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_my_profile(request):
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)

    # PATCH
    user = request.user
    if request.data.get('remove_avatar') == 'true':
        user.avatar.delete(save=False)
        user.avatar = None
        user.save()

    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# =============================================================
# SKILLS
# =============================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_skills(request):
    if request.method == 'GET':
        qs = UserSkill.objects.filter(user=request.user)
        return Response(UserSkillSerializer(qs, many=True).data)

    # POST
    if not request.user.is_pro:
        current = UserSkill.objects.filter(user=request.user).count()
        if current >= 2:
            return Response(
                {"error": "Free Plan Limit Reached. Upgrade to Pro to add more skills."},
                status=status.HTTP_403_FORBIDDEN,
            )

    skill_name = request.data.get('skill_name')
    skill_type = request.data.get('skill_type')
    skill_obj, _ = Skill.objects.get_or_create(name=skill_name)
    UserSkill.objects.create(user=request.user, skill=skill_obj, skill_type=skill_type)
    return Response({"message": "Skill added!"}, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_skill(request, skill_id):
    try:
        us = UserSkill.objects.get(id=skill_id, user=request.user)
    except UserSkill.DoesNotExist:
        return Response({"error": "Skill not found"}, status=404)
    us.delete()
    return Response(status=204)

# =============================================================
# SEARCH
# =============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_peers(request):
    query = request.query_params.get('skill', '').strip()
    if not query:
        return Response({"message": "Please provide a skill to search for."}, status=400)

    matches = UserSkill.objects.filter(
        skill__name__icontains=query, skill_type='TEACH'
    ).exclude(user=request.user)

    return Response(UserSkillSerializer(matches, many=True).data)

# =============================================================
# PUBLIC PROFILE
# =============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_public_profile(request, pk):
    try:
        user = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    skills = UserSkill.objects.filter(user=user)
    return Response({
        "user": UserSerializer(user).data,
        "skills": UserSkillSerializer(skills, many=True).data,
    })

# =============================================================
# PASSWORD
# =============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_pw = request.data.get('old_password')
    new_pw = request.data.get('new_password')
    if not user.check_password(old_pw):
        return Response({"error": "Wrong old password."}, status=400)
    user.set_password(new_pw)
    user.save()
    return Response({"message": "Password updated successfully."})

# =============================================================
# CALL SIGNALING (LEGACY)
# =============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_call(request, receiver_id):
    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    Call.objects.update_or_create(
        caller=request.user, receiver=receiver, defaults={'is_active': True}
    )
    return Response({"message": "Call started"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_calls(request):
    active_call = Call.objects.filter(receiver=request.user, is_active=True).last()
    if active_call:
        return Response({"active": True, "caller": UserSerializer(active_call.caller).data})
    return Response({"active": False})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_call(request, receiver_id):
    Call.objects.filter(
        Q(caller=request.user) | Q(receiver=request.user),
        is_active=True,
    ).update(is_active=False)
    return Response({"message": "Call ended"})

# =============================================================
# FIREBASE UID
# =============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_firebase_uid(request):
    uid = request.data.get('firebase_uid')
    if not uid:
        return Response({"detail": "firebase_uid required"}, status=400)

    User.objects.filter(firebase_uid=uid).exclude(id=request.user.id).update(firebase_uid=None)
    request.user.firebase_uid = uid
    request.user.save()
    return Response({"detail": "registered"})

# =============================================================
# MEETINGS
# =============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_meeting(request):
    guest_id = request.data.get("guest_id")
    topic = request.data.get("topic", "")
    start = request.data.get("start_datetime")
    end = request.data.get("end_datetime")

    try:
        guest = User.objects.get(id=guest_id)
    except User.DoesNotExist:
        return Response({"detail": "guest not found"}, status=404)

    meeting = Meeting.objects.create(
        host=request.user,
        guest=guest,
        topic=topic,
        start_datetime=start,
        end_datetime=end,
        status='PENDING',
    )

    Notification.objects.create(
        user=guest,
        actor=request.user,
        type="MEETING_REQUEST",
        data={"meeting_id": meeting.id},
    )

    return Response(MeetingSerializer(meeting).data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_meeting(request, meeting_id):
    response = (request.data.get("response") or "").upper()

    try:
        meeting = Meeting.objects.get(id=meeting_id)
    except Meeting.DoesNotExist:
        return Response({"detail": "not found"}, status=404)

    # ✅ Allow both host and guest to respond
    if request.user not in [meeting.host, meeting.guest]:
        return Response({"detail": "forbidden"}, status=403)

    if response == "ACCEPT":
        meeting.status = "ACCEPTED"
        meeting.jitsi_room = (
            f"peerza-{min(meeting.host.id, meeting.guest.id)}-"
            f"{max(meeting.host.id, meeting.guest.id)}-{meeting.id}"
        )
    elif response == "DECLINE":
        meeting.status = "DECLINED"
    else:
        return Response({"detail": "Invalid response"}, status=400)

    meeting.save()

    # Notify the other participant
    other_user = meeting.guest if request.user == meeting.host else meeting.host
    Notification.objects.create(
        user=other_user,
        actor=request.user,
        type="MEETING_RESPONSE",
        data={"meeting_id": meeting.id, "response": meeting.status},
    )

    print(f"✅ Meeting {meeting.id} updated to {meeting.status} by {request.user.username}")

    return Response(MeetingSerializer(meeting).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_meetings(request):
    qs = Meeting.objects.filter(Q(host=request.user) | Q(guest=request.user))
    return Response(MeetingSerializer(qs, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_meetings(request):
    """
    Pending invites for the logged-in user (receiver/guest).
    Used by dashboard poll.
    """
    meetings = Meeting.objects.filter(
        Q(guest=request.user),
        status='PENDING'
    ).order_by('-created_at')
    return Response(MeetingSerializer(meetings, many=True).data)

# =============================================================
# NOTIFICATIONS
# =============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    notes = Notification.objects.filter(
        user=request.user, is_read=False
    ).order_by("-created_at")[:50]
    return Response(NotificationSerializer(notes, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        n = Notification.objects.get(id=notification_id, user=request.user)
    except Notification.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)
    n.is_read = True
    n.save()
    return Response({"ok": True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_read_all(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({"ok": True})

# =============================================================
# UPDATED CALL START / END (MEETING + NOTIFY)
# =============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def call_start(request, receiver_id):
    caller = request.user
    receiver = get_object_or_404(User, id=receiver_id)

    if caller == receiver:
        return Response({"error": "You cannot call yourself."}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ Only reuse a PENDING meeting; ignore ACCEPTED/DECLINED/CANCELLED
    meeting = Meeting.objects.filter(
        host=caller,
        guest=receiver,
        status="PENDING",
    ).order_by("-created_at").first()

    if not meeting:
        meeting = Meeting.objects.create(
            host=caller,
            guest=receiver,
            status="PENDING",
            start_datetime=timezone.now(),
        )
        # Notify receiver only when we actually create a new pending request
        Notification.objects.create(
            user=receiver,       # who should receive it
            actor=caller,        # who initiated it
            type="MEETING_REQUEST",
            data={"meeting_id": meeting.id},
        )

    # room name is stable for this pair + this meeting
    room_name = f"Peerza-Class-{caller.id}-{receiver.id}"
    return Response({"ok": True, "room": room_name}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def call_end(request, receiver_id):
    user = request.user
    receiver = get_object_or_404(User, id=receiver_id)
    meeting = Meeting.objects.filter(
        Q(host__in=[user, receiver]),
        Q(guest__in=[user, receiver]),
        status="PENDING",
    ).first()

    if meeting:
        meeting.status = "CANCELLED"
        meeting.end_datetime = timezone.now()
        meeting.save()

    return Response({"ok": True})

# =============================================================
# CHAT
# =============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_conversations(request):
    me = request.user

    msg_peers = set(
        Message.objects.filter(Q(sender=me) | Q(receiver=me)).values_list("sender", flat=True)
    ) | set(
        Message.objects.filter(Q(sender=me) | Q(receiver=me)).values_list("receiver", flat=True)
    )
    msg_peers.discard(me.id)

    friend_ids = set(Friendship.objects.filter(user=me).values_list("friend_id", flat=True))
    peer_ids = msg_peers | friend_ids

    data = []
    for pid in peer_ids:
        peer = User.objects.get(id=pid)
        unread = Message.objects.filter(sender=peer, receiver=me, is_read=False).count()
        last_msg = Message.objects.filter(
            Q(sender=me, receiver=peer) | Q(sender=peer, receiver=me)
        ).order_by('-timestamp').first()
        data.append({
            "peer": UserSerializer(peer).data,
            "unread_count": unread,
            "last_message": MessageSerializer(last_msg).data if last_msg else None,
        })

    data.sort(key=lambda x: x["last_message"]["timestamp"] if x["last_message"] else "", reverse=True)
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_messages(request, user_id):
    me = request.user
    peer = get_object_or_404(User, id=user_id)
    qs = Message.objects.filter(
        Q(sender=me, receiver=peer) | Q(sender=peer, receiver=me)
    ).order_by('timestamp')
    return Response(MessageSerializer(qs, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_send(request, user_id):
    me = request.user
    peer = get_object_or_404(User, id=user_id)
    text = (request.data.get("content") or "").strip()
    if not text:
        return Response({"detail": "Message content required"}, status=400)
    msg = Message.objects.create(sender=me, receiver=peer, content=text)
    return Response(MessageSerializer(msg).data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_mark_read(request, user_id):
    me = request.user
    peer = get_object_or_404(User, id=user_id)
    Message.objects.filter(sender=peer, receiver=me, is_read=False).update(is_read=True)
    return Response({"ok": True})

# =============================================================
# FRIENDS
# =============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friends_list(request):
    me = request.user
    qs = Friendship.objects.filter(user=me).select_related("friend")
    data = [{"id": f.id, "friend": UserSerializer(f.friend).data} for f in qs]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def friend_request_send(request, user_id):
    me = request.user
    to_user = get_object_or_404(User, id=user_id)
    if to_user == me:
        return Response({"detail": "cannot friend yourself"}, status=400)

    fr, created = FriendRequest.objects.get_or_create(from_user=me, to_user=to_user)
    if not created and fr.status != FriendRequest.PENDING:
        fr.status = FriendRequest.PENDING
        fr.save()

    Notification.objects.create(
        user=to_user, actor=me, type="FRIEND_REQUEST", data={"request_id": fr.id}
    )
    return Response({"ok": True, "request_id": fr.id}, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def friend_request_respond(request, request_id):
    me = request.user
    action = (request.data.get("action") or "").upper()
    fr = get_object_or_404(FriendRequest, id=request_id, to_user=me)

    if action == "ACCEPT":
        fr.status = FriendRequest.ACCEPTED
        fr.save()
        Friendship.objects.get_or_create(user=me, friend=fr.from_user)
        Friendship.objects.get_or_create(user=fr.from_user, friend=me)
        Notification.objects.create(user=fr.from_user, actor=me, type="FRIEND_ACCEPTED", data={})
    elif action == "DECLINE":
        fr.status = FriendRequest.DECLINED
        fr.save()
        Notification.objects.create(user=fr.from_user, actor=me, type="FRIEND_DECLINED", data={})
    else:
        return Response({"detail": "Invalid action"}, status=400)

    return Response({"ok": True})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friend_requests_inbox(request):
    me = request.user
    qs = FriendRequest.objects.filter(
        to_user=me, status=FriendRequest.PENDING
    ).select_related("from_user")
    return Response(FriendRequestSerializer(qs, many=True).data)
