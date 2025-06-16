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

    // Get user's 2FA status and security information
    try {
      const userResult = await query(
        'SELECT id, email, first_name, last_name, role, created_at FROM user_schema.users WHERE id = $1',
        [authData.userId]
      );

      if (!userResult.rows || userResult.rows.length === 0) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      const user = userResult.rows[0];

      // For prototype: Use mock data since database tables don't exist yet
      let twoFactorStatus: {
        enabled: boolean;
        setupDate: string | null;
        enabledDate: string | null;
      } = {
        enabled: false,
        setupDate: null,
        enabledDate: null
      };

      // Mock recent login attempts for prototype
      let recentLogins: Array<{
        ipAddress: string;
        userAgent: string;
        timestamp: string;
        success: boolean;
      }> = [
        {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          success: true
        },
        {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          success: true
        }
      ];

      // Mock security events for prototype
      let securityEvents: Array<{
        type: string;
        ipAddress: string;
        userAgent: string;
        timestamp: string;
      }> = [
        {
          type: 'login',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          type: 'password_change',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        }
      ];

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          role: user.role,
          accountCreated: user.created_at
        },
        security: {
          twoFactor: twoFactorStatus,
          recentLogins: recentLogins || [],
          securityEvents: securityEvents || []
        }
      });

    } catch (dbError) {
      console.error('Database error during security summary fetch:', dbError);
      return NextResponse.json(
        { message: 'Database error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Security summary error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}