import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DietPlan, DietPlanItem } from '../types';
import { ArrowLeft, Star, Printer, Download } from 'lucide-react';

interface DietPlanViewProps {
  planId: string;
  onBack: () => void;
}

export function DietPlanView({ planId, onBack }: DietPlanViewProps) {
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [items, setItems] = useState<DietPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      const { data: planData } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('id', planId)
        .single();

      setPlan(planData);

      const { data: itemsData } = await supabase
        .from('diet_plan_items')
        .select(`
          *,
          ingredient:ingredients(*)
        `)
        .eq('diet_plan_id', planId)
        .order('meal_type')
        .order('order_index');

      setItems(itemsData || []);
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!plan) return;

    const { error } = await supabase
      .from('diet_plans')
      .update({ is_favorite: !plan.is_favorite })
      .eq('id', planId);

    if (!error) {
      setPlan({ ...plan, is_favorite: !plan.is_favorite });
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.meal_type]) {
      acc[item.meal_type] = [];
    }
    acc[item.meal_type].push(item);
    return acc;
  }, {} as Record<string, DietPlanItem[]>);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealEmojis = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Plan not found</p>
          <button onClick={onBack} className="mt-4 text-emerald-600 hover:text-emerald-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg transition ${
                plan.is_favorite
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  : 'bg-white text-gray-400 hover:text-yellow-600'
              }`}
            >
              <Star className="w-5 h-5" fill={plan.is_favorite ? 'currentColor' : 'none'} />
            </button>
            <button className="p-2 bg-white text-gray-600 hover:text-gray-900 rounded-lg transition">
              <Printer className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white text-gray-600 hover:text-gray-900 rounded-lg transition">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-12 text-white">
            <h1 className="text-3xl font-bold mb-4">{plan.plan_name}</h1>
            <p className="text-emerald-50 text-lg leading-relaxed max-w-4xl">
              {plan.ai_description}
            </p>
            <div className="mt-6 pt-6 border-t border-emerald-400/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-emerald-200 text-sm mb-1">Total Calories</p>
                  <p className="text-3xl font-bold">{plan.total_calories}</p>
                  <p className="text-emerald-200 text-xs">kcal</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm mb-1">Protein</p>
                  <p className="text-3xl font-bold">{plan.total_protein}g</p>
                  <p className="text-emerald-200 text-xs">
                    {Math.round((plan.total_protein * 4 / plan.total_calories) * 100)}% of calories
                  </p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm mb-1">Carbohydrates</p>
                  <p className="text-3xl font-bold">{plan.total_carbs}g</p>
                  <p className="text-emerald-200 text-xs">
                    {Math.round((plan.total_carbs * 4 / plan.total_calories) * 100)}% of calories
                  </p>
                </div>
                <div>
                  <p className="text-emerald-200 text-sm mb-1">Fat</p>
                  <p className="text-3xl font-bold">{plan.total_fat}g</p>
                  <p className="text-emerald-200 text-xs">
                    {Math.round((plan.total_fat * 9 / plan.total_calories) * 100)}% of calories
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-12">
              {mealTypes.map(mealType => {
                const mealItems = groupedItems[mealType];
                if (!mealItems || mealItems.length === 0) return null;

                const mealTotals = mealItems.reduce(
                  (acc, item) => {
                    const ingredient = item.ingredient as any;
                    const multiplier = item.quantity_grams / 100;
                    return {
                      calories: acc.calories + ingredient.calories_per_100g * multiplier,
                      protein: acc.protein + ingredient.protein_per_100g * multiplier,
                      carbs: acc.carbs + ingredient.carbs_per_100g * multiplier,
                      fat: acc.fat + ingredient.fat_per_100g * multiplier,
                    };
                  },
                  { calories: 0, protein: 0, carbs: 0, fat: 0 }
                );

                return (
                  <div key={mealType} className="border-b border-gray-200 last:border-0 pb-12 last:pb-0">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{mealEmojis[mealType as keyof typeof mealEmojis]}</span>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 capitalize">{mealType}</h2>
                          <p className="text-sm text-gray-600">
                            {Math.round(mealTotals.calories)} kcal • {Math.round(mealTotals.protein)}g protein • {Math.round(mealTotals.carbs)}g carbs • {Math.round(mealTotals.fat)}g fat
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {mealItems.map(item => {
                        const ingredient = item.ingredient as any;
                        return (
                          <div
                            key={item.id}
                            className="bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
                          >
                            <div className="aspect-video relative overflow-hidden bg-gray-200">
                              <img
                                src={ingredient.image_url}
                                alt={ingredient.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
                                }}
                              />
                              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
                                <span className="font-bold text-gray-900">{item.quantity_grams}g</span>
                              </div>
                            </div>
                            <div className="p-5">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{ingredient.name}</h3>
                              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                                {item.ai_description}
                              </p>
                              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-200">
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 mb-1">Calories</p>
                                  <p className="font-bold text-gray-900 text-sm">
                                    {Math.round((ingredient.calories_per_100g * item.quantity_grams) / 100)}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 mb-1">Protein</p>
                                  <p className="font-bold text-gray-900 text-sm">
                                    {Math.round((ingredient.protein_per_100g * item.quantity_grams) / 100)}g
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 mb-1">Carbs</p>
                                  <p className="font-bold text-gray-900 text-sm">
                                    {Math.round((ingredient.carbs_per_100g * item.quantity_grams) / 100)}g
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-600 mb-1">Fat</p>
                                  <p className="font-bold text-gray-900 text-sm">
                                    {Math.round((ingredient.fat_per_100g * item.quantity_grams) / 100)}g
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Shopping List</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => {
              const ingredient = item.ingredient as any;
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={ingredient.image_url}
                      alt={ingredient.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{ingredient.name}</p>
                    <p className="text-xs text-gray-600">{item.quantity_grams}g</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
