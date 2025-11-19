from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, UserSerializer, UserSkillSerializer, SkillSerializer
from .models import User, UserSkill, Skill
from django.db.models import Q

# --- AUTHENTICATION ---

@api_view(['POST'])
@permission_classes([AllowAny]) # Anyone can register
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- PROFILE ---

@api_view(['GET'])
@permission_classes([IsAuthenticated]) # Must be logged in
def get_my_profile(request):
    # 'request.user' is automatically set by Django if the token is valid
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# --- SKILLS (CRUD) ---

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_skills(request):
    # READ: Get all skills I am teaching or learning
    if request.method == 'GET':
        my_skills = UserSkill.objects.filter(user=request.user)
        serializer = UserSkillSerializer(my_skills, many=True)
        return Response(serializer.data)

    # CREATE: Add a new skill to my profile
    elif request.method == 'POST':
        # 1. Get data from frontend
        skill_name = request.data.get('skill_name')
        skill_type = request.data.get('skill_type') # 'TEACH' or 'LEARN'
        
        # 2. Check/Create the Skill object first
        # get_or_create prevents duplicates in the main Skill table
        skill_obj, created = Skill.objects.get_or_create(name=skill_name)

        # 3. Link it to the user
        user_skill = UserSkill.objects.create(
            user=request.user,
            skill=skill_obj,
            skill_type=skill_type
        )
        
        return Response({"message": "Skill added!"}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_peers(request):
    # 1. Capture the search term (e.g., "Python")
    query = request.query_params.get('skill', '')

    if not query:
        return Response({"message": "Please provide a skill to search for."}, status=status.HTTP_400_BAD_REQUEST)

    # 2. The Filter Logic
    # Find UserSkill entries where:
    # - The skill name contains the query (case-insensitive)
    # - The type is 'TEACH' (we are looking for teachers)
    # - The user is NOT me (I don't need to find myself)
    matches = UserSkill.objects.filter(
        skill__name__icontains=query, 
        skill_type='TEACH'
    ).exclude(user=request.user)

    # 3. Return the results
    serializer = UserSkillSerializer(matches, many=True)
    return Response(serializer.data)