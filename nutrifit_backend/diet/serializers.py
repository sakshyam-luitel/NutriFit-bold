from rest_framework import serializers
from .models import Ingredient, DietPlan, DietPlanItem


class IngredientSerializer(serializers.ModelSerializer):
    """Serializer for Ingredient model."""
    
    class Meta:
        model = Ingredient
        fields = ('id', 'name', 'category', 'calories_per_100g', 'protein_per_100g',
                  'carbs_per_100g', 'fat_per_100g', 'fiber_per_100g', 'image_url',
                  'is_vegetarian', 'is_vegan', 'common_allergens')


class DietPlanItemSerializer(serializers.ModelSerializer):
    """Serializer for DietPlanItem model."""
    
    ingredient = IngredientSerializer(read_only=True)
    calories = serializers.DecimalField(max_digits=6, decimal_places=2, read_only=True)
    protein = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    carbs = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    fat = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = DietPlanItem
        fields = ('id', 'ingredient', 'quantity_grams', 'meal_type', 'ai_description',
                  'preparation_notes', 'order_index', 'calories', 'protein', 'carbs', 'fat')


class DietPlanSerializer(serializers.ModelSerializer):
    """Serializer for DietPlan model."""
    
    items = DietPlanItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = DietPlan
        fields = ('id', 'user', 'goal', 'plan_name', 'ai_description', 'total_calories',
                  'total_protein', 'total_carbs', 'total_fat', 'is_favorite', 'created_at', 'items')
        read_only_fields = ('id', 'user', 'created_at')


class DietPlanListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing diet plans."""
    
    class Meta:
        model = DietPlan
        fields = ('id', 'plan_name', 'ai_description', 'total_calories', 'total_protein',
                  'total_carbs', 'total_fat', 'is_favorite', 'created_at')
        read_only_fields = ('id', 'created_at')
