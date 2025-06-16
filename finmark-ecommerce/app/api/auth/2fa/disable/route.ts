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

    // For prototype: Accept any password
    // In a real app, this would verify the password against the user's hash
    return NextResponse.json({
      message: '2FA disabled successfully (Demo Mode)'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}