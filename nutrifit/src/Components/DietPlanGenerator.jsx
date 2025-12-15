import { useState } from 'react';
import { dietPlansAPI } from '../lib/api';

export function DietPlanGenerator({ profile, onPlanCreated, onBack }) {
  const [name, setName] = useState('My AI Plan');
  const [goal, setGoal] = useState('maintain'); // lose_weight | gain_weight | maintain
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        plan_name: name,
        ai_description: `Plan for ${profile.email}`,
        // backend computes totals
      };

      const result = await dietPlansAPI.generate(payload);
      onPlanCreated(result.id?.toString());
    } catch (err) {
      console.error('Failed to create plan', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={onBack}
          className="text-emerald-600 mb-4"
        >
          Back
        </button>

        <h2 className="text-2xl font-bold mb-4">Generate Diet Plan</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Plan name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            >
              <option value="lose_weight">Lose weight</option>
              <option value="gain_weight">Gain weight</option>
              <option value="maintain">Maintain</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              {loading ? 'Creating...' : 'Create Plan'}
            </button>

            <button
              onClick={onBack}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
