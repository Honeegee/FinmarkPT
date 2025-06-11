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
  Activity,
  Heart,
  Star,
  Eye,
  Gift,
  CreditCard,
  Truck,
  PieChart
} from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

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

  // Render different dashboards based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard user={user} />;
  } else {
    return <CustomerDashboard user={user} />;
  }
}

// Admin Dashboard Component
function AdminDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 145,
    totalProducts: 89,
    totalCustomers: 234,
    revenue: 15750
  });

  // Chart data for admin analytics
  const salesData = [
    { name: 'Electronics', value: 45, color: '#3B82F6' },
    { name: 'Clothing', value: 30, color: '#10B981' },
    { name: 'Home & Garden', value: 15, color: '#F59E0B' },
    { name: 'Books', value: 10, color: '#EF4444' }
  ];

  const customerData = [
    { name: 'New Customers', value: 65, color: '#8B5CF6' },
    { name: 'Returning', value: 35, color: '#06B6D4' }
  ];

  const orderStatusData = [
    { name: 'Completed', value: 78, color: '#10B981' },
    { name: 'Processing', value: 15, color: '#F59E0B' },
    { name: 'Pending', value: 7, color: '#EF4444' }
  ];

  return (
    <AppLayout
      title={`Admin Dashboard - Welcome back, ${user?.firstName || 'Admin'}! 👋`}
      subtitle="Manage your e-commerce platform and monitor business metrics."
      badgeText="Admin Dashboard"
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

      {/* Admin Stats Grid */}
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

      {/* Admin Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Admin Actions
            </CardTitle>
            <CardDescription className="text-slate-600">
              Manage your platform and monitor business operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white font-medium">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
            <Button className="w-full justify-start border-slate-300 hover:bg-slate-50 text-slate-900 font-medium" variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2 text-slate-700" />
              View All Orders
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
              Admin Account
            </CardTitle>
            <CardDescription className="text-slate-600">
              Your administrator account details and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm font-semibold text-slate-800">Email:</span>
                <span className="text-sm text-slate-900 font-semibold">{user?.email || 'admin@finmarksolutions.ph'}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm font-semibold text-slate-800">Role:</span>
                <Badge className="capitalize bg-red-100 text-red-800 border-red-200 font-medium px-3 py-1">
                  {user?.role || 'admin'} - Full Access
                </Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm font-semibold text-slate-800">Account Status:</span>
                <Badge className="bg-green-100 text-green-800 border-green-200 font-medium px-3 py-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active Admin
                </Badge>
              </div>
            </div>
            <Separator className="my-4" />
            <Button className="w-full border-slate-300 hover:bg-slate-50 text-slate-900 font-medium" variant="outline">
              <Settings className="h-4 w-4 mr-2 text-slate-700" />
              Admin Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales by Category Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Sales by Category
            </CardTitle>
            <CardDescription className="text-slate-600">
              Product category performance breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={salesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {salesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Acquisition Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Customer Acquisition
            </CardTitle>
            <CardDescription className="text-slate-600">
              New vs returning customer ratio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={customerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {customerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
              Order Status
            </CardTitle>
            <CardDescription className="text-slate-600">
              Current order processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Activity */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            System Activity
          </CardTitle>
          <CardDescription className="text-slate-600">
            Latest system updates and administrative notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex-1">
                <p className="font-semibold text-blue-900 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Admin Access Granted
                </p>
                <p className="text-sm text-blue-800 mt-1">You have full administrative access to the platform.</p>
                <p className="text-xs text-blue-700 mt-2 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              <Badge className="bg-blue-600 text-white">Admin</Badge>
            </div>
            
            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex-1">
                <p className="font-semibold text-green-900 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  System Status
                </p>
                <p className="text-sm text-green-800 mt-1">All systems operational. {dashboardStats.totalCustomers} active users.</p>
                <p className="text-xs text-green-700 mt-2">Last checked: 2 minutes ago</p>
              </div>
              <Badge className="bg-green-600 text-white">Operational</Badge>
            </div>

            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex-1">
                <p className="font-semibold text-purple-900 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Revenue Update
                </p>
                <p className="text-sm text-purple-800 mt-1">Daily revenue: ₱{Math.round(dashboardStats.revenue / 30).toLocaleString()}</p>
                <p className="text-xs text-purple-700 mt-2">Updated hourly</p>
              </div>
              <Badge className="bg-purple-600 text-white">Revenue</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

// Customer Dashboard Component
function CustomerDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [customerStats, setCustomerStats] = useState({
    totalOrders: 8,
    favoriteItems: 12,
    rewardPoints: 450,
    savedItems: 5
  });

  return (
    <AppLayout
      title={`Welcome back, ${user?.firstName || 'Customer'}! 🛍️`}
      subtitle="Discover new products and manage your shopping experience."
      badgeText="Customer Dashboard"
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

      {/* Customer Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">My Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{customerStats.totalOrders}</div>
            <p className="text-sm text-blue-600 font-medium flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              2 orders this month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Favorites</CardTitle>
            <Heart className="h-5 w-5 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{customerStats.favoriteItems}</div>
            <p className="text-sm text-pink-600 font-medium flex items-center mt-1">
              <Heart className="h-3 w-3 mr-1" />
              Items you love
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Reward Points</CardTitle>
            <Star className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{customerStats.rewardPoints}</div>
            <p className="text-sm text-green-600 font-medium flex items-center mt-1">
              <Gift className="h-3 w-3 mr-1" />
              Earn more rewards
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Saved Items</CardTitle>
            <Eye className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{customerStats.savedItems}</div>
            <p className="text-sm text-purple-600 font-medium flex items-center mt-1">
              <Eye className="h-3 w-3 mr-1" />
              For later viewing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
              Quick Shopping
            </CardTitle>
            <CardDescription className="text-slate-600">
              Browse products and manage your shopping experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white font-medium"
              onClick={() => router.push('/')}
            >
              <Package className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
            <Button 
              className="w-full justify-start border-slate-300 hover:bg-slate-50 text-slate-900 font-medium" 
              variant="outline"
              onClick={() => router.push('/cart')}
            >
              <ShoppingCart className="h-4 w-4 mr-2 text-slate-700" />
              View Cart
            </Button>
            <Button className="w-full justify-start border-slate-300 hover:bg-slate-50 text-slate-900 font-medium" variant="outline">
              <Heart className="h-4 w-4 mr-2 text-slate-700" />
              My Favorites
            </Button>
            <Button className="w-full justify-start border-slate-300 hover:bg-slate-50 text-slate-900 font-medium" variant="outline">
              <Truck className="h-4 w-4 mr-2 text-slate-700" />
              Track Orders
            </Button>
            <Button
              className="w-full justify-start border-slate-300 hover:bg-slate-50 text-slate-900 font-medium"
              variant="outline"
              onClick={() => router.push('/dashboard/security')}
            >
              <Settings className="h-4 w-4 mr-2 text-slate-700" />
              Account Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              My Account
            </CardTitle>
            <CardDescription className="text-slate-600">
              Your customer account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm font-semibold text-slate-800">Email:</span>
                <span className="text-sm text-slate-900 font-semibold">{user?.email || 'demo@customer.com'}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm font-semibold text-slate-800">Member Type:</span>
                <Badge className="capitalize bg-blue-100 text-blue-800 border-blue-200 font-medium px-3 py-1">
                  {user?.role || 'customer'} - Standard
                </Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-sm font-semibold text-slate-800">Account Status:</span>
                <Badge className="bg-green-100 text-green-800 border-green-200 font-medium px-3 py-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active Member
                </Badge>
              </div>
            </div>
            <Separator className="my-4" />
            <Button className="w-full border-slate-300 hover:bg-slate-50 text-slate-900 font-medium" variant="outline">
              <CreditCard className="h-4 w-4 mr-2 text-slate-700" />
              Payment Methods
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Customer Activity */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-slate-600">
            Your recent shopping activity and recommendations
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
                <p className="text-sm text-blue-800 mt-1">Start browsing our curated product collection.</p>
                <p className="text-xs text-blue-700 mt-2 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              <Badge className="bg-blue-600 text-white">Welcome</Badge>
            </div>
            
            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex-1">
                <p className="font-semibold text-green-900 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Reward Points Available
                </p>
                <p className="text-sm text-green-800 mt-1">You have {customerStats.rewardPoints} points ready to use on your next purchase.</p>
                <p className="text-xs text-green-700 mt-2">Expires in 6 months</p>
              </div>
              <Badge className="bg-green-600 text-white">Rewards</Badge>
            </div>

            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex-1">
                <p className="font-semibold text-purple-900 flex items-center">
                  <Gift className="h-4 w-4 mr-2" />
                  Special Offers
                </p>
                <p className="text-sm text-purple-800 mt-1">Check out our latest deals and exclusive customer offers.</p>
                <p className="text-xs text-purple-700 mt-2">Updated daily</p>
              </div>
              <Badge className="bg-purple-600 text-white">Offers</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}