import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import * as authService from '@/services/authService';

export function useAuth() {
  const { user, accessToken, status, setSession, clearSession } = useAuthStore();

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login(email, password);
      setSession(result.accessToken, result.user);
      return result.user;
    },
    [setSession],
  );

  const signOut = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    clearSession();
  }, [clearSession]);

  return {
    user,
    accessToken,
    status,
    isAuthenticated: status === 'authenticated',
    signIn,
    signOut,
  };
}
