import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BrandLogo } from '@/components/common/BrandLogo';
import { usePublicBranches } from '@/hooks/usePublicData';
import { useBranchNavigate } from '@/hooks/useBranchNavigate';
import { BRANCH_LOCATIONS } from '@/lib/branchLocations';
import gujaratBoundary from '@/lib/gujaratBoundary.json';
import type { PublicBranch } from '@/services/public/publicApi';

type LatLng = [number, number];
type GeoJSONMultiPolygon = { type: 'MultiPolygon' | 'Polygon'; coordinates: number[][][][] | number[][][] };

// A world-covering rectangle so the mask polygon below can punch Gujarat's
// shape out of it as a hole, hiding every country/state around it instead
// of just fading them — see WORLD_MASK's usage.
const WORLD_RING: LatLng[] = [
  [-85, -180],
  [-85, 180],
  [85, 180],
  [85, -180],
];

// Each Gujarat sub-polygon's outer ring, converted from GeoJSON's [lng,lat]
// to Leaflet's [lat,lng] -- becomes one hole in the mask below (islands in
// the Gulf of Kutch keep the state's real coastline instead of a smoothed
// blob).
function outerRings(geojson: GeoJSONMultiPolygon): LatLng[][] {
  const polygons = geojson.type === 'MultiPolygon' ? (geojson.coordinates as number[][][][]) : [geojson.coordinates as number[][][]];
  return polygons.map((poly) => poly[0].map(([lng, lat]) => [lat, lng] as LatLng));
}

const GUJARAT_GEOJSON = gujaratBoundary as GeoJSONMultiPolygon;

// The landing page: a brand hero with real, aggregated numbers (not
// invented copy) over a Gujarat-only map with a pin at each branch's
// actual address (see branchLocations.ts). Clicking a pin hands off to
// the same reveal-or-navigate flow every branch entry point uses
// (useBranchNavigate.ts): a Street View reveal first if one's on file
// for that branch (Iscon Janmahaal today), straight to its floor page
// otherwise.
export function PublicMapHome() {
  const { data: branches } = usePublicBranches();

  const stats = useMemo(() => {
    if (!branches?.length) return null;
    return {
      branches: branches.length,
      floors: branches.reduce((sum, b) => sum + b.totalFloors, 0),
      seats: branches.reduce((sum, b) => sum + b.totalSeats, 0),
      sqFt: branches.reduce((sum, b) => sum + b.totalAreaSqFt, 0),
    };
  }, [branches]);

  if (!branches?.length || !stats) return null;

  return (
    <div className="flex h-full w-full flex-col">
      <header className="relative z-[2] border-b border-black/10 bg-[#fbf8f2]/90 px-6 py-5 backdrop-blur-sm sm:px-10 sm:py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3.5">
            <BrandLogo className="h-10 shrink-0" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8a4e1a]">
                Coaching &amp; Admissions
              </p>
              <h1 className="mt-1 font-heading text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl">
                Find your nearest Kanan center
              </h1>
              <p className="mt-1 max-w-md text-sm text-neutral-600">
                {stats.branches} branches across Vadodara, Gujarat — tap a pin to walk through the real floor plan in
                3D.
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-4 gap-x-5 gap-y-1 sm:gap-x-8">
            <Stat label="Branches" value={stats.branches} />
            <Stat label="Floors" value={stats.floors} />
            <Stat label="Seats" value={stats.seats.toLocaleString('en-IN')} />
            <Stat label="Sq. Ft" value={Math.round(stats.sqFt).toLocaleString('en-IN')} />
          </dl>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <GujaratMap branches={branches} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="font-heading text-xl font-semibold text-neutral-900 sm:text-2xl">{value}</dd>
    </div>
  );
}

function GujaratMap({ branches }: { branches: PublicBranch[] }) {
  const goToBranch = useBranchNavigate();

  const gujaratLayer = useMemo(() => L.geoJSON(GUJARAT_GEOJSON as GeoJSON.GeoJsonObject), []);
  const gujaratBounds = useMemo(() => gujaratLayer.getBounds(), [gujaratLayer]);
  const maskRings = useMemo<LatLng[][]>(() => [WORLD_RING, ...outerRings(GUJARAT_GEOJSON)], []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        bounds={gujaratBounds.pad(0.9)}
        minZoom={6.5}
        maxZoom={18}
        maxBounds={gujaratBounds.pad(0.35)}
        maxBoundsViscosity={1}
        zoomControl={false}
        attributionControl={false}
        className="isolate h-full w-full"
        style={{ background: '#eef2ec' }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Everything outside Gujarat's real coastline is masked to the
            page background — "only Gujarat", not Gujarat-plus-neighbors. */}
        <Polygon
          positions={maskRings}
          pathOptions={{ stroke: false, fillColor: '#eef2ec', fillOpacity: 1, interactive: false }}
        />
        <GeoJSON
          data={GUJARAT_GEOJSON as GeoJSON.GeoJsonObject}
          style={{ color: '#8a4e1a', weight: 1.75, fillOpacity: 0, opacity: 0.55 }}
          interactive={false}
        />

        <SettleIntoView bounds={gujaratBounds} />

        {branches.map((branch, i) => {
          const location = BRANCH_LOCATIONS[branch.code];
          if (!location) return null;
          return <BranchPin key={branch._id} branch={branch} location={location} index={i} onSelect={goToBranch} />;
        })}
      </MapContainer>
    </div>
  );
}

// Opens on a wider view than the final framing, then settles into place --
// reads as the map arriving, not a hard cut to its resting state.
function SettleIntoView({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.flyToBounds(bounds.pad(0.06), { duration: 1.7, easeLinearity: 0.25 });
    }, 200);
    return () => clearTimeout(timer);
  }, [map, bounds]);
  return null;
}

function BranchPin({
  branch,
  location,
  index,
  onSelect,
}: {
  branch: PublicBranch;
  location: { lat: number; lng: number };
  index: number;
  onSelect: (branch: PublicBranch) => void;
}) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `
          <div class="branch-pin" style="animation-delay:${1700 + index * 110}ms">
            <span class="branch-pin__ring"></span>
            <span class="branch-pin__head"><span class="branch-pin__head-dot"></span></span>
            <span class="branch-pin__tail"></span>
          </div>
        `,
        iconSize: [44, 58],
        iconAnchor: [22, 56],
      }),
    [index],
  );

  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(branch),
      }}
    >
      <Tooltip direction="top" offset={[0, -50]} opacity={1} className="branch-tooltip">
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
