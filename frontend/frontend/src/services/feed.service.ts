import api from './api';
import type { FeedActivity, Pagination } from '../types';

interface FeedResponse {
  activities: FeedActivity[];
  pagination: Pagination;
  isEmpty: boolean;
}

const getFeed = async (page = 1): Promise<FeedResponse> => {
  const response = await api.get<FeedResponse>('/feed', { params: { page } });
  return response.data;
};

export const feedService = { getFeed };
