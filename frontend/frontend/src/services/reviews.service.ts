import api from './api';
import type { Review, Pagination } from '../types';

interface CreateReviewPayload {
  tmdbId: number;
  content: string;
  rating: number;
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: Pagination;
}

const create = async (payload: CreateReviewPayload): Promise<Review> => {
  const response = await api.post<{ review: Review }>('/reviews', payload);
  return response.data.review;
};

const update = async (reviewId: string, payload: { content: string; rating: number }): Promise<Review> => {
  const response = await api.put<{ review: Review }>(`/reviews/${reviewId}`, payload);
  return response.data.review;
};

const remove = async (reviewId: string): Promise<void> => {
  await api.delete(`/reviews/${reviewId}`);
};

const getByMovie = async (tmdbId: number, page = 1): Promise<ReviewsResponse> => {
  const response = await api.get<ReviewsResponse>(`/movies/${tmdbId}/reviews`, {
    params: { page },
  });
  return response.data;
};

const like = async (reviewId: string): Promise<{ liked: boolean; likes_count: number }> => {
  const response = await api.post<{ liked: boolean; likes_count: number }>(`/reviews/${reviewId}/like`);
  return response.data;
};

export const reviewsService = { create, update, remove, getByMovie, like };
