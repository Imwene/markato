// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import {CONFIG} from '../config/config';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);   // Add error state
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          // You might want to validate the token here (e.g., check expiry)
          setUser(user);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setError('Failed to check authentication.'); // Set error message
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const checkTokenExpiration = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch (error) {
      return false;
    }
  };

const refreshToken = async () => {
  // Implement token refresh logic
};

useEffect(() => {
  const interval = setInterval(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token && !checkTokenExpiration(user.token)) {
      refreshToken();
    }
  }, 1000 * 60 * 5); // Check every 5 minutes

  return () => clearInterval(interval);
}, []);

  const login = async (email, password) => {
    try {
      setLoading(true); 
      setError(null);

      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          ...data.user,
          token: data.token // Store token with user data
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/admin');
        return { success: true };
      } else {
        console.error('Login failed:', data.error);
        setError(data.error || 'Login failed.'); // Set error message
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed.'); // Set generic error message
      return { success: false, error: 'Login failed.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const value = { user, login, logout, loading, error }; // Include loading and error

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;