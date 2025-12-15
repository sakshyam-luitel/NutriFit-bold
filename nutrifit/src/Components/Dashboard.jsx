import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI, dietPlansAPI } from '../lib/api';
import { LogOut, PlusCircle, BookOpen, MessageSquare } from 'lucide-react';
import { DietPlanGenerator } from './DietPlanGenerator';
import { DietPlanView } from './DietPlanView';
import { NaturalLanguageInput } from './NaturalLanguageInput';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [view, setView] = useState('home'); // 'home' | 'generate' | 'view' | 'nl-input'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const profileData = await profileAPI.getProfile();
      setProfile(profileData || null);

      const plansData = await dietPlansAPI.list();
      const plansList = Array.isArray(plansData)
        ? plansData
        : plansData?.results || [];

      setDietPlans(plansList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanCreated = (planId) => {
    loadData();
    setSelectedPlan(planId);
    setView('view');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (view === 'generate') {
    return (
      <DietPlanGenerator
        profile={profile}
        onPlanCreated={handlePlanCreated}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'view' && selectedPlan) {
    return (
      <DietPlanView
        planId={selectedPlan}
        onBack={() => {
          setView('home');
          setSelectedPlan(null);
        }}
      />
    );
  }

  if (view === 'nl-input') {
    return (
      <NaturalLanguageInput
        profile={profile}
        onPlanCreated={handlePlanCreated}
        onBack={() => setView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">NutriPlan AI</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {profile?.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => setView('generate')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                <PlusCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Generate New Plan
                </h3>
                <p className="text-gray-600">
                  Create a personalized diet plan using our advanced form-based generator
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setView('nl-input')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Natural Language Input
                </h3>
                <p className="text-gray-600">
                  Describe your needs in plain English and let AI create your plan
                </p>
              </div>
            </div>
          </button>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Your Diet Plans
            </h2>
          </div>

          {dietPlans.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No plans yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first personalized diet plan
              </p>
              <button
                onClick={() => setView('generate')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition shadow-lg"
              >
                <PlusCircle className="w-5 h-5" />
                Create Your First Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dietPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setView('view');
                  }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition">
                      {plan.plan_name}
                    </h3>
                    {plan.is_favorite && <span className="text-xl">⭐</span>}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Calories:</span>
                      <span className="font-semibold text-gray-900">
                        {plan.total_calories} kcal
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Protein:</span>
                      <span className="font-semibold text-gray-900">
                        {plan.total_protein}g
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Carbs:</span>
                      <span className="font-semibold text-gray-900">
                        {plan.total_carbs}g
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fat:</span>
                      <span className="font-semibold text-gray-900">
                        {plan.total_fat}g
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {plan.ai_description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {new Date(plan.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
