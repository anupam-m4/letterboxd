const axios = require('axios');
const ENV = require('../config/env');

const tmdbClient = axios.create({
  baseURL: ENV.TMDB_BASE_URL,
  params: { api_key: ENV.TMDB_API_KEY },
});

const searchMovies = async (query, page = 1) => {
  const response = await tmdbClient.get('/search/movie', {
    params: { query, page },
  });
  return response.data;
};

const getMovieById = async (tmdbId) => {
  const response = await tmdbClient.get(`/movie/${tmdbId}`, {
    params: { append_to_response: 'credits' },
  });
  return response.data;
};

const getPopularMovies = async (page = 1) => {
  const response = await tmdbClient.get('/movie/popular', { params: { page } });
  return response.data;
};

const getTopRatedMovies = async (page = 1) => {
  const response = await tmdbClient.get('/movie/top_rated', { params: { page } });
  return response.data;
};

const getNowPlayingMovies = async (page = 1) => {
  const response = await tmdbClient.get('/movie/now_playing', { params: { page } });
  return response.data;
};

const getSimilarMovies = async (tmdbId) => {
  const response = await tmdbClient.get(`/movie/${tmdbId}/similar`);
  return response.data;
};

const discoverMovies = async ({ genreIds, sortBy = 'popularity.desc', voteGte, releaseFrom, releaseTo, page = 1 }) => {
  const params = { sort_by: sortBy, page };
  if (genreIds) params.with_genres = genreIds;
  if (voteGte) params['vote_average.gte'] = voteGte;
  if (releaseFrom) params['primary_release_date.gte'] = releaseFrom;
  if (releaseTo) params['primary_release_date.lte'] = releaseTo;
  const response = await tmdbClient.get('/discover/movie', { params });
  return response.data;
};

const buildImageUrl = (path) => {
  if (!path) return null;
  return `${ENV.TMDB_IMAGE_BASE}${path}`;
};

module.exports = { searchMovies, getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getSimilarMovies, discoverMovies, getMovieById, buildImageUrl };
