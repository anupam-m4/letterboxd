const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReviewLike = sequelize.define('ReviewLike', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  review_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'review_likes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['user_id', 'review_id'] },
    { fields: ['review_id'] },
  ],
});

module.exports = ReviewLike;
