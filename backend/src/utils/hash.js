const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const hashPassword = async (plainText) => {
  return bcrypt.hash(plainText, SALT_ROUNDS);
};

const comparePassword = async (plainText, hashed) => {
  return bcrypt.compare(plainText, hashed);
};

module.exports = { hashPassword, comparePassword };
