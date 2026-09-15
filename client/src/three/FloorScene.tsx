import { useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import type { PublicArea } from '@/services/public/publicApi';
import { AreaVolume } from '@/three/AreaVolume';
import { hasRealLayout, layoutAreas, layoutFromRealCoordinates } from '@/three/layout';
import { usePublicSceneStore } from '@/store/publicSceneStore';
import { SCENE } from '@/three/materials';
import { IsconJanmahaalFloor } from '@/three/IsconJanmahaalFloor';
import { isconJanmahaalBounds, isconJanmahaalRects } from '@/three/isconJanmahaalRoomMap';

// Branches with a hand-authored architectural model (real walls, doors,
// furniture) instead of the generic per-area box -- keyed the same way
// PublicBranch.tsx computes it, from branch code + floor number.
export type DetailedFloorModel = 'iscon-janmahaal-2';

interface FloorSceneProps {
  areas: PublicArea[];
  onSelectArea: (area: PublicArea) => void;
  focusAreaCode?: string | null;
  detailedModel?: DetailedFloorModel;
}

export function FloorScene({ areas, onSelectArea, focusAreaCode, detailedModel }: FloorSceneProps) {
  const cameraControls = usePublicSceneStore((s) => s.cameraControls);
  const resetSignal = usePublicSceneStore((s) => s.resetSignal);

  // A digitized floor (every area carries real drawing coordinates) gets
  // its true room shapes and placement; a hand-authored floor gets its own
  // rects derived from that model; everything else still uses the
  // procedural shelf-packer (ARCH-SPEC FLO·07 — geometry improves
  // per-branch as real floor plans get digitized, one at a time).
  const { rects, width, depth } = useMemo(() => {
    if (detailedModel === 'iscon-janmahaal-2') {
      return { rects: isconJanmahaalRects(new Set(areas.map((a) => a.areaCode))), ...isconJanmahaalBounds() };
    }
    if (hasRealLayout(areas)) {
      return layoutFromRealCoordinates(areas.map((a) => ({ areaCode: a.areaCode, layout: a.layout })));
    }
    return layoutAreas(areas.map((a) => ({ areaCode: a.areaCode, areaSqFt: a.areaSqFt })));
  }, [areas, detailedModel]);
  const rectByCode = useMemo(() => new Map(rects.map((r) => [r.areaCode, r])), [rects]);

  // Frame the whole plate when the floor (re)loads, or on Reset.
  useEffect(() => {
    if (!cameraControls || width === 0) return;
    const dist = Math.max(width, depth) * 0.85 + 4;
    cameraControls.setLookAt(dist * 0.7, dist * 0.62, dist * 0.7, 0, 0, 0, true);
  }, [cameraControls, width, depth, resetSignal]);

  // A deep-linked or search-selected area gets its own close-up.
  useEffect(() => {
    if (!cameraControls || !focusAreaCode) return;
    const rect = rectByCode.get(focusAreaCode);
    if (!rect) return;
    const dist = Math.max(rect.width, rect.depth) * 2 + 3;
    cameraControls.setLookAt(rect.x + dist * 0.6, dist * 0.55, rect.z + dist * 0.6, rect.x, 0.3, rect.z, true);
  }, [cameraControls, focusAreaCode, rectByCode]);

  function handleSelect(area: PublicArea) {
    onSelectArea(area);
    const rect = rectByCode.get(area.areaCode);
    if (!cameraControls || !rect) return;
    const dist = Math.max(rect.width, rect.depth) * 2 + 3;
    cameraControls.setLookAt(rect.x + dist * 0.6, dist * 0.55, rect.z + dist * 0.6, rect.x, 0.3, rect.z, true);
  }

  return (
    <group>
      {detailedModel !== 'iscon-janmahaal-2' && (
        <RoundedBox args={[width + 1.2, 0.12, depth + 1.2]} radius={0.04} position={[0, -0.06, 0]} receiveShadow>
          <meshStandardMaterial color={SCENE.floorPlate} roughness={0.95} />
        </RoundedBox>
      )}

      {detailedModel === 'iscon-janmahaal-2' ? (
        <IsconJanmahaalFloor areas={areas} onSelectArea={handleSelect} />
      ) : (
        areas.map((area) => {
          const rect = rectByCode.get(area.areaCode);
          if (!rect) return null;
          return <AreaVolume key={area._id} area={area} rect={rect} onSelect={handleSelect} />;
        })
      )}
    </group>
  );
}
