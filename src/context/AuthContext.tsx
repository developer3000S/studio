'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  // Set loading to false initially as we don't need to wait for Firebase
  const [loading, setLoading] = useState(false);

  // All auth functions are now simple async functions that set a mock user
  const login = async (email: string, pass: string) => {
    setLoading(true);
    console.log(`Attempting login for ${email}`);
    // Simulate a network delay
    await new Promise(res => setTimeout(res, 500));
    setUser({ email, isDemo: false });
    setLoading(false);
  }

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    console.log(`Attempting signup for ${email}`);
    // Simulate a network delay
    await new Promise(res => setTimeout(res, 500));
    setUser({ email, isDemo: false });
    setLoading(false);
  }
  
  const demoLogin = async () => {
    setLoading(true);
    console.log("Attempting demo login...");
    // Simulate a network delay
    await new Promise(res => setTimeout(res, 500));
    setUser(demoUser);
    setLoading(false);
    console.log("Demo user set.");
  }

  const logout = async () => {
    setLoading(true);
    console.log("Logging out.");
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
