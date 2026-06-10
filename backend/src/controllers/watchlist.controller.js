const watchlistService = require('../services/watchlist.service');

const addToWatchlist = async (req, res, next) => {
  try {
    const { tmdbId } = req.body;
    if (!tmdbId) return res.status(400).json({ error: 'tmdbId is required' });

    const result = await watchlistService.addToWatchlist(req.user.id, Number(tmdbId));
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const removeFromWatchlist = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const result = await watchlistService.removeFromWatchlist(req.user.id, Number(tmdbId));
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const markAsWatched = async (req, res, next) => {
  try {
    const { tmdbId } = req.body;
    if (!tmdbId) return res.status(400).json({ error: 'tmdbId is required' });

    const result = await watchlistService.markAsWatched(req.user.id, Number(tmdbId));
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const unmarkWatched = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const result = await watchlistService.unmarkWatched(req.user.id, Number(tmdbId));
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { addToWatchlist, removeFromWatchlist, markAsWatched, unmarkWatched };
