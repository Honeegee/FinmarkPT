'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AppLayout from "@/components/layout/AppLayout";
import { Shield, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

export default function Simple2FASetupPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const enableMock2FA = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simply set a flag in localStorage to indicate 2FA is "enabled"
    localStorage.setItem('mock-2fa-enabled', 'true');
    setSuccess(true);
    setLoading(false);
  };

  const disableMock2FA = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.removeItem('mock-2fa-enabled');
    setSuccess(false);
    setLoading(false);
  };

  const is2FAEnabled = () => {
    return localStorage.getItem('mock-2fa-enabled') === 'true';
  };

  if (!user) return null;

  return (
    <AppLayout
      title="Quick 2FA Setup 🚀"
      subtitle="Enable two-factor authentication with a simple toggle for demo purposes."
      showBackButton={true}
      backButtonText="Security Settings"
      backButtonPath="/dashboard/security"
      badgeText="2FA Setup"
      showUserActions={true}
    >
      <div className="max-w-2xl">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Two-Factor Authentication
              <Badge className={`ml-3 ${is2FAEnabled() ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'} font-medium px-3 py-1`}>
                {is2FAEnabled() ? "Enabled" : "Disabled"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-slate-600">
              {is2FAEnabled()
                ? "2FA is currently enabled. You'll be prompted for a code when logging in."
                : "Enable 2FA to add an extra verification step during login."
              }
            </CardDescription>
          </CardHeader>
        
          <CardContent className="space-y-6">
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  2FA setting updated successfully! (Demo Mode)
                </AlertDescription>
              </Alert>
            )}

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-900">How Mock 2FA Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    When enabled, login will show a 2FA code prompt
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Enter any 6-digit code (e.g., "123456") to proceed
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    No real authenticator app required
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Perfect for testing and demonstrations
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex justify-between space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/security')}
                className="border-slate-300 hover:bg-slate-50 text-slate-900 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2 text-slate-700" />
                Back to Security
              </Button>
              
              {is2FAEnabled() ? (
                <Button
                  variant="destructive"
                  onClick={disableMock2FA}
                  disabled={loading}
                  className="font-medium"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </Button>
              ) : (
                <Button
                  onClick={enableMock2FA}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Enabling...' : 'Enable 2FA'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}