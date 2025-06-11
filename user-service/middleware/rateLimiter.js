const rateLimit = require('express-rate-limit');
const { query } = require('../config/database');

// In-memory store for rate limiting (in production, use Redis)
const attemptStore = new Map();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [key, data] of attemptStore) {
    if (now - data.firstAttempt > oneHour) {
      attemptStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 5, // limit each IP to 5 requests per windowMs
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    keyGenerator = (req) => req.ip
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    skipSuccessfulRequests,
    keyGenerator,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Specific rate limiters
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour
  message: 'Too many registration attempts, please try again later'
});

const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later'
});

// Account lockout mechanism
const checkAccountLockout = async (req, res, next) => {
  try {
    const { email } = req.body;
    const ip = req.ip;
    
    if (!email) {
      return next();
    }

    // Check failed login attempts in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const result = await query(
      `SELECT COUNT(*) as attempt_count 
       FROM user_schema.login_attempts 
       WHERE email = $1 AND success = false AND attempted_at > $2`,
      [email, oneHourAgo]
    );

    const attemptCount = parseInt(result.rows[0].attempt_count);
    
    // Lock account after 10 failed attempts
    if (attemptCount >= 10) {
      // Log security event
      await query(
        `INSERT INTO user_schema.security_events (user_id, event_type, ip_address, user_agent, metadata)
         SELECT u.id, 'account_locked', $1, $2, $3
         FROM user_schema.users u WHERE u.email = $4`,
        [ip, req.get('User-Agent'), JSON.stringify({ reason: 'too_many_failed_attempts', attempt_count: attemptCount }), email]
      );

      return res.status(423).json({
        error: 'Account temporarily locked due to too many failed attempts',
        lockoutTime: '1 hour'
      });
    }

    next();
  } catch (error) {
    console.error('Account lockout check error:', error);
    next(); // Don't block on error
  }
};

// Log login attempts
const logLoginAttempt = async (email, success, ip, userAgent, failureReason = null) => {
  try {
    await query(
      `INSERT INTO user_schema.login_attempts (email, ip_address, user_agent, success, failure_reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [email, ip, userAgent, success, failureReason]
    );
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

// Suspicious activity detection
const detectSuspiciousActivity = async (req, res, next) => {
  try {
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    const now = Date.now();
    const key = `${ip}:${userAgent}`;
    
    if (!attemptStore.has(key)) {
      attemptStore.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return next();
    }

    const data = attemptStore.get(key);
    data.count++;
    data.lastAttempt = now;

    // Flag as suspicious if more than 20 requests in 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    if (data.count > 20 && (now - data.firstAttempt) < fiveMinutes) {
      // Log suspicious activity
      await query(
        `INSERT INTO user_schema.security_events (event_type, ip_address, user_agent, metadata)
         VALUES ($1, $2, $3, $4)`,
        ['suspicious_activity', ip, userAgent, JSON.stringify({ 
          request_count: data.count, 
          time_window: '5_minutes',
          endpoint: req.path 
        })]
      );

      return res.status(429).json({
        error: 'Suspicious activity detected. Please try again later.',
        retryAfter: 300 // 5 minutes
      });
    }

    next();
  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    next(); // Don't block on error
  }
};

module.exports = {
  createRateLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  checkAccountLockout,
  logLoginAttempt,
  detectSuspiciousActivity
};