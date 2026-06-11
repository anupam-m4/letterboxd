export const ROUTES = {
  HOME: '/',
  FILMS: '/films',
  WELCOME: '/welcome',
  LOGIN: '/login',
  REGISTER: '/register',
  SEARCH: '/search',
  MOVIE_DETAIL: '/movies/:tmdbId',
  PROFILE: '/users/:username',
  WATCHLIST: '/watchlist',
  WATCHED: '/watched',
  FEED: '/feed',
  USER_SEARCH: '/users/search',
  JOURNAL: '/journal',
  AI_PICKS: '/ai-picks',
} as const;

export const buildRoute = {
  movieDetail: (tmdbId: number) => `/movies/${tmdbId}`,
  profile: (username: string) => `/users/${username}`,
};
