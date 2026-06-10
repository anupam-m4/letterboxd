const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const moviesController = require('../controllers/movies.controller');
const reviewsController = require('../controllers/reviews.controller');
const usersController = require('../controllers/users.controller');
const watchlistController = require('../controllers/watchlist.controller');
const feedController = require('../controllers/feed.controller');
const { authenticate, optionalAuth } = require('../middlewares/authenticate');

const router = Router();

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticate, authController.me);

router.get('/movies/search', moviesController.search);
router.get('/movies/discover', moviesController.discover);
router.get('/movies/popular', moviesController.getPopular);
router.get('/movies/top-rated', moviesController.getTopRated);
router.get('/movies/now-playing', moviesController.getNowPlaying);
router.get('/movies/:tmdbId', optionalAuth, moviesController.getMovieDetail);
router.get('/movies/:tmdbId/similar', moviesController.getSimilar);
router.get('/movies/:tmdbId/reviews', reviewsController.getReviewsByMovie);

router.post('/reviews', authenticate, reviewsController.createReview);
router.put('/reviews/:id', authenticate, reviewsController.updateReview);
router.delete('/reviews/:id', authenticate, reviewsController.deleteReview);
router.post('/reviews/:id/like', authenticate, reviewsController.likeReview);

router.post('/watchlist', authenticate, watchlistController.addToWatchlist);
router.delete('/watchlist/:tmdbId', authenticate, watchlistController.removeFromWatchlist);

router.post('/watched', authenticate, watchlistController.markAsWatched);
router.delete('/watched/:tmdbId', authenticate, watchlistController.unmarkWatched);

router.get('/users/search', usersController.searchUsers);
router.get('/users/:username', optionalAuth, usersController.getProfile);
router.get('/users/:username/reviews', usersController.getUserReviews);
router.get('/users/:username/watchlist', usersController.getUserWatchlist);
router.get('/users/:username/watched', usersController.getUserWatched);
router.post('/users/:username/follow', authenticate, usersController.followUser);
router.delete('/users/:username/follow', authenticate, usersController.unfollowUser);
router.put('/users/profile', authenticate, usersController.updateProfile);

router.get('/feed', authenticate, feedController.getFeed);

module.exports = router;
