import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyPassword, validateEmail, generateAccessToken, generateRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, clientId = 1 } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user
    const result = await query(
      `SELECT id, email, password_hash, first_name, last_name, role, email_verified, 1 as client_id
       FROM user_schema.users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      clientId: user.client_id
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Log analytics event
    await query(
      `INSERT INTO analytics_schema.events (client_id, user_id, event_type, event_data)
       VALUES ($1, $2, $3, $4)`,
      [1, user.id, 'user_login', { email, timestamp: new Date().toISOString() }]
    );

    // Update last login timestamp
    await query(
      'UPDATE user_schema.users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        emailVerified: user.email_verified
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}