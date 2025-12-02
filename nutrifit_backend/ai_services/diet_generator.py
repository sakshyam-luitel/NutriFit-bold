"""
AI-powered Diet Plan Generator using Google Gemini.
"""

from .gemini_service import GeminiService
from diet.models import DietPlan, DietPlanItem, Ingredient
from profiles.models import DietGoal
from django.db import transaction
import json


class DietPlanGenerator:
    """Generate personalized diet plans using AI."""
    
    def __init__(self, user):
        self.user = user
        self.gemini = GeminiService()
    
    def generate_plan(self, params):
        """
        Generate a complete diet plan based on user parameters.
        
        Args:
            params (dict): Parameters for plan generation including:
                - goalType: Type of diet goal
                - age, weight, height, sex, activityLevel: User metrics
                - medicalConditions: List of medical conditions
                - preferences: Dietary preferences and restrictions
                
        Returns:
            DietPlan: The generated diet plan object
        """
        
        # Get user profile and preferences
        profile_data = self._get_user_context(params)
        
        # Calculate nutritional targets
        targets = self._calculate_targets(profile_data)
        
        # Generate meal plan using AI
        meal_plan = self._generate_meals_with_ai(profile_data, targets)
        
        # Create diet plan in database
        diet_plan = self._create_diet_plan(meal_plan, targets)
        
        return diet_plan
    
    def _get_user_context(self, params):
        """Gather user context from profile and parameters."""
        
        context = {
            'age': params.get('age'),
            'weight': params.get('weight'),
            'height': params.get('height'),
            'sex': params.get('sex'),
            'activity_level': params.get('activityLevel'),
            'goal_type': params.get('goalType'),
            'medical_conditions': params.get('medicalConditions', []),
            'preferences': params.get('preferences', {}),
        }
        
        # Fill from user profile if not provided
        try:
            profile = self.user.profile
            context['age'] = context['age'] or profile.age
            context['weight'] = context['weight'] or float(profile.weight)
            context['height'] = context['height'] or float(profile.height)
            context['sex'] = context['sex'] or profile.sex
            context['activity_level'] = context['activity_level'] or profile.activity_level
        except:
            pass
        
        # Get medical conditions
        if not context['medical_conditions']:
            conditions = self.user.medical_conditions.all()
            context['medical_conditions'] = [
                {'name': c.condition_name, 'severity': c.severity}
                for c in conditions
            ]
        
        # Get preferences
        try:
            prefs = self.user.preferences
            if not context['preferences'].get('dietaryType'):
                context['preferences']['dietaryType'] = prefs.dietary_type
            if not context['preferences'].get('allergies'):
                context['preferences']['allergies'] = prefs.allergies
        except:
            pass
        
        return context
    
    def _calculate_targets(self, profile_data):
        """Calculate calorie and macro targets using Harris-Benedict equation."""
        
        age = profile_data['age']
        weight = profile_data['weight']
        height = profile_data['height']
        sex = profile_data['sex']
        activity_level = profile_data['activity_level']
        goal_type = profile_data['goal_type']
        
        # Calculate BMR (Basal Metabolic Rate)
        if sex == 'male':
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        
        # Activity multipliers
        activity_multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9,
        }
        
        tdee = bmr * activity_multipliers.get(activity_level, 1.55)
        
        # Adjust for goal
        if goal_type == 'lose_weight':
            calories = tdee - 500  # 500 calorie deficit
            protein_ratio = 0.30
            carbs_ratio = 0.35
            fat_ratio = 0.35
        elif goal_type == 'gain_weight' or goal_type == 'muscle_gain':
            calories = tdee + 300  # 300 calorie surplus
            protein_ratio = 0.30
            carbs_ratio = 0.45
            fat_ratio = 0.25
        else:  # maintain or health_management
            calories = tdee
            protein_ratio = 0.25
            carbs_ratio = 0.45
            fat_ratio = 0.30
        
        return {
            'calories': int(calories),
            'protein': int((calories * protein_ratio) / 4),  # 4 cal per gram
            'carbs': int((calories * carbs_ratio) / 4),
            'fat': int((calories * fat_ratio) / 9),  # 9 cal per gram
        }
    
    def _generate_meals_with_ai(self, profile_data, targets):
        """Use Gemini AI to generate meal plan."""
        
        # Get available ingredients
        ingredients = Ingredient.objects.all()
        
        # Filter based on dietary preferences
        dietary_type = profile_data['preferences'].get('dietaryType', 'none')
        if dietary_type == 'vegetarian':
            ingredients = ingredients.filter(is_vegetarian=True)
        elif dietary_type == 'vegan':
            ingredients = ingredients.filter(is_vegan=True)
        
        # Filter out allergens
        allergies = profile_data['preferences'].get('allergies', [])
        for allergy in allergies:
            ingredients = ingredients.exclude(common_allergens__contains=allergy)
        
        # Create ingredient list for AI
        ingredient_list = []
        for ing in ingredients[:100]:  # Limit to 100 ingredients for prompt size
            ingredient_list.append({
                'id': ing.id,
                'name': ing.name,
                'category': ing.category,
                'calories_per_100g': float(ing.calories_per_100g),
                'protein_per_100g': float(ing.protein_per_100g),
                'carbs_per_100g': float(ing.carbs_per_100g),
                'fat_per_100g': float(ing.fat_per_100g),
            })
        
        prompt = f"""
You are a professional nutritionist AI. Create a personalized daily meal plan.

User Profile:
- Age: {profile_data['age']}
- Weight: {profile_data['weight']} kg
- Height: {profile_data['height']} cm
- Sex: {profile_data['sex']}
- Activity Level: {profile_data['activity_level']}
- Goal: {profile_data['goal_type']}
- Medical Conditions: {json.dumps(profile_data['medical_conditions'])}
- Dietary Type: {dietary_type}
- Allergies: {json.dumps(allergies)}

Nutritional Targets:
- Calories: {targets['calories']} kcal
- Protein: {targets['protein']}g
- Carbs: {targets['carbs']}g
- Fat: {targets['fat']}g

Available Ingredients (first 100):
{json.dumps(ingredient_list, indent=2)}

Create a meal plan with breakfast, lunch, dinner, and 1-2 snacks. Return ONLY a JSON object:
{{
    "plan_name": "<creative plan name>",
    "description": "<personalized description explaining why this plan suits the user>",
    "meals": [
        {{
            "meal_type": "breakfast",
            "ingredient_id": <id from list>,
            "quantity_grams": <amount in grams>,
            "description": "<why this food is good for this meal>",
            "order_index": 0
        }},
        ...
    ]
}}

Rules:
1. Use ONLY ingredient IDs from the provided list
2. Total calories should be within 50 kcal of target
3. Distribute meals appropriately (breakfast 25%, lunch 35%, dinner 30%, snacks 10%)
4. Consider medical conditions (e.g., low sodium for hypertension, low sugar for diabetes)
5. Ensure variety in ingredients
6. Return ONLY valid JSON
"""
        
        try:
            meal_plan = self.gemini.parse_json_response(prompt)
            return meal_plan
        except Exception as e:
            raise Exception(f"Failed to generate meal plan: {str(e)}")
    
    @transaction.atomic
    def _create_diet_plan(self, meal_plan, targets):
        """Create DietPlan and DietPlanItems in database."""
        
        # Create the diet plan
        diet_plan = DietPlan.objects.create(
            user=self.user,
            plan_name=meal_plan['plan_name'],
            ai_description=meal_plan['description'],
            total_calories=targets['calories'],
            total_protein=targets['protein'],
            total_carbs=targets['carbs'],
            total_fat=targets['fat'],
        )
        
        # Create diet plan items
        for meal in meal_plan['meals']:
            ingredient = Ingredient.objects.get(id=meal['ingredient_id'])
            
            DietPlanItem.objects.create(
                diet_plan=diet_plan,
                ingredient=ingredient,
                quantity_grams=meal['quantity_grams'],
                meal_type=meal['meal_type'],
                ai_description=meal['description'],
                order_index=meal.get('order_index', 0),
            )
        
        return diet_plan
