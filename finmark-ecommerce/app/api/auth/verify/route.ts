import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('Auth verification request received');
    
    const authData = getAuthFromRequest(request);
    console.log('Auth data from request:', authData ? 'Found' : 'Not found');
    
    if (!authData) {
      console.log('No valid token provided');
      return NextResponse.json(
        { message: 'No valid token provided' },
        { status: 401 }
      );
    }

    console.log('User ID from token:', authData.userId, 'Type:', typeof authData.userId);

    // Fetch user data from database to ensure it's current
    try {
      const result = await query(
        'SELECT id, email, first_name, last_name, name, role, profile_picture, google_id FROM user_schema.users WHERE id = $1',
        [authData.userId]
      );

      console.log('Database query result:', result.rows.length, 'rows found');
      console.log('Query executed with ID:', authData.userId);

      let user;
      if (!result.rows || result.rows.length === 0) {
        console.log('User not found in database for ID:', authData.userId);
        console.log('Attempting to find user by email as fallback...');
        
        // Fallback: try to find user by email (for OAuth users)
        const emailResult = await query(
          'SELECT id, email, first_name, last_name, name, role, profile_picture, google_id FROM user_schema.users WHERE email = $1',
          [authData.email]
        );
        
        if (emailResult.rows && emailResult.rows.length > 0) {
          console.log('User found by email fallback');
          user = emailResult.rows[0];
        } else {
          console.log('User not found by email either');
          return NextResponse.json(
            { message: 'User not found' },
            { status: 401 }
          );
        }
      } else {
        user = result.rows[0];
      }
      console.log('User found:', { id: user.id, email: user.email, name: user.name });
      
      // Handle both regular users (first_name/last_name) and OAuth users (name)
      const firstName = user.first_name || (user.name ? user.name.split(' ')[0] : '');
      const lastName = user.last_name || (user.name ? user.name.split(' ').slice(1).join(' ') : '');
      const displayName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
      
      const responseData = {
        user: {
          id: user.id,
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          name: displayName,
          role: user.role || 'customer',
          profilePicture: user.profile_picture || null
        }
      };
      
      console.log('Returning user data:', responseData);
      return NextResponse.json(responseData);
    } catch (dbError) {
      console.error('Database error during token verification:', dbError);
      return NextResponse.json(
        { message: 'Database error', details: dbError instanceof Error ? dbError.message : 'Unknown database error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}