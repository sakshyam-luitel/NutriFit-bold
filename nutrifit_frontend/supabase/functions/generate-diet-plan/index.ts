import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface DietPlanRequest {
  userId: string;
  age: number;
  weight: number;
  height: number;
  sex: string;
  activityLevel: string;
  goalType: string;
  medicalConditions?: Array<{
    name: string;
    severity: string;
  }>;
  preferences?: {
    dietaryType?: string;
    allergies?: string[];
    dislikedFoods?: string[];
  };
}

interface Ingredient {
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: DietPlanRequest = await req.json();

    const bmr = calculateBMR(
      requestData.weight,
      requestData.height,
      requestData.age,
      requestData.sex
    );

    const activityMultiplier = getActivityMultiplier(requestData.activityLevel);
    const tdee = bmr * activityMultiplier;

    let calorieTarget = tdee;
    if (requestData.goalType === 'lose_weight') {
      calorieTarget = tdee - 500;
    } else if (requestData.goalType === 'gain_weight' || requestData.goalType === 'muscle_gain') {
      calorieTarget = tdee + 300;
    }

    const { data: allIngredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('*');

    if (ingredientsError) {
      throw new Error('Failed to fetch ingredients: ' + ingredientsError.message);
    }

    const filteredIngredients = filterIngredientsByPreferences(
      allIngredients as Ingredient[],
      requestData.preferences
    );

    const mealPlan = generateMealPlan(
      filteredIngredients,
      calorieTarget,
      requestData.goalType,
      requestData.medicalConditions
    );

    const aiDescription = generateAIDescription(
      requestData,
      calorieTarget,
      mealPlan
    );

    const totals = calculateTotals(mealPlan, filteredIngredients);

    const { data: insertedPlan, error: planError } = await supabase
      .from('diet_plans')
      .insert({
        user_id: requestData.userId,
        plan_name: `${requestData.goalType.replace('_', ' ')} Plan - ${new Date().toLocaleDateString()}`,
        ai_description: aiDescription,
        total_calories: Math.round(totals.calories),
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fat: totals.fat,
      })
      .select()
      .single();

    if (planError) {
      throw new Error('Failed to create diet plan: ' + planError.message);
    }

    const planItems = mealPlan.map((item, index) => ({
      diet_plan_id: insertedPlan.id,
      ingredient_id: item.ingredientId,
      quantity_grams: item.quantityGrams,
      meal_type: item.mealType,
      ai_description: item.aiDescription,
      order_index: index,
    }));

    const { error: itemsError } = await supabase
      .from('diet_plan_items')
      .insert(planItems);

    if (itemsError) {
      throw new Error('Failed to create diet plan items: ' + itemsError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        planId: insertedPlan.id,
        calorieTarget: Math.round(calorieTarget),
        message: 'Diet plan generated successfully',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating diet plan:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate diet plan',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function calculateBMR(weight: number, height: number, age: number, sex: string): number {
  if (sex === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

function getActivityMultiplier(activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return multipliers[activityLevel] || 1.55;
}

function filterIngredientsByPreferences(
  ingredients: Ingredient[],
  preferences?: DietPlanRequest['preferences']
): Ingredient[] {
  if (!preferences) return ingredients;

  return ingredients.filter((ingredient) => {
    if (preferences.dietaryType === 'vegetarian' && !ingredient.is_vegetarian) {
      return false;
    }
    if (preferences.dietaryType === 'vegan' && !ingredient.is_vegan) {
      return false;
    }
    if (preferences.allergies?.some((allergy) => ingredient.common_allergens.includes(allergy))) {
      return false;
    }
    if (preferences.dislikedFoods?.includes(ingredient.name.toLowerCase())) {
      return false;
    }
    return true;
  });
}

function generateMealPlan(
  ingredients: Ingredient[],
  calorieTarget: number,
  goalType: string,
  medicalConditions?: Array<{ name: string; severity: string }>
) {
  const mealPlan: Array<{
    ingredientId: string;
    quantityGrams: number;
    mealType: string;
    aiDescription: string;
  }> = [];

  const calorieDistribution = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.30,
    snack: 0.10,
  };

  const proteins = ingredients.filter((i) => i.category === 'protein');
  const vegetables = ingredients.filter((i) => i.category === 'vegetable');
  const grains = ingredients.filter((i) => i.category === 'grain');
  const fruits = ingredients.filter((i) => i.category === 'fruit');

  const hasDiabetes = medicalConditions?.some((c) => c.name.toLowerCase().includes('diabetes'));

  Object.entries(calorieDistribution).forEach(([mealType, ratio]) => {
    const mealCalories = calorieTarget * ratio;

    if (mealType === 'breakfast') {
      if (proteins.length > 0) {
        const protein = proteins[Math.floor(Math.random() * proteins.length)];
        const quantity = Math.round((mealCalories * 0.4) / protein.calories_per_100g * 100);
        mealPlan.push({
          ingredientId: protein.id,
          quantityGrams: quantity,
          mealType,
          aiDescription: `Start your day with ${quantity}g of ${protein.name}, providing essential protein for energy and muscle maintenance.`,
        });
      }

      if (!hasDiabetes && grains.length > 0) {
        const grain = grains[Math.floor(Math.random() * grains.length)];
        const quantity = Math.round((mealCalories * 0.35) / grain.calories_per_100g * 100);
        mealPlan.push({
          ingredientId: grain.id,
          quantityGrams: quantity,
          mealType,
          aiDescription: `${quantity}g of ${grain.name} provides complex carbohydrates for sustained energy throughout the morning.`,
        });
      }

      if (fruits.length > 0) {
        const fruit = fruits[Math.floor(Math.random() * fruits.length)];
        const quantity = Math.round((mealCalories * 0.25) / fruit.calories_per_100g * 100);
        mealPlan.push({
          ingredientId: fruit.id,
          quantityGrams: quantity,
          mealType,
          aiDescription: `${quantity}g of fresh ${fruit.name} adds natural sweetness and vital antioxidants.`,
        });
      }
    } else if (mealType === 'lunch' || mealType === 'dinner') {
      if (proteins.length > 0) {
        const protein = proteins[Math.floor(Math.random() * proteins.length)];
        const quantity = Math.round((mealCalories * 0.45) / protein.calories_per_100g * 100);
        mealPlan.push({
          ingredientId: protein.id,
          quantityGrams: quantity,
          mealType,
          aiDescription: `${quantity}g of ${protein.name}, a high-quality protein source essential for ${goalType.includes('muscle') ? 'muscle building' : 'maintaining lean mass'}.`,
        });
      }

      if (vegetables.length > 0) {
        const veg1 = vegetables[Math.floor(Math.random() * vegetables.length)];
        const quantity1 = Math.round((mealCalories * 0.25) / veg1.calories_per_100g * 100);
        mealPlan.push({
          ingredientId: veg1.id,
          quantityGrams: quantity1,
          mealType,
          aiDescription: `${quantity1}g of ${veg1.name}, rich in fiber and micronutrients to support digestive health.`,
        });

        if (vegetables.length > 1) {
          const veg2 = vegetables.filter((v) => v.id !== veg1.id)[Math.floor(Math.random() * (vegetables.length - 1))];
          const quantity2 = Math.round((mealCalories * 0.20) / veg2.calories_per_100g * 100);
          mealPlan.push({
            ingredientId: veg2.id,
            quantityGrams: quantity2,
            mealType,
            aiDescription: `${quantity2}g of ${veg2.name} adds variety and additional vitamins.`,
          });
        }
      }

      if (!hasDiabetes && grains.length > 0 && Math.random() > 0.3) {
        const grain = grains[Math.floor(Math.random() * grains.length)];
        const quantity = Math.round((mealCalories * 0.10) / grain.calories_per_100g * 100);
        mealPlan.push({
          ingredientId: grain.id,
          quantityGrams: quantity,
          mealType,
          aiDescription: `${quantity}g of ${grain.name} provides healthy carbohydrates for energy.`,
        });
      }
    } else if (mealType === 'snack') {
      const snackOptions = [...fruits, ...ingredients.filter((i) => i.category === 'nut')];
      if (snackOptions.length > 0) {
        const snack = snackOptions[Math.floor(Math.random() * snackOptions.length)];
        const quantity = Math.round(mealCalories / snack.calories_per_100g * 100);
        mealPlan.push({
          ingredientId: snack.id,
          quantityGrams: quantity,
          mealType,
          aiDescription: `${quantity}g of ${snack.name} as a nutritious snack to keep your metabolism active.`,
        });
      }
    }
  });

  return mealPlan;
}

function generateAIDescription(
  request: DietPlanRequest,
  calorieTarget: number,
  mealPlan: any[]
): string {
  const goalDescriptions: Record<string, string> = {
    lose_weight: 'achieve sustainable weight loss',
    gain_weight: 'support healthy weight gain',
    maintain: 'maintain your current healthy weight',
    muscle_gain: 'build lean muscle mass',
    health_management: 'support your overall health and wellness',
  };

  const medicalNote = request.medicalConditions && request.medicalConditions.length > 0
    ? ` This plan has been carefully crafted considering your ${request.medicalConditions[0].name}, with appropriate nutritional adjustments to support your health condition.`
    : '';

  const activityNote = request.activityLevel === 'very_active'
    ? ' Your high activity level has been accounted for with adequate caloric intake to fuel your workouts and recovery.'
    : request.activityLevel === 'sedentary'
    ? ' The caloric distribution has been optimized for a less active lifestyle.'
    : '';

  return `This personalized nutrition plan is designed specifically for you to ${goalDescriptions[request.goalType] || 'support your health goals'}. ` +
    `Based on your profile (${request.age} years old, ${request.weight}kg, ${request.height}cm, ${request.sex}), ` +
    `your daily caloric target is approximately ${Math.round(calorieTarget)} calories.${medicalNote}${activityNote} ` +
    `The plan includes ${mealPlan.length} carefully selected ingredients distributed across breakfast, lunch, dinner, and snacks. ` +
    `Each ingredient has been chosen not only for its nutritional value but also to create a balanced, satisfying meal plan that you can enjoy and sustain. ` +
    `Focus on consistent portion sizes and meal timing for optimal results.`;
}

function calculateTotals(mealPlan: any[], ingredients: Ingredient[]) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  mealPlan.forEach((item) => {
    const ingredient = ingredients.find((i) => i.id === item.ingredientId);
    if (ingredient) {
      const multiplier = item.quantityGrams / 100;
      totals.calories += ingredient.calories_per_100g * multiplier;
      totals.protein += ingredient.protein_per_100g * multiplier;
      totals.carbs += ingredient.carbs_per_100g * multiplier;
      totals.fat += ingredient.fat_per_100g * multiplier;
    }
  });

  return {
    calories: totals.calories,
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
  };
}
