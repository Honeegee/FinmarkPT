import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Add Google OAuth columns to users table
    await query(`
      ALTER TABLE user_schema.users 
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500),
      ADD COLUMN IF NOT EXISTS name VARCHAR(200)
    `);

    // Create index for Google ID lookups
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON user_schema.users(google_id)
    `);

    // Update existing users to have a name field based on first_name and last_name
    await query(`
      UPDATE user_schema.users 
      SET name = CONCAT(first_name, ' ', last_name) 
      WHERE name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL)
    `);

    // Make password_hash nullable for OAuth users
    await query(`
      ALTER TABLE user_schema.users 
      ALTER COLUMN password_hash DROP NOT NULL
    `);

    return NextResponse.json({
      success: true,
      message: 'Google OAuth migration completed successfully'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}