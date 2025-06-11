const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const twoFactorController = require('../controllers/twoFactorController');
const { authenticateToken } = require('../middleware/auth');
const {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  checkAccountLockout,
  detectSuspiciousActivity
} = require('../middleware/rateLimiter');

// Public routes
router.post('/register',
  registerLimiter,
  detectSuspiciousActivity,
  authController.register
);

router.post('/login',
  loginLimiter,
  checkAccountLockout,
  detectSuspiciousActivity,
  authController.login
);

router.post('/refresh-token', authController.refreshToken);

router.post('/request-password-reset',
  passwordResetLimiter,
  authController.requestPasswordReset
);

router.post('/reset-password',
  passwordResetLimiter,
  authController.resetPassword
);

// Protected routes (require authentication)
router.post('/logout', authenticateToken, authController.logout);

router.get('/verify', authenticateToken, authController.verifyToken);

router.post('/change-password', authenticateToken, authController.changePassword);

router.get('/security-summary', authenticateToken, authController.getSecuritySummary);

// 2FA routes (protected)
router.post('/2fa/setup', authenticateToken, twoFactorController.setup2FA);

router.post('/2fa/enable', authenticateToken, twoFactorController.enable2FA);

router.post('/2fa/disable', authenticateToken, twoFactorController.disable2FA);

router.post('/2fa/verify', authenticateToken, twoFactorController.verify2FA);

router.post('/2fa/regenerate-backup-codes', authenticateToken, twoFactorController.regenerateBackupCodes);

router.get('/2fa/status', authenticateToken, twoFactorController.get2FAStatus);

module.exports = router;
