import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('devspace_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('devspace_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<{ user: User }>('/auth/me');
        setUser(response.data.user);
        localStorage.setItem('devspace_user', JSON.stringify(response.data.user));
      } catch (err) {
        console.warn('Auth token verification failed:', err);
        localStorage.removeItem('devspace_token');
        localStorage.removeItem('devspace_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    const { token: receivedToken, user: receivedUser } = response.data;
    localStorage.setItem('devspace_token', receivedToken);
    localStorage.setItem('devspace_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const response = await api.post<{ token: string; user: User }>('/auth/register', {
      name,
      email,
      password,
    });
    const { token: receivedToken, user: receivedUser } = response.data;
    localStorage.setItem('devspace_token', receivedToken);
    localStorage.setItem('devspace_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('devspace_token');
    localStorage.removeItem('devspace_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('devspace_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
