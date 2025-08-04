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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('user');
      if (item) {
        setUser(JSON.parse(item));
      }
    } catch (error) {
      console.warn("Error reading user from localStorage", error);
      setUser(null);
    } finally {
        setLoading(false);
    }
  }, []);

  const setAndStoreUser = (newUser: MockUser | null) => {
    setUser(newUser);
    try {
        if (newUser) {
            window.localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            window.localStorage.removeItem('user');
        }
    } catch (error) {
        console.warn('Error saving user to localStorage', error);
    }
  }


  // All auth functions are now simple async functions that set a mock user
  const login = async (email: string, pass: string) => {
    // Simulate a network delay
    await new Promise(res => setTimeout(res, 500));
    setAndStoreUser({ email, isDemo: false });
  }

  const signup = async (email: string, pass: string) => {
    // Simulate a network delay
    await new Promise(res => setTimeout(res, 500));
    setAndStoreUser({ email, isDemo: false });
  }
  
  const demoLogin = async () => {
    await new Promise(res => setTimeout(res, 500));
    setAndStoreUser(demoUser);
  }

  const logout = async () => {
    await new Promise(res => setTimeout(res, 500));
    setAndStoreUser(null);
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
