import { Pool, PoolClient } from 'pg';

// Support both DATABASE_URL (for cloud deployments) and individual config
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased from 2s to 10s for Render
        statement_timeout: 30000, // 30 second statement timeout
        query_timeout: 30000, // 30 second query timeout
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'finmark_ecommerce',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased timeout
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

export async function query(text: string, params?: any[]) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      params: params ? params.length : 0
    });
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Add a health check function
export async function checkDatabaseHealth() {
  try {
    const result = await query('SELECT 1 as health_check');
    return { healthy: true, result: result.rows[0] };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export { pool };