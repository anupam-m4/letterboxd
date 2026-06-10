const ERRORS = {
  VALIDATION_FAILED: 'Validation failed',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_TAKEN: 'Email is already in use',
  USERNAME_TAKEN: 'Username is already taken',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',
  USER_NOT_FOUND: 'User not found',
  MOVIE_NOT_FOUND: 'Movie not found',
  REVIEW_NOT_FOUND: 'Review not found',
  REVIEW_ALREADY_EXISTS: 'You have already reviewed this movie',
  WATCHLIST_DUPLICATE: 'Movie is already in your watchlist',
  WATCHLIST_NOT_FOUND: 'Movie is not in your watchlist',
  WATCHED_DUPLICATE: 'Movie is already marked as watched',
  ALREADY_FOLLOWING: 'You are already following this user',
  NOT_FOLLOWING: 'You are not following this user',
  CANNOT_FOLLOW_SELF: 'You cannot follow yourself',
  TMDB_ERROR: 'Failed to fetch movie data',
  INTERNAL_ERROR: 'An unexpected error occurred',
};

module.exports = ERRORS;
