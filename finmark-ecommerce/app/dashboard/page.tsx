'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/layout/AppLayout";
import { 
  User, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Activity
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 145,
    totalProducts: 89,
    totalCustomers: 234,
    revenue: 15750
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <AppLayout
      title={`Welcome back, ${user?.firstName || 'Demo'}! 👋`}
      subtitle="Here's what's happening with your business today."
      badgeText="Dashboard"
      showUserActions={true}
    >
      {/* Date Display */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-slate-600">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{dashboardStats.totalOrders}</div>
            <p className="text-sm text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Products</CardTitle>
            <Package className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{dashboardStats.totalProducts}</div>
            <p className="text-sm text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Customers</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{dashboardStats.totalCustomers}</div>
            <p className="text-sm text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">₱{dashboardStats.revenue.toLocaleString()}</div>
            <p className="text-sm text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-slate-600">
              Manage your store efficiently with these quick actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white font-medium">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
            <Button className="w-full justify-start border-slate-300 hover:bg-slate-50 text-slate-900 font-medium" variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2 text-slate-700" />
              View Orders
            </Button>
            <Button className="w-full justify-start border-slate-300 hover:bg-slate-50 text-slate-900 font-medium" variant="outline">
              <User className="h-4 w-4 mr-2 text-slate-700" />
              Manage Customers
            </Button>
            <Button className="w-full justify-start border-slate-300 hover:bg-slate-50 text-slate-900 font-medium" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2 text-slate-700" />
              View Analytics
            </Button>
            <Button
              className="w-full justify-start border-slate-300 hover:bg-slate-50 text-slate-900 font-medium"
              variant="outline"
              onClick={() => router.push('/dashboard/security')}
            >
              <Settings className="h-4 w-4 mr-2 text-slate-700" />
              Security Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Account Information
            </CardTitle>
            <CardDescription className="text-slate-600">
              Your account details and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm font-semibold text-slate-800">Email:</span>
                <span className="text-sm text-slate-900 font-semibold">{user?.email || 'demo@customer.com'}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm font-semibold text-slate-800">Role:</span>
                <Badge className="capitalize bg-blue-100 text-blue-800 border-blue-200 font-medium px-3 py-1">{user?.role || 'customer'}</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm font-semibold text-slate-800">Account Status:</span>
                <Badge className="bg-green-100 text-green-800 border-green-200 font-medium px-3 py-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
            <Separator className="my-4" />
            <Button className="w-full border-slate-300 hover:bg-slate-50 text-slate-900 font-medium" variant="outline">
              <Settings className="h-4 w-4 mr-2 text-slate-700" />
              Account Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-slate-600">
            Latest updates and notifications from your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex-1">
                <p className="font-semibold text-blue-900 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Welcome to Finmark!
                </p>
                <p className="text-sm text-blue-800 mt-1">You've successfully logged into your dashboard.</p>
                <p className="text-xs text-blue-700 mt-2 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              <Badge className="bg-blue-600 text-white">New</Badge>
            </div>
            
            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex-1">
                <p className="font-semibold text-green-900 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  System Status
                </p>
                <p className="text-sm text-green-800 mt-1">All systems are operational and running smoothly.</p>
                <p className="text-xs text-green-700 mt-2">Last checked: 2 minutes ago</p>
              </div>
              <Badge className="bg-green-600 text-white">Operational</Badge>
            </div>

            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Daily Backup
                </p>
                <p className="text-sm text-yellow-800 mt-1">Your daily data backup has been completed successfully.</p>
                <p className="text-xs text-yellow-700 mt-2">Completed at 3:00 AM</p>
              </div>
              <Badge className="bg-yellow-600 text-white">Complete</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}