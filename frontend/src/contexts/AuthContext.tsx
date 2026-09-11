import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../api/client';

interface Learner {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  learner: Learner | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [learner, setLearner] = useState<Learner | null>(() => {
    const stored = localStorage.getItem('learner');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { learner: l, token: t } = res.data;
    setLearner(l);
    setToken(t);
    localStorage.setItem('learner', JSON.stringify(l));
    localStorage.setItem('token', t);
  };

  const register = async (email: string, name: string, password: string) => {
    const res = await api.post('/auth/register', { email, name, password });
    const { learner: l, token: t } = res.data;
    setLearner(l);
    setToken(t);
    localStorage.setItem('learner', JSON.stringify(l));
    localStorage.setItem('token', t);
  };

  const logout = () => {
    setLearner(null);
    setToken(null);
    localStorage.removeItem('learner');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ learner, token, login, register, logout, isAuthenticated: !!token }}>
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
