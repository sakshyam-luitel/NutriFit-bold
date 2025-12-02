import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { profileAPI } from './lib/api';

function AppContent() {
  const { user, loading } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      checkProfile();
    } else {
      setHasProfile(null);
    }
  }, [user]);

  const checkProfile = async () => {
    try {
      await profileAPI.getProfile();
      setHasProfile(true);
    } catch (error) {
      setHasProfile(false);
    }
  };

  if (loading || (user && hasProfile === null)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!hasProfile) {
    return <Onboarding onComplete={() => setHasProfile(true)} />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
