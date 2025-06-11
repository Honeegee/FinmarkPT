'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Building2, Eye, EyeOff, Loader2, Check, X, AlertCircle } from "lucide-react";

interface PasswordValidation {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Password validation
  const getPasswordValidation = (password: string): PasswordValidation => ({
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  });

  const passwordValidation = getPasswordValidation(formData.password);
  const validationCount = Object.values(passwordValidation).filter(Boolean).length;
  const progressPercentage = (validationCount / 5) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!Object.values(passwordValidation).every(Boolean)) {
      setError('Password does not meet security requirements');
      setLoading(false);
      return;
    }

    // Simulate registration process
    setTimeout(() => {
      // Store registered user data in localStorage (in a real app, this would be sent to your API)
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const newUser = {
        id: Date.now().toString(), // Simple ID generation
        email: formData.email,
        password: formData.password, // In a real app, this would be hashed
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'customer'
      };
      
      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      
      setSuccess(`Account created successfully! Welcome ${formData.firstName} ${formData.lastName} to Finmark.`);
      setLoading(false);
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span>Finmark</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Create your account to get started
          </p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-900">Join Finmark</CardTitle>
            <CardDescription>
              Start your journey with our e-commerce platform
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <Card className="border-slate-200 bg-slate-50">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Password strength</span>
                          <span className={`font-medium ${
                            progressPercentage === 100 ? 'text-green-600' : 
                            progressPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {progressPercentage === 100 ? 'Strong' : 
                             progressPercentage >= 60 ? 'Medium' : 'Weak'}
                          </span>
                        </div>
                        
                        <Progress 
                          value={progressPercentage} 
                          className={`h-2 ${
                            progressPercentage === 100 ? '[&>div]:bg-green-500' : 
                            progressPercentage >= 60 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                          }`}
                        />
                        
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className={`flex items-center space-x-1 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                            {passwordValidation.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>8+ characters</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-red-600'}`}>
                            {passwordValidation.hasUpper ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>Uppercase</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${passwordValidation.hasLower ? 'text-green-600' : 'text-red-600'}`}>
                            {passwordValidation.hasLower ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>Lowercase</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                            {passwordValidation.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>Number</span>
                          </div>
                          <div className={`flex items-center space-x-1 col-span-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-600'}`}>
                            {passwordValidation.hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>Special character (!@#$%^&*)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <X className="h-3 w-3 mr-1" />
                    Passwords do not match
                  </p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <Check className="h-3 w-3 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>

              <Button 
                type="submit"
                disabled={loading || !Object.values(passwordValidation).every(Boolean) || formData.password !== formData.confirmPassword}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600">Already have an account? </span>
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>© 2024 Finmark Corporation. All rights reserved.</p>
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}