import { Outlet, useMatches } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

interface RouteHandle {
  title?: string;
}

export function AppLayout() {
  const matches = useMatches();
  const current = [...matches].reverse().find((m) => (m.handle as RouteHandle | undefined)?.title);
  const title = (current?.handle as RouteHandle | undefined)?.title ?? 'Kanan Baroda';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
