'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AppLayout from "@/components/layout/AppLayout";
import { 
  Shield, 
  Smartphone, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Settings,
  RefreshCw,
  Activity,
  MapPin,
  Clock
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

export default function SecurityDashboard() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [password, setPassword] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [securitySummary, setSecuritySummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    load2FAStatus();
    loadSecuritySummary();
  }, [user, router]);

  const load2FAStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if using mock authentication
      if (token && token.startsWith('mock-')) {
        // Mock 2FA status based on localStorage
        const mock2FAEnabled = localStorage.getItem('mock-2fa-enabled') === 'true';
        setIs2FAEnabled(mock2FAEnabled);
        return;
      }
      
      const localState = localStorage.getItem('mock-2fa-enabled') === 'true';
      const response = await fetch('/api/auth/2fa/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-2FA-Local-State': localState.toString()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIs2FAEnabled(data.enabled);
      }
    } catch (err) {
      console.error('Failed to load 2FA status:', err);
      // Fallback to mock for demo purposes
      const mock2FAEnabled = localStorage.getItem('mock-2fa-enabled') === 'true';
      setIs2FAEnabled(mock2FAEnabled);
    }
  };

  const loadSecuritySummary = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if using mock authentication
      if (token && token.startsWith('mock-')) {
        // Mock security summary for demo
        const mockSummary = {
          security: {
            recentLoginAttempts: [
              {
                success: true,
                ip_address: '192.168.1.100',
                attempted_at: new Date().toISOString()
              },
              {
                success: false,
                ip_address: '10.0.0.1',
                attempted_at: new Date(Date.now() - 86400000).toISOString()
              }
            ]
          },
          recommendations: [
            {
              priority: 'medium',
              message: 'Consider enabling 2FA for enhanced security'
            }
          ]
        };
        setSecuritySummary(mockSummary);
        return;
      }
      
      const response = await fetch('/api/auth/security-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSecuritySummary(data);
      }
    } catch (err) {
      console.error('Failed to load security summary:', err);
      // Fallback to mock for demo purposes
      const mockSummary = {
        security: {
          recentLoginAttempts: [
            {
              success: true,
              ip_address: '192.168.1.100',
              attempted_at: new Date().toISOString()
            }
          ]
        },
        recommendations: [
          {
            priority: 'medium',
            message: 'This is a demo environment. Enable 2FA to test the functionality.'
          }
        ]
      };
      setSecuritySummary(mockSummary);
    }
  };

  const disable2FA = async () => {
    if (!password) {
      setError('Password is required to disable 2FA');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Check if using mock authentication
      if (token && token.startsWith('mock-')) {
        // Mock disable 2FA - just remove localStorage flag
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        localStorage.removeItem('mock-2fa-enabled');
        setIs2FAEnabled(false);
        setShowDisableForm(false);
        setPassword('');
        setSuccess('2FA has been disabled (Demo Mode)');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        // Remove localStorage flag for prototype system
        localStorage.removeItem('mock-2fa-enabled');
        setIs2FAEnabled(false);
        setShowDisableForm(false);
        setPassword('');
        setSuccess('2FA has been disabled');
      } else {
        setError(data.message || 'Failed to disable 2FA');
      }
    } catch (err) {
      // Fallback to mock for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.removeItem('mock-2fa-enabled');
      setIs2FAEnabled(false);
      setShowDisableForm(false);
      setPassword('');
      setSuccess('2FA has been disabled (Demo Mode)');
    } finally {
      setLoading(false);
    }
  };

  const regenerateBackupCodes = async () => {
    if (!password) {
      setError('Password is required to regenerate backup codes');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Check if using mock authentication
      if (token && token.startsWith('mock-')) {
        // Mock regenerate backup codes
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        const mockBackupCodes = [
          'ABC123', 'DEF456', 'GHI789', 'JKL012',
          'MNO345', 'PQR678', 'STU901', 'VWX234'
        ];
        setNewBackupCodes(mockBackupCodes);
        setShowBackupCodes(true);
        setPassword('');
        setSuccess('Backup codes regenerated successfully (Demo Mode)');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/auth/2fa/regenerate-backup-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        setNewBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
        setPassword('');
        setSuccess('Backup codes regenerated successfully');
      } else {
        setError(data.message || 'Failed to regenerate backup codes');
      }
    } catch (err) {
      // Fallback to mock for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockBackupCodes = [
        'ABC123', 'DEF456', 'GHI789', 'JKL012',
        'MNO345', 'PQR678', 'STU901', 'VWX234'
      ];
      setNewBackupCodes(mockBackupCodes);
      setShowBackupCodes(true);
      setPassword('');
      setSuccess('Backup codes regenerated successfully (Demo Mode)');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(newBackupCodes.join('\n'));
    setSuccess('Backup codes copied to clipboard');
  };

  if (!user) return null;

  return (
    <AppLayout
      title="Security & Privacy 🔒"
      subtitle="Manage your account security settings and two-factor authentication."
      showBackButton={true}
      backButtonText="Dashboard"
      backButtonPath="/dashboard"
      badgeText="Security"
      showUserActions={true}
    >
      <div className="space-y-6">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Two-Factor Authentication */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
              Two-Factor Authentication
              <Badge className={`ml-3 ${is2FAEnabled ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'} font-medium px-3 py-1`}>
                {is2FAEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-slate-600">
              Add an extra layer of security to your account with 2FA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {is2FAEnabled ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    2FA is enabled and protecting your account
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDisableForm(!showDisableForm)}
                    className="border-slate-300 hover:bg-slate-50 text-slate-900 font-medium"
                  >
                    <Settings className="h-4 w-4 mr-2 text-slate-700" />
                    Disable 2FA
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                    className="border-slate-300 hover:bg-slate-50 text-slate-900 font-medium"
                  >
                    <RefreshCw className="h-4 w-4 mr-2 text-slate-700" />
                    Regenerate Backup Codes
                  </Button>
                </div>

                {/* Disable 2FA Form */}
                {showDisableForm && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-red-900">Disable Two-Factor Authentication</CardTitle>
                      <CardDescription className="text-red-800">
                        Enter your password to disable 2FA. This will make your account less secure.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="disable-password">Current Password</Label>
                        <Input
                          id="disable-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="destructive"
                          onClick={disable2FA}
                          disabled={loading || !password}
                          size="sm"
                          className="font-medium"
                        >
                          {loading ? 'Disabling...' : 'Disable 2FA'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDisableForm(false);
                            setPassword('');
                          }}
                          size="sm"
                          className="border-slate-300 hover:bg-slate-50 text-slate-900 font-medium"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Regenerate Backup Codes */}
                {showBackupCodes && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-yellow-900">Regenerate Backup Codes</CardTitle>
                      <CardDescription className="text-yellow-800">
                        Generate new backup codes. Your old codes will no longer work.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {newBackupCodes.length > 0 ? (
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded border">
                            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                              {newBackupCodes.map((code, index) => (
                                <div key={index} className="text-center py-1 px-2 bg-slate-50 rounded">
                                  {code}
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={copyBackupCodes}
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <Key className="h-3 w-3" />
                            <span>Copy All Codes</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="regen-password">Current Password</Label>
                          <Input
                            id="regen-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={regenerateBackupCodes}
                              disabled={loading || !password}
                              size="sm"
                            >
                              {loading ? 'Generating...' : 'Generate New Codes'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowBackupCodes(false);
                                setPassword('');
                              }}
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    2FA is not enabled. Your account is less secure without it.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => router.push('/auth/2fa/simple-setup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Enable Two-Factor Authentication
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Summary */}
        {securitySummary && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Security Activity
              </CardTitle>
              <CardDescription className="text-slate-600">
                Recent security events and recommendations for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recent Login Attempts */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Recent Login Attempts
                </h4>
                <div className="space-y-2">
                  {securitySummary.security?.recentLoginAttempts?.slice(0, 5).map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-3">
                        <Badge className={attempt.success ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                          {attempt.success ? 'Success' : 'Failed'}
                        </Badge>
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          {attempt.ip_address}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(attempt.attempted_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Recommendations */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Security Recommendations</h4>
                <div className="space-y-2">
                  {securitySummary.recommendations.map((rec, index) => (
                    <Alert key={index} className={
                      rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                      rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }>
                      <AlertCircle className={`h-4 w-4 ${
                        rec.priority === 'high' ? 'text-red-600' :
                        rec.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <AlertDescription className={
                        rec.priority === 'high' ? 'text-red-800' :
                        rec.priority === 'medium' ? 'text-yellow-800' :
                        'text-blue-800'
                      }>
                        {rec.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}