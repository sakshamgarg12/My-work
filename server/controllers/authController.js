const jwt = require('jsonwebtoken');
const { User } = require('../models');

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('JWT_SECRET is not configured');
    err.status = 500;
    throw err;
  }
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
}

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email).toLowerCase().trim();
    const { password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    const token = signToken(user);
    res.status(200).json({
      status: 'success',
      token,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const count = await User.count();
    const allowPublic = String(process.env.ALLOW_PUBLIC_REGISTER || '').toLowerCase() === 'true';
    if (!allowPublic && count > 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Registration is disabled. Ask an administrator for access.',
      });
    }

    const { name, email, password } = req.body;
    const role = count === 0 ? 'admin' : 'user';

    const user = await User.create({
      name: name.trim(),
      email: String(email).toLowerCase().trim(),
      password,
      role,
    });

    const token = signToken(user);
    res.status(201).json({
      status: 'success',
      token,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        status: 'error',
        message: 'That email is already registered',
      });
    }
    next(err);
  }
};

exports.registrationStatus = async (req, res, next) => {
  try {
    const count = await User.count();
    const allowPublic = String(process.env.ALLOW_PUBLIC_REGISTER || '').toLowerCase() === 'true';
    res.json({
      status: 'success',
      registrationOpen: allowPublic || count === 0,
    });
  } catch (err) {
    next(err);
  }
};
