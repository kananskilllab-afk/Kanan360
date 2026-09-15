import { useSearchParams } from 'react-router-dom';
import { FloorScene } from '@/three/FloorScene';
import { usePublicAreas } from '@/hooks/usePublicData';
import { useCurrentPublicBranch } from '@/hooks/useCurrentPublicBranch';
import { usePublicSceneStore } from '@/store/publicSceneStore';

// Pure 3D content for /branch/:code — no DOM here (see PublicHome.tsx).
export function PublicBranch() {
  const { branch, activeFloor } = useCurrentPublicBranch();
  const [searchParams] = useSearchParams();
  const setSelectedAreaCode = usePublicSceneStore((s) => s.setSelectedAreaCode);

  const { data: areas } = usePublicAreas(activeFloor?._id);
  const focusAreaCode = searchParams.get('area');

  if (!areas?.length) return null;

  // Iscon Janmahaal's 2nd floor is digitized from the architect's own
  // drawing (real walls, doors, furniture) — every other branch/floor
  // still gets the generic per-area box (see FloorScene.tsx).
  const detailedModel = branch?.code === 'VAD05' && activeFloor?.floorNumber === 2 ? 'iscon-janmahaal-2' : undefined;

  return (
    <FloorScene
      areas={areas}
      focusAreaCode={focusAreaCode}
      onSelectArea={(area) => setSelectedAreaCode(area.areaCode)}
      detailedModel={detailedModel}
    />
  );
}
