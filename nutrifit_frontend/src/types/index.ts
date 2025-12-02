export interface UserProfile {
  id: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  sex: 'male' | 'female' | 'other';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  created_at: string;
  updated_at: string;
}

export interface MedicalCondition {
  id: string;
  user_id: string;
  condition_name: string;
  severity: 'mild' | 'moderate' | 'severe';
  dietary_restrictions: Record<string, any>;
  created_at: string;
}

export interface DietGoal {
  id: string;
  user_id: string;
  goal_type: 'lose_weight' | 'gain_weight' | 'maintain' | 'muscle_gain' | 'health_management';
  target_weight?: number;
  target_date?: string;
  calorie_target: number;
  is_active: boolean;
  created_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  image_url: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  common_allergens: string[];
}

export interface DietPlan {
  id: string;
  user_id: string;
  goal_id?: string;
  plan_name: string;
  ai_description: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  is_favorite: boolean;
  created_at: string;
}

export interface DietPlanItem {
  id: string;
  diet_plan_id: string;
  ingredient_id: string;
  quantity_grams: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ai_description: string;
  preparation_notes?: string;
  order_index: number;
  ingredient?: Ingredient;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  dietary_type?: 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean' | 'none';
  allergies: string[];
  disliked_foods: string[];
  preferred_cuisines: string[];
  updated_at: string;
}
