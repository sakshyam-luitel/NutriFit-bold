import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI, medicalConditionsAPI, preferencesAPI, dietGoalsAPI } from '../lib/api';
import { ArrowRight, Activity, Target, AlertCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    sex: 'male' as 'male' | 'female' | 'other',
    activityLevel: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    goalType: 'maintain' as 'lose_weight' | 'gain_weight' | 'maintain' | 'muscle_gain' | 'health_management',
    medicalConditions: [] as string[],
    dietaryType: 'none' as 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean' | 'none',
    allergies: [] as string[],
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'medicalConditions' | 'allergies', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Create profile
      await profileAPI.createProfile({
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        sex: formData.sex,
        activity_level: formData.activityLevel,
      });

      // Create medical conditions
      for (const condition of formData.medicalConditions) {
        await medicalConditionsAPI.create({
          condition_name: condition,
          severity: 'moderate',
        });
      }

      // Create preferences
      await preferencesAPI.update({
        dietary_type: formData.dietaryType,
        allergies: formData.allergies,
      });

      // Create diet goal
      await dietGoalsAPI.create({
        goal_type: formData.goalType,
        calorie_target: 2000,
        is_active: true,
      });

      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const medicalConditionOptions = [
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'High Cholesterol',
    'Thyroid Condition',
    'Kidney Disease',
  ];

  const allergyOptions = [
    'tree nuts',
    'dairy',
    'eggs',
    'gluten',
    'shellfish',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
              <span className="text-sm text-gray-500">Step {step} of 3</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition ${s <= step ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="25"
                    min="1"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sex
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => updateField('sex', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => updateField('weight', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="70"
                    step="0.1"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateField('height', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="175"
                    step="0.1"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Level
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
                    { value: 'light', label: 'Light (exercise 1-2 days/week)' },
                    { value: 'moderate', label: 'Moderate (exercise 3-4 days/week)' },
                    { value: 'active', label: 'Active (exercise 5-6 days/week)' },
                    { value: 'very_active', label: 'Very Active (intense daily exercise)' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="activityLevel"
                        value={option.value}
                        checked={formData.activityLevel === option.value}
                        onChange={(e) => updateField('activityLevel', e.target.value)}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Goals & Health</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your primary goal?
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'lose_weight', label: 'Lose Weight', emoji: '📉' },
                    { value: 'gain_weight', label: 'Gain Weight', emoji: '📈' },
                    { value: 'maintain', label: 'Maintain Weight', emoji: '⚖️' },
                    { value: 'muscle_gain', label: 'Build Muscle', emoji: '💪' },
                    { value: 'health_management', label: 'Health Management', emoji: '❤️' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-500 transition">
                      <input
                        type="radio"
                        name="goalType"
                        value={option.value}
                        checked={formData.goalType === option.value}
                        onChange={(e) => updateField('goalType', e.target.value)}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions (optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {medicalConditionOptions.map(condition => (
                    <label key={condition} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="checkbox"
                        checked={formData.medicalConditions.includes(condition)}
                        onChange={() => toggleArrayField('medicalConditions', condition)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Dietary Preferences</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Type
                </label>
                <select
                  value={formData.dietaryType}
                  onChange={(e) => updateField('dietaryType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="none">No Restrictions</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                  <option value="mediterranean">Mediterranean</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies (optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {allergyOptions.map(allergy => (
                    <label key={allergy} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="checkbox"
                        checked={formData.allergies.includes(allergy)}
                        onChange={() => toggleArrayField('allergies', allergy)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!formData.age || !formData.weight || !formData.height))
                }
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
