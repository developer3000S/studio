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
    console.log("AuthProvider: Подписка на изменение состояния аутентификации.");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("AuthProvider: Пользователь вошел в систему:", user.uid);
        setUser(user);
      } else {
        console.log("AuthProvider: Пользователь вышел из системы.");
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log("AuthProvider: Отписка от изменения состояния аутентификации.");
      unsubscribe();
    }
  }, []);

  const login = (email: string, pass: string) => {
    console.log(`AuthContext: Попытка входа с email: ${email}`);
    return signInWithEmailAndPassword(auth, email, pass)
      .then(userCredential => {
        console.log("AuthContext: Вход выполнен успешно для", userCredential.user.email);
        return userCredential;
      })
      .catch(error => {
        console.error("AuthContext: Ошибка входа:", error.code, error.message);
        throw error;
      });
  }

  const signup = (email: string, pass: string) => {
    console.log(`AuthContext: Попытка регистрации с email: ${email}`);
    return createUserWithEmailAndPassword(auth, email, pass)
     .then(userCredential => {
        console.log("AuthContext: Регистрация выполнена успешно для", userCredential.user.email);
        return userCredential;
      })
      .catch(error => {
        console.error("AuthContext: Ошибка регистрации:", error.code, error.message);
        throw error;
      });
  }

  const logout = () => {
    console.log("AuthContext: Выполнение выхода...");
    return signOut(auth).then(() => {
      console.log("AuthContext: Выход выполнен успешно.");
    });
  };
  
  const demoLogin = async () => {
    const demoEmail = "demo@example.com";
    const demoPassword = "password123";
    console.log("AuthContext: Попытка демо-входа...");
    try {
        console.log(`AuthContext: Шаг 1: Попытка входа как существующий демо-пользователь (${demoEmail})`);
        await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
        console.log("AuthContext: Демо-вход выполнен успешно как существующий пользователь.");
    } catch(error: any) {
        console.warn(`AuthContext: Ошибка на шаге 1: ${error.code}. Это ожидаемо, если пользователь новый.`);
        if(error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            console.log("AuthContext: Демо-пользователь не найден. Попытка создать нового.");
            try {
               console.log(`AuthContext: Шаг 2: Попытка создать нового демо-пользователя (${demoEmail})`);
               await createUserWithEmailAndPassword(auth, demoEmail, demoPassword)
               console.log("AuthContext: Новый демо-пользователь успешно создан и вошел в систему.");
            } catch (signupError: any) {
                console.error("AuthContext: Ошибка на шаге 2 (создание пользователя):", signupError.code, signupError.message);
                if (signupError.code !== 'auth/email-already-in-use') {
                    throw new Error("Не удалось создать демо-пользователя: " + signupError.message);
                }
                console.log("AuthContext: Пользователь уже существует, возможно, из-за гонки состояний. Повторная попытка входа.");
                await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
                 console.log("AuthContext: Повторный демо-вход выполнен успешно.");
            }
        } else {
            console.error("AuthContext: Непредвиденная ошибка при демо-входе:", error.code, error.message);
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
