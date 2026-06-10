const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Watchlist = sequelize.define('Watchlist', {
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
}, {
  tableName: 'watchlist',
  timestamps: true,
  createdAt: 'added_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['user_id', 'movie_id'] },
    { fields: ['user_id'] },
  ],
});

module.exports = Watchlist;
