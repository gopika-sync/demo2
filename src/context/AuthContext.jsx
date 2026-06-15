import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user data on load
    const storedUser = localStorage.getItem('lms_user');
    const storedToken = localStorage.getItem('lms_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('lms_token', token);
      localStorage.setItem('lms_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn("Logout request failed on server, cleaning local session anyway.", e);
    } finally {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      setUser(null);
    }
  };

  const registerStudent = async (studentData) => {
    try {
      // Add student role explicitly
      const response = await api.post('/auth/register', {
        ...studentData,
        role: 'student'
      });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      return { success: false, error: message };
    }
  };

  const updateProfile = (updatedUser) => {
    const updated = { ...user, ...updatedUser };
    localStorage.setItem('lms_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerStudent, updateProfile }}>
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
