import api from './api';
import type { JournalArticle } from '../types';

const getAll = async (limit = 20): Promise<JournalArticle[]> => {
  const response = await api.get<JournalArticle[]>('/journal', { params: { limit } });
  return response.data;
};

const getFeatured = async (): Promise<JournalArticle | null> => {
  const response = await api.get<JournalArticle | null>('/journal/featured');
  return response.data;
};

const getSpotlight = async (limit = 4): Promise<JournalArticle[]> => {
  const response = await api.get<JournalArticle[]>('/journal/spotlight', { params: { limit } });
  return response.data;
};

const getByCategory = async (category: string, limit = 6): Promise<JournalArticle[]> => {
  const response = await api.get<JournalArticle[]>(`/journal/category/${encodeURIComponent(category)}`, {
    params: { limit },
  });
  return response.data;
};

export const journalService = { getAll, getFeatured, getSpotlight, getByCategory };
