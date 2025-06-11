import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyPassword, validateEmail, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { validateLoginForm, sanitizeInput, formatValidationErrors } from '@/lib/validation';

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
    // Parse request body with error handling
    try {
      const rawBody = await request.text();
      if (!rawBody || rawBody.trim() === '') {
        return NextResponse.json(
          {
            error: 'Request body is required',
            details: 'Please provide login credentials in the request body',
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
    const { email, password, clientId = 1, twoFactorCode, backupCode } = sanitizedBody;

    // Comprehensive validation
    const validation = validateLoginForm(sanitizedBody);
    
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

    // Find user with enhanced error handling
    let result;
    try {
      result = await query(
        `SELECT id, email, password_hash, first_name, last_name, role, email_verified, 1 as client_id
         FROM user_schema.users
         WHERE email = $1`,
        [email.toLowerCase().trim()]
      );
    } catch (dbError) {
      console.error('Database query error during login:', dbError);
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: 'Unable to verify credentials at this time',
          code: 'DATABASE_ERROR'
        },
        { status: 503 }
      );
    }

    if (!result || !result.rows || result.rows.length === 0) {
      // Log failed login attempt for security monitoring
      console.warn(`Failed login attempt for email: ${email} from IP: ${getClientIP(request)}`);
      
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          details: 'Email or password is incorrect',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify password with enhanced error handling
    let passwordValid = false;
    try {
      passwordValid = await verifyPassword(password, user.password_hash);
    } catch (verifyError) {
      console.error('Password verification error:', verifyError);
      return NextResponse.json(
        {
          error: 'Authentication service unavailable',
          details: 'Unable to verify password at this time',
          code: 'AUTH_SERVICE_ERROR'
        },
        { status: 503 }
      );
    }

    if (!passwordValid) {
      // Log failed login attempt for security monitoring
      console.warn(`Failed password verification for user ID: ${user.id} from IP: ${getClientIP(request)}`);
      
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          details: 'Email or password is incorrect',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Generate tokens with error handling
    let accessToken, refreshToken;
    try {
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        clientId: user.client_id
      };

      accessToken = generateAccessToken(tokenPayload);
      refreshToken = generateRefreshToken(tokenPayload);
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
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
        [clientId, user.id, 'user_login', {
          email: email.toLowerCase().trim(),
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent') || 'unknown',
          ip: getClientIP(request)
        }]
      );
    } catch (analyticsError) {
      // Log the error but don't fail the login
      console.warn('Failed to log analytics event:', analyticsError);
    }

    // Update last login timestamp with error handling
    try {
      await query(
        'UPDATE user_schema.users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    } catch (updateError) {
      // Log the error but don't fail the login
      console.warn('Failed to update last login timestamp:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        role: user.role || 'user',
        emailVerified: Boolean(user.email_verified)
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Unexpected login error:', error);
    
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
        details: 'An unexpected error occurred during login',
        code: 'INTERNAL_ERROR',
        requestId: `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      { status: 500 }
    );
  }
}