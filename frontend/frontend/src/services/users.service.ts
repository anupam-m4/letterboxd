import api from './api';
import type { UserProfile, Review, Pagination, WatchlistEntry, WatchedEntry, User } from '../types';

const getProfile = async (username: string): Promise<UserProfile> => {
  const response = await api.get<UserProfile>(`/users/${username}`);
  return response.data;
};

const getReviews = async (username: string, page = 1): Promise<{ reviews: Review[]; pagination: Pagination }> => {
  const response = await api.get(`/users/${username}/reviews`, { params: { page } });
  return response.data;
};

const follow = async (username: string): Promise<{ following: boolean }> => {
  const response = await api.post<{ following: boolean }>(`/users/${username}/follow`);
  return response.data;
};

const unfollow = async (username: string): Promise<{ following: boolean }> => {
  const response = await api.delete<{ following: boolean }>(`/users/${username}/follow`);
  return response.data;
};

const addToWatchlist = async (tmdbId: number): Promise<{ inWatchlist: boolean }> => {
  const response = await api.post<{ inWatchlist: boolean }>('/watchlist', { tmdbId });
  return response.data;
};

const removeFromWatchlist = async (tmdbId: number): Promise<{ inWatchlist: boolean }> => {
  const response = await api.delete<{ inWatchlist: boolean }>(`/watchlist/${tmdbId}`);
  return response.data;
};

const markWatched = async (tmdbId: number): Promise<{ watched: boolean }> => {
  const response = await api.post<{ watched: boolean }>('/watched', { tmdbId });
  return response.data;
};

const unmarkWatched = async (tmdbId: number): Promise<{ watched: boolean }> => {
  const response = await api.delete<{ watched: boolean }>(`/watched/${tmdbId}`);
  return response.data;
};

const updateProfile = async (payload: { bio?: string; avatar_url?: string }): Promise<void> => {
  await api.put('/users/profile', payload);
};

const getWatchlist = async (username: string, page = 1): Promise<{ movies: WatchlistEntry[]; pagination: Pagination }> => {
  const response = await api.get(`/users/${username}/watchlist`, { params: { page } });
  return response.data;
};

const getWatched = async (username: string, page = 1): Promise<{ movies: WatchedEntry[]; pagination: Pagination }> => {
  const response = await api.get(`/users/${username}/watched`, { params: { page } });
  return response.data;
};

const searchUsers = async (query: string): Promise<{ users: (Pick<User, 'id' | 'username' | 'bio' | 'avatar_url'> & { is_following: boolean })[] }> => {
  const response = await api.get('/users/search', { params: { q: query } });
  return response.data;
};

const getMyFollowing = async (): Promise<{ following: string[] }> => {
  const response = await api.get('/users/me/following');
  return response.data;
};

export const usersService = { getProfile, getReviews, getWatchlist, getWatched, updateProfile, searchUsers, getMyFollowing, follow, unfollow, addToWatchlist, removeFromWatchlist, markWatched, unmarkWatched };
