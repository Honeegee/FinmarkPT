'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MigrateTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runMigration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/migrate/google-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to run migration', details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Database Migration</CardTitle>
          <CardDescription>
            Run the Google OAuth database migration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runMigration} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Running Migration...' : 'Run Google OAuth Migration'}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}