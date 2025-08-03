'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  demoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const signup = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  }

  const logout = () => {
    return signOut(auth);
  };
  
  const demoLogin = async () => {
    const demoEmail = "demo@example.com";
    const demoPassword = "password123";
    try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
    } catch(error: any) {
        if(error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            try {
               await createUserWithEmailAndPassword(auth, demoEmail, demoPassword)
            } catch (signupError: any) {
                if (signupError.code !== 'auth/email-already-in-use') {
                    throw new Error("Не удалось создать демо-пользователя: " + signupError.message);
                }
                // If it already exists, another try to login might be needed if there was a race condition.
                // Or we can just let the original error be thrown. For simplicity, we'll try one more time.
                await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
            }
        } else {
            throw new Error("Ошибка демо-входа: " + error.message)
        }
    }
  }

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
