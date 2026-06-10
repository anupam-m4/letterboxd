const { Movie, Watchlist, WatchedMovie } = require('../models');
const tmdb = require('../utils/tmdb');
const ERRORS = require('../constants/errors');
const { createError } = require('../middlewares/errorHandler');

const ensureMovie = async (tmdbId) => {
  let movie = await Movie.findOne({ where: { tmdb_id: tmdbId } });
  if (!movie) {
    try {
      const data = await tmdb.getMovieById(tmdbId);
      movie = await Movie.create({
        tmdb_id: data.id,
        title: data.title,
        release_date: data.release_date || null,
        poster_path: data.poster_path || null,
        backdrop_path: data.backdrop_path || null,
        overview: data.overview || null,
        genres: data.genres ? data.genres.map((g) => g.name) : [],
        runtime: data.runtime || null,
      });
    } catch {
      throw createError(404, ERRORS.MOVIE_NOT_FOUND);
    }
  }
  return movie;
};

const addToWatchlist = async (userId, tmdbId) => {
  const movie = await ensureMovie(tmdbId);
  const existing = await Watchlist.findOne({ where: { user_id: userId, movie_id: movie.id } });
  if (existing) throw createError(409, ERRORS.WATCHLIST_DUPLICATE);

  await Watchlist.create({ user_id: userId, movie_id: movie.id });
  return { inWatchlist: true, movie: { tmdb_id: movie.tmdb_id, title: movie.title } };
};

const removeFromWatchlist = async (userId, tmdbId) => {
  const movie = await Movie.findOne({ where: { tmdb_id: tmdbId } });
  if (!movie) throw createError(404, ERRORS.WATCHLIST_NOT_FOUND);

  const entry = await Watchlist.findOne({ where: { user_id: userId, movie_id: movie.id } });
  if (!entry) throw createError(404, ERRORS.WATCHLIST_NOT_FOUND);

  await entry.destroy();
  return { inWatchlist: false };
};

const markAsWatched = async (userId, tmdbId) => {
  const movie = await ensureMovie(tmdbId);
  const existing = await WatchedMovie.findOne({ where: { user_id: userId, movie_id: movie.id } });
  if (existing) throw createError(409, ERRORS.WATCHED_DUPLICATE);

  await WatchedMovie.create({ user_id: userId, movie_id: movie.id });
  return { watched: true };
};

const unmarkWatched = async (userId, tmdbId) => {
  const movie = await Movie.findOne({ where: { tmdb_id: tmdbId } });
  if (!movie) return { watched: false };

  const entry = await WatchedMovie.findOne({ where: { user_id: userId, movie_id: movie.id } });
  if (!entry) return { watched: false };

  await entry.destroy();
  return { watched: false };
};

module.exports = { addToWatchlist, removeFromWatchlist, markAsWatched, unmarkWatched };
