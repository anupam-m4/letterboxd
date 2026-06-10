const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WatchedMovie = sequelize.define('WatchedMovie', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  movie_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  watched_at: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'watched_movies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['user_id', 'movie_id'] },
    { fields: ['user_id'] },
  ],
});

module.exports = WatchedMovie;
