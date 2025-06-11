'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/layout/AppLayout";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  Package,
  CreditCard,
  Truck,
  Shield
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
}

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock cart data
  useEffect(() => {
    const mockCartItems: CartItem[] = [
      {
        id: '1',
        name: 'Premium Business Analytics Dashboard',
        price: 2999,
        quantity: 1,
        image: '/api/placeholder/100/100',
        description: 'Comprehensive analytics solution for SMEs'
      },
      {
        id: '2',
        name: 'E-commerce Platform License',
        price: 4999,
        quantity: 1,
        image: '/api/placeholder/100/100',
        description: 'Full-featured online store platform'
      },
      {
        id: '3',
        name: 'Marketing Intelligence Suite',
        price: 1999,
        quantity: 2,
        image: '/api/placeholder/100/100',
        description: 'Advanced marketing analytics tools'
      }
    ];
    setCartItems(mockCartItems);
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.12; // 12% VAT
  const shipping = subtotal > 5000 ? 0 : 299; // Free shipping over ₱5000
  const total = subtotal + tax + shipping;

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    setLoading(true);
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Checkout completed! (Demo Mode)');
    setCartItems([]);
    setLoading(false);
  };

  return (
    <AppLayout
      title="Shopping Cart 🛒"
      subtitle="Review your items and proceed to checkout"
      showBackButton={true}
      backButtonText="Continue Shopping"
      backButtonPath="/"
      badgeText="Cart"
      showUserActions={true}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingCart className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <CardTitle className="text-xl text-slate-600 mb-2">Your cart is empty</CardTitle>
                <CardDescription className="mb-6">
                  Looks like you haven't added any items to your cart yet.
                </CardDescription>
                <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
                  <Package className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                    Cart Items ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                      <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-400" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">₱{item.price.toLocaleString()}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {cartItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">₱{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax (12% VAT)</span>
                    <span className="font-medium">₱{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Free</Badge>
                      ) : (
                        `₱${shipping.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">₱{total.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Why Choose Finmark?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Secure Payments</p>
                  <p className="text-xs text-slate-600">Bank-grade encryption</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Fast Deployment</p>
                  <p className="text-xs text-slate-600">Setup within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Package className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Complete Solution</p>
                  <p className="text-xs text-slate-600">Everything you need included</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}