import { useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MessageSquare, Sparkles } from 'lucide-react';

interface NaturalLanguageInputProps {
  profile: UserProfile;
  onPlanCreated: (planId: string) => void;
  onBack: () => void;
}

export function NaturalLanguageInput({ profile, onPlanCreated, onBack }: NaturalLanguageInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);

  const handleParse = async () => {
    if (!input.trim()) return;

    setError('');
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-natural-language`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input, userId: profile.id }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to parse input');
      }

      setParsedData(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to parse your input');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setError('');
    setLoading(true);

    try {
      const requestData = {
        userId: profile.id,
        age: parsedData.age || profile.age,
        weight: parsedData.weight || profile.weight,
        height: parsedData.height || profile.height,
        sex: parsedData.sex || profile.sex,
        activityLevel: parsedData.activityLevel || profile.activity_level,
        goalType: parsedData.goalType,
        medicalConditions: parsedData.medicalConditions || [],
        preferences: parsedData.preferences || {},
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-diet-plan`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate diet plan');
      }

      onPlanCreated(result.planId);
    } catch (err: any) {
      setError(err.message || 'Failed to generate diet plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Natural Language Input</h2>
              <p className="text-gray-600">Describe your needs in plain English</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Examples:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 mt-1">•</span>
                  <span>"I'm a 30 year old male, 75kg, 180cm, want to lose weight, I have diabetes"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 mt-1">•</span>
                  <span>"Female, 25yo, 60kg, vegetarian, want to gain muscle, exercise 5 times a week"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 mt-1">•</span>
                  <span>"I'm 40, hypertension, sedentary lifestyle, want to maintain weight, allergic to nuts"</span>
                </li>
              </ul>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your goals, health status, and preferences..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />

            <button
              onClick={handleParse}
              disabled={loading || !input.trim()}
              className="mt-4 w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading && !parsedData ? 'Analyzing...' : 'Analyze Input'}
            </button>
          </div>

          {parsedData && (
            <div className="space-y-6 mb-8">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-600" />
                  Understood Information
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {parsedData.age && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-semibold text-gray-900">{parsedData.age} years</p>
                    </div>
                  )}
                  {parsedData.weight && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-semibold text-gray-900">{parsedData.weight} kg</p>
                    </div>
                  )}
                  {parsedData.height && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Height</p>
                      <p className="font-semibold text-gray-900">{parsedData.height} cm</p>
                    </div>
                  )}
                  {parsedData.sex && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Sex</p>
                      <p className="font-semibold text-gray-900 capitalize">{parsedData.sex}</p>
                    </div>
                  )}
                  {parsedData.activityLevel && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Activity Level</p>
                      <p className="font-semibold text-gray-900 capitalize">{parsedData.activityLevel.replace('_', ' ')}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Goal</p>
                    <p className="font-semibold text-gray-900 capitalize">{parsedData.goalType.replace('_', ' ')}</p>
                  </div>
                </div>

                {parsedData.medicalConditions && parsedData.medicalConditions.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Medical Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.medicalConditions.map((condition: any, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {condition.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {parsedData.preferences && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Dietary Preferences</p>
                    <div className="space-y-1">
                      {parsedData.preferences.dietaryType && (
                        <p className="text-sm">
                          <span className="text-gray-600">Type: </span>
                          <span className="font-medium text-gray-900 capitalize">{parsedData.preferences.dietaryType}</span>
                        </p>
                      )}
                      {parsedData.preferences.allergies && parsedData.preferences.allergies.length > 0 && (
                        <p className="text-sm">
                          <span className="text-gray-600">Allergies: </span>
                          <span className="font-medium text-gray-900">{parsedData.preferences.allergies.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-yellow-800">
                    Missing information will be filled from your profile. You can edit your profile later.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Your Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Diet Plan
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
