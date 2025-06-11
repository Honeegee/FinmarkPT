// Enhanced validation utilities for robust error handling
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FieldValidation {
  field: string;
  value: any;
  isValid: boolean;
  error?: string;
}

// Email validation with detailed error messages
export function validateEmailDetailed(email: any): ValidationResult {
  const errors: string[] = [];
  
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
    errors.push('Email cannot be empty or contain only whitespace');
    return { isValid: false, errors };
  }
  
  if (trimmedEmail.length > 254) {
    errors.push('Email address is too long (maximum 254 characters)');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.push('Email format is invalid');
  }
  
  // Additional email format checks
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    errors.push('Email must contain exactly one @ symbol');
  } else {
    const [localPart, domainPart] = parts;
    
    if (localPart.length === 0) {
      errors.push('Email local part cannot be empty');
    } else if (localPart.length > 64) {
      errors.push('Email local part is too long (maximum 64 characters)');
    }
    
    if (domainPart.length === 0) {
      errors.push('Email domain cannot be empty');
    } else if (domainPart.length > 253) {
      errors.push('Email domain is too long (maximum 253 characters)');
    }
    
    if (domainPart.includes('..')) {
      errors.push('Email domain cannot contain consecutive dots');
    }
  }
  
  return { 
    isValid: errors.length === 0, 
    errors,
    warnings: trimmedEmail !== email ? ['Email contained leading/trailing whitespace that was trimmed'] : undefined
  };
}

