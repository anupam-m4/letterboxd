import api from './api';
import type { RecommendedFilm } from '../types';

interface InsightsResponse {
  summary: string | null;
  sentiment?: 'positive' | 'mixed' | 'negative';
}

interface RecommendResponse {
  recommendations: RecommendedFilm[];
  message?: string;
}

const recommend = async (mood?: string): Promise<RecommendResponse> => {
  const response = await api.post<RecommendResponse>('/ai/recommend', { mood: mood ?? '' });
  return response.data;
};

const getInsights = async (tmdbId: number): Promise<InsightsResponse> => {
  const response = await api.get<InsightsResponse>(`/ai/movie/${tmdbId}/insights`);
  return response.data;
};

export const aiService = { recommend, getInsights };
