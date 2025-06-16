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

    // For prototype: Check custom header for localStorage state
    const localStorageState = request.headers.get('x-2fa-local-state');
    const enabled = localStorageState === 'true';
    
    const status = {
      enabled: enabled,
      setupDate: enabled ? new Date().toISOString() : null,
      enabledDate: enabled ? new Date().toISOString() : null
    };
    
    console.log('🔐 2FA status returned:', status, 'localStorage state:', localStorageState);
    return NextResponse.json(status);
  } catch (error) {
    console.error('🔐 2FA status check error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}