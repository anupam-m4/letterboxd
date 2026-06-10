const ERRORS = require('../constants/errors');

const errorHandler = (err, req, res, next) => {
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path;
    if (field === 'email') return res.status(409).json({ error: ERRORS.EMAIL_TAKEN });
    if (field === 'username') return res.status(409).json({ error: ERRORS.USERNAME_TAKEN });
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: ERRORS.VALIDATION_FAILED,
      details: err.errors.map((e) => e.message),
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: ERRORS.INTERNAL_ERROR });
};

const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, createError };
