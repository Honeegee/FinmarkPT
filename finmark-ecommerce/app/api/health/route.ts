import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    service: 'FinMark E-commerce Frontend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: [
      'Next.js 15',
      'TypeScript',
      'Tailwind CSS',
      'Radix UI Components',
      'JWT Authentication',
      'Shopping Cart',
      'Product Management',
      'User Dashboard'
    ]
  });
}