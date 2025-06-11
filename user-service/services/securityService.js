const { query } = require('../config/database');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class SecurityService {
  // Log security events
  static async logSecurityEvent(userId, eventType, ipAddress, userAgent, metadata = {}) {
    try {
      await query(
        `INSERT INTO user_schema.security_events (user_id, event_type, ip_address, user_agent, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, eventType, ipAddress, userAgent, JSON.stringify(metadata)]
      );
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // Generate password reset token
  static async generatePasswordResetToken(userId) {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await query(
        `INSERT INTO user_schema.password_reset_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [userId, token, expiresAt]
      );

      return token;
    } catch (error) {
      console.error('Error generating password reset token:', error);
      throw new Error('Failed to generate reset token');
    }
  }

  // Verify password reset token
  static async verifyPasswordResetToken(token) {
    try {
      const result = await query(
        `SELECT user_id, expires_at, used 
         FROM user_schema.password_reset_tokens 
         WHERE token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        return { valid: false, error: 'Invalid token' };
      }

      const { user_id, expires_at, used } = result.rows[0];

      if (used) {
        return { valid: false, error: 'Token already used' };
      }

      if (new Date() > new Date(expires_at)) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, userId: user_id };
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      return { valid: false, error: 'Verification failed' };
    }
  }

  // Mark password reset token as used
  static async markTokenAsUsed(token) {
    try {
      await query(
        'UPDATE user_schema.password_reset_tokens SET used = true WHERE token = $1',
        [token]
      );
    } catch (error) {
      console.error('Error marking token as used:', error);
    }
  }

  // Clean up expired tokens
  static async cleanupExpiredTokens() {
    try {
      await query(
        'DELETE FROM user_schema.password_reset_tokens WHERE expires_at < NOW()',
        []
      );
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  // Get user security summary
  static async getUserSecuritySummary(userId) {
    try {
      const [user2FA, recentEvents, loginAttempts] = await Promise.all([
        // Check 2FA status
        query(
          'SELECT is_enabled FROM user_schema.user_2fa WHERE user_id = $1',
          [userId]
        ),
        // Get recent security events
        query(
          `SELECT event_type, ip_address, created_at, metadata 
           FROM user_schema.security_events 
           WHERE user_id = $1 
           ORDER BY created_at DESC 
           LIMIT 10`,
          [userId]
        ),
        // Get recent login attempts
        query(
          `SELECT success, ip_address, attempted_at, failure_reason
           FROM user_schema.login_attempts la
           JOIN user_schema.users u ON la.email = u.email
           WHERE u.id = $1
           ORDER BY attempted_at DESC
           LIMIT 10`,
          [userId]
        )
      ]);

      return {
        twoFactorEnabled: user2FA.rows.length > 0 && user2FA.rows[0].is_enabled,
        recentEvents: recentEvents.rows,
        recentLoginAttempts: loginAttempts.rows
      };
    } catch (error) {
      console.error('Error getting user security summary:', error);
      throw new Error('Failed to get security summary');
    }
  }

  // Detect anomalous login patterns
  static async detectAnomalousLogin(userId, ipAddress, userAgent) {
    try {
      // Get user's typical login patterns
      const result = await query(
        `SELECT DISTINCT ip_address, user_agent
         FROM user_schema.login_attempts la
         JOIN user_schema.users u ON la.email = u.email
         WHERE u.id = $1 AND success = true AND attempted_at > NOW() - INTERVAL '30 days'`,
        [userId]
      );

      const knownIPs = result.rows.map(row => row.ip_address);
      const knownUserAgents = result.rows.map(row => row.user_agent);

      const flags = [];

      // Check for new IP address
      if (!knownIPs.includes(ipAddress)) {
        flags.push('new_ip_address');
      }

      // Check for new user agent (simplified check)
      const similarUserAgent = knownUserAgents.some(ua => 
        ua && userAgent && ua.substring(0, 50) === userAgent.substring(0, 50)
      );
      
      if (!similarUserAgent && knownUserAgents.length > 0) {
        flags.push('new_user_agent');
      }

      // Check for multiple rapid login attempts
      const recentAttempts = await query(
        `SELECT COUNT(*) as count
         FROM user_schema.login_attempts la
         JOIN user_schema.users u ON la.email = u.email
         WHERE u.id = $1 AND attempted_at > NOW() - INTERVAL '5 minutes'`,
        [userId]
      );

      if (parseInt(recentAttempts.rows[0].count) > 3) {
        flags.push('rapid_attempts');
      }

      return {
        isAnomalous: flags.length > 0,
        flags: flags,
        riskScore: this.calculateRiskScore(flags)
      };
    } catch (error) {
      console.error('Error detecting anomalous login:', error);
      return { isAnomalous: false, flags: [], riskScore: 0 };
    }
  }

  // Calculate risk score based on flags
  static calculateRiskScore(flags) {
    const riskWeights = {
      'new_ip_address': 30,
      'new_user_agent': 20,
      'rapid_attempts': 40,
      'geo_anomaly': 50,
      'time_anomaly': 25
    };

    return flags.reduce((score, flag) => score + (riskWeights[flag] || 10), 0);
  }

  // Check if account should be locked
  static async checkAccountLockStatus(email) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const result = await query(
        `SELECT COUNT(*) as attempt_count,
                MAX(attempted_at) as last_attempt
         FROM user_schema.login_attempts 
         WHERE email = $1 AND success = false AND attempted_at > $2`,
        [email, oneHourAgo]
      );

      const attemptCount = parseInt(result.rows[0].attempt_count);
      const lastAttempt = result.rows[0].last_attempt;

      return {
        isLocked: attemptCount >= 10,
        attemptCount: attemptCount,
        lastAttempt: lastAttempt,
        lockoutEnds: attemptCount >= 10 ? new Date(Date.now() + 60 * 60 * 1000) : null
      };
    } catch (error) {
      console.error('Error checking account lock status:', error);
      return { isLocked: false, attemptCount: 0 };
    }
  }

  // Generate session fingerprint
  static generateSessionFingerprint(req) {
    const components = [
      req.ip,
      req.get('User-Agent') || '',
      req.get('Accept-Language') || '',
      req.get('Accept-Encoding') || ''
    ];

    return crypto
      .createHash('sha256')
      .update(components.join('|'))
      .digest('hex');
  }

  // Validate session fingerprint
  static validateSessionFingerprint(req, storedFingerprint) {
    const currentFingerprint = this.generateSessionFingerprint(req);
    return currentFingerprint === storedFingerprint;
  }

  // Get security recommendations for user
  static async getSecurityRecommendations(userId) {
    try {
      const summary = await this.getUserSecuritySummary(userId);
      const recommendations = [];

      if (!summary.twoFactorEnabled) {
        recommendations.push({
          type: 'enable_2fa',
          priority: 'high',
          message: 'Enable two-factor authentication for enhanced security'
        });
      }

      // Check for recent failed login attempts
      const recentFailures = summary.recentLoginAttempts.filter(
        attempt => !attempt.success && 
        new Date() - new Date(attempt.attempted_at) < 24 * 60 * 60 * 1000
      );

      if (recentFailures.length > 0) {
        recommendations.push({
          type: 'review_activity',
          priority: 'medium',
          message: `${recentFailures.length} failed login attempt(s) in the last 24 hours`
        });
      }

      // Check for logins from new locations
      const newLocationEvents = summary.recentEvents.filter(
        event => event.event_type === 'login' && 
        event.metadata && JSON.parse(event.metadata).flags?.includes('new_ip_address')
      );

      if (newLocationEvents.length > 0) {
        recommendations.push({
          type: 'review_locations',
          priority: 'medium',
          message: 'Recent logins from new locations detected'
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting security recommendations:', error);
      return [];
    }
  }
}

// Run cleanup tasks periodically
setInterval(() => {
  SecurityService.cleanupExpiredTokens();
}, 60 * 60 * 1000); // Every hour

module.exports = SecurityService;