from django.db import models
from django.conf import settings


class UserProfile(models.Model):
    """User profile with health and physical information."""
    
    SEX_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    ACTIVITY_LEVEL_CHOICES = [
        ('sedentary', 'Sedentary'),
        ('light', 'Light'),
        ('moderate', 'Moderate'),
        ('active', 'Active'),
        ('very_active', 'Very Active'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
        primary_key=True
    )
    age = models.PositiveIntegerField()
    weight = models.DecimalField(max_digits=5, decimal_places=2, help_text='Weight in kg')
    height = models.DecimalField(max_digits=5, decimal_places=2, help_text='Height in cm')
    sex = models.CharField(max_length=10, choices=SEX_CHOICES)
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVEL_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
    
    def __str__(self):
        return f"Profile for {self.user.email}"
    
    @property
    def bmi(self):
        """Calculate BMI (Body Mass Index)."""
        height_m = float(self.height) / 100
        return float(self.weight) / (height_m ** 2)


class MedicalCondition(models.Model):
    """Medical conditions affecting dietary needs."""
    
    SEVERITY_CHOICES = [
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='medical_conditions'
    )
    condition_name = models.CharField(max_length=100)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='moderate')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'medical_conditions'
        unique_together = ['user', 'condition_name']
    
    def __str__(self):
        return f"{self.condition_name} ({self.user.email})"


class UserPreferences(models.Model):
    """User dietary preferences and restrictions."""
    
    DIETARY_TYPE_CHOICES = [
        ('none', 'No Restrictions'),
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
        ('keto', 'Keto'),
        ('paleo', 'Paleo'),
        ('mediterranean', 'Mediterranean'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='preferences',
        primary_key=True
    )
    dietary_type = models.CharField(
        max_length=20,
        choices=DIETARY_TYPE_CHOICES,
        default='none'
    )
    allergies = models.JSONField(default=list, blank=True)
    disliked_foods = models.JSONField(default=list, blank=True)
    preferred_cuisines = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_preferences'
    
    def __str__(self):
        return f"Preferences for {self.user.email}"


class DietGoal(models.Model):
    """User's diet and fitness goals."""
    
    GOAL_TYPE_CHOICES = [
        ('lose_weight', 'Lose Weight'),
        ('gain_weight', 'Gain Weight'),
        ('maintain', 'Maintain Weight'),
        ('muscle_gain', 'Muscle Gain'),
        ('health_management', 'Health Management'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='diet_goals'
    )
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES)
    target_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Target weight in kg'
    )
    target_date = models.DateField(null=True, blank=True)
    calorie_target = models.PositiveIntegerField(help_text='Daily calorie target')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'diet_goals'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_goal_type_display()} - {self.user.email}"
