const TwoFactorAuth = require('../services/twoFactorAuth');
const SecurityService = require('../services/securityService');
const User = require('../models/User');

exports.setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Check if 2FA is already enabled
    const is2FAEnabled = await TwoFactorAuth.is2FAEnabled(userId);
    if (is2FAEnabled) {
      return res.status(400).json({ 
        message: '2FA is already enabled for this account'
      });
    }

    // Generate secret and QR code
    const setup = await TwoFactorAuth.generateSecret(userId, userEmail);
    const qrCode = await TwoFactorAuth.generateQRCode(setup.qrCodeUrl);

    // Log security event
    await SecurityService.logSecurityEvent(
      userId,
      '2fa_setup_initiated',
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      message: '2FA setup initiated',
      secret: setup.secret,
      qrCode: qrCode,
      manualEntryKey: setup.manualEntryKey,
      instructions: {
        step1: 'Install an authenticator app (Google Authenticator, Authy, etc.)',
        step2: 'Scan the QR code or enter the manual key',
        step3: 'Enter the 6-digit code from your app to complete setup'
      }
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: '2FA setup failed' });
  }
};

exports.enable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    // Verify token and enable 2FA
    const result = await TwoFactorAuth.enable2FA(userId, token);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({
      message: '2FA enabled successfully',
      backupCodes: result.backupCodes,
      warning: 'Store these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.'
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ message: 'Failed to enable 2FA' });
  }
};

exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to disable 2FA' });
    }

    // Verify user password
    const user = await User.findById(userId);
    const isPasswordValid = await user.validatePassword(password);
    
    if (!isPasswordValid) {
      await SecurityService.logSecurityEvent(
        userId,
        '2fa_disable_failed',
        req.ip,
        req.get('User-Agent'),
        { reason: 'invalid_password' }
      );
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Disable 2FA
    const result = await TwoFactorAuth.disable2FA(userId, password);

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Failed to disable 2FA' });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { token, backupCode } = req.body;
    const userId = req.user.id;

    if (!token && !backupCode) {
      return res.status(400).json({ message: 'Verification code or backup code is required' });
    }

    let verification;
    let method;

    if (token) {
      verification = await TwoFactorAuth.verifyToken(userId, token);
      method = 'totp';
    } else {
      verification = await TwoFactorAuth.verifyBackupCode(userId, backupCode);
      method = 'backup_code';
    }

    if (!verification.valid) {
      await SecurityService.logSecurityEvent(
        userId,
        '2fa_verification_failed',
        req.ip,
        req.get('User-Agent'),
        { method: method, error: verification.error }
      );
      return res.status(400).json({ message: verification.error || 'Invalid code' });
    }

    // Log successful verification
    await SecurityService.logSecurityEvent(
      userId,
      '2fa_verified',
      req.ip,
      req.get('User-Agent'),
      { method: method }
    );

    const response = { message: '2FA verification successful', method: method };
    
    if (method === 'backup_code' && verification.remainingCodes !== undefined) {
      response.remainingBackupCodes = verification.remainingCodes;
      if (verification.remainingCodes <= 2) {
        response.warning = 'You have few backup codes remaining. Consider regenerating them.';
      }
    }

    res.json(response);
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: '2FA verification failed' });
  }
};

exports.regenerateBackupCodes = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Verify user password
    const user = await User.findById(userId);
    const isPasswordValid = await user.validatePassword(password);
    
    if (!isPasswordValid) {
      await SecurityService.logSecurityEvent(
        userId,
        'backup_codes_regeneration_failed',
        req.ip,
        req.get('User-Agent'),
        { reason: 'invalid_password' }
      );
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Check if 2FA is enabled
    const is2FAEnabled = await TwoFactorAuth.is2FAEnabled(userId);
    if (!is2FAEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Regenerate backup codes
    const result = await TwoFactorAuth.regenerateBackupCodes(userId);

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    res.json({
      message: 'Backup codes regenerated successfully',
      backupCodes: result.backupCodes,
      warning: 'Your old backup codes are no longer valid. Store these new codes in a safe place.'
    });
  } catch (error) {
    console.error('Backup codes regeneration error:', error);
    res.status(500).json({ message: 'Failed to regenerate backup codes' });
  }
};

exports.get2FAStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const is2FAEnabled = await TwoFactorAuth.is2FAEnabled(userId);
    
    res.json({
      enabled: is2FAEnabled,
      message: is2FAEnabled ? '2FA is enabled' : '2FA is not enabled'
    });
  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({ message: 'Failed to get 2FA status' });
  }
};