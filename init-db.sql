-- Finmark Database Schema Initialization
-- Hybrid Microservices with Shared Data Layer Architecture

-- Create schemas for each service
CREATE SCHEMA IF NOT EXISTS user_schema;
CREATE SCHEMA IF NOT EXISTS product_schema;
CREATE SCHEMA IF NOT EXISTS cart_schema;
CREATE SCHEMA IF NOT EXISTS order_schema;
CREATE SCHEMA IF NOT EXISTS notification_schema;
CREATE SCHEMA IF NOT EXISTS admin_schema;
CREATE SCHEMA IF NOT EXISTS analytics_schema;
CREATE SCHEMA IF NOT EXISTS shared_schema;

-- Set search path to include all schemas
ALTER DATABASE finmark_ecommerce SET search_path TO user_schema,product_schema,cart_schema,order_schema,notification_schema,admin_schema,analytics_schema,shared_schema,public;

-- User Schema Tables
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

CREATE TABLE IF NOT EXISTS user_schema.user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_schema.users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

CREATE TABLE IF NOT EXISTS user_schema.user_2fa (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_schema.users(id) ON DELETE CASCADE,
    secret VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    backup_codes TEXT[], -- JSON array of backup codes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enabled_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_schema.login_attempts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    failure_reason VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS user_schema.password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_schema.users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_schema.security_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_schema.users(id),
    event_type VARCHAR(100) NOT NULL, -- 'login', 'failed_login', 'password_change', 'account_locked', etc.
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Schema Tables
CREATE TABLE IF NOT EXISTS product_schema.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES product_schema.categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_schema.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES product_schema.categories(id),
    image_url VARCHAR(500),
    sku VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_id INTEGER DEFAULT 1
);

-- Cart Schema Tables
CREATE TABLE IF NOT EXISTS cart_schema.carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_schema.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_schema.cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES cart_schema.carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product_schema.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Schema Tables
CREATE TABLE IF NOT EXISTS order_schema.orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_schema.users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_schema.order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES order_schema.orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product_schema.products(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    product_name VARCHAR(255) NOT NULL
);

-- Analytics Schema Tables
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON user_schema.users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON product_schema.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON product_schema.products(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_schema.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON order_schema.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_schema.events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_schema.events(user_id);

-- New indexes for security and performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_schema.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_schema.user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON user_schema.user_2fa(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON user_schema.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON user_schema.login_attempts(ip_address, attempted_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON user_schema.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON user_schema.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON user_schema.security_events(event_type);

-- Insert default data
-- Password for admin@finmarksolutions.ph is 'Admin123!'
-- Password for demo@finmarksolutions.ph is 'Customer123!'
INSERT INTO user_schema.users (email, password_hash, first_name, last_name, role)
VALUES
  ('admin@finmarksolutions.ph', '$2a$12$6kuBq9It2mdnkSEgQ9EtVOWAHEBepJFZ0ulX4/ntyi2totea9.Iui', 'Admin', 'User', 'admin'),
  ('demo@finmarksolutions.ph', '$2a$12$4q0s1TOOKEKyjYhqWSXNYuysmUNnP8XDiDd8HYk1JitnK3ibGmKsq', 'Demo', 'User', 'customer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO product_schema.categories (name, description) 
VALUES ('Electronics', 'Electronic devices and accessories'),
       ('Clothing', 'Apparel and fashion items'),
       ('Home & Garden', 'Home improvement and garden supplies')
ON CONFLICT DO NOTHING;

-- Update triggers for updated_at fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON user_schema.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON product_schema.products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();