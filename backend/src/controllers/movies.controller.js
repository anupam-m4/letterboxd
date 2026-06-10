const moviesService = require('../services/movies.service');

const search = async (req, res, next) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ error: 'Query parameter q is required' });
    const result = await moviesService.search(q.trim(), Number(page));
    return res.status(200).json(result);
  } catch (err) { next(err); }
};

const getPopular = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    return res.status(200).json(await moviesService.getPopular(Number(page)));
  } catch (err) { next(err); }
};

const getTopRated = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    return res.status(200).json(await moviesService.getTopRated(Number(page)));
  } catch (err) { next(err); }
};

const getNowPlaying = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    return res.status(200).json(await moviesService.getNowPlaying(Number(page)));
  } catch (err) { next(err); }
};

const getMovieDetail = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const userId = req.user ? req.user.id : null;
    const result = await moviesService.getMovieDetail(Number(tmdbId), userId);
    return res.status(200).json(result);
  } catch (err) { next(err); }
};

const getSimilar = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    return res.status(200).json(await moviesService.getSimilar(Number(tmdbId)));
  } catch (err) { next(err); }
};

const discover = async (req, res, next) => {
  try {
    const { genres, sort_by, vote_gte, release_from, release_to, page = 1 } = req.query;
    const result = await moviesService.discover({ genres, sortBy: sort_by, voteGte: vote_gte, releaseFrom: release_from, releaseTo: release_to, page });
    return res.status(200).json(result);
  } catch (err) { next(err); }
};

module.exports = { search, discover, getPopular, getTopRated, getNowPlaying, getMovieDetail, getSimilar };
