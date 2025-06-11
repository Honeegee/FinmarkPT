const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const TwoFactorAuth = require('../services/twoFactorAuth');
const SecurityService = require('../services/securityService');
const { logLoginAttempt } = require('../middleware/rateLimiter');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        message: 'All fields are required',
        required: ['email', 'password', 'firstName', 'lastName']
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      // Log security event for attempted duplicate registration
      await SecurityService.logSecurityEvent(
        null, 
        'duplicate_registration_attempt', 
        req.ip, 
        req.get('User-Agent'),
        { email: email }
      );
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await User.saveRefreshToken(
      user.id, 
      tokens.refreshToken, 
      expiresAt, 
      req.ip, 
      req.get('User-Agent')
    );

    // Log security event
    await SecurityService.logSecurityEvent(
      user.id, 
      'user_registered', 
      req.ip, 
      req.get('User-Agent')
    );

    // Log successful registration attempt
    await logLoginAttempt(email, true, req.ip, req.get('User-Agent'));

    res.status(201).json({
      message: 'User registered successfully',
      tokens: tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorCode, backupCode } = req.body;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');

    // Validation
    if (!email || !password) {
      await logLoginAttempt(email, false, ip, userAgent, 'missing_credentials');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      await logLoginAttempt(email, false, ip, userAgent, 'user_not_found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    const lockStatus = await SecurityService.checkAccountLockStatus(email);
    if (lockStatus.isLocked) {
      await SecurityService.logSecurityEvent(
        user.id, 
        'login_attempt_while_locked', 
        ip, 
        userAgent
      );
      return res.status(423).json({ 
        message: 'Account temporarily locked due to too many failed attempts',
        lockoutEnds: lockStatus.lockoutEnds
      });
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      await logLoginAttempt(email, false, ip, userAgent, 'invalid_password');
      await SecurityService.logSecurityEvent(
        user.id, 
        'failed_login', 
        ip, 
        userAgent,
        { reason: 'invalid_password' }
      );
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      await logLoginAttempt(email, false, ip, userAgent, 'account_inactive');
      return res.status(400).json({ message: 'Account is inactive' });
    }

    // Check 2FA if enabled
    const is2FAEnabled = await TwoFactorAuth.is2FAEnabled(user.id);
    
    if (is2FAEnabled) {
      let twoFactorValid = false;

      if (twoFactorCode) {
        const verification = await TwoFactorAuth.verifyToken(user.id, twoFactorCode);
        twoFactorValid = verification.valid;
      } else if (backupCode) {
        const verification = await TwoFactorAuth.verifyBackupCode(user.id, backupCode);
        twoFactorValid = verification.valid;
      }

      if (!twoFactorValid) {
        await logLoginAttempt(email, false, ip, userAgent, 'invalid_2fa');
        await SecurityService.logSecurityEvent(
          user.id, 
          'failed_2fa', 
          ip, 
          userAgent
        );
        return res.status(400).json({ 
          message: 'Two-factor authentication required',
          requires2FA: true 
        });
      }
    }

    // Detect anomalous login patterns
    const anomalyDetection = await SecurityService.detectAnomalousLogin(user.id, ip, userAgent);
    
    // Generate tokens
    const tokens = generateTokens(user.id);

    // Save refresh token with session fingerprint
    const sessionFingerprint = SecurityService.generateSessionFingerprint(req);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await User.saveRefreshToken(user.id, tokens.refreshToken, expiresAt, ip, userAgent);

    // Log successful login
    await logLoginAttempt(email, true, ip, userAgent);
    await SecurityService.logSecurityEvent(
      user.id, 
      'login', 
      ip, 
      userAgent,
      { 
        anomaly_flags: anomalyDetection.flags,
        risk_score: anomalyDetection.riskScore,
        session_fingerprint: sessionFingerprint
      }
    );

    // Send response with anomaly warning if needed
    const response = {
      message: 'Login successful',
      tokens: tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    };

    if (anomalyDetection.isAnomalous && anomalyDetection.riskScore > 40) {
      response.securityWarning = {
        message: 'We noticed some unusual activity with your login',
        riskScore: anomalyDetection.riskScore,
        flags: anomalyDetection.flags
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Find user by refresh token
    const user = await User.findByRefreshToken(refreshToken);
    if (!user || user.id !== decoded.userId) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    // Update refresh token in database
    await User.deleteRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await User.saveRefreshToken(
      user.id, 
      tokens.refreshToken, 
      expiresAt, 
      req.ip, 
      req.get('User-Agent')
    );

    // Log security event
    await SecurityService.logSecurityEvent(
      user.id, 
      'token_refreshed', 
      req.ip, 
      req.get('User-Agent')
    );

    res.json({
      message: 'Token refreshed successfully',
      tokens: tokens
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    if (refreshToken) {
      await User.deleteRefreshToken(refreshToken);
    }

    if (userId) {
      await SecurityService.logSecurityEvent(
        userId, 
        'logout', 
        req.ip, 
        req.get('User-Agent')
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    res.json({
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Token verification failed' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    // Verify current password
    const user = await User.findById(userId);
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      await SecurityService.logSecurityEvent(
        userId, 
        'password_change_failed', 
        req.ip, 
        req.get('User-Agent'),
        { reason: 'invalid_current_password' }
      );
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await user.update({ password_hash: hashedPassword });

    // Log security event
    await SecurityService.logSecurityEvent(
      userId, 
      'password_changed', 
      req.ip, 
      req.get('User-Agent')
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Password change failed' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If an account exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = await SecurityService.generatePasswordResetToken(user.id);

    // Log security event
    await SecurityService.logSecurityEvent(
      user.id, 
      'password_reset_requested', 
      req.ip, 
      req.get('User-Agent')
    );

    // In a real application, send email here
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ 
      message: 'If an account exists, a reset link has been sent',
      // Include token in development only
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Password reset request failed' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Verify token
    const verification = await SecurityService.verifyPasswordResetToken(token);
    if (!verification.valid) {
      return res.status(400).json({ message: verification.error });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    const user = await User.findById(verification.userId);
    await user.update({ password_hash: hashedPassword });

    // Mark token as used
    await SecurityService.markTokenAsUsed(token);

    // Log security event
    await SecurityService.logSecurityEvent(
      verification.userId, 
      'password_reset_completed', 
      req.ip, 
      req.get('User-Agent')
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};

exports.getSecuritySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [summary, recommendations] = await Promise.all([
      SecurityService.getUserSecuritySummary(userId),
      SecurityService.getSecurityRecommendations(userId)
    ]);

    res.json({
      security: summary,
      recommendations: recommendations
    });
  } catch (error) {
    console.error('Get security summary error:', error);
    res.status(500).json({ message: 'Failed to get security summary' });
  }
};
