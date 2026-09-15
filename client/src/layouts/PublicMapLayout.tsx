import { Outlet } from 'react-router-dom';
import { PublicTopBar } from '@/components/public/PublicTopBar';
import { StreetViewReveal } from '@/components/public/StreetViewReveal';

// The landing route's shell: a real map (Leaflet, see PublicMapHome.tsx)
// instead of the 3D <Canvas> that /branch/:code uses (PublicLayout.tsx) --
// a pin click still hands off to the same Street-View-reveal-then-navigate
// flow via useBranchNavigate.ts, so StreetViewReveal lives here too.
export function PublicMapLayout() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#eef2ec]">
      <Outlet />
      <PublicTopBar />
      <StreetViewReveal />
    </div>
  );
}
