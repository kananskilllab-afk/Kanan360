import { Outlet } from 'react-router-dom';
import { StreetViewReveal } from '@/components/public/StreetViewReveal';

// The landing route's shell: a real map (Leaflet, see PublicMapHome.tsx)
// instead of the 3D <Canvas> that /branch/:code uses (PublicLayout.tsx) --
// a pin click still hands off to the same Street-View-reveal-then-navigate
// flow via useBranchNavigate.ts, so StreetViewReveal lives here too.
// No floating PublicTopBar here — PublicMapHome's own hero header carries
// the brand identity instead of a small pill floating over the map.
export function PublicMapLayout() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#eef2ec]">
      <Outlet />
      <StreetViewReveal />
    </div>
  );
}
