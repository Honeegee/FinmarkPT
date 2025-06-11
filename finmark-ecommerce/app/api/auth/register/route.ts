import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { hashPassword, validatePassword, validateEmail, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateRegistrationForm, sanitizeInput, formatValidationErrors } from '@/lib/validation';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get client IP from request
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddr) {
    return remoteAddr;
  }
  return 'unknown';
}

export async function POST(request: NextRequest) {
  let requestBody: any = null;
  
  try {
    // Parse request body with enhanced error handling
    try {
      const rawBody = await request.text();
      if (!rawBody || rawBody.trim() === '') {
        return NextResponse.json(
          {
            error: 'Request body is required',
            details: 'Please provide registration data in the request body',
            code: 'EMPTY_REQUEST_BODY'
          },
          { status: 400 }
        );
      }
      
      requestBody = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON format',
          details: 'Request body must be valid JSON',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    // Sanitize input data
    const sanitizedBody = sanitizeInput(requestBody);
    const { email, password, firstName, lastName, clientId = 1 } = sanitizedBody;

    // Comprehensive validation
    const validation = validateRegistrationForm(sanitizedBody);
    
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation),
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Additional security checks
    if (typeof clientId !== 'number' || clientId < 1) {
      return NextResponse.json(
        {
          error: 'Invalid client ID',
          details: 'Client ID must be a positive number',
          code: 'INVALID_CLIENT_ID'
        },
        { status: 400 }
      );
    }

    // Additional password validation using existing auth lib
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: 'Password validation failed',
          details: passwordValidation.errors,
          code: 'PASSWORD_VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Check if user already exists with enhanced error handling
    let existingUser;
    try {
      existingUser = await query(
        'SELECT id FROM user_schema.users WHERE email = $1',
        [email.toLowerCase().trim()]
      );
    } catch (dbError) {
      console.error('Database query error during registration:', dbError);
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: 'Unable to check existing users at this time',
          code: 'DATABASE_ERROR'
        },
        { status: 503 }
      );
    }

    if (existingUser && existingUser.rows && existingUser.rows.length > 0) {
      // Log potential duplicate registration attempt
      console.warn(`Duplicate registration attempt for email: ${email} from IP: ${getClientIP(request)}`);
      
      return NextResponse.json(
        {
          error: 'User already exists',
          details: 'An account with this email address already exists',
          code: 'USER_EXISTS'
        },
        { status: 409 }
      );
    }

    // Hash password with error handling
    let passwordHash;
    try {
      passwordHash = await hashPassword(password);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return NextResponse.json(
        {
          error: 'Password processing failed',
          details: 'Unable to process password securely',
          code: 'HASH_ERROR'
        },
        { status: 500 }
      );
    }

    // Create user with enhanced error handling
    let result;
    try {
      result = await query(
        `INSERT INTO user_schema.users (email, password_hash, first_name, last_name, email_verified)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, first_name, last_name, role, created_at`,
        [email.toLowerCase().trim(), passwordHash, firstName.trim(), lastName.trim(), false]
      );
    } catch (dbError) {
      console.error('Database insert error during registration:', dbError);
      
      // Handle specific database errors
      if (dbError && typeof dbError === 'object' && 'code' in dbError && dbError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          {
            error: 'User already exists',
            details: 'An account with this email address already exists',
            code: 'DUPLICATE_USER'
          },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Registration failed',
          details: 'Unable to create user account at this time',
          code: 'USER_CREATION_ERROR'
        },
        { status: 500 }
      );
    }

    if (!result || !result.rows || result.rows.length === 0) {
      return NextResponse.json(
        {
          error: 'Registration failed',
          details: 'User creation did not return expected result',
          code: 'INCOMPLETE_REGISTRATION'
        },
        { status: 500 }
      );
    }

    const newUser = result.rows[0];

    // Generate tokens with error handling
    let accessToken, refreshToken;
    try {
      const tokenPayload = {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role || 'user',
        clientId: clientId
      };

      accessToken = generateAccessToken(tokenPayload);
      refreshToken = generateRefreshToken(tokenPayload);
    } catch (tokenError) {
      console.error('Token generation error during registration:', tokenError);
      return NextResponse.json(
        {
          error: 'Token generation failed',
          details: 'Unable to create authentication tokens',
          code: 'TOKEN_GENERATION_ERROR'
        },
        { status: 500 }
      );
    }

    // Log analytics event with error handling
    try {
      await query(
        `INSERT INTO analytics_schema.events (client_id, user_id, event_type, event_data)
         VALUES ($1, $2, $3, $4)`,
        [clientId, newUser.id, 'user_registered', {
          email: email.toLowerCase().trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent') || 'unknown',
          ip: getClientIP(request)
        }]
      );
    } catch (analyticsError) {
      // Log the error but don't fail the registration
      console.warn('Failed to log registration analytics event:', analyticsError);
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name || '',
        lastName: newUser.last_name || '',
        role: newUser.role || 'user',
        emailVerified: false,
        createdAt: newUser.created_at
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected registration error:', error);
    
    // Provide different error messages based on error type
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: 'Request body contains invalid JSON',
          code: 'SYNTAX_ERROR'
        },
        { status: 400 }
      );
    }
    
    if (error instanceof TypeError) {
      return NextResponse.json(
        {
          error: 'Invalid data type',
          details: 'One or more fields contain invalid data types',
          code: 'TYPE_ERROR'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: 'An unexpected error occurred during registration',
        code: 'INTERNAL_ERROR',
        requestId: `register_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      { status: 500 }
    );
  }
}