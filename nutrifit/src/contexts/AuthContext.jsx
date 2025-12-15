import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, profileAPI } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Try to get current user profile
        const profile = await profileAPI.getProfile();
        setUser({
          id: profile.user,
          email: profile.email,
        });
      }
    } catch (error) {
      // Token invalid or expired, clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    const response = await authAPI.register(email, password);

    // Store tokens
    localStorage.setItem('access_token', response.tokens.access);
    localStorage.setItem('refresh_token', response.tokens.refresh);

    // Set user
    setUser(response.user);
  };

  const signIn = async (email, password) => {
    const response = await authAPI.login(email, password);

    // Store tokens
    localStorage.setItem('access_token', response.tokens.access);
    localStorage.setItem('refresh_token', response.tokens.refresh);

    // Set user
    setUser(response.user);
  };

  const signOut = async () => {
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Clear user
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
