from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, UserSerializer, UserSkillSerializer, SkillSerializer
from .models import User, UserSkill, Skill, Call 
from django.db.models import Q 

# --- AUTHENTICATION ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- PROFILE MANAGEMENT ---

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_my_profile(request):
    # 1. READ Profile
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    # 2. UPDATE Profile
    elif request.method == 'PATCH':
        user = request.user
        
        # Check for removal flag
        if request.data.get('remove_avatar') == 'true':
            user.avatar.delete(save=False)
            user.avatar = None
            user.save()

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- SKILLS CRUD ---

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_skills(request):
    # READ
    if request.method == 'GET':
        my_skills = UserSkill.objects.filter(user=request.user)
        serializer = UserSkillSerializer(my_skills, many=True)
        return Response(serializer.data)

    # CREATE (WITH FREEMIUM CHECK)
    elif request.method == 'POST':
        if not request.user.is_pro:
            current_count = UserSkill.objects.filter(user=request.user).count()
            if current_count >= 2:
                return Response(
                    {"error": "Free Plan Limit Reached. Upgrade to Pro to add more skills."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

        skill_name = request.data.get('skill_name')
        skill_type = request.data.get('skill_type')
        
        skill_obj, created = Skill.objects.get_or_create(name=skill_name)

        user_skill = UserSkill.objects.create(
            user=request.user,
            skill=skill_obj,
            skill_type=skill_type
        )
        
        return Response({"message": "Skill added!"}, status=status.HTTP_201_CREATED)

# --- MATCHMAKING / SEARCH ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_peers(request):
    query = request.query_params.get('skill', '')

    if not query:
        return Response({"message": "Please provide a skill to search for."}, status=status.HTTP_400_BAD_REQUEST)

    matches = UserSkill.objects.filter(
        skill__name__icontains=query, 
        skill_type='TEACH'
    ).exclude(user=request.user)

    serializer = UserSkillSerializer(matches, many=True)
    return Response(serializer.data)

# --- DELETE SKILL ---

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_skill(request, skill_id):
    try:
        user_skill = UserSkill.objects.get(id=skill_id, user=request.user)
        user_skill.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except UserSkill.DoesNotExist:
        return Response({"error": "Skill not found"}, status=status.HTTP_404_NOT_FOUND)
    
# --- PUBLIC PROFILE ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_public_profile(request, pk):
    try:
        user = User.objects.get(id=pk)
        user_skills = UserSkill.objects.filter(user=user)
        
        user_data = UserSerializer(user).data
        skills_data = UserSkillSerializer(user_skills, many=True).data
        
        return Response({
            "user": user_data,
            "skills": skills_data
        })
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
# --- PASSWORD MANAGEMENT ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not user.check_password(old_password):
        return Response({"error": "Wrong old password."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)

# ==========================================
# --- CALL SIGNALING VIEWS (FIXED) ---
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_call(request, receiver_id):
    try:
        receiver = User.objects.get(id=receiver_id)
        # Create or update an active call record
        Call.objects.update_or_create(
            caller=request.user,
            receiver=receiver,
            defaults={'is_active': True}
        )
        return Response({"message": "Call started"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_calls(request):
    # Check if anyone is calling ME right now
    active_call = Call.objects.filter(receiver=request.user, is_active=True).last()
    
    if active_call:
        # Return the caller's info so we can show their name
        serializer = UserSerializer(active_call.caller)
        return Response({"active": True, "caller": serializer.data})
    
    return Response({"active": False})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_call(request, receiver_id):
    """
    Ends any active call involving the current user, 
    whether they are the caller or the receiver.
    """
    user = request.user
    
    # Mark ALL active calls involving me as inactive
    Call.objects.filter(
        Q(caller=user) | Q(receiver=user), 
        is_active=True
    ).update(is_active=False)
    
    return Response({"message": "Call ended/rejected"})