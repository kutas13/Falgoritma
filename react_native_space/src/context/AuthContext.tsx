import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserCredits: (credits: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (e) {
      // ignore
    }
    setUser(null);
  }, []);

  useEffect(() => {
    apiService.setLogoutCallback(logout);
  }, [logout]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          const userData = await apiService.getMe();
          setUser(userData);
        }
      } catch (error) {
        await AsyncStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    await AsyncStorage.setItem('auth_token', response?.access_token ?? '');
    setUser(response?.user ?? null);
  };

  const register = async (email: string, password: string) => {
    const response = await apiService.register(email, password);
    await AsyncStorage.setItem('auth_token', response?.access_token ?? '');
    setUser(response?.user ?? null);
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getMe();
      setUser(userData);
    } catch (error) {
      // ignore
    }
  };

  const updateUserCredits = (credits: number) => {
    if (user) {
      setUser({ ...user, credits });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateUserCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
