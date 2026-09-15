// Shared by the admin and public analytics controllers so the same number
// is never computed two slightly different ways.

export function pct(part: number, whole: number): number {
  return whole ? Math.round((part / whole) * 1000) / 10 : 0;
}

// The proportional square-footage split behind "Used / Available sq. ft."
// on an area card: without per-seat floor plates, occupancy ratio inside
// an area is the most defensible stand-in for how much of its footprint
// is in use.
export function usedSqFt(areaSqFt: number, seatingCapacity: number, occupiedSeats: number): number {
  if (!seatingCapacity) return 0;
  return Math.round(areaSqFt * (occupiedSeats / seatingCapacity) * 10) / 10;
}
