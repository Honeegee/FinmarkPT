import { Pool, PoolClient } from 'pg';

// Log database configuration for debugging
console.log('Database configuration:', {
  hasDatabaseUrl: !!process.env.DATABASE_URL,
  hasDbHost: !!process.env.DB_HOST,
  dbHost: process.env.DB_HOST ? process.env.DB_HOST.substring(0, 20) + '...' : 'not set',
  dbName: process.env.DB_NAME || 'not set',
  dbUser: process.env.DB_USER || 'not set',
  nodeEnv: process.env.NODE_ENV
});

// Support both DATABASE_URL (for cloud deployments) and individual config
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000, // Increased to 15s for better reliability
        statement_timeout: 30000,
        query_timeout: 30000,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'finmark_ecommerce',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
        statement_timeout: 30000,
        query_timeout: 30000,
      }
);

// Set schema search path for all connections
pool.on('connect', (client: PoolClient) => {
  client.query('SET search_path TO product_schema,analytics_schema,user_schema,order_schema,cart_schema,notification_schema,admin_schema,shared_schema,public');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

export async function query(text: string, params?: any[], retries = 3) {
  let client;
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      client = await pool.connect();
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Database query error (attempt ${attempt}/${retries}):`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error && 'code' in error ? error.code : 'unknown',
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        params: params ? params.length : 0
      });
      
      // If it's a DNS resolution error, don't retry immediately
      if (error instanceof Error && error.message.includes('ENOTFOUND')) {
        console.error('DNS resolution failed - database host not found');
        if (attempt < retries) {
          console.log(`Waiting 5 seconds before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } else if (attempt < retries) {
        // For other errors, wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  
  throw lastError;
}

// Add a health check function with detailed diagnostics
export async function checkDatabaseHealth() {
  try {
    console.log('Checking database health...');
    const result = await query('SELECT 1 as health_check', [], 1); // Only 1 retry for health check
    console.log('Database health check passed');
    return { healthy: true, result: result.rows[0] };
  } catch (error) {
    console.error('Database health check failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : 'unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : 'unknown'
    };
  }
}

// Add a function to test database connectivity without queries
export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    return { connected: true };
  } catch (error) {
    console.error('Database connection test failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : 'unknown'
    });
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : 'unknown'
    };
  }
}

export { pool };