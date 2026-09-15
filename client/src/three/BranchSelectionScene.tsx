import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactShadows } from '@react-three/drei';
import type { PublicBranch } from '@/services/public/publicApi';
import { BranchBuilding } from '@/three/BranchBuilding';
import { usePublicSceneStore } from '@/store/publicSceneStore';

const RADIUS = 13;
const ANGLE_STEP = 0.44;

export function BranchSelectionScene({ branches }: { branches: PublicBranch[] }) {
  const navigate = useNavigate();
  const cameraControls = usePublicSceneStore((s) => s.cameraControls);
  const resetSignal = usePublicSceneStore((s) => s.resetSignal);

  const positions = useMemo<[number, number, number][]>(() => {
    const mid = (branches.length - 1) / 2;
    return branches.map((_, i) => {
      const angle = (i - mid) * ANGLE_STEP;
      const x = Math.sin(angle) * RADIUS;
      const z = -Math.cos(angle) * RADIUS + RADIUS * 0.65;
      return [x, 0, z];
    });
  }, [branches]);

  // Establish the overview shot once the scene mounts (landing, or
  // returning here from a branch) — a deliberate fly-in, not a hard cut.
  useEffect(() => {
    if (!cameraControls) return;
    cameraControls.setLookAt(0, 9, 20, 0, 2.5, 2, true);
  }, [cameraControls, resetSignal]);

  // Navigate immediately rather than waiting for a fly-toward-building
  // animation to finish first: CameraControls.setLookAt always animates
  // smoothly from wherever the camera currently is, so FloorScene's own
  // establishing shot (fired the moment its data loads) continues the
  // motion in one unbroken transition — landing straight into a
  // fly-toward-building leg followed by a separate hop reads as two
  // disconnected moves, not one.
  function handleSelect(branch: PublicBranch) {
    navigate(`/branch/${branch.code}`);
  }

  return (
    <group>
      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={40} blur={2} far={10} />

      {branches.map((branch, i) => (
        <BranchBuilding key={branch._id} branch={branch} position={positions[i]} onSelect={handleSelect} />
      ))}
    </group>
  );
}
