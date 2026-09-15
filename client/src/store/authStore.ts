import { create } from 'zustand';
import type { AppUser } from '@kanan-baroda/shared';

interface AuthState {
  user: AppUser | null;
  accessToken: string | null;
  status: 'checking' | 'authenticated' | 'anonymous';
  setSession: (accessToken: string, user: AppUser) => void;
  clearSession: () => void;
  setStatus: (status: AuthState['status']) => void;
}

// Deliberately not persisted to localStorage — the access token lives in
// memory only, and a page refresh re-derives it from the httpOnly refresh
// cookie (see lib/apiClient.ts). This keeps the JWT out of reach of any
// script running on the page (ARCH-SPEC "Security").
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'checking',
  setSession: (accessToken, user) => set({ accessToken, user, status: 'authenticated' }),
  clearSession: () => set({ accessToken: null, user: null, status: 'anonymous' }),
  setStatus: (status) => set({ status }),
}));
