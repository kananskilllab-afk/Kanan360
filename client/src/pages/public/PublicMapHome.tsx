import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePublicBranches } from '@/hooks/usePublicData';
import { useBranchNavigate } from '@/hooks/useBranchNavigate';
import { BRANCH_LOCATIONS, GUJARAT_CENTER, GUJARAT_ZOOM } from '@/lib/branchLocations';
import type { PublicBranch } from '@/services/public/publicApi';

// A real, pannable map of Gujarat with a pin at each branch's actual
// address (see branchLocations.ts) — replaces the old abstract "building
// blocks" scene. Clicking a pin hands off to the same reveal-or-navigate
// flow every branch entry point uses (useBranchNavigate.ts): a Street
// View reveal first if one's on file for that branch (Iscon Janmahaal
// today), straight to its floor page otherwise.
export function PublicMapHome() {
  const { data: branches } = usePublicBranches();
  const goToBranch = useBranchNavigate();

  if (!branches?.length) return null;

  return (
    <MapContainer
      center={GUJARAT_CENTER}
      zoom={GUJARAT_ZOOM}
      minZoom={6}
      maxZoom={18}
      zoomControl={false}
      className="isolate h-full w-full"
      style={{ background: '#eef2ec' }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {branches.map((branch) => {
        const location = BRANCH_LOCATIONS[branch.code];
        if (!location) return null;
        return <BranchPin key={branch._id} branch={branch} location={location} onSelect={goToBranch} />;
      })}
    </MapContainer>
  );
}

function BranchPin({
  branch,
  location,
  onSelect,
}: {
  branch: PublicBranch;
  location: { lat: number; lng: number };
  onSelect: (branch: PublicBranch) => void;
}) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `
          <div class="branch-pin">
            <span class="branch-pin__ring"></span>
            <span class="branch-pin__dot"></span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
    [],
  );

  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(branch),
      }}
    >
      <Tooltip direction="top" offset={[0, -14]} opacity={1} className="branch-tooltip">
        <div className="branch-tooltip-card min-w-40">
          <p className="font-heading text-sm font-semibold text-neutral-900">{branch.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-wide text-neutral-500">
            {branch.code} · {branch.location}
          </p>
          <div className="mt-1.5 flex gap-3 text-[11px] text-neutral-600">
            <span>
              {branch.totalFloors} floor{branch.totalFloors === 1 ? '' : 's'}
            </span>
            <span>{branch.totalSeats} seats</span>
            <span>{branch.utilization}% used</span>
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}
