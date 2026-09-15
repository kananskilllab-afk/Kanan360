// Three.js materials can't consume CSS custom properties, so these mirror
// the dark-theme hex values in client/src/index.css and
// @kanan-baroda/shared's status.ts / departments.ts by value — same
// palette, same meaning, everywhere the spec asks for it (ARCH-SPEC
// DAT·02 "centralized status/theme configuration"). If the brand palette
// changes, update index.css and this file together.
import type { SeatStatus } from '@kanan-baroda/shared';

export const SCENE = {
  ground: '#e7e6dd',
  buildingBase: '#c9c6b8',
  buildingAccent: '#8a4e1a',
  floorPlate: '#d8d6ca',
  wallLine: '#4a4a42',
} as const;

export const STATUS_COLOR_3D: Record<SeatStatus, string> = {
  AVAILABLE: '#3f8f63',
  OCCUPIED: '#c2594a',
  RESERVED: '#4a7fa8',
  MAINTENANCE: '#8f8a7a',
  NOT_ASSIGNED: '#b3b0a3',
};

export const DEPARTMENT_COLORS_3D = ['#5b6ea6', '#2f7a78', '#8c5b9e', '#a6667a', '#7a8c4e', '#4e7a8c', '#a6822e'];

export function departmentColor3D(colorToken: string | undefined): string {
  if (!colorToken) return SCENE.buildingBase;
  const index = Number(colorToken.replace('--dept-', '')) - 1;
  return DEPARTMENT_COLORS_3D[index] ?? SCENE.buildingBase;
}

const AREA_TYPE_TINT: Record<string, string> = {
  RECEPTION: '#a8895a',
  MEETING_ROOM: '#6b83a8',
  CAFETERIA: '#a87a5a',
  UTILITY: '#8a8a82',
  CABIN: '#8c6a3e',
};

// Rooms without a department (reception, meeting rooms, utility, cafeteria)
// still need a distinguishable color — falls back to a type-based tint.
export function areaFillColor3D(areaType: string, departmentColorToken?: string): string {
  if (departmentColorToken) return departmentColor3D(departmentColorToken);
  return AREA_TYPE_TINT[areaType] ?? SCENE.buildingBase;
}
