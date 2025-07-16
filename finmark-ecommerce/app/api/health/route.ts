import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth, testDatabaseConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('Health check endpoint called');
    
    // Test basic connection first
    const connectionTest = await testDatabaseConnection();
    console.log('Connection test result:', connectionTest);
    
    // Then test with a query
    const dbHealth = await checkDatabaseHealth();
    console.log('Database health result:', dbHealth);
    
    const healthStatus = {
      status: dbHealth.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: connectionTest.connected,
        queryable: dbHealth.healthy,
        connectionError: connectionTest.error || null,
        queryError: dbHealth.error || null,
        errorCode: dbHealth.code || connectionTest.code || null
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDbHost: !!process.env.DB_HOST,
        hasDbName: !!process.env.DB_NAME,
        hasDbUser: !!process.env.DB_USER,
        hasDbPassword: !!process.env.DB_PASSWORD,
        databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'not set'
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
        queryable: false,
        error: 'Health check failed'
      }
    }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}