export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SEARCH: '/search',
  MOVIE_DETAIL: '/movies/:tmdbId',
  PROFILE: '/users/:username',
  WATCHLIST: '/watchlist',
  WATCHED: '/watched',
  FEED: '/feed',
  USER_SEARCH: '/users/search',
} as const;

export const buildRoute = {
  movieDetail: (tmdbId: number) => `/movies/${tmdbId}`,
  profile: (username: string) => `/users/${username}`,
};
