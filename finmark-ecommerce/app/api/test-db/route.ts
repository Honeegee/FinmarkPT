import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connection test:', result.rows[0]);

    // Check if Google OAuth columns exist
    const schemaCheck = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'user_schema' 
      AND table_name = 'users' 
      AND column_name IN ('google_id', 'profile_picture', 'name')
      ORDER BY column_name
    `);

    // Check if password_hash is nullable
    const passwordCheck = await query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'user_schema' 
      AND table_name = 'users' 
      AND column_name = 'password_hash'
    `);

    return NextResponse.json({
      success: true,
      database_time: result.rows[0],
      oauth_columns: schemaCheck.rows,
      password_nullable: passwordCheck.rows[0]?.is_nullable === 'YES',
      message: 'Database connection and schema check completed'
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}