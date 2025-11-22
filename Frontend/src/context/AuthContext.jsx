import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Base API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Set default Authorization header when user logs in
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Check if token exists in localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/profile`);
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
      const { data } = await axios.post(`${API_URL}/auth/login`, credentials);
      const token = data.token;

      localStorage.setItem('token', token);
      setAuthToken(token);

      await fetchUserProfile();
      toast.success('Logged in successfully!');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, userData);
      const token = data.token;

      localStorage.setItem('token', token);
      setAuthToken(token);

      await fetchUserProfile();
      toast.success('Account created successfully!');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
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