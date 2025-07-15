'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function GoogleSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [localUser, setLocalUser] = useState<any>(null);
  const router = useRouter();
  const { user: contextUser } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verify the JWT token from cookies
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          setLocalUser(data.user);
          setIsLoading(false);
          
          // Trigger AuthContext to re-check authentication state
          // This will sync the cookie-based auth with the context
          window.dispatchEvent(new Event('auth-state-changed'));
          
          // Auto-redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          console.error('Auth verification failed');
          setIsLoading(false);
          router.push('/auth/login?error=auth_verification_failed');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoading(false);
        router.push('/auth/login?error=auth_check_failed');
      }
    };

    checkAuth();
  }, [router]);

  // Use context user if available, otherwise use local user
  const displayUser = contextUser || localUser;

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Completing authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Authentication Successful!
          </CardTitle>
          <CardDescription className="text-gray-600">
            You have successfully signed in with Google
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayUser && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                {displayUser.profilePicture && (
                  <img
                    src={displayUser.profilePicture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm text-green-600 font-medium">Welcome back!</p>
                  <p className="font-medium text-gray-900">{displayUser.name || `${displayUser.firstName} ${displayUser.lastName}`.trim()}</p>
                  <p className="text-sm text-gray-600">{displayUser.email}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
            <p className="text-sm text-blue-700">
              <Loader2 className="inline h-4 w-4 animate-spin mr-1" />
              Redirecting to dashboard in 2 seconds...
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continue to Dashboard Now
            </Button>
            
            <Button
              onClick={handleBackToLogin}
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}