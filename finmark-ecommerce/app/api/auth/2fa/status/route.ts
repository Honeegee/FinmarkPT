import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  console.log('🔐 2FA Status endpoint called');
  
  try {
    const authData = getAuthFromRequest(request);
    console.log('🔐 Auth data:', authData ? `Valid (User: ${authData.userId})` : 'Invalid');
    
    if (!authData) {
      console.log('🔐 No auth data, returning 401');
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // For prototype: Always return false initially
    // The frontend will handle enabling via localStorage
    // In a real app, this would query the database for user's 2FA status
    const status = {
      enabled: false,
      setupDate: null,
      enabledDate: null
    };
    
    console.log('🔐 2FA status returned:', status);
    return NextResponse.json(status);
  } catch (error) {
    console.error('🔐 2FA status check error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}