// Enhanced password validation
export function validatePasswordDetailed(password: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Explicit null/undefined checks
  if (password === null) {
    errors.push('Password cannot be null');
    return { isValid: false, errors };
  }
  
  if (password === undefined) {
    errors.push('Password is required and cannot be undefined');
    return { isValid: false, errors };
  }
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (typeof password !== 'string') {
    errors.push(`Password must be a string, received ${typeof password}`);
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password is too long (maximum 128 characters)');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak patterns
  const commonPasswords = ['password', '12345678', 'qwertyui', 'password123'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    warnings.push('Password contains common patterns that may be easily guessed');
  }
  
  // Check for repeated characters
  if (/(.)\1{3,}/.test(password)) {
    warnings.push('Password contains repeated characters which may reduce security');
  }
  
  return { 
    isValid: errors.length === 0, 
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// Name validation
export function validateName(name: any, fieldName: string = 'Name'): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
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
    errors.push(`${fieldName} cannot be empty or contain only whitespace`);
    return { isValid: false, errors };
  }
  
  if (trimmedName.length < 2) {
    errors.push(`${fieldName} must be at least 2 characters long`);
  }
  
  if (trimmedName.length > 50) {
    errors.push(`${fieldName} is too long (maximum 50 characters)`);
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }
  
  // Check for suspicious patterns
  if (/^\s|\s$/.test(name)) {
    warnings.push(`${fieldName} had leading or trailing whitespace that was trimmed`);
  }
  
  if (/\s{2,}/.test(trimmedName)) {
    warnings.push(`${fieldName} contains multiple consecutive spaces`);
  }
  
  return { 
    isValid: errors.length === 0, 
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// Comprehensive form validation
export function validateRegistrationForm(data: any): {
  isValid: boolean;
  fieldValidations: FieldValidation[];
  generalErrors: string[];
} {
  const fieldValidations: FieldValidation[] = [];
  const generalErrors: string[] = [];
  
  // Validate required fields exist
  const requiredFields = ['email', 'password', 'firstName', 'lastName'];
  const missingFields = requiredFields.filter(field => !data || !data[field]);
  
  if (missingFields.length > 0) {
    generalErrors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Validate each field if present
  if (data) {
    // Email validation
    const emailValidation = validateEmailDetailed(data.email);
    fieldValidations.push({
      field: 'email',
      value: data.email,
      isValid: emailValidation.isValid,
      error: emailValidation.errors.join(', ')
    });
    
    // Password validation
    const passwordValidation = validatePasswordDetailed(data.password);
    fieldValidations.push({
      field: 'password',
      value: data.password ? '[HIDDEN]' : null,
      isValid: passwordValidation.isValid,
      error: passwordValidation.errors.join(', ')
    });
    
    // First name validation
    const firstNameValidation = validateName(data.firstName, 'First name');
    fieldValidations.push({
      field: 'firstName',
      value: data.firstName,
      isValid: firstNameValidation.isValid,
      error: firstNameValidation.errors.join(', ')
    });
    
    // Last name validation
    const lastNameValidation = validateName(data.lastName, 'Last name');
    fieldValidations.push({
      field: 'lastName',
      value: data.lastName,
      isValid: lastNameValidation.isValid,
      error: lastNameValidation.errors.join(', ')
    });
  }
  
  const isValid = generalErrors.length === 0 && fieldValidations.every(v => v.isValid);
  
  return {
    isValid,
    fieldValidations,
    generalErrors
  };
}

// Comprehensive login form validation
export function validateLoginForm(data: any): {
  isValid: boolean;
  fieldValidations: FieldValidation[];
  generalErrors: string[];
} {
  const fieldValidations: FieldValidation[] = [];
  const generalErrors: string[] = [];
  
  // Check if data exists and is an object
  if (!data || typeof data !== 'object') {
    generalErrors.push('Invalid request data format');
    return { isValid: false, fieldValidations, generalErrors };
  }
  
  // Validate required fields exist
  const requiredFields = ['email', 'password'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    generalErrors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Email validation
  const emailValidation = validateEmailDetailed(data.email);
  fieldValidations.push({
    field: 'email',
    value: data.email,
    isValid: emailValidation.isValid,
    error: emailValidation.errors.join(', ')
  });
  
  // Password validation (basic for login)
  const passwordErrors: string[] = [];
  if (!data.password) {
    passwordErrors.push('Password is required');
  } else if (typeof data.password !== 'string') {
    passwordErrors.push('Password must be a string');
  } else if (data.password.length === 0) {
    passwordErrors.push('Password cannot be empty');
  }
  
  fieldValidations.push({
    field: 'password',
    value: data.password ? '[HIDDEN]' : null,
    isValid: passwordErrors.length === 0,
    error: passwordErrors.join(', ')
  });
  
  const isValid = generalErrors.length === 0 && fieldValidations.every(v => v.isValid);
  
  return {
    isValid,
    fieldValidations,
    generalErrors
  };
}

// Null/undefined validation utility
export function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined;
}

// Check if value is effectively empty (null, undefined, empty string, only whitespace)
export function isEmpty(value: any): boolean {
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

// Enhanced null-safe sanitization
export function sanitizeInput(data: any): any {
  // Preserve null and undefined explicitly
  if (data === null) {
    return null;
  }
  
  if (data === undefined) {
    return undefined;
  }
  
  if (typeof data === 'string') {
    return data.trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

// Strict null validation for critical fields
export function validateNotNull(value: any, fieldName: string): ValidationResult {
  const errors: string[] = [];
  
  if (value === null) {
    errors.push(`${fieldName} cannot be null`);
  }
  
  if (value === undefined) {
    errors.push(`${fieldName} cannot be undefined`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Comprehensive field validation with null checks
export function validateField(value: any, fieldName: string, options: {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  allowNull?: boolean;
  allowEmpty?: boolean;
} = {}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const {
    required = false,
    type,
    minLength,
    maxLength,
    allowNull = false,
    allowEmpty = false
  } = options;
  
  // Null/undefined checks
  if (value === null) {
    if (!allowNull) {
      errors.push(`${fieldName} cannot be null`);
      return { isValid: false, errors };
    }
    return { isValid: true, errors: [] }; // Allow null if explicitly permitted
  }
  
  if (value === undefined) {
    if (required) {
      errors.push(`${fieldName} is required and cannot be undefined`);
      return { isValid: false, errors };
    }
    return { isValid: true, errors: [] }; // Allow undefined if not required
  }
  
  // Required field check
  if (required && isEmpty(value)) {
    errors.push(`${fieldName} is required and cannot be empty`);
    return { isValid: false, errors };
  }
  
  // Empty value check
  if (!allowEmpty && isEmpty(value)) {
    errors.push(`${fieldName} cannot be empty`);
    return { isValid: false, errors };
  }
  
  // Type validation
  if (type && typeof value !== type) {
    errors.push(`${fieldName} must be of type ${type}, received ${typeof value}`);
    return { isValid: false, errors };
  }
  
  // String-specific validations
  if (typeof value === 'string') {
    if (minLength !== undefined && value.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters long`);
    }
    
    if (maxLength !== undefined && value.length > maxLength) {
      errors.push(`${fieldName} must be no more than ${maxLength} characters long`);
    }
    
    // Warning for whitespace-only strings
    if (value.trim() !== value) {
      warnings.push(`${fieldName} contained leading or trailing whitespace that was trimmed`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// Error response formatter
export function formatValidationErrors(validation: { fieldValidations: FieldValidation[]; generalErrors: string[] }) {
  const errors: Record<string, string[]> = {};
  
  // Add field-specific errors
  validation.fieldValidations.forEach(field => {
    if (!field.isValid && field.error) {
      errors[field.field] = field.error.split(', ');
    }
  });
  
  // Add general errors
  if (validation.generalErrors.length > 0) {
    errors.general = validation.generalErrors;
  }
  
  return errors;
}