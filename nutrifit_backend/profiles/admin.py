from django.contrib import admin
from .models import UserProfile, MedicalCondition, UserPreferences, DietGoal


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'age', 'weight', 'height', 'sex', 'activity_level', 'bmi')
    list_filter = ('sex', 'activity_level')
    search_fields = ('user__email',)
    readonly_fields = ('created_at', 'updated_at', 'bmi')


@admin.register(MedicalCondition)
class MedicalConditionAdmin(admin.ModelAdmin):
    list_display = ('user', 'condition_name', 'severity', 'created_at')
    list_filter = ('severity', 'condition_name')
    search_fields = ('user__email', 'condition_name')


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ('user', 'dietary_type', 'updated_at')
    list_filter = ('dietary_type',)
    search_fields = ('user__email',)


@admin.register(DietGoal)
class DietGoalAdmin(admin.ModelAdmin):
    list_display = ('user', 'goal_type', 'calorie_target', 'is_active', 'created_at')
    list_filter = ('goal_type', 'is_active')
    search_fields = ('user__email',)
