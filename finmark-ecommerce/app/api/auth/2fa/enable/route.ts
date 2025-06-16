import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log('🔐 2FA Enable endpoint called');
  
  try {
    const authData = getAuthFromRequest(request);
    console.log('🔐 Auth data:', authData ? 'Valid' : 'Invalid');
    
    if (!authData) {
      console.log('🔐 No auth data, returning 401');
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = body;
    console.log('🔐 Received token:', token);

    if (!token || token.length !== 6) {
      console.log('🔐 Invalid token length or missing token');
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // For prototype: Accept any 6-digit code
    // In a real app, this would verify the TOTP code against the secret
    const mockBackupCodes = [
      'ABC123', 'DEF456', 'GHI789', 'JKL012',
      'MNO345', 'PQR678', 'STU901', 'VWX234'
    ];

    console.log('🔐 2FA enabled successfully for user:', authData.userId);
    return NextResponse.json({
      message: '2FA enabled successfully (Demo Mode)',
      backupCodes: mockBackupCodes
    });
  } catch (error) {
    console.error('🔐 2FA enable error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}