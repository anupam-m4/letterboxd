const reviewsService = require('../services/reviews.service');

const createReview = async (req, res, next) => {
  try {
    const { tmdbId, content, rating } = req.body;

    if (!tmdbId || !content || !rating) {
      return res.status(400).json({ error: 'tmdbId, content, and rating are required' });
    }
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }

    const review = await reviewsService.createReview(req.user.id, {
      tmdbId: Number(tmdbId),
      content,
      rating: Number(rating),
    });
    return res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;

    const review = await reviewsService.updateReview(id, req.user.id, { content, rating });
    return res.status(200).json({ review });
  } catch (err) {
    next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await reviewsService.deleteReview(id, req.user.id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const getReviewsByMovie = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const { page = 1 } = req.query;

    const result = await reviewsService.getReviewsByMovie(Number(tmdbId), Number(page));
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const likeReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await reviewsService.likeReview(req.user.id, id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, updateReview, deleteReview, getReviewsByMovie, likeReview };
