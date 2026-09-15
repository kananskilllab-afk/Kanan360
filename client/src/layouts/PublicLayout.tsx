import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, Grid } from '@react-three/drei';
import { CameraRig } from '@/three/CameraRig';
import { LandingAtmosphere } from '@/three/LandingAtmosphere';
import { SCENE } from '@/three/materials';
import { PublicTopBar } from '@/components/public/PublicTopBar';
import { PublicFloorSelector } from '@/components/public/PublicFloorSelector';
import { PublicToolbar } from '@/components/public/PublicToolbar';
import { PublicAreaPanel } from '@/components/public/PublicAreaPanel';
import { StreetViewReveal } from '@/components/public/StreetViewReveal';
import { usePublicSceneStore } from '@/store/publicSceneStore';

// The public site's shell: one persistent <Canvas> that survives every
// route change under it (landing → branch → another branch), so moving
// through the experience is a camera transition, never a reload
// (ARCH-SPEC "3D LANDING EXPERIENCE"). Floating DOM chrome renders as
// siblings of the canvas, not children of it — see PublicAreaPanel.tsx
// for why that split matters.
export function PublicLayout() {
  const location = useLocation();
  const setSelectedAreaCode = usePublicSceneStore((s) => s.setSelectedAreaCode);

  useEffect(() => {
    setSelectedAreaCode(null);
  }, [location.pathname, setSelectedAreaCode]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#e7e6dd]">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 9, 20], fov: 42, near: 0.1, far: 200 }}>
        <color attach="background" args={['#e7e6dd']} />
        <fog attach="fog" args={['#e7e6dd', 30, 90]} />
        <hemisphereLight args={['#fff5e2', '#d6d0bd', 0.55]} />
        <directionalLight
          position={[14, 20, 10]}
          intensity={1.4}
          color="#fff7ea"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        <directionalLight position={[-12, 8, -10]} intensity={0.32} color="#cfdae6" />
        {/* Its own Suspense boundary: this fetches an HDR from a public
            CDN for reflections only — cosmetic, not load-bearing. Without
            an isolated boundary, a slow or blocked fetch (flaky network,
            corporate proxy) would suspend the whole scene indefinitely,
            leaving the entire canvas blank instead of just skipping the
            sheen. */}
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.35} />
        </Suspense>

        {/* Always mounted, never remounted on route change — a floor
            reference plane that stays put through every transition so
            navigating never shows a truly empty frame while the next
            scene's data loads (ARCH-SPEC: "avoid hard page reloads...
            continuous visual experience"). */}
        <Grid
          args={[80, 80]}
          cellSize={1}
          cellThickness={0.4}
          cellColor="#c9c6ba"
          sectionSize={5}
          sectionThickness={0.8}
          sectionColor="#b3ae9c"
          fadeDistance={40}
          fadeStrength={1.5}
          infiniteGrid
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color={SCENE.ground} roughness={1} />
        </mesh>
        <LandingAtmosphere />

        <CameraRig />
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </Canvas>

      <PublicTopBar />
      <PublicFloorSelector />
      <PublicToolbar />
      <PublicAreaPanel />
      <StreetViewReveal />
    </div>
  );
}
