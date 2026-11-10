import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aapan_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('aapan_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      api.getMe(token)
        .then(data => {
          setUser(data.user);
          localStorage.setItem('aapan_user', JSON.stringify(data.user));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('aapan_token', data.token);
      localStorage.setItem('aapan_user', JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await api.register(userData);
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('aapan_token', data.token);
        localStorage.setItem('aapan_user', JSON.stringify(data.user));
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aapan_token');
    localStorage.removeItem('aapan_user');
  };

  const updatePreferences = async (prefs) => {
    if (!token) return;
    try {
      const data = await api.updatePreferences(token, prefs);
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('aapan_user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.warn('Update prefs failed:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, register, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

