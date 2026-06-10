require('dotenv').config();

const ENV = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  TMDB_API_KEY: process.env.TMDB_API_KEY,
  TMDB_BASE_URL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: process.env.TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500',
};

module.exports = ENV;
