import { useEffect, useRef } from 'react';
import { CameraControls } from '@react-three/drei';
import { usePublicSceneStore } from '@/store/publicSceneStore';

// The one camera controller for the whole public site — registered into
// the scene store so any component (a branch building, an area mesh, the
// toolbar) can request a smooth fly-to without prop drilling. Persists
// across route changes because it lives inside <PublicLayout>'s single
// <Canvas>, never remounted per scene (ARCH-SPEC "3D LANDING EXPERIENCE":
// "avoid hard page reloads... continuous visual experience").
export function CameraRig() {
  const controlsRef = useRef<React.ComponentRef<typeof CameraControls>>(null);
  const setCameraControls = usePublicSceneStore((s) => s.setCameraControls);

  useEffect(() => {
    setCameraControls(controlsRef.current);
    return () => setCameraControls(null);
  }, [setCameraControls]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={4}
      maxDistance={70}
      maxPolarAngle={Math.PI / 2 - 0.02}
      smoothTime={0.45}
      draggingSmoothTime={0.12}
    />
  );
}
