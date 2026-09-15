import type { AppUser } from '@kanan-baroda/shared';
import { apiClient, refreshSession } from '@/lib/apiClient';

export interface LoginResponse {
  accessToken: string;
  user: AppUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function refresh(): Promise<LoginResponse> {
  const result = await refreshSession();
  if (!result) throw new Error('No active session');
  return result as LoginResponse;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
