// Real coordinates for each branch, geocoded from its address (OSM
// Nominatim) — VAD05's is exact (pulled from the Street View embed on
// file for it, see branchStreetView.ts); the rest resolve to the
// building or, where a street address wasn't specific enough to geocode
// directly, the named locality (accurate to neighborhood level).
export interface BranchLocation {
  lat: number;
  lng: number;
}

export const BRANCH_LOCATIONS: Record<string, BranchLocation> = {
  VAD01: { lat: 22.3147347, lng: 73.1643345 }, // Trident Shopping Complex, Race Course Rd
  VAD02: { lat: 22.2905178, lng: 73.1269699 }, // Bhayli
  VAD03: { lat: 22.2758686, lng: 73.1879304 }, // Manjalpur
  VAD04: { lat: 22.3001884, lng: 73.2384439 }, // Waghodia Road
  VAD05: { lat: 22.31118588861243, lng: 73.1817828085798 }, // Iscon Janmahaal Complex
};

// Gujarat's rough centroid/zoom for the map's initial view.
export const GUJARAT_CENTER: [number, number] = [22.2587, 71.1924];
export const GUJARAT_ZOOM = 7;
