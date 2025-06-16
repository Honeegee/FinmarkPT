import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const authData = getAuthFromRequest(request);
    
    if (!authData) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check 2FA status for the authenticated user
    try {
      const result = await query(
        'SELECT is_enabled, created_at, enabled_at FROM user_schema.user_2fa WHERE user_id = $1',
        [authData.userId]
      );

      if (result.rows && result.rows.length > 0) {
        const twoFactor = result.rows[0];
        return NextResponse.json({
          enabled: Boolean(twoFactor.is_enabled),
          setupDate: twoFactor.created_at,
          enabledDate: twoFactor.enabled_at
        });
      } else {
        // No 2FA setup found
        return NextResponse.json({
          enabled: false,
          setupDate: null,
          enabledDate: null
        });
      }
    } catch (dbError) {
      console.error('Database error during 2FA status check:', dbError);
      return NextResponse.json(
        { message: 'Database error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('2FA status check error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}