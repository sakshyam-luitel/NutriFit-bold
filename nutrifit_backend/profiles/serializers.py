from rest_framework import serializers
from .models import UserProfile, MedicalCondition, UserPreferences, DietGoal


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""
    
    email = serializers.EmailField(source='user.email', read_only=True)
    bmi = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ('user', 'email', 'age', 'weight', 'height', 'sex', 'activity_level', 
                  'bmi', 'created_at', 'updated_at')
        read_only_fields = ('user', 'created_at', 'updated_at')


class MedicalConditionSerializer(serializers.ModelSerializer):
    """Serializer for MedicalCondition model."""
    
    class Meta:
        model = MedicalCondition
        fields = ('id', 'user', 'condition_name', 'severity', 'notes', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for UserPreferences model."""
    
    class Meta:
        model = UserPreferences
        fields = ('user', 'dietary_type', 'allergies', 'disliked_foods', 
                  'preferred_cuisines', 'updated_at')
        read_only_fields = ('user', 'updated_at')


class DietGoalSerializer(serializers.ModelSerializer):
    """Serializer for DietGoal model."""
    
    goal_type_display = serializers.CharField(source='get_goal_type_display', read_only=True)
    
    class Meta:
        model = DietGoal
        fields = ('id', 'user', 'goal_type', 'goal_type_display', 'target_weight', 
                  'target_date', 'calorie_target', 'is_active', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')
