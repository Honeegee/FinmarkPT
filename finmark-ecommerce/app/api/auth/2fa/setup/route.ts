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

    // For prototype: Return mock QR code and secret
    // In a real app, this would generate a real TOTP secret and QR code
    const mockSecret = 'DEMO2FASECRETKEY123456789ABCDEF';
    const mockQrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

    return NextResponse.json({
      qrCode: mockQrCode,
      manualEntryKey: mockSecret,
      message: '2FA setup initiated (Demo Mode)'
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}