import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    const healthStatus = {
      status: dbHealth.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbHealth.healthy,
        error: dbHealth.error || null
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDbHost: !!process.env.DB_HOST,
        hasDbName: !!process.env.DB_NAME,
        hasDbUser: !!process.env.DB_USER,
        hasDbPassword: !!process.env.DB_PASSWORD
      }
    };

    const statusCode = dbHealth.healthy ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false,
        error: 'Health check failed'
      }
    }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}