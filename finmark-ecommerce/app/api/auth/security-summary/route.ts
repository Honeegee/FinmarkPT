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

      // Check 2FA status
      let twoFactorStatus: {
        enabled: boolean;
        setupDate: string | null;
        enabledDate: string | null;
      } = {
        enabled: false,
        setupDate: null,
        enabledDate: null
      };

      try {
        const twoFactorResult = await query(
          'SELECT is_enabled, created_at, enabled_at FROM user_schema.user_2fa WHERE user_id = $1',
          [authData.userId]
        );

        if (twoFactorResult.rows && twoFactorResult.rows.length > 0) {
          const twoFactor = twoFactorResult.rows[0];
          twoFactorStatus = {
            enabled: Boolean(twoFactor.is_enabled),
            setupDate: twoFactor.created_at,
            enabledDate: twoFactor.enabled_at
          };
        }
      } catch (twoFactorError) {
        console.warn('Could not fetch 2FA status:', twoFactorError);
      }

      // Get recent login attempts
      let recentLogins: Array<{
        ipAddress: string;
        userAgent: string;
        timestamp: string;
        success: boolean;
      }> = [];

      try {
        const loginResult = await query(
          'SELECT ip_address, user_agent, attempted_at, success FROM user_schema.login_attempts WHERE email = $1 ORDER BY attempted_at DESC LIMIT 5',
          [user.email]
        );

        if (loginResult.rows) {
          recentLogins = loginResult.rows.map(login => ({
            ipAddress: login.ip_address,
            userAgent: login.user_agent,
            timestamp: login.attempted_at,
            success: Boolean(login.success)
          }));
        }
      } catch (loginError) {
        console.warn('Could not fetch recent login attempts:', loginError);
      }

      // Get security events
      let securityEvents: Array<{
        type: string;
        ipAddress: string;
        userAgent: string;
        timestamp: string;
      }> = [];

      try {
        const eventsResult = await query(
          'SELECT event_type, ip_address, user_agent, created_at FROM user_schema.security_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
          [authData.userId]
        );

        if (eventsResult.rows) {
          securityEvents = eventsResult.rows.map(event => ({
            type: event.event_type,
            ipAddress: event.ip_address,
            userAgent: event.user_agent,
            timestamp: event.created_at
          }));
        }
      } catch (eventsError) {
        console.warn('Could not fetch security events:', eventsError);
      }

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
          recentLogins: recentLogins,
          securityEvents: securityEvents
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