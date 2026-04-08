const express = require('express');
const jwt = require('jsonwebtoken');
const { validateRequest } = require('../middleware/validation');
const { loginSchema, registerSchema } = require('../middleware/authValidation');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/registration-status', authController.registrationStatus);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/register', validateRequest(registerSchema), authController.register);

/**
 * Issue a short-lived JWT for local development (no login UI yet).
 * Disabled in production unless ALLOW_DEV_TOKEN=true.
 */
router.get('/dev-token', (req, res) => {
  const allow =
    process.env.NODE_ENV !== 'production' || String(process.env.ALLOW_DEV_TOKEN).toLowerCase() === 'true';

  if (!allow) {
    return res.status(404).json({ status: 'error', message: 'Not found' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({
      status: 'error',
      message: 'JWT_SECRET is missing in server .env',
    });
  }

  const token = jwt.sign(
    { sub: 'dev', role: 'developer' },
    secret,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  res.status(200).json({
    status: 'success',
    token,
  });
});

module.exports = router;
