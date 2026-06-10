const { Review, Movie, User, ReviewLike, WatchedMovie } = require('../models');
const tmdb = require('../utils/tmdb');
const ERRORS = require('../constants/errors');
const { createError } = require('../middlewares/errorHandler');

const createReview = async (userId, { tmdbId, content, rating }) => {
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

  const existing = await Review.findOne({ where: { user_id: userId, movie_id: movie.id } });
  if (existing) throw createError(409, ERRORS.REVIEW_ALREADY_EXISTS);

  const review = await Review.create({
    user_id: userId,
    movie_id: movie.id,
    content,
    rating,
  });

  const watched = await WatchedMovie.findOne({ where: { user_id: userId, movie_id: movie.id } });
  if (!watched) {
    await WatchedMovie.create({ user_id: userId, movie_id: movie.id });
  }

  return formatReview(review, null, movie);
};

const updateReview = async (reviewId, userId, { content, rating }) => {
  const review = await Review.findByPk(reviewId);
  if (!review) throw createError(404, ERRORS.REVIEW_NOT_FOUND);
  if (review.user_id !== userId) throw createError(403, ERRORS.FORBIDDEN);

  await review.update({ content, rating });
  return formatReview(review, null, null);
};

const deleteReview = async (reviewId, userId) => {
  const review = await Review.findByPk(reviewId);
  if (!review) throw createError(404, ERRORS.REVIEW_NOT_FOUND);
  if (review.user_id !== userId) throw createError(403, ERRORS.FORBIDDEN);

  await review.destroy();
};

const getReviewsByMovie = async (tmdbId, page = 1) => {
  const movie = await Movie.findOne({ where: { tmdb_id: tmdbId } });
  if (!movie) return { reviews: [], pagination: { page, total: 0, pages: 0 } };

  const limit = 10;
  const offset = (page - 1) * limit;

  const { count, rows } = await Review.findAndCountAll({
    where: { movie_id: movie.id },
    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar_url'] }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    reviews: rows.map((r) => formatReview(r, r.user, null)),
    pagination: { page, total: count, pages: Math.ceil(count / limit) },
  };
};

const formatReview = (review, user, movie) => ({
  id: review.id,
  content: review.content,
  rating: review.rating,
  likes_count: review.likes_count,
  created_at: review.created_at,
  updated_at: review.updated_at,
  user: user
    ? { id: user.id, username: user.username, avatar_url: user.avatar_url }
    : undefined,
  movie: movie
    ? { id: movie.id, tmdb_id: movie.tmdb_id, title: movie.title, poster_path: movie.poster_path }
    : undefined,
});

const likeReview = async (userId, reviewId) => {
  const review = await Review.findByPk(reviewId);
  if (!review) throw createError(404, ERRORS.REVIEW_NOT_FOUND);

  const existing = await ReviewLike.findOne({ where: { user_id: userId, review_id: reviewId } });
  if (existing) {
    await existing.destroy();
    await review.decrement('likes_count');
    await review.reload();
    return { liked: false, likes_count: review.likes_count };
  }

  await ReviewLike.create({ user_id: userId, review_id: reviewId });
  await review.increment('likes_count');
  await review.reload();
  return { liked: true, likes_count: review.likes_count };
};

const getUserLikedReviews = async (userId, reviewIds) => {
  if (!userId || reviewIds.length === 0) return new Set();
  const likes = await ReviewLike.findAll({
    where: { user_id: userId, review_id: reviewIds },
    attributes: ['review_id'],
  });
  return new Set(likes.map((l) => l.review_id));
};

module.exports = { createReview, updateReview, deleteReview, getReviewsByMovie, likeReview, getUserLikedReviews };
