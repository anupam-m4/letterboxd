const sequelize = require('../config/database');
const User = require('./User');
const Movie = require('./Movie');
const Review = require('./Review');
const ReviewLike = require('./ReviewLike');
const Watchlist = require('./Watchlist');
const WatchedMovie = require('./WatchedMovie');
const Follow = require('./Follow');

User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Movie.hasMany(Review, { foreignKey: 'movie_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

User.hasMany(Watchlist, { foreignKey: 'user_id', as: 'watchlist', onDelete: 'CASCADE' });
Watchlist.belongsTo(User, { foreignKey: 'user_id' });
Movie.hasMany(Watchlist, { foreignKey: 'movie_id', onDelete: 'CASCADE' });
Watchlist.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

User.hasMany(WatchedMovie, { foreignKey: 'user_id', as: 'watched', onDelete: 'CASCADE' });
WatchedMovie.belongsTo(User, { foreignKey: 'user_id' });
Movie.hasMany(WatchedMovie, { foreignKey: 'movie_id', onDelete: 'CASCADE' });
WatchedMovie.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

User.hasMany(Follow, { foreignKey: 'follower_id', as: 'following', onDelete: 'CASCADE' });
User.hasMany(Follow, { foreignKey: 'following_id', as: 'followers', onDelete: 'CASCADE' });
Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'following_id', as: 'followedUser' });

User.hasMany(ReviewLike, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.hasMany(ReviewLike, { foreignKey: 'review_id', as: 'likes', onDelete: 'CASCADE' });
ReviewLike.belongsTo(User, { foreignKey: 'user_id' });
ReviewLike.belongsTo(Review, { foreignKey: 'review_id' });

module.exports = { sequelize, User, Movie, Review, ReviewLike, Watchlist, WatchedMovie, Follow };
