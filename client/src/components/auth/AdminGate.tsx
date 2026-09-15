import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { refreshSession } from '@/lib/apiClient';
import { LoginPage } from '@/pages/LoginPage';

// The only door into the admin console. The public site (mounted at `/`)
// never renders this and never attempts a session check at all — a
// visitor there has no account to check (ARCH-SPEC "CRITICAL ACCESS
// REQUIREMENT"). This component IS /admin: unauthenticated, it renders
// the login form in place; authenticated, it renders the console via
// Outlet — the URL never changes, so a deep link into e.g.
// /admin/branches/:id still lands there once signed in.
export function AdminGate() {
  const status = useAuthStore((s) => s.status);
  const setSession = useAuthStore((s) => s.setSession);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    if (status !== 'checking') return;
    let cancelled = false;
    refreshSession()
      .then((result) => {
        if (cancelled) return;
        if (result) setSession(result.accessToken, result.user as never);
        else setStatus('anonymous');
      })
      .catch(() => {
        if (!cancelled) setStatus('anonymous');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === 'checking') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading admin console…
      </div>
    );
  }

  if (status === 'anonymous') {
    return <LoginPage />;
  }

  return <Outlet />;
}
