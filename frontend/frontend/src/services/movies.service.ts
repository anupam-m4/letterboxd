import api from './api';
import type { Movie, TmdbSearchResult, UserMovieState, CastMember } from '../types';

interface MovieListResponse {
  results: TmdbSearchResult[];
  page: number;
  total_pages: number;
  total_results?: number;
}

interface MovieDetailResponse {
  movie: Movie;
  cast: CastMember[];
  userState: UserMovieState;
}

const search = async (query: string, page = 1): Promise<MovieListResponse> => {
  const response = await api.get<MovieListResponse>('/movies/search', { params: { q: query, page } });
  return response.data;
};

const getPopular = async (page = 1): Promise<MovieListResponse> => {
  const response = await api.get('/movies/popular', { params: { page } });
  return response.data;
};

const getTopRated = async (page = 1): Promise<MovieListResponse> => {
  const response = await api.get('/movies/top-rated', { params: { page } });
  return response.data;
};

const getNowPlaying = async (page = 1): Promise<MovieListResponse> => {
  const response = await api.get('/movies/now-playing', { params: { page } });
  return response.data;
};

const getDetail = async (tmdbId: number): Promise<MovieDetailResponse> => {
  const response = await api.get<MovieDetailResponse>(`/movies/${tmdbId}`);
  return response.data;
};

const getSimilar = async (tmdbId: number): Promise<{ results: TmdbSearchResult[] }> => {
  const response = await api.get(`/movies/${tmdbId}/similar`);
  return response.data;
};

interface DiscoverParams {
  genres?: string;
  sort_by?: string;
  vote_gte?: number;
  release_from?: string;
  release_to?: string;
  page?: number;
}

const discover = async (params: DiscoverParams): Promise<MovieListResponse> => {
  const response = await api.get<MovieListResponse>('/movies/discover', { params });
  return response.data;
};

export const moviesService = { search, discover, getPopular, getTopRated, getNowPlaying, getDetail, getSimilar };
