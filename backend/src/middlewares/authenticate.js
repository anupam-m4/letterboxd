const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');
const ERRORS = require('../constants/errors');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: ERRORS.UNAUTHORIZED });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'bio', 'avatar_url', 'created_at'],
    });

    if (!user) {
      return res.status(401).json({ error: ERRORS.UNAUTHORIZED });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: ERRORS.UNAUTHORIZED });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'bio', 'avatar_url'],
    });
    req.user = user || null;
  } catch {
    req.user = null;
  }

  next();
};

module.exports = { authenticate, optionalAuth };
