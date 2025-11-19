from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, UserSerializer, UserSkillSerializer, SkillSerializer
from .models import User, UserSkill, Skill
from django.db.models import Q # Needed for search

# --- AUTHENTICATION ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- PROFILE MANAGEMENT (Updated for Step 43) ---

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_my_profile(request):
    # 1. READ Profile
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    # 2. UPDATE Profile
    elif request.method == 'PATCH':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- SKILLS CRUD ---

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_skills(request):
    # READ: Get all skills
    if request.method == 'GET':
        my_skills = UserSkill.objects.filter(user=request.user)
        serializer = UserSkillSerializer(my_skills, many=True)
        return Response(serializer.data)

    # CREATE: Add a new skill (WITH FREEMIUM CHECK)
    elif request.method == 'POST':
        # 1. Check if user is Free or Pro
        if not request.user.is_pro:
            # 2. Count current skills
            current_count = UserSkill.objects.filter(user=request.user).count()
            # 3. The Gatekeeper Rule (Limit: 2)
            if current_count >= 2:
                return Response(
                    {"error": "Free Plan Limit Reached. Upgrade to Pro to add more skills."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

        # ... If pass, continue as normal ...
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

    # Filter: Find users teaching the skill, excluding myself
    matches = UserSkill.objects.filter(
        skill__name__icontains=query, 
        skill_type='TEACH'
    ).exclude(user=request.user)

    serializer = UserSkillSerializer(matches, many=True)
    return Response(serializer.data)

# --- For Skill deletion ---
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_skill(request, skill_id):
    try:
        # 1. Find the connection (UserSkill)
        # We filter by 'user=request.user' to ensure you can't delete someone else's skill
        user_skill = UserSkill.objects.get(id=skill_id, user=request.user)
        
        # 2. Delete it
        user_skill.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    except UserSkill.DoesNotExist:
        return Response({"error": "Skill not found"}, status=status.HTTP_404_NOT_FOUND)
    
# public profile endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_public_profile(request, pk):
    try:
        # 1. Get the User
        user = User.objects.get(id=pk)
        
        # 2. Get their Skills
        user_skills = UserSkill.objects.filter(user=user)
        
        # 3. Serialize both
        user_data = UserSerializer(user).data
        skills_data = UserSkillSerializer(user_skills, many=True).data
        
        # 4. Return combined data
        return Response({
            "user": user_data,
            "skills": skills_data
        })
        
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)