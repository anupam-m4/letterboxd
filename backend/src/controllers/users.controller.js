const usersService = require('../services/users.service');

const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const requesterId = req.user ? req.user.id : null;
    const result = await usersService.getProfile(username, requesterId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getUserReviews = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { page = 1 } = req.query;
    const result = await usersService.getUserReviews(username, Number(page));
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getUserWatchlist = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { page = 1 } = req.query;
    const result = await usersService.getUserWatchlist(username, Number(page));
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getUserWatched = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { page = 1 } = req.query;
    const result = await usersService.getUserWatched(username, Number(page));
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const followUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await usersService.followUser(req.user.id, username);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await usersService.unfollowUser(req.user.id, username);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { bio, avatar_url } = req.body;
    const user = await usersService.updateProfile(req.user.id, { bio, avatar_url });
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const result = await usersService.searchUsers(q);
    return res.status(200).json(result);
  } catch (err) { next(err); }
};

module.exports = { getProfile, getUserReviews, getUserWatchlist, getUserWatched, followUser, unfollowUser, updateProfile, searchUsers };
