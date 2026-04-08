const jwt = require('jsonwebtoken');

function authDisabled() {
  const v = process.env.AUTH_DISABLED || process.env.DISABLE_AUTH || '';
  return String(v).toLowerCase() === 'true' || v === '1';
}

const authMiddleware = (req, res, next) => {
  try {
    if (authDisabled()) {
      req.user = { sub: 'dev-bypass', authDisabled: true };
      return next();
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
  }
};

module.exports = authMiddleware;
