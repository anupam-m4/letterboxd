export interface User {
  id: string;
  username: string;
  email?: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Movie {
  id: string;
  tmdb_id: number;
  title: string;
  release_date: string | null;
  poster_path: string | null;
  backdrop_path?: string | null;
  overview: string | null;
  genres: string[];
  runtime: number | null;
  vote_average?: number | null;
  trailer_key?: string | null;
}

export interface TmdbSearchResult {
  tmdb_id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  vote_count?: number;
}

export interface ReviewWithMovie extends Review {
  movie: Pick<Movie, 'id' | 'tmdb_id' | 'title' | 'poster_path' | 'release_date'>;
}

export interface Review {
  id: string;
  content: string;
  rating: number;
  likes_count: number;
  created_at: string;
  updated_at?: string;
  user?: Pick<User, 'id' | 'username' | 'avatar_url'>;
  movie?: Pick<Movie, 'id' | 'tmdb_id' | 'title' | 'poster_path'>;
}

export interface UserMovieState {
  watched: boolean;
  inWatchlist: boolean;
  review: { id: string; rating: number; content: string } | null;
}

export interface UserStats {
  reviews: number;
  watchlist: number;
  watched: number;
  followers: number;
  following: number;
}

export interface UserProfile {
  user: User;
  stats: UserStats;
  isFollowing: boolean;
}

export interface Pagination {
  page: number;
  total: number;
  pages: number;
}

export interface MovieSummary {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
}

export interface WatchlistEntry {
  id: string;
  added_at: string;
  movie: MovieSummary | null;
}

export interface WatchedEntry {
  id: string;
  watched_at: string | null;
  movie: MovieSummary | null;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface FeedActivity {
  id: string;
  type: 'review';
  content: string;
  rating: number;
  created_at: string;
  user: Pick<User, 'id' | 'username' | 'avatar_url'>;
  movie: MovieSummary;
}

export interface RecommendedFilm {
  title: string;
  year: number;
  reason: string;
  similar_to: string;
  tmdb_id?: number;
  poster_path?: string | null;
  overview?: string;
}

export interface JournalArticle {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  author: string;
  image_url: string | null;
  published_at: string;
  is_featured: boolean;
  is_spotlight: boolean;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}
