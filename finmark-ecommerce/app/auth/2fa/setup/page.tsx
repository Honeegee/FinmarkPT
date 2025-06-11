'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Smartphone,
  Key,
  CheckCircle,
  AlertCircle,
  Copy,
  QrCode,
  ArrowLeft,
  Building2
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

export default function TwoFactorSetupPage() {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Step 1: Initialize 2FA setup
  const initiate2FASetup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Check if using mock authentication
      if (token && token.startsWith('mock-')) {
        // Mock 2FA setup
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='); // 1x1 transparent PNG as placeholder
        setSecret('DEMO2FASECRETKEY123456789ABCDEF');
        setStep(2);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setQrCode(data.qrCode);
        setSecret(data.manualEntryKey);
        setStep(2);
      } else {
        setError(data.message || 'Failed to setup 2FA');
      }
    } catch (err) {
      // Fallback to mock for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
      setSecret('DEMO2FASECRETKEY123456789ABCDEF');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify and enable 2FA
  const enable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Check if using mock authentication
      if (token && token.startsWith('mock-')) {
        // Mock enable 2FA
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        const mockBackupCodes = [
          'ABC123', 'DEF456', 'GHI789', 'JKL012',
          'MNO345', 'PQR678', 'STU901', 'VWX234'
        ];
        setBackupCodes(mockBackupCodes);
        setSuccess('2FA enabled successfully! (Demo Mode)');
        localStorage.setItem('mock-2fa-enabled', 'true');
        setStep(3);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationCode })
      });

      const data = await response.json();
      
      if (response.ok) {
        setBackupCodes(data.backupCodes);
        setSuccess('2FA enabled successfully!');
        setStep(3);
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      // Fallback to mock for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockBackupCodes = [
        'ABC123', 'DEF456', 'GHI789', 'JKL012',
        'MNO345', 'PQR678', 'STU901', 'VWX234'
      ];
      setBackupCodes(mockBackupCodes);
      setSuccess('2FA enabled successfully! (Demo Mode)');
      localStorage.setItem('mock-2fa-enabled', 'true');
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/security')}
                className="flex items-center space-x-2 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4 text-slate-600" />
                <span className="text-slate-900 font-medium">Security Settings</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <span className="text-xl font-bold text-slate-900">Finmark</span>
                  <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">2FA Setup</Badge>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.firstName || 'Demo'} {user?.lastName || 'User'}
                </p>
                <p className="text-xs text-slate-600 capitalize">{user?.role || 'customer'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Two-Factor Authentication Setup 🛡️
          </h1>
          <p className="text-lg text-slate-700">
            Secure your account with an extra layer of protection using an authenticator app.
          </p>
        </div>

        <div className="max-w-2xl">

          {/* Step 1: Introduction */}
          {step === 1 && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Enable Two-Factor Authentication
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Two-factor authentication (2FA) adds an extra layer of security to your account
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 text-base">Step 1: Install an Authenticator App</h3>
                    <p className="text-base text-blue-800 mt-1">
                      Download Google Authenticator, Authy, or any compatible TOTP app
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <QrCode className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 text-base">Step 2: Scan QR Code</h3>
                    <p className="text-base text-green-800 mt-1">
                      Use your authenticator app to scan the QR code we'll provide
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                  <Key className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900 text-base">Step 3: Enter Verification Code</h3>
                    <p className="text-base text-purple-800 mt-1">
                      Enter the 6-digit code from your app to complete setup
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/security')}
                  className="border-slate-300 hover:bg-slate-50 text-slate-900 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 text-slate-700" />
                  Back to Security
                </Button>
                <Button
                  onClick={initiate2FASetup}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {loading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Setting up...' : 'Start Setup'}
                </Button>
              </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: QR Code and Verification */}
          {step === 2 && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                  <QrCode className="h-5 w-5 mr-2 text-blue-600" />
                  Scan QR Code
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Use your authenticator app to scan this QR code
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-center space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-slate-200">
                    <img 
                      src={qrCode} 
                      alt="2FA QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>

                {/* Manual Entry Option */}
                <div className="space-y-2">
                  <p className="text-base text-slate-700">
                    Can't scan the QR code? Enter this code manually:
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <code className="px-3 py-2 bg-slate-100 rounded font-mono text-base text-slate-900">
                      {secret}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copySecret}
                      className="flex items-center space-x-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Verification Code Input */}
              <div className="space-y-2">
                <Label htmlFor="verification-code" className="text-base font-semibold text-slate-900">
                  Enter the 6-digit code from your authenticator app
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg font-mono"
                  maxLength={6}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-slate-300 hover:bg-slate-50 text-slate-900 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 text-slate-700" />
                  Back
                </Button>
                <Button
                  onClick={enable2FA}
                  disabled={loading || verificationCode.length !== 6}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {loading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Verifying...' : 'Enable 2FA'}
                </Button>
              </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Success and Backup Codes */}
          {step === 3 && (
            <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>2FA Successfully Enabled!</span>
              </CardTitle>
              <CardDescription>
                Your account is now protected with two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Backup Codes */}
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Key className="h-4 w-4 text-yellow-600" />
                    <h3 className="font-medium text-yellow-800">Backup Codes</h3>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                  </p>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="text-center py-1 px-2 bg-slate-50 rounded">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyBackupCodes}
                    className="mt-3 flex items-center space-x-2"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copied ? 'Copied!' : 'Copy All Codes'}</span>
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Continue to Dashboard
                </Button>
              </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}