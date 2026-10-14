import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('inventory_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('inventory_token') || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Verify auth token on initial load
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('inventory_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();

    // Listen for unauthorized events from api client
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      showToast('Your session has expired. Please sign in again.', 'warning');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login({ email, password });
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('inventory_token', data.token);
        localStorage.setItem('inventory_user', JSON.stringify(data.user));
        showToast(`Welcome back, ${data.user.name}! Logged in as ${data.user.role}.`, 'success');
        return { success: true };
      }
    } catch (error) {
      showToast(error.message || 'Login failed. Please check credentials.', 'error');
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await api.register({ name, email, password });
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('inventory_token', data.token);
        localStorage.setItem('inventory_user', JSON.stringify(data.user));
        showToast('Registration successful! Welcome to Inventro.', 'success');
        return { success: true };
      }
    } catch (error) {
      showToast(error.message || 'Registration failed.', 'error');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('inventory_token');
    localStorage.removeItem('inventory_user');
    showToast('You have been logged out safely.', 'info');
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        loading,
        login,
        register,
        logout,
        toast,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
