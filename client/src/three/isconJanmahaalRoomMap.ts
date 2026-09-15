// Bridges the hand-authored Iscon Janmahaal floor model (room/common ids
// like "reception", "counsel1", "lift") to the DB's Area records (codes
// like A001-A018) -- lets clicking a room in the detailed 3D model open
// the same PublicAreaPanel every other branch's generic boxes use, and
// lets FloorScene fit the camera to this floor without needing the
// generic `layout` field at all. Codes come from
// server/src/scripts/importIsconJanmahaal.ts.
import type { AreaLayoutRect } from '@/three/layout';
import { FEET_TO_UNITS } from '@/three/layout';
import { CENTER, commonList, roomList } from '@/three/isconJanmahaalFloorModel';

export const MODEL_ID_TO_AREA_CODE: Record<string, string> = {
  reception: 'VAD05-F2-A001',
  counsel1: 'VAD05-F2-A002',
  counsel2: 'VAD05-F2-A003',
  counsel3: 'VAD05-F2-A004',
  demo: 'VAD05-F2-A005',
  cabin1: 'VAD05-F2-A006',
  cabin2: 'VAD05-F2-A007',
  cmCabin: 'VAD05-F2-A008',
  faculty: 'VAD05-F2-A009',
  lab: 'VAD05-F2-A010',
  audi1: 'VAD05-F2-A011',
  audi2: 'VAD05-F2-A012',
  audi3: 'VAD05-F2-A013',
  pantry: 'VAD05-F2-A014',
  maleWR: 'VAD05-F2-A015',
  femWR: 'VAD05-F2-A016',
  passage: 'VAD05-F2-A017',
  // Lift and stairs are one DB record (A018) but two model footprints --
  // their rect below is the combined bounding box of both.
  lift: 'VAD05-F2-A018',
  stair: 'VAD05-F2-A018',
};

function rectFromBounds(x1: number, z1: number, x2: number, z2: number) {
  return {
    x: ((x1 + x2) / 2 - CENTER.x) * FEET_TO_UNITS,
    z: ((z1 + z2) / 2 - CENTER.z) * FEET_TO_UNITS,
    width: (x2 - x1) * FEET_TO_UNITS,
    depth: (z2 - z1) * FEET_TO_UNITS,
  };
}

// One AreaLayoutRect per DB area code actually present on the floor,
// derived from the model's own room/common rects -- mirrors
// layoutFromRealCoordinates()'s shape so FloorScene's existing camera-fit
// and click-to-focus logic works unchanged for this floor too.
export function isconJanmahaalRects(areaCodes: Set<string>): AreaLayoutRect[] {
  const bounds = new Map<string, [number, number, number, number]>();
  for (const rm of roomList) {
    const code = MODEL_ID_TO_AREA_CODE[rm.id];
    if (code) bounds.set(code, rm.r);
  }
  for (const c of commonList) {
    const code = MODEL_ID_TO_AREA_CODE[c.id];
    if (!code) continue;
    const [x1, z1, x2, z2] = c.r;
    const prev = bounds.get(code);
    bounds.set(code, prev
      ? [Math.min(prev[0], x1), Math.min(prev[1], z1), Math.max(prev[2], x2), Math.max(prev[3], z2)]
      : [x1, z1, x2, z2]);
  }
  const rects: AreaLayoutRect[] = [];
  for (const [areaCode, [x1, z1, x2, z2]] of bounds) {
    if (!areaCodes.has(areaCode)) continue;
    rects.push({ areaCode, ...rectFromBounds(x1, z1, x2, z2) });
  }
  return rects;
}

// The floor's true footprint (every room + common circulation rect),
// independent of which DB areas exist -- used for the initial
// establishing-shot camera fit.
export function isconJanmahaalBounds(): { width: number; depth: number } {
  const rects = [...roomList.map((r) => r.r), ...commonList.map((c) => c.r)];
  const minX = Math.min(...rects.map((r) => r[0]));
  const maxX = Math.max(...rects.map((r) => r[2]));
  const minZ = Math.min(...rects.map((r) => r[1]));
  const maxZ = Math.max(...rects.map((r) => r[3]));
  return { width: (maxX - minX) * FEET_TO_UNITS, depth: (maxZ - minZ) * FEET_TO_UNITS };
}
