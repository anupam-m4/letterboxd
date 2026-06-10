import api from './api';
import type { User, LoginPayload, RegisterPayload } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', payload);
  return response.data;
};

const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', payload);
  return response.data;
};

const getMe = async (): Promise<User> => {
  const response = await api.get<{ user: User }>('/auth/me');
  return response.data.user;
};

export const authService = { register, login, getMe };
