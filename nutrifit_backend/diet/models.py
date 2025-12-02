from django.db import models
from django.conf import settings


class Ingredient(models.Model):
    """Food ingredients with nutritional information."""
    
    CATEGORY_CHOICES = [
        ('protein', 'Protein'),
        ('carbs', 'Carbohydrates'),
        ('vegetables', 'Vegetables'),
        ('fruits', 'Fruits'),
        ('dairy', 'Dairy'),
        ('fats', 'Fats & Oils'),
        ('grains', 'Grains'),
        ('nuts', 'Nuts & Seeds'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=200, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    calories_per_100g = models.DecimalField(max_digits=6, decimal_places=2)
    protein_per_100g = models.DecimalField(max_digits=5, decimal_places=2)
    carbs_per_100g = models.DecimalField(max_digits=5, decimal_places=2)
    fat_per_100g = models.DecimalField(max_digits=5, decimal_places=2)
    fiber_per_100g = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    image_url = models.URLField(blank=True)
    is_vegetarian = models.BooleanField(default=True)
    is_vegan = models.BooleanField(default=False)
    common_allergens = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ingredients'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class DietPlan(models.Model):
    """AI-generated diet plans for users."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='diet_plans'
    )
    goal = models.ForeignKey(
        'profiles.DietGoal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='diet_plans'
    )
    plan_name = models.CharField(max_length=200)
    ai_description = models.TextField(help_text='AI-generated description of the plan')
    total_calories = models.PositiveIntegerField()
    total_protein = models.DecimalField(max_digits=6, decimal_places=2)
    total_carbs = models.DecimalField(max_digits=6, decimal_places=2)
    total_fat = models.DecimalField(max_digits=6, decimal_places=2)
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'diet_plans'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.plan_name} - {self.user.email}"


class DietPlanItem(models.Model):
    """Individual meals/items in a diet plan."""
    
    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]
    
    diet_plan = models.ForeignKey(
        DietPlan,
        on_delete=models.CASCADE,
        related_name='items'
    )
    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name='diet_plan_items'
    )
    quantity_grams = models.DecimalField(max_digits=6, decimal_places=2)
    meal_type = models.CharField(max_length=10, choices=MEAL_TYPE_CHOICES)
    ai_description = models.TextField(help_text='AI-generated meal description')
    preparation_notes = models.TextField(blank=True)
    order_index = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'diet_plan_items'
        ordering = ['meal_type', 'order_index']
    
    def __str__(self):
        return f"{self.ingredient.name} - {self.meal_type}"
    
    @property
    def calories(self):
        """Calculate calories for this item."""
        multiplier = float(self.quantity_grams) / 100
        return float(self.ingredient.calories_per_100g) * multiplier
    
    @property
    def protein(self):
        """Calculate protein for this item."""
        multiplier = float(self.quantity_grams) / 100
        return float(self.ingredient.protein_per_100g) * multiplier
    
    @property
    def carbs(self):
        """Calculate carbs for this item."""
        multiplier = float(self.quantity_grams) / 100
        return float(self.ingredient.carbs_per_100g) * multiplier
    
    @property
    def fat(self):
        """Calculate fat for this item."""
        multiplier = float(self.quantity_grams) / 100
        return float(self.ingredient.fat_per_100g) * multiplier
