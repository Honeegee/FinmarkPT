'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function TestOAuthPage() {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [migrationMessage, setMigrationMessage] = useState('');

  const runMigration = async () => {
    setMigrationStatus('loading');
    try {
      const response = await fetch('/api/migrate/google-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setMigrationStatus('success');
        setMigrationMessage(data.message);
      } else {
        setMigrationStatus('error');
        setMigrationMessage(data.details || data.error);
      }
    } catch (error) {
      setMigrationStatus('error');
      setMigrationMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testGoogleOAuth = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Google OAuth Test Page</CardTitle>
            <CardDescription>
              Test and setup Google OAuth integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Migration Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">1. Database Migration</h3>
              <p className="text-sm text-gray-600">
                Run this first to add Google OAuth support to the database
              </p>
              
              <Button 
                onClick={runMigration}
                disabled={migrationStatus === 'loading'}
                className="w-full"
              >
                {migrationStatus === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Migration...
                  </>
                ) : (
                  'Run Database Migration'
                )}
              </Button>

              {migrationStatus === 'success' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {migrationMessage}
                  </AlertDescription>
                </Alert>
              )}

              {migrationStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Migration failed: {migrationMessage}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* OAuth Test Section */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">2. Test Google OAuth</h3>
              <p className="text-sm text-gray-600">
                Click to test the Google OAuth flow
              </p>
              
              <Button 
                onClick={testGoogleOAuth}
                variant="outline"
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Test Google OAuth
              </Button>
            </div>

            {/* Environment Check */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">3. Environment Variables</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>GOOGLE_CLIENT_ID:</span>
                  <span className={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'text-green-600' : 'text-red-600'}>
                    {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>NEXTAUTH_URL:</span>
                  <span className="text-blue-600">
                    {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}