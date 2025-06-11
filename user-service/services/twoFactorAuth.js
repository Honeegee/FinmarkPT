const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { query } = require('../config/database');
const crypto = require('crypto');

class TwoFactorAuthService {
  // Generate secret for new 2FA setup
  static async generateSecret(userId, userEmail) {
    try {
      const secret = speakeasy.generateSecret({
        name: `Finmark (${userEmail})`,
        issuer: 'Finmark Corporation',
        length: 32
      });

      // Store secret in database (not enabled yet)
      await query(
        `INSERT INTO user_schema.user_2fa (user_id, secret, is_enabled)
         VALUES ($1, $2, false)
         ON CONFLICT (user_id) 
         DO UPDATE SET secret = $2, is_enabled = false`,
        [userId, secret.base32]
      );

      return {
        secret: secret.base32,
        qrCodeUrl: secret.otpauth_url,
        manualEntryKey: secret.base32
      };
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      throw new Error('Failed to generate 2FA secret');
    }
  }

  // Generate QR code for 2FA setup
  static async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify TOTP token
  static async verifyToken(userId, token) {
    try {
      const result = await query(
        'SELECT secret, is_enabled FROM user_schema.user_2fa WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return { valid: false, error: '2FA not set up' };
      }

      const { secret } = result.rows[0];

      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow 1 step tolerance
      });

      return { valid: verified };
    } catch (error) {
      console.error('Error verifying 2FA token:', error);
      return { valid: false, error: 'Verification failed' };
    }
  }

  // Enable 2FA after successful verification
  static async enable2FA(userId, token) {
    try {
      // First verify the token
      const verification = await this.verifyToken(userId, token);
      
      if (!verification.valid) {
        return { success: false, error: 'Invalid verification code' };
      }

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Enable 2FA and store backup codes
      await query(
        `UPDATE user_schema.user_2fa 
         SET is_enabled = true, enabled_at = CURRENT_TIMESTAMP, backup_codes = $1
         WHERE user_id = $2`,
        [JSON.stringify(backupCodes), userId]
      );

      // Log security event
      await query(
        `INSERT INTO user_schema.security_events (user_id, event_type, metadata)
         VALUES ($1, '2fa_enabled', $2)`,
        [userId, JSON.stringify({ method: 'totp' })]
      );

      return {
        success: true,
        backupCodes: backupCodes
      };
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return { success: false, error: 'Failed to enable 2FA' };
    }
  }

  // Disable 2FA
  static async disable2FA(userId, password) {
    try {
      // In a real implementation, verify password here
      
      await query(
        `UPDATE user_schema.user_2fa 
         SET is_enabled = false, backup_codes = NULL
         WHERE user_id = $1`,
        [userId]
      );

      // Log security event
      await query(
        `INSERT INTO user_schema.security_events (user_id, event_type, metadata)
         VALUES ($1, '2fa_disabled', $2)`,
        [userId, JSON.stringify({ method: 'manual' })]
      );

      return { success: true };
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return { success: false, error: 'Failed to disable 2FA' };
    }
  }

  // Check if user has 2FA enabled
  static async is2FAEnabled(userId) {
    try {
      const result = await query(
        'SELECT is_enabled FROM user_schema.user_2fa WHERE user_id = $1',
        [userId]
      );

      return result.rows.length > 0 && result.rows[0].is_enabled;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  }

  // Verify backup code
  static async verifyBackupCode(userId, code) {
    try {
      const result = await query(
        'SELECT backup_codes FROM user_schema.user_2fa WHERE user_id = $1 AND is_enabled = true',
        [userId]
      );

      if (result.rows.length === 0) {
        return { valid: false, error: '2FA not enabled' };
      }

      const backupCodes = JSON.parse(result.rows[0].backup_codes || '[]');
      const codeIndex = backupCodes.indexOf(code);

      if (codeIndex === -1) {
        return { valid: false, error: 'Invalid backup code' };
      }

      // Remove used backup code
      backupCodes.splice(codeIndex, 1);
      
      await query(
        'UPDATE user_schema.user_2fa SET backup_codes = $1 WHERE user_id = $2',
        [JSON.stringify(backupCodes), userId]
      );

      // Log security event
      await query(
        `INSERT INTO user_schema.security_events (user_id, event_type, metadata)
         VALUES ($1, 'backup_code_used', $2)`,
        [userId, JSON.stringify({ remaining_codes: backupCodes.length })]
      );

      return { valid: true, remainingCodes: backupCodes.length };
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return { valid: false, error: 'Verification failed' };
    }
  }

  // Generate backup codes
  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Regenerate backup codes
  static async regenerateBackupCodes(userId) {
    try {
      const newCodes = this.generateBackupCodes();
      
      await query(
        'UPDATE user_schema.user_2fa SET backup_codes = $1 WHERE user_id = $2 AND is_enabled = true',
        [JSON.stringify(newCodes), userId]
      );

      // Log security event
      await query(
        `INSERT INTO user_schema.security_events (user_id, event_type, metadata)
         VALUES ($1, 'backup_codes_regenerated', $2)`,
        [userId, JSON.stringify({ code_count: newCodes.length })]
      );

      return { success: true, backupCodes: newCodes };
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      return { success: false, error: 'Failed to regenerate backup codes' };
    }
  }
}

module.exports = TwoFactorAuthService;