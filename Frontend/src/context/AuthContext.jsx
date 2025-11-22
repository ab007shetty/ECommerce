// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api'; // ✅ Use your API instance
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists in localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data } = await API.get('/auth/profile');
      setUser(data); // assuming backend returns user object
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout(); // invalid token
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await API.post('/auth/login', credentials);
      const token = data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.user));

      await fetchUserProfile();
      toast.success('Logged in successfully!');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await API.post('/auth/register', userData);
      const token = data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.user));

      await fetchUserProfile();
      toast.success('Account created successfully!');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};