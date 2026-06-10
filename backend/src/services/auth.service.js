const { User } = require('../models');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');
const ERRORS = require('../constants/errors');
const { createError } = require('../middlewares/errorHandler');

const register = async ({ username, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw createError(409, ERRORS.EMAIL_TAKEN);

  const existingUsername = await User.findOne({ where: { username } });
  if (existingUsername) throw createError(409, ERRORS.USERNAME_TAKEN);

  const password_hash = await hashPassword(password);
  const user = await User.create({ username, email, password_hash });

  const token = signToken({ id: user.id, username: user.username });
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    },
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw createError(401, ERRORS.INVALID_CREDENTIALS);

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw createError(401, ERRORS.INVALID_CREDENTIALS);

  const token = signToken({ id: user.id, username: user.username });
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    },
    token,
  };
};

module.exports = { register, login };
