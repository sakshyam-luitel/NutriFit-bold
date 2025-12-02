from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile, MedicalCondition, UserPreferences, DietGoal
from .serializers import (
    UserProfileSerializer, MedicalConditionSerializer,
    UserPreferencesSerializer, DietGoalSerializer
)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user's profile."""
    
    serializer_class = UserProfileSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_object(self):
        return self.request.user.profile


class UserProfileCreateView(generics.CreateAPIView):
    """Create user profile."""
    
    serializer_class = UserProfileSerializer
    permission_classes = (IsAuthenticated,)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MedicalConditionListCreateView(generics.ListCreateAPIView):
    """List or create medical conditions."""
    
    serializer_class = MedicalConditionSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        return MedicalCondition.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MedicalConditionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a medical condition."""
    
    serializer_class = MedicalConditionSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        return MedicalCondition.objects.filter(user=self.request.user)


class UserPreferencesView(generics.RetrieveUpdateAPIView):
    """Get or update user preferences."""
    
    serializer_class = UserPreferencesSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_object(self):
        preferences, created = UserPreferences.objects.get_or_create(
            user=self.request.user
        )
        return preferences


class DietGoalListCreateView(generics.ListCreateAPIView):
    """List or create diet goals."""
    
    serializer_class = DietGoalSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        return DietGoal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DietGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a diet goal."""
    
    serializer_class = DietGoalSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        return DietGoal.objects.filter(user=self.request.user)
