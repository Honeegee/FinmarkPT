import { Pool, PoolClient } from 'pg';

// Support both DATABASE_URL (for cloud deployments) and individual config
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'finmark_ecommerce',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
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
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export { pool };