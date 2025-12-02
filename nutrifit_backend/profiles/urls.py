from django.urls import path
from .views import (
    UserProfileView, UserProfileCreateView,
    MedicalConditionListCreateView, MedicalConditionDetailView,
    UserPreferencesView,
    DietGoalListCreateView, DietGoalDetailView
)

urlpatterns = [
    path('profiles/me/', UserProfileView.as_view(), name='profile-detail'),
    path('profiles/', UserProfileCreateView.as_view(), name='profile-create'),
    path('medical-conditions/', MedicalConditionListCreateView.as_view(), name='medical-condition-list'),
    path('medical-conditions/<int:pk>/', MedicalConditionDetailView.as_view(), name='medical-condition-detail'),
    path('preferences/', UserPreferencesView.as_view(), name='preferences'),
    path('diet-goals/', DietGoalListCreateView.as_view(), name='diet-goal-list'),
    path('diet-goals/<int:pk>/', DietGoalDetailView.as_view(), name='diet-goal-detail'),
]
