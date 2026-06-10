const feedService = require('../services/feed.service');

const getFeed = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const result = await feedService.getFeed(req.user.id, Number(page));
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getFeed };
