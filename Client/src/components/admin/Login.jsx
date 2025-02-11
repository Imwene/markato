// src/components/admin/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { user, login, loading, error } = useAuth();

  // If user is already logged in, redirect to admin dashboard
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const result = await login(email, password);
      if (!result.success) {
        setLoginError(result.error || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center 
                bg-background-light dark:bg-stone-900">
  <div className="max-w-md w-full p-6 
                  bg-white dark:bg-stone-800 
                  rounded-lg shadow-lg">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold 
                     text-content-dark dark:text-white">
        Admin Login
      </h2>
      <p className="text-content-light dark:text-stone-400 mt-2">
        Enter your credentials to access the admin panel
      </p>
    </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(loginError || error) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {loginError || error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-content-DEFAULT mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg
              focus:outline-none focus:ring-2 
              focus:ring-primary-light dark:focus:ring-orange-500
              bg-background-light dark:bg-stone-900
              border-border-DEFAULT dark:border-stone-700
              text-content-DEFAULT dark:text-white
              placeholder:text-content-light dark:placeholder:text-stone-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-content-DEFAULT mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg
              focus:outline-none focus:ring-2 
              focus:ring-primary-light dark:focus:ring-orange-500
              bg-background-light dark:bg-stone-900
              border-border-DEFAULT dark:border-stone-700
              text-content-DEFAULT dark:text-white
              placeholder:text-content-light dark:placeholder:text-stone-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 
            bg-primary-light dark:bg-orange-500 
            text-white rounded-lg 
            hover:bg-primary-DEFAULT dark:hover:bg-orange-600 
            transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;