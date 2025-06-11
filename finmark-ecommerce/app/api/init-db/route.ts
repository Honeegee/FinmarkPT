import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Test database connection and check if schemas exist
    const result = await query('SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE \'%_schema\'');
    
    return NextResponse.json({
      message: 'Database connection successful',
      schemas: result.rows.map(row => row.schema_name),
      status: 'ready'
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: 'Database connection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}