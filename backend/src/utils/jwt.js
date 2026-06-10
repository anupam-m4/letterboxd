const jwt = require('jsonwebtoken');
const ENV = require('../config/env');

const signToken = (payload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, ENV.JWT_SECRET);
};

module.exports = { signToken, verifyToken };
