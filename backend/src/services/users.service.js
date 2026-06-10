const { User, Review, Movie, Watchlist, WatchedMovie, Follow } = require('../models');
const { Op } = require('sequelize');
const ERRORS = require('../constants/errors');
const { createError } = require('../middlewares/errorHandler');
const tmdb = require('../utils/tmdb');

const getProfile = async (username, requesterId) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw createError(404, ERRORS.USER_NOT_FOUND);

  const [reviewCount, watchlistCount, watchedCount, followersCount, followingCount] = await Promise.all([
    Review.count({ where: { user_id: user.id } }),
    Watchlist.count({ where: { user_id: user.id } }),
    WatchedMovie.count({ where: { user_id: user.id } }),
    Follow.count({ where: { following_id: user.id } }),
    Follow.count({ where: { follower_id: user.id } }),
  ]);

  let isFollowing = false;
  if (requesterId && requesterId !== user.id) {
    const follow = await Follow.findOne({
      where: { follower_id: requesterId, following_id: user.id },
    });
    isFollowing = !!follow;
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    },
    stats: {
      reviews: reviewCount,
      watchlist: watchlistCount,
      watched: watchedCount,
      followers: followersCount,
      following: followingCount,
    },
    isFollowing,
  };
};

const getUserReviews = async (username, page = 1) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw createError(404, ERRORS.USER_NOT_FOUND);

  const limit = 12;
  const offset = (page - 1) * limit;

  const { count, rows } = await Review.findAndCountAll({
    where: { user_id: user.id },
    include: [{ model: Movie, as: 'movie', attributes: ['id', 'tmdb_id', 'title', 'poster_path', 'release_date'] }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    reviews: rows.map((r) => ({
      id: r.id,
      content: r.content,
      rating: r.rating,
      created_at: r.created_at,
      movie: r.movie
        ? {
            id: r.movie.id,
            tmdb_id: r.movie.tmdb_id,
            title: r.movie.title,
            poster_path: r.movie.poster_path ? tmdb.buildImageUrl(r.movie.poster_path) : null,
            release_date: r.movie.release_date,
          }
        : null,
    })),
    pagination: { page, total: count, pages: Math.ceil(count / limit) },
  };
};

const getUserWatchlist = async (username, page = 1) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw createError(404, ERRORS.USER_NOT_FOUND);

  const limit = 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await Watchlist.findAndCountAll({
    where: { user_id: user.id },
    include: [{ model: Movie, as: 'movie', attributes: ['id', 'tmdb_id', 'title', 'poster_path', 'release_date'] }],
    order: [['added_at', 'DESC']],
    limit,
    offset,
  });

  return {
    movies: rows.map((w) => ({
      id: w.id,
      added_at: w.added_at,
      movie: w.movie
        ? {
            id: w.movie.id,
            tmdb_id: w.movie.tmdb_id,
            title: w.movie.title,
            poster_path: w.movie.poster_path ? tmdb.buildImageUrl(w.movie.poster_path) : null,
            release_date: w.movie.release_date,
          }
        : null,
    })),
    pagination: { page, total: count, pages: Math.ceil(count / limit) },
  };
};

const getUserWatched = async (username, page = 1) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw createError(404, ERRORS.USER_NOT_FOUND);

  const limit = 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await WatchedMovie.findAndCountAll({
    where: { user_id: user.id },
    include: [{ model: Movie, as: 'movie', attributes: ['id', 'tmdb_id', 'title', 'poster_path', 'release_date'] }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    movies: rows.map((w) => ({
      id: w.id,
      watched_at: w.watched_at,
      movie: w.movie
        ? {
            id: w.movie.id,
            tmdb_id: w.movie.tmdb_id,
            title: w.movie.title,
            poster_path: w.movie.poster_path ? tmdb.buildImageUrl(w.movie.poster_path) : null,
            release_date: w.movie.release_date,
          }
        : null,
    })),
    pagination: { page, total: count, pages: Math.ceil(count / limit) },
  };
};

const followUser = async (followerId, username) => {
  const target = await User.findOne({ where: { username } });
  if (!target) throw createError(404, ERRORS.USER_NOT_FOUND);
  if (target.id === followerId) throw createError(400, ERRORS.CANNOT_FOLLOW_SELF);

  const existing = await Follow.findOne({
    where: { follower_id: followerId, following_id: target.id },
  });
  if (existing) throw createError(409, ERRORS.ALREADY_FOLLOWING);

  await Follow.create({ follower_id: followerId, following_id: target.id });
  return { following: true };
};

const unfollowUser = async (followerId, username) => {
  const target = await User.findOne({ where: { username } });
  if (!target) throw createError(404, ERRORS.USER_NOT_FOUND);

  const follow = await Follow.findOne({
    where: { follower_id: followerId, following_id: target.id },
  });
  if (!follow) throw createError(404, ERRORS.NOT_FOLLOWING);

  await follow.destroy();
  return { following: false };
};

const updateProfile = async (userId, { bio, avatar_url }) => {
  const user = await User.findByPk(userId);
  if (!user) throw createError(404, ERRORS.USER_NOT_FOUND);

  await user.update({ bio, avatar_url });
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar_url: user.avatar_url,
  };
};

const searchUsers = async (query) => {
  if (!query || !query.trim()) return { users: [] };
  const users = await User.findAll({
    where: { username: { [Op.iLike]: `%${query.trim()}%` } },
    attributes: ['id', 'username', 'bio', 'avatar_url'],
    limit: 20,
  });
  return { users };
};

module.exports = { getProfile, getUserReviews, getUserWatchlist, getUserWatched, followUser, unfollowUser, updateProfile, searchUsers };
