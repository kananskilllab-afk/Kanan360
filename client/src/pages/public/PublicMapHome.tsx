import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// A real, pannable — but Gujarat-only — map with a pin at each branch's
// actual address (see branchLocations.ts). Replaces the old abstract
// "building blocks" scene. Clicking a pin hands off to the same
// reveal-or-navigate flow every branch entry point uses
// (useBranchNavigate.ts): a Street View reveal first if one's on file for
// that branch (Iscon Janmahaal today), straight to its floor page
// otherwise.
export function PublicMapHome() {
  const { data: branches } = usePublicBranches();
  const goToBranch = useBranchNavigate();

  const gujaratLayer = useMemo(() => L.geoJSON(GUJARAT_GEOJSON as GeoJSON.GeoJsonObject), []);
  const gujaratBounds = useMemo(() => gujaratLayer.getBounds(), [gujaratLayer]);
  const maskRings = useMemo<LatLng[][]>(() => [WORLD_RING, ...outerRings(GUJARAT_GEOJSON)], []);

  if (!branches?.length) return null;

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

      <div className="pointer-events-none absolute bottom-5 left-5 z-[1] flex items-center gap-1.5 rounded-full border border-black/10 bg-white/90 px-3.5 py-2 text-xs text-neutral-600 shadow-sm backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#8a4e1a]" />
        <span className="font-medium text-neutral-800">{branches.length} branches</span>
        <span className="text-neutral-400">·</span>
        <span>Gujarat</span>
      </div>
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
