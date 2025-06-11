// Enhanced error handling utilities for user service
const { logSecurityEvent } = require('../services/securityService');

/**
 * Check if value is null or undefined
 */
function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

/**
 * Check if value is effectively empty
 */
function isEmpty(value) {
  if (isNullOrUndefined(value)) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Validate request body structure with comprehensive null checks
 */
function validateRequestBody(body, requiredFields = []) {
  const errors = [];
  
  // Explicit null/undefined checks for body
  if (body === null) {
    return {
      isValid: false,
      errors: ['Request body cannot be null']
    };
  }
  
  if (body === undefined) {
    return {
      isValid: false,
      errors: ['Request body is required and cannot be undefined']
    };
  }
  
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object']
    };
  }
  
  // Check for required fields with null validation
  for (const field of requiredFields) {
    if (body[field] === null) {
      errors.push(`${field} cannot be null`);
    } else if (body[field] === undefined) {
      errors.push(`${field} is required and cannot be undefined`);
    } else if (!body[field]) {
      errors.push(`${field} is required`);
    } else if (typeof body[field] === 'string' && body[field].trim() === '') {
      errors.push(`${field} cannot be empty`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize input data
 */
function sanitizeInput(data) {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'string') {
    return data.trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Enhanced email validation with null checks
 */
function validateEmail(email) {
  const errors = [];
  
  // Explicit null/undefined checks
  if (email === null) {
    errors.push('Email cannot be null');
    return { isValid: false, errors };
  }
  
  if (email === undefined) {
    errors.push('Email is required and cannot be undefined');
    return { isValid: false, errors };
  }
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  if (typeof email !== 'string') {
    errors.push(`Email must be a string, received ${typeof email}`);
    return { isValid: false, errors };
  }
  
  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    errors.push('Email cannot be empty');
    return { isValid: false, errors };
  }
  
  if (trimmedEmail.length > 254) {
    errors.push('Email address is too long');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.push('Invalid email format');
  }
  
  return { 
    isValid: errors.length === 0, 
    errors,
    sanitized: trimmedEmail.toLowerCase()
  };
}

/**
 * Enhanced name validation with null checks
 */
function validateName(name, fieldName) {
  const errors = [];
  
  // Explicit null/undefined checks
  if (name === null) {
    errors.push(`${fieldName} cannot be null`);
    return { isValid: false, errors };
  }
  
  if (name === undefined) {
    errors.push(`${fieldName} is required and cannot be undefined`);
    return { isValid: false, errors };
  }
  
  if (!name) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }
  
  if (typeof name !== 'string') {
    errors.push(`${fieldName} must be a string, received ${typeof name}`);
    return { isValid: false, errors };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    errors.push(`${fieldName} cannot be empty`);
    return { isValid: false, errors };
  }
  
  if (trimmedName.length < 2) {
    errors.push(`${fieldName} must be at least 2 characters long`);
  }
  
  if (trimmedName.length > 50) {
    errors.push(`${fieldName} is too long (maximum 50 characters)`);
  }
  
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }
  
  return { 
    isValid: errors.length === 0, 
    errors,
    sanitized: trimmedName
  };
}

/**
 * Get client IP from request
 */
function getClientIP(req) {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
}

/**
 * Enhanced error response formatter
 */
function formatErrorResponse(error, code = null, statusCode = 500) {
  const response = {
    success: false,
    error: error.message || error,
    timestamp: new Date().toISOString()
  };
  
  if (code) {
    response.code = code;
  }
  
  // Add request ID for tracking
  response.requestId = `${code || 'error'}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  return { response, statusCode };
}

/**
 * Database error handler
 */
function handleDatabaseError(error, operation = 'database operation') {
  console.error(`Database error during ${operation}:`, error);
  
  // Handle specific PostgreSQL errors
  if (error.code === '23505') {
    return formatErrorResponse('Resource already exists', 'DUPLICATE_RESOURCE', 409);
  }
  
  if (error.code === '23503') {
    return formatErrorResponse('Referenced resource not found', 'FOREIGN_KEY_VIOLATION', 400);
  }
  
  if (error.code === '23502') {
    return formatErrorResponse('Required field is missing', 'NOT_NULL_VIOLATION', 400);
  }
  
  if (error.code === '42P01') {
    return formatErrorResponse('Database table not found', 'TABLE_NOT_FOUND', 500);
  }
  
  if (error.code === '28P01') {
    return formatErrorResponse('Database authentication failed', 'DB_AUTH_FAILED', 500);
  }
  
  // Connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return formatErrorResponse('Database connection failed', 'DB_CONNECTION_ERROR', 503);
  }
  
  // Generic database error
  return formatErrorResponse('Database operation failed', 'DATABASE_ERROR', 500);
}

/**
 * Async error wrapper for route handlers
 */
function asyncErrorHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware
 */
function globalErrorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);
  
  // Log security event for unexpected errors
  if (req.user?.id) {
    logSecurityEvent(
      req.user.id,
      'unexpected_error',
      getClientIP(req),
      req.get('User-Agent') || 'unknown',
      { error: err.message, stack: err.stack }
    ).catch(logError => {
      console.error('Failed to log security event:', logError);
    });
  }
  
  // Handle different error types
  if (err.name === 'ValidationError') {
    return res.status(400).json(formatErrorResponse(err.message, 'VALIDATION_ERROR', 400).response);
  }
  
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json(formatErrorResponse('Authentication failed', 'AUTH_ERROR', 401).response);
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(formatErrorResponse('Token expired', 'TOKEN_EXPIRED', 401).response);
  }
  
  if (err.code && err.code.startsWith('23')) {
    const dbError = handleDatabaseError(err);
    return res.status(dbError.statusCode).json(dbError.response);
  }
  
  // Generic server error
  const genericError = formatErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  res.status(500).json(genericError.response);
}

/**
 * Rate limiting error handler
 */
function handleRateLimitError(req, res) {
  const error = formatErrorResponse(
    'Too many requests. Please try again later.',
    'RATE_LIMIT_EXCEEDED',
    429
  );
  
  res.status(429).json({
    ...error.response,
    retryAfter: '60 seconds'
  });
}

module.exports = {
  validateRequestBody,
  sanitizeInput,
  validateEmail,
  validateName,
  getClientIP,
  formatErrorResponse,
  handleDatabaseError,
  asyncErrorHandler,
  globalErrorHandler,
  handleRateLimitError
};