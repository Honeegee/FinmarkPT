require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const { pool } = require('./config/database');
const { createRateLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Global rate limiting
const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api', globalLimiter);

// Test database connection with retry logic
const connectWithRetry = () => {
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.error('Database connection error:', err);
      console.log('Retrying database connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('Connected to PostgreSQL database at:', result.rows[0].now);
      startServer();
    }
  });
};

const startServer = () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 User Service running on port ${PORT}`);
    console.log(`🔒 Security features: Enhanced`);
    console.log(`🛡️  Rate limiting: Active`);
    console.log(`🔐 2FA support: Available`);
    console.log(`📊 Monitoring: Enabled`);
  });
};

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'User Service',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'JWT Authentication',
      'Two-Factor Authentication (TOTP)',
      'Rate Limiting',
      'Account Lockout Protection',
      'Security Event Logging',
      'Password Reset',
      'Session Management',
      'Anomaly Detection'
    ]
  });
});

// Security status endpoint
app.get('/api/security/status', (req, res) => {
  res.json({
    security: {
      helmet: 'enabled',
      cors: 'configured',
      rateLimiting: 'active',
      twoFactorAuth: 'available',
      sessionSecurity: 'enhanced',
      anomalyDetection: 'active'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(err.status || 500).json({
    error: message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

// Start the connection process
connectWithRetry();
