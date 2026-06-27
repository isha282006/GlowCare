import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authService } from '../api/services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('glowcare_token');
      const storedUser = localStorage.getItem('glowcare_user');
      
      if (storedToken) {
        try {
          // Fetch fresh user data from API
          const res = await authService.getMe();
          setUser(res.data.user);
          setToken(storedToken);
          localStorage.setItem('glowcare_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Auth initialization error:', err);
          // Try to fallback to localStorage if offline, or clear if expired
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } else {
            localStorage.removeItem('glowcare_token');
            localStorage.removeItem('glowcare_user');
            setToken(null);
            setUser(null);
          }
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    const { token: apiToken, user: apiUser } = res.data;
    
    localStorage.setItem('glowcare_token', apiToken);
    localStorage.setItem('glowcare_user', JSON.stringify(apiUser));
    
    setToken(apiToken);
    setUser(apiUser);
    return res.data;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authService.register({ name, email, password });
    const { token: apiToken, user: apiUser } = res.data;
    
    localStorage.setItem('glowcare_token', apiToken);
    localStorage.setItem('glowcare_user', JSON.stringify(apiUser));
    
    setToken(apiToken);
    setUser(apiUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('glowcare_token');
    localStorage.removeItem('glowcare_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('glowcare_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
