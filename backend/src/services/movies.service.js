const { Movie, Review, Watchlist, WatchedMovie } = require('../models');
const tmdb = require('../utils/tmdb');
const ERRORS = require('../constants/errors');
const { createError } = require('../middlewares/errorHandler');

const GENRE_IDS = {
  Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80,
  Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36,
  Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749,
  'Science Fiction': 878, 'TV Movie': 10770, Thriller: 53, War: 10752, Western: 37,
};

const SORT_MAP = {
  popularity: 'popularity.desc',
  rating: 'vote_average.desc',
  release_date: 'release_date.desc',
  title: 'original_title.asc',
};

const discover = async ({ genres, sortBy, voteGte, releaseFrom, releaseTo, page = 1 }) => {
  const genreIds = genres
    ? genres.split(',').map((g) => GENRE_IDS[g.trim()]).filter(Boolean).join(',')
    : null;
  const data = await tmdb.discoverMovies({
    genreIds: genreIds || null,
    sortBy: SORT_MAP[sortBy] || 'popularity.desc',
    voteGte: voteGte ? Number(voteGte) : null,
    releaseFrom: releaseFrom || null,
    releaseTo: releaseTo || null,
    page: Number(page),
  });
  return {
    results: data.results.map(formatTmdbResult),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
};

const search = async (query, page = 1) => {
  const data = await tmdb.searchMovies(query, page);
  return {
    results: data.results.map(formatTmdbResult),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
};

const getPopular = async (page = 1) => {
  const data = await tmdb.getPopularMovies(page);
  return { results: data.results.map(formatTmdbResult), page: data.page, total_pages: data.total_pages };
};

const getTopRated = async (page = 1) => {
  const data = await tmdb.getTopRatedMovies(page);
  return { results: data.results.map(formatTmdbResult), page: data.page, total_pages: data.total_pages };
};

const getNowPlaying = async (page = 1) => {
  const data = await tmdb.getNowPlayingMovies(page);
  return { results: data.results.map(formatTmdbResult), page: data.page, total_pages: data.total_pages };
};

const getMovieDetail = async (tmdbId, userId) => {
  let movie = await Movie.findOne({ where: { tmdb_id: tmdbId } });
  let cast = [];

  let trailerKey = null;

  if (!movie) {
    try {
      const data = await tmdb.getMovieById(tmdbId);
      movie = await Movie.create({
        tmdb_id: data.id,
        title: data.title,
        release_date: data.release_date || null,
        poster_path: data.poster_path || null,
        backdrop_path: data.backdrop_path || null,
        overview: data.overview || null,
        genres: data.genres ? data.genres.map((g) => g.name) : [],
        runtime: data.runtime || null,
        vote_average: data.vote_average || null,
      });
      cast = parseCast(data.credits);
      trailerKey = parseTrailer(data.videos);
    } catch {
      throw createError(404, ERRORS.MOVIE_NOT_FOUND);
    }
  } else {
    try {
      const fresh = await tmdb.getMovieById(tmdbId);
      cast = parseCast(fresh.credits);
      trailerKey = parseTrailer(fresh.videos);
      if (fresh.vote_average != null) {
        await movie.update({ vote_average: fresh.vote_average });
      }
    } catch {
      cast = [];
    }
  }

  const userState = await getUserMovieState(userId, movie.id);
  return { movie: formatMovie(movie), cast, trailerKey, userState };
};

const getSimilar = async (tmdbId) => {
  try {
    const data = await tmdb.getSimilarMovies(tmdbId);
    return { results: data.results.slice(0, 12).map(formatTmdbResult) };
  } catch {
    return { results: [] };
  }
};

const getUserMovieState = async (userId, movieId) => {
  if (!userId) return { watched: false, inWatchlist: false, review: null };

  const [watched, inWatchlist, review] = await Promise.all([
    WatchedMovie.findOne({ where: { user_id: userId, movie_id: movieId } }),
    Watchlist.findOne({ where: { user_id: userId, movie_id: movieId } }),
    Review.findOne({ where: { user_id: userId, movie_id: movieId } }),
  ]);

  return {
    watched: !!watched,
    inWatchlist: !!inWatchlist,
    review: review ? { id: review.id, rating: review.rating, content: review.content } : null,
  };
};

const parseCast = (credits) => {
  if (!credits || !credits.cast) return [];
  return credits.cast.slice(0, 12).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profile_path: c.profile_path ? tmdb.buildImageUrl(c.profile_path) : null,
  }));
};

const parseTrailer = (videos) => {
  if (!videos || !videos.results) return null;
  const trailers = videos.results.filter(
    (v) => v.site === 'YouTube' && v.type === 'Trailer',
  );
  const official = trailers.find((v) => v.official);
  const pick = official || trailers[0];
  return pick ? pick.key : null;
};

const formatTmdbResult = (item) => ({
  tmdb_id: item.id,
  title: item.title,
  release_date: item.release_date,
  poster_path: item.poster_path ? tmdb.buildImageUrl(item.poster_path) : null,
  overview: item.overview,
  vote_average: item.vote_average,
});

const formatMovie = (movie) => ({
  id: movie.id,
  tmdb_id: movie.tmdb_id,
  title: movie.title,
  release_date: movie.release_date,
  poster_path: movie.poster_path ? tmdb.buildImageUrl(movie.poster_path) : null,
  backdrop_path: movie.backdrop_path ? tmdb.buildImageUrl(movie.backdrop_path) : null,
  overview: movie.overview,
  genres: movie.genres,
  runtime: movie.runtime,
  vote_average: movie.vote_average,
});

module.exports = { search, discover, getPopular, getTopRated, getNowPlaying, getMovieDetail, getSimilar };
