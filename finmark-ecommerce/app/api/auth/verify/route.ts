import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const authData = getAuthFromRequest(request);
    
    if (!authData) {
      return NextResponse.json(
        { message: 'No valid token provided' },
        { status: 401 }
      );
    }

    // Fetch user data from database to ensure it's current
    try {
      const result = await query(
        'SELECT id, email, first_name, last_name, role FROM user_schema.users WHERE id = $1',
        [authData.userId]
      );

      if (!result.rows || result.rows.length === 0) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 401 }
        );
      }

      const user = result.rows[0];
      
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          role: user.role || 'customer'
        }
      });
    } catch (dbError) {
      console.error('Database error during token verification:', dbError);
      return NextResponse.json(
        { message: 'Database error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}