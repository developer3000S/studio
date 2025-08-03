'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Mock user type. Can be expanded if needed.
interface MockUser {
  email: string;
  isDemo: boolean;
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mock user for the demo session
const demoUser: MockUser = {
    email: 'demo@example.com',
    isDemo: true,
};

const getInitialUser = (): MockUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const item = window.localStorage.getItem('user');
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn("Error reading user from localStorage", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(getInitialUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getInitialUser());
    setLoading(false);
  }, []);

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem('user', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('user');
      }
    } catch (error) {
      console.warn('Error saving user to localStorage', error);
    }
  }, [user]);


  // All auth functions are now simple async functions that set a mock user
  const login = async (email: string, pass: string) => {
    setLoading(true);
    // Simulate a network delay
    await new Promise(res => setTimeout(res, 500));
    setUser({ email, isDemo: false });
    setLoading(false);
  }

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    // Simulate a network delay
    await new Promise(res => setTimeout(res, 500));
    setUser({ email, isDemo: false });
    setLoading(false);
  }
  
  const demoLogin = async () => {
    setLoading(true);
    // Simulate a network delay
    await new Promise(res => setTimeout(res, 500));
    setUser(demoUser);
    setLoading(false);
  }

  const logout = async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 500));
    setUser(null);
    setLoading(false);
  };
  
  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    demoLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
