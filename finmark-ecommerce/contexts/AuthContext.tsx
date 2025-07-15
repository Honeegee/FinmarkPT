'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      verifyToken(token);
    } else {
      // If no localStorage token, check if we have cookie-based auth (OAuth)
      checkCookieAuth();
    }

    // Listen for auth state changes (triggered by OAuth success page)
    const handleAuthStateChange = () => {
      checkCookieAuth();
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, []);

  const checkCookieAuth = async () => {
    try {
      // Try to verify using cookies (for OAuth flow)
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Cookie auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (token: string) => {
    try {
      // Check for mock user data first (for demo purposes)
      const mockUser = localStorage.getItem('user');
      if (mockUser && token.startsWith('mock-')) {
        setUser(JSON.parse(mockUser));
        setLoading(false);
        return;
      }

      // If not mock data, try API verification
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // For mock tokens, don't clear the data on API failure
      if (!token.startsWith('mock-')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        // Keep mock user data even if API fails
        const mockUser = localStorage.getItem('user');
        if (mockUser) {
          setUser(JSON.parse(mockUser));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    // Handle the tokens structure from the API response
    const token = data.tokens?.accessToken || data.token;
    localStorage.setItem('token', token);
    setUser(data.user);
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Also clear server-side cookies for OAuth users
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to clear server cookies:', error);
    }
    
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}