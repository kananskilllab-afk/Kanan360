// Procedural floor-plan layout — there is no real architectural drawing
// yet (no CDR/SVG/GLB), so room footprints are derived from each Area's
// areaSqFt using a shelf/row bin-packing algorithm: areas are bucketed
// into rows, then each row's depth is set so the row's rectangle area
// exactly equals the sum of its items' target areas, and each item's
// width is back-solved from that shared depth. The result is a gapless,
// area-preserving grid that reads as a plausible office floor plate.
// Swapping this for real geometry later only changes this one module —
// nothing downstream (the Area ID, the info panel, the API) changes
// (see ARCH-SPEC IDX·03 / FLO·07).

export interface AreaLayoutInput {
  areaCode: string;
  areaSqFt: number;
}

export interface AreaLayoutRect {
  areaCode: string;
  x: number;
  z: number;
  width: number;
  depth: number;
}

// World units² per sq. ft. — tuned so a ~4,000 sq. ft. floor renders as a
// plate roughly 16-20 units wide, a comfortable frame for the default
// camera distance.
const AREA_SCALE = 1 / 16;

export function layoutAreas(areas: AreaLayoutInput[]): { rects: AreaLayoutRect[]; width: number; depth: number } {
  if (areas.length === 0) return { rects: [], width: 0, depth: 0 };

  const totalUnits = areas.reduce((sum, a) => sum + a.areaSqFt * AREA_SCALE, 0);
  const maxRowWidth = Math.max(Math.sqrt(totalUnits * 1.5), 4);

  const rows: AreaLayoutInput[][] = [];
  let current: AreaLayoutInput[] = [];
  let currentWidthEstimate = 0;
  for (const area of areas) {
    const estWidth = Math.sqrt(Math.max(area.areaSqFt, 1) * AREA_SCALE);
    if (current.length > 0 && currentWidthEstimate + estWidth > maxRowWidth) {
      rows.push(current);
      current = [];
      currentWidthEstimate = 0;
    }
    current.push(area);
    currentWidthEstimate += estWidth;
  }
  if (current.length) rows.push(current);

  const rects: AreaLayoutRect[] = [];
  let cursorZ = 0;
  let maxWidthUsed = 0;

  for (const row of rows) {
    const rowUnits = row.reduce((sum, a) => sum + a.areaSqFt * AREA_SCALE, 0);
    const rowDepth = rowUnits / maxRowWidth;
    let cursorX = 0;
    for (const area of row) {
      const width = (area.areaSqFt * AREA_SCALE) / rowDepth;
      rects.push({
        areaCode: area.areaCode,
        x: cursorX + width / 2,
        z: cursorZ + rowDepth / 2,
        width,
        depth: rowDepth,
      });
      cursorX += width;
    }
    maxWidthUsed = Math.max(maxWidthUsed, cursorX);
    cursorZ += rowDepth;
  }

  const totalWidth = maxWidthUsed;
  const totalDepth = cursorZ;
  for (const r of rects) {
    r.x -= totalWidth / 2;
    r.z -= totalDepth / 2;
  }

  return { rects, width: totalWidth, depth: totalDepth };
}

export interface RealLayoutInput {
  areaCode: string;
  layout?: { x: number; z: number; widthFt: number; depthFt: number };
}

// Feet → world units for digitized floor plans (see the server's Area
// model `layout` field). Independent of AREA_SCALE above — this one is a
// straight linear conversion, not an area-preserving derivation — but
// tuned to land in the same visual scale as the procedural layout so a
// digitized floor and a generic one feel like the same product.
export const FEET_TO_UNITS = 0.25;

// True when every area on this floor carries real digitized coordinates
// — the two layout strategies aren't mixed on one floor.
export function hasRealLayout(areas: RealLayoutInput[]): boolean {
  return areas.length > 0 && areas.every((a) => !!a.layout);
}

// Renders a floor plan from real architectural-drawing coordinates
// instead of packing rectangles by area alone. Input `layout.x/z` is each
// room's top-left corner in feet, floor-local origin; output centers the
// whole plate at the origin, same convention as layoutAreas().
export function layoutFromRealCoordinates(areas: RealLayoutInput[]): {
  rects: AreaLayoutRect[];
  width: number;
  depth: number;
} {
  const withLayout = areas.filter(
    (a): a is RealLayoutInput & { layout: NonNullable<RealLayoutInput['layout']> } => !!a.layout,
  );
  if (withLayout.length === 0) return { rects: [], width: 0, depth: 0 };

  const minX = Math.min(...withLayout.map((a) => a.layout.x));
  const maxX = Math.max(...withLayout.map((a) => a.layout.x + a.layout.widthFt));
  const minZ = Math.min(...withLayout.map((a) => a.layout.z));
  const maxZ = Math.max(...withLayout.map((a) => a.layout.z + a.layout.depthFt));
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  const rects: AreaLayoutRect[] = withLayout.map((a) => ({
    areaCode: a.areaCode,
    x: (a.layout.x + a.layout.widthFt / 2 - centerX) * FEET_TO_UNITS,
    z: (a.layout.z + a.layout.depthFt / 2 - centerZ) * FEET_TO_UNITS,
    width: a.layout.widthFt * FEET_TO_UNITS,
    depth: a.layout.depthFt * FEET_TO_UNITS,
  }));

  return { rects, width: (maxX - minX) * FEET_TO_UNITS, depth: (maxZ - minZ) * FEET_TO_UNITS };
}

// A simple grid for seats inside an area's rect — not calibrated to the
// seed script's placeholder Seat.position values (those aren't scaled to
// real room dimensions either), just a tidy in-bounds arrangement for
// however many seats the area holds.
export function layoutSeatsInRect(count: number, rect: AreaLayoutRect, marginRatio = 0.72): Array<{ x: number; z: number }> {
  if (count === 0) return [];
  const cols = Math.max(Math.round(Math.sqrt(count * (rect.width / rect.depth))), 1);
  const rowsCount = Math.ceil(count / cols);
  const usableWidth = rect.width * marginRatio;
  const usableDepth = rect.depth * marginRatio;
  const stepX = cols > 1 ? usableWidth / (cols - 1) : 0;
  const stepZ = rowsCount > 1 ? usableDepth / (rowsCount - 1) : 0;

  const points: Array<{ x: number; z: number }> = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = rect.x - usableWidth / 2 + col * stepX;
    const z = rect.z - usableDepth / 2 + row * stepZ;
    points.push({ x, z });
  }
  return points;
}
