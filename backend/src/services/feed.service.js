const { Review, User, Movie, Follow } = require('../models');
const { Op } = require('sequelize');
const tmdb = require('../utils/tmdb');

const getFeed = async (userId, page = 1) => {
  const limit = 20;
  const offset = (page - 1) * limit;

  const following = await Follow.findAll({
    where: { follower_id: userId },
    attributes: ['following_id'],
  });

  const followingIds = following.map((f) => f.following_id);

  if (followingIds.length === 0) {
    return { activities: [], pagination: { page, total: 0, pages: 0 }, isEmpty: true };
  }

  const { count, rows } = await Review.findAndCountAll({
    where: { user_id: { [Op.in]: followingIds } },
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'avatar_url'] },
      { model: Movie, as: 'movie', attributes: ['id', 'tmdb_id', 'title', 'poster_path', 'release_date'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const activities = rows.map((r) => ({
    id: r.id,
    type: 'review',
    content: r.content,
    rating: r.rating,
    created_at: r.created_at,
    user: { id: r.user.id, username: r.user.username, avatar_url: r.user.avatar_url },
    movie: {
      id: r.movie.id,
      tmdb_id: r.movie.tmdb_id,
      title: r.movie.title,
      poster_path: r.movie.poster_path ? tmdb.buildImageUrl(r.movie.poster_path) : null,
      release_date: r.movie.release_date,
    },
  }));

  return {
    activities,
    pagination: { page, total: count, pages: Math.ceil(count / limit) },
    isEmpty: false,
  };
};

module.exports = { getFeed };
