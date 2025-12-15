from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .models import Ingredient, DietPlan, DietPlanItem
from .management.serializers import (
    IngredientSerializer, DietPlanSerializer,
    DietPlanListSerializer, DietPlanItemSerializer
)
from ai_services.diet_generator import DietPlanGenerator
from ai_services.nl_parser import NaturalLanguageParser


class IngredientListView(generics.ListAPIView):
    """List and search ingredients."""
    
    serializer_class = IngredientSerializer
    permission_classes = (IsAuthenticated,)
    queryset = Ingredient.objects.all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        
        if search:
            queryset = queryset.filter(name__icontains=search)
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset


class IngredientDetailView(generics.RetrieveAPIView):
    """Get ingredient details."""
    
    serializer_class = IngredientSerializer
    permission_classes = (IsAuthenticated,)
    queryset = Ingredient.objects.all()


class DietPlanListView(generics.ListAPIView):
    """List user's diet plans."""
    
    serializer_class = DietPlanListSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        return DietPlan.objects.filter(user=self.request.user)


class DietPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a diet plan."""
    
    serializer_class = DietPlanSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        return DietPlan.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_diet_plan(request):
    """Generate AI-powered diet plan."""
    
    try:
        # For now, create a simple diet plan without AI generation
        # Extract data from request
        plan_name = request.data.get('plan_name', 'My Diet Plan')
        ai_description = request.data.get('ai_description', '')
        
        # Create a simple diet plan
        diet_plan = DietPlan.objects.create(
            user=request.user,
            plan_name=plan_name,
            ai_description=ai_description,
            total_calories=2000,  # Default values
            total_protein=150,
            total_carbs=200,
            total_fat=65,
        )
        
        serializer = DietPlanSerializer(diet_plan)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        print(f"Diet plan generation error: {str(e)}")
        print(f"Request data: {request.data}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_from_natural_language(request):
    """Generate diet plan from natural language input."""
    
    try:
        nl_input = request.data.get('input', '')
        
        if not nl_input:
            return Response({
                'error': 'Input text is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse natural language
        parser = NaturalLanguageParser()
        parsed_data = parser.parse(nl_input, request.user)
        
        # Generate diet plan
        generator = DietPlanGenerator(request.user)
        plan = generator.generate_plan(parsed_data)
        
        serializer = DietPlanSerializer(plan)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
