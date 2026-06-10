const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tmdb_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  release_date: {
    type: DataTypes.DATEONLY,
    defaultValue: null,
  },
  poster_path: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  backdrop_path: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  overview: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
  genres: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  runtime: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  vote_average: {
    type: DataTypes.FLOAT,
    defaultValue: null,
  },
}, {
  tableName: 'movies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Movie;
