import { useCallback, useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { PublicArea } from '@/services/public/publicApi';
import { usePublicSceneStore } from '@/store/publicSceneStore';
import { SCENE } from '@/three/materials';
import { FEET_TO_UNITS } from '@/three/layout';
import { buildFloor, CENTER, commonList, FEET_TO_METERS, roomList } from '@/three/isconJanmahaalFloorModel';
import { MODEL_ID_TO_AREA_CODE } from '@/three/isconJanmahaalRoomMap';

// Rescales the model's internal feet->metres build into the site's
// feet->world-unit convention (see layout.ts's FEET_TO_UNITS), so this
// floor sits at the same visual scale as every other branch's generic
// per-area boxes.
const SCALE = FEET_TO_UNITS / FEET_TO_METERS;

const AREA_CODE_TO_MODEL_ID = Object.fromEntries(
  Object.entries(MODEL_ID_TO_AREA_CODE).map(([modelId, code]) => [code, modelId]),
);

interface IsconJanmahaalFloorProps {
  areas: PublicArea[];
  onSelectArea: (area: PublicArea) => void;
}

// Iscon Janmahaal's 2nd floor, rendered from the architect's drawing
// (real walls, doors, glazing and furniture) instead of the generic
// per-area box every other branch uses -- see FloorScene.tsx for where
// this is swapped in, and isconJanmahaalRoomMap.ts for how a click on a
// mesh here resolves back to a DB Area.
export function IsconJanmahaalFloor({ areas, onSelectArea }: IsconJanmahaalFloorProps) {
  const showLabels = usePublicSceneStore((s) => s.showLabels);
  const selectedAreaCode = usePublicSceneStore((s) => s.selectedAreaCode);
  const setHoveredAreaCode = usePublicSceneStore((s) => s.setHoveredAreaCode);

  // showSeats has no equivalent here -- the model's furniture kits already
  // imply seating per room, so that toggle is a no-op on this floor.
  const group = useMemo(
    () => buildFloor({ furniture: true, labels: showLabels, glazing: true, useWash: true, common: true }),
    [showLabels],
  );

  const areaByCode = useMemo(() => new Map(areas.map((a) => [a.areaCode, a])), [areas]);

  // Furniture/floor meshes are named `${roomId}_...` / `floor_${roomId}` --
  // but the closest hit along the ray is often a glass partition or shared
  // wall in front of them, which carry no room id. Scan every intersection
  // along the ray (not just the nearest) so a click passes straight
  // through glass to the room/furniture behind it. Shared walls and the
  // common-circulation blob are never room-tagged at all, so those fall
  // back to a point-in-rect test against the common-area footprints.
  const resolveModelId = useCallback((event: ThreeEvent<MouseEvent | PointerEvent>): string | null => {
    for (const hit of event.intersections) {
      const name = hit.object.name;
      for (const rm of roomList) {
        if (name === `floor_${rm.id}` || name.startsWith(`${rm.id}_`)) return rm.id;
      }
    }
    const point = event.intersections[0]?.point ?? event.point;
    const localX = point.x / FEET_TO_UNITS + CENTER.x;
    const localZ = point.z / FEET_TO_UNITS + CENTER.z;
    for (const c of commonList) {
      const [x1, z1, x2, z2] = c.r;
      if (localX >= x1 && localX <= x2 && localZ >= z1 && localZ <= z2) return c.id;
    }
    return null;
  }, []);

  const resolveArea = useCallback(
    (event: ThreeEvent<MouseEvent | PointerEvent>): PublicArea | null => {
      const modelId = resolveModelId(event);
      if (!modelId) return null;
      const areaCode = MODEL_ID_TO_AREA_CODE[modelId];
      return areaCode ? (areaByCode.get(areaCode) ?? null) : null;
    },
    [resolveModelId, areaByCode],
  );

  const selectedRing = useMemo(() => {
    if (!selectedAreaCode) return null;
    const modelId = AREA_CODE_TO_MODEL_ID[selectedAreaCode];
    if (!modelId) return null;
    const rect = roomList.find((r) => r.id === modelId)?.r ?? commonList.find((c) => c.id === modelId)?.r;
    if (!rect) return null;
    const [x1, z1, x2, z2] = rect;
    return {
      x: ((x1 + x2) / 2 - CENTER.x) * FEET_TO_UNITS,
      z: ((z1 + z2) / 2 - CENTER.z) * FEET_TO_UNITS,
      size: Math.max(x2 - x1, z2 - z1) * FEET_TO_UNITS,
    };
  }, [selectedAreaCode]);

  return (
    <group>
      <primitive
        object={group}
        scale={SCALE}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          const area = resolveArea(e);
          if (area) onSelectArea(area);
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          const area = resolveArea(e);
          setHoveredAreaCode(area?.areaCode ?? null);
          document.body.style.cursor = area ? 'pointer' : 'auto';
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHoveredAreaCode(null);
          document.body.style.cursor = 'auto';
        }}
      />
      {selectedRing && (
        <mesh position={[selectedRing.x, 0.02, selectedRing.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[selectedRing.size / 1.7, selectedRing.size / 1.7 + 0.06, 48]} />
          <meshBasicMaterial color={SCENE.buildingAccent} />
        </mesh>
      )}
    </group>
  );
}
