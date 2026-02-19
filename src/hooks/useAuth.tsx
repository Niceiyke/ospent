import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  monthlyBudget: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  updateMonthlyBudget: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ospent_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('ospent_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setToken('');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ospent_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const updateMonthlyBudget = async (amount: number) => {
    if (!user) return;
    try {
      const res = await fetch('/api/user/budget', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ monthlyBudget: amount }),
      });
      if (res.ok) {
        const newUser = { ...user, monthlyBudget: amount };
        setUser(newUser);
        localStorage.setItem('ospent_user', JSON.stringify(newUser));
      }
    } catch (err) {
      console.error('Failed to update budget', err);
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ospent_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error', err);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('ospent_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, theme, toggleTheme, updateMonthlyBudget }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
