import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Check if database is already initialized by looking for our specific schemas
    const schemaCheck = await query(`
      SELECT schema_name FROM information_schema.schemata
      WHERE schema_name IN ('user_schema', 'product_schema', 'analytics_schema')
    `);
    
    if (schemaCheck.rows.length >= 3) {
      return NextResponse.json({
        message: 'Database already initialized',
        schemas: schemaCheck.rows.map(row => row.schema_name),
        status: 'ready'
      });
    }

    // Initialize database schema
    console.log('Initializing database schema...');
    
    // Create schemas
    await query('CREATE SCHEMA IF NOT EXISTS user_schema;');
    await query('CREATE SCHEMA IF NOT EXISTS product_schema;');
    await query('CREATE SCHEMA IF NOT EXISTS cart_schema;');
    await query('CREATE SCHEMA IF NOT EXISTS order_schema;');
    await query('CREATE SCHEMA IF NOT EXISTS notification_schema;');
    await query('CREATE SCHEMA IF NOT EXISTS admin_schema;');
    await query('CREATE SCHEMA IF NOT EXISTS analytics_schema;');
    await query('CREATE SCHEMA IF NOT EXISTS shared_schema;');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS user_schema.users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'customer',
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create analytics events table
    await query(`
      CREATE TABLE IF NOT EXISTS analytics_schema.events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES user_schema.users(id),
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB,
        session_id VARCHAR(255),
        ip_address INET,
        user_agent TEXT,
        client_id INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON user_schema.users(email);');
    await query('CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_schema.events(event_type);');
    await query('CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_schema.events(user_id);');

    // Insert default users
    await query(`
      INSERT INTO user_schema.users (email, password_hash, first_name, last_name, role)
      VALUES
        ('admin@finmarksolutions.ph', '$2a$12$6kuBq9It2mdnkSEgQ9EtVOWAHEBepJFZ0ulX4/ntyi2totea9.Iui', 'Admin', 'User', 'admin'),
        ('demo@finmarksolutions.ph', '$2a$12$4q0s1TOOKEKyjYhqWSXNYuysmUNnP8XDiDd8HYk1JitnK3ibGmKsq', 'Demo', 'User', 'customer')
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('Database schema initialized successfully');

    return NextResponse.json({
      message: 'Database initialized successfully',
      status: 'initialized'
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Database initialization failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}