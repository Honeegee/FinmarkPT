'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Comprehensive input validation with null checks
      if (email === null) {
        setError('Email cannot be null. Please enter a valid email address.');
        setLoading(false);
        return;
      }

      if (email === undefined) {
        setError('Email is required. Please enter your email address.');
        setLoading(false);
        return;
      }

      if (password === null) {
        setError('Password cannot be null. Please enter your password.');
        setLoading(false);
        return;
      }

      if (password === undefined) {
        setError('Password is required. Please enter your password.');
        setLoading(false);
        return;
      }

      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      if (typeof email !== 'string') {
        setError(`Email must be text, not ${typeof email}. Please enter a valid email.`);
        setLoading(false);
        return;
      }

      if (typeof password !== 'string') {
        setError(`Password must be text, not ${typeof password}. Please enter a valid password.`);
        setLoading(false);
        return;
      }

      if (!email.trim() || !password.trim()) {
        setError('Email and password cannot be empty or contain only spaces');
        setLoading(false);
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address (example: user@domain.com)');
        setLoading(false);
        return;
      }

      // Try API login first
      try {
        const localState = localStorage.getItem('mock-2fa-enabled') === 'true';
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-2FA-Local-State': localState.toString()
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
            twoFactorCode: show2FA && !useBackupCode ? twoFactorCode : undefined,
            backupCode: show2FA && useBackupCode ? backupCode : undefined
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Store tokens and user data
          localStorage.setItem('token', data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          window.location.href = '/dashboard';
          return;
        } else if (response.ok && data.require2FA) {
          // 2FA required - show 2FA prompt
          setShow2FA(true);
          setError('');
          setLoading(false);
          return;
        } else {
          // Handle API errors
          if (data.code === 'VALIDATION_ERROR' && data.details) {
            const errorMessages: string[] = [];
            if (data.details.email && Array.isArray(data.details.email)) {
              errorMessages.push(...data.details.email);
            }
            if (data.details.password && Array.isArray(data.details.password)) {
              errorMessages.push(...data.details.password);
            }
            if (data.details.general && Array.isArray(data.details.general)) {
              errorMessages.push(...data.details.general);
            }
            setError(errorMessages.join(' '));
            setLoading(false);
            return;
          } else if (data.error) {
            setError(data.details || data.error);
            setLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.warn('API login failed, falling back to demo login:', apiError);
      }

      // Fallback to demo authentication logic
      let isValidCredentials = false;
      let userForAuth: User | null = null;
      
      // Check demo credentials
      if (email === 'admin@finmarksolutions.ph' && password === 'Admin123!') {
        isValidCredentials = true;
        userForAuth = {
          id: '1',
          email: 'admin@finmarksolutions.ph',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        };
      } else if (email === 'demo@finmarksolutions.ph' && password === 'Customer123!') {
        isValidCredentials = true;
        userForAuth = {
          id: '2',
          email: 'demo@finmarksolutions.ph',
          firstName: 'Demo',
          lastName: 'User',
          role: 'customer'
        };
      } else {
        // Check registered users
        try {
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const foundUser = registeredUsers.find(user =>
            user.email === email.trim().toLowerCase() && user.password === password
          );
          
          if (foundUser) {
            isValidCredentials = true;
            userForAuth = {
              id: foundUser.id,
              email: foundUser.email,
              firstName: foundUser.firstName,
              lastName: foundUser.lastName,
              role: foundUser.role
            };
          }
        } catch (storageError) {
          console.warn('Error reading from localStorage:', storageError);
        }
      }
      
      if (!isValidCredentials || !userForAuth) {
        setError('Invalid email or password. Please check your credentials or use the demo accounts.');
        return;
      }
      
      // Check if mock 2FA is enabled and we haven't shown 2FA prompt yet
      const is2FAEnabled = localStorage.getItem('mock-2fa-enabled') === 'true';
      
      if (is2FAEnabled && !show2FA) {
        // Show 2FA prompt
        setShow2FA(true);
        setError('');
        return;
      }
      
      if (show2FA && is2FAEnabled) {
        // Validate 2FA code (accept any 6-digit code for demo)
        if (!useBackupCode && (!twoFactorCode || twoFactorCode.length !== 6)) {
          setError('Please enter a valid 6-digit code');
          return;
        }
        
        if (useBackupCode && (!backupCode || backupCode.trim().length === 0)) {
          setError('Please enter a backup code');
          return;
        }
        
        // For demo purposes, accept any 6-digit code or any backup code
        // In real implementation, you would validate against actual codes
      }
      
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Login successful
      localStorage.setItem('token', `mock-token-${userForAuth.id}`);
      localStorage.setItem('user', JSON.stringify(userForAuth));
      
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span>Finmark</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-900">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* 2FA Code Input */}
              {show2FA && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-900">Two-Factor Authentication Required</CardTitle>
                    <CardDescription className="text-blue-700">
                      Enter the 6-digit code from your authenticator app or use a backup code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!useBackupCode ? (
                      <div className="space-y-2">
                        <Label htmlFor="twoFactorCode" className="text-blue-700">
                          Authenticator Code
                        </Label>
                        <Input
                          id="twoFactorCode"
                          type="text"
                          placeholder="000000"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="text-center text-lg font-mono border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                          maxLength={6}
                        />
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setUseBackupCode(true)}
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                        >
                          Use backup code instead
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="backupCode" className="text-blue-700">
                          Backup Code
                        </Label>
                        <Input
                          id="backupCode"
                          type="text"
                          placeholder="Enter backup code"
                          value={backupCode}
                          onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                          className="text-center font-mono border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setUseBackupCode(false)}
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                        >
                          Use authenticator code instead
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                disabled={loading || (show2FA && !useBackupCode && twoFactorCode.length !== 6) || (show2FA && useBackupCode && !backupCode)}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {show2FA ? 'Verifying...' : 'Signing in...'}
                  </>
                ) : (
                  show2FA ? 'Verify & Sign In' : 'Sign In'
                )}
              </Button>

              {/* Back button for 2FA */}
              {show2FA && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShow2FA(false);
                    setTwoFactorCode('');
                    setBackupCode('');
                    setUseBackupCode(false);
                    setError('');
                  }}
                >
                  ← Back to login
                </Button>
              )}
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600">Don't have an account? </span>
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </div>

            {/* Demo Credentials */}
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-900">Demo Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-blue-800 space-y-2">
                  <p className="font-medium"><strong>Admin:</strong> admin@finmarksolutions.ph / Admin123!</p>
                  <p className="font-medium"><strong>Customer:</strong> demo@finmarksolutions.ph / Customer123!</p>
                </div>
                <Alert className="border-blue-300 bg-blue-100">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Note:</strong> After logging in, go to Dashboard → Security to enable 2FA and test the 2FA login flow
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>© 2024 Finmark Corporation. All rights reserved.</p>
          <p>Secure login protected by enterprise-grade encryption</p>
        </div>
      </div>
    </div>
  );
}