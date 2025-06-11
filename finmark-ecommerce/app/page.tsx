'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  BarChart3,
  ShoppingCart,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Menu,
  X
} from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // Mock user state
  const [totalItems, setTotalItems] = useState(0); // Mock cart state
  const router = useRouter();

  // Mock initialization
  useEffect(() => {
    console.log('Component initialized');
  }, []);

  const handleLoginClick = () => {
    router.push('/auth/login');
  };

  const handleGetStartedClick = () => {
    router.push('/auth/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Finmark Corporation</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#products" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Products
              </a>
              <a href="#analytics" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Analytics
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                About
              </a>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Button variant="outline" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart
                      {totalItems > 0 && (
                        <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs bg-blue-600 text-white border-blue-600">
                          {totalItems}
                        </Badge>
                      )}
                    </Button>
                  </div>
                  <Button size="sm">
                    Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleLoginClick}>Login</Button>
                  <Button size="sm" onClick={handleGetStartedClick}>Get Started</Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-200 pt-4">
              <div className="flex flex-col space-y-3">
                <a href="#products" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Products
                </a>
                <a href="#analytics" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Analytics
                </a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  About
                </a>
                
                {user ? (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart ({totalItems})
                    </Button>
                    <Button size="sm" className="w-full">Dashboard</Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={handleLoginClick}>Login</Button>
                    <Button size="sm" className="w-full" onClick={handleGetStartedClick}>Get Started</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 px-4 py-2 text-sm bg-blue-100 text-blue-800 border-blue-200">
            🇵🇭 Leading E-commerce Solutions in the Philippines
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Empowering SMEs with 
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}Data-Driven
            </span> E-commerce
          </h1>
          
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Finmark Corporation delivers cutting-edge e-commerce platforms with built-in business intelligence, 
            marketing analytics, and financial insights to help your business thrive in the digital economy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group px-8 py-3" onClick={handleGetStartedClick}>
              Start Your Platform
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3">
              View Solutions
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="products" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Complete E-commerce Solution
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Everything you need to build, manage, and scale your online business with data-driven insights.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Business Analytics</CardTitle>
              <CardDescription>
                Real-time dashboards and insights to track your business performance and make data-driven decisions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>E-commerce Platform</CardTitle>
              <CardDescription>
                Full-featured online store with inventory management, payment processing, and customer management.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Marketing Intelligence</CardTitle>
              <CardDescription>
                Advanced analytics to optimize your marketing campaigns and improve customer acquisition.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Multi-Tenant Architecture</CardTitle>
              <CardDescription>
                Secure, scalable platform supporting multiple clients with isolated data and customizable features.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
            <CardHeader>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Enterprise Security</CardTitle>
              <CardDescription>
                Bank-grade security with JWT authentication, data encryption, and compliance with industry standards.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-cyan-500">
            <CardHeader>
              <div className="h-12 w-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-cyan-600" />
              </div>
              <CardTitle>High Performance</CardTitle>
              <CardDescription>
                Optimized for speed and scalability to handle high traffic and large product catalogs efficiently.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section id="analytics" className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Businesses Across the Philippines
            </h2>
            <p className="text-lg text-gray-300">
              Our platform powers success stories nationwide
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
                <div className="text-gray-300">SME Clients Served</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-green-400 mb-2">₱2.5B+</div>
                <div className="text-gray-300">Revenue Analyzed</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
                <div className="text-gray-300">Platform Uptime</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-orange-400 mb-2">10+</div>
                <div className="text-gray-300">Years Experience</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="about" className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-gray-700">
              Contact Finmark Corporation today to discuss your e-commerce needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Speak with our experts about your e-commerce platform requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-800">123 Makati Avenue, Makati City, Manila, Philippines</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-800">+63 2 1234 5678</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-800">info@finmarksolutions.ph</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-800">www.finmarksolutions.ph</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
                <CardDescription>
                  Comprehensive solutions for modern businesses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-800">
                  <li>• Business Intelligence & Analytics</li>
                  <li>• E-commerce Platform Development</li>
                  <li>• Marketing Analytics & Insights</li>
                  <li>• Financial Analysis & Planning</li>
                  <li>• Data Migration & Integration</li>
                  <li>• Business Strategy Consulting</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={handleGetStartedClick} className="px-8 py-3">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/')}>
              <Building2 className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold text-white">Finmark Corporation</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 Finmark Corporation. All rights reserved. | Leading E-commerce Solutions in the Philippines
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}