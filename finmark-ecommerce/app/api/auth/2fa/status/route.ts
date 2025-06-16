import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authData = getAuthFromRequest(request);
    
    if (!authData) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // For prototype: Always return false initially
    // The frontend will handle enabling via localStorage
    // In a real app, this would query the database for user's 2FA status
    return NextResponse.json({
      enabled: false,
      setupDate: null,
      enabledDate: null
    });
  } catch (error) {
    console.error('2FA status check error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}