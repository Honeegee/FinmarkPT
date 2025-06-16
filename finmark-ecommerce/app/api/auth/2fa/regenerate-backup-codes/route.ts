import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authData = getAuthFromRequest(request);
    
    if (!authData) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    // For prototype: Accept any password and generate mock backup codes
    // In a real app, this would verify the password and generate real backup codes
    const mockBackupCodes = [
      'NEW123', 'COD456', 'BAK789', 'UPC012',
      'GEN345', 'ERA678', 'TED901', 'ABC234'
    ];

    return NextResponse.json({
      message: 'Backup codes regenerated successfully (Demo Mode)',
      backupCodes: mockBackupCodes
    });
  } catch (error) {
    console.error('2FA regenerate backup codes error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}