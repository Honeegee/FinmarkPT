import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/database';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/login?error=oauth_error`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/login?error=missing_code`);
    }

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/login?error=no_email`);
    }

    // Check if user exists in database
    let user;
    try {
      const existingUser = await query(
        'SELECT * FROM user_schema.users WHERE email = $1 OR google_id = $2',
        [email, googleId]
      );

      if (existingUser.rows.length > 0) {
        // Update existing user with Google ID if not set
        user = existingUser.rows[0];
        if (!user.google_id) {
          await query(
            'UPDATE user_schema.users SET google_id = $1, profile_picture = $2, name = $3 WHERE id = $4',
            [googleId, picture, name, user.id]
          );
          user.google_id = googleId;
          user.profile_picture = picture;
          user.name = name;
        }
      } else {
        // Create new user
        const newUser = await query(
          `INSERT INTO user_schema.users (email, name, google_id, profile_picture, email_verified, created_at, updated_at)
           VALUES ($1, $2, $3, $4, true, NOW(), NOW())
           RETURNING *`,
          [email, name, googleId, picture]
        );
        user = newUser.rows[0];
      }
    } catch (dbError) {
      console.error('Database error during OAuth:', dbError);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/login?error=database_error`);
    }

    // Generate JWT tokens using auth utilities for consistency
    const { generateAccessToken, generateRefreshToken } = await import('@/lib/auth');
    
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'customer',
      clientId: 1, // Default client ID for OAuth users
      name: user.name,
      profilePicture: user.profile_picture
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Create response with redirect
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/google/success`);
    
    // Set secure HTTP-only cookies with consistent expiration times
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes (matches ACCESS_TOKEN_EXPIRES_IN)
      path: '/'
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours (matches REFRESH_TOKEN_EXPIRES_IN)
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/login?error=oauth_callback_error`);
  }
}