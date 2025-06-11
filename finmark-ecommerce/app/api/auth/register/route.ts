import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { hashPassword, validatePassword, validateEmail, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, clientId = 1 } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Password validation failed', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM user_schema.users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO user_schema.users (email, password_hash, first_name, last_name, email_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, passwordHash, firstName, lastName, false]
    );

    const newUser = result.rows[0];

    // Generate tokens
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      clientId: clientId
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Log analytics event
    await query(
      `INSERT INTO analytics_schema.events (client_id, user_id, event_type, event_data)
       VALUES ($1, $2, $3, $4)`,
      [1, newUser.id, 'user_registered', { email, firstName, lastName }]
    );

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        emailVerified: false
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}