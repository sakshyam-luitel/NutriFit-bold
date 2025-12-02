import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, profileAPI } from '../lib/api';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

  const signUp = async (email: string, password: string) => {
    const response = await authAPI.register(email, password);

    // Store tokens
    localStorage.setItem('access_token', response.tokens.access);
    localStorage.setItem('refresh_token', response.tokens.refresh);

    // Set user
    setUser(response.user);
  };

  const signIn = async (email: string, password: string) => {
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
