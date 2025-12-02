from django.urls import path
from .views import (
    IngredientListView, IngredientDetailView,
    DietPlanListView, DietPlanDetailView,
    generate_diet_plan, generate_from_natural_language
)

urlpatterns = [
    path('ingredients/', IngredientListView.as_view(), name='ingredient-list'),
    path('ingredients/<int:pk>/', IngredientDetailView.as_view(), name='ingredient-detail'),
    path('diet-plans/', DietPlanListView.as_view(), name='diet-plan-list'),
    path('diet-plans/<int:pk>/', DietPlanDetailView.as_view(), name='diet-plan-detail'),
    path('diet-plans/generate/', generate_diet_plan, name='generate-diet-plan'),
    path('diet-plans/generate-from-nl/', generate_from_natural_language, name='generate-from-nl'),
]
