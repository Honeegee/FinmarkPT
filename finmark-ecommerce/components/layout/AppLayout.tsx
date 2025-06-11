'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  ArrowLeft,
  Bell,
  Search,
  LogOut
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  badgeText?: string;
  showUserActions?: boolean;
}

export default function AppLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  backButtonText = "Dashboard",
  backButtonPath = "/dashboard",
  badgeText,
  showUserActions = true
}: AppLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push(backButtonPath)}
                    className="flex items-center space-x-2 hover:bg-blue-50"
                  >
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                    <span className="text-slate-900 font-medium">{backButtonText}</span>
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <span className="text-xl font-bold text-slate-900">Finmark</span>
                  {badgeText && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                      {badgeText}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* User Info and Actions */}
            {showUserActions && user && (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                  <Bell className="h-4 w-4 text-slate-600" />
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                  <Search className="h-4 w-4 text-slate-600" />
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.firstName || 'Demo'} {user?.lastName || 'User'}
                    </p>
                    <p className="text-xs text-slate-600 capitalize">
                      {user?.role || 'customer'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-900 border-slate-300 font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-1 text-slate-700" />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title Section */}
        {title && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-slate-700">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
}