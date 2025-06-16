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

    // For prototype: Check if mock 2FA is enabled
    // In a real app, this would query the database
    const mockEnabled = typeof window !== 'undefined'
      ? localStorage.getItem('mock-2fa-enabled') === 'true'
      : false;

    return NextResponse.json({
      enabled: mockEnabled,
      setupDate: mockEnabled ? new Date().toISOString() : null,
      enabledDate: mockEnabled ? new Date().toISOString() : null
    });
  } catch (error) {
    console.error('2FA status check error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}