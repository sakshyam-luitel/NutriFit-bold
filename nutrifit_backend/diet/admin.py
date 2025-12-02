from django.contrib import admin
from .models import Ingredient, DietPlan, DietPlanItem


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'calories_per_100g', 'protein_per_100g', 
                    'is_vegetarian', 'is_vegan')
    list_filter = ('category', 'is_vegetarian', 'is_vegan')
    search_fields = ('name',)


class DietPlanItemInline(admin.TabularInline):
    model = DietPlanItem
    extra = 0
    readonly_fields = ('calories', 'protein', 'carbs', 'fat')


@admin.register(DietPlan)
class DietPlanAdmin(admin.ModelAdmin):
    list_display = ('plan_name', 'user', 'total_calories', 'is_favorite', 'created_at')
    list_filter = ('is_favorite', 'created_at')
    search_fields = ('plan_name', 'user__email')
    inlines = [DietPlanItemInline]


@admin.register(DietPlanItem)
class DietPlanItemAdmin(admin.ModelAdmin):
    list_display = ('diet_plan', 'ingredient', 'quantity_grams', 'meal_type', 'order_index')
    list_filter = ('meal_type',)
    search_fields = ('diet_plan__plan_name', 'ingredient__name')
