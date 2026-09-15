import { useMemo } from 'react';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Ambient dressing for the public scene -- a flat single-color background
// is most of why the landing page reads as "blank": a gradient sky dome
// replaces it, a bright warm glow stages the building cluster, and a
// generous field of slow-drifting motes gives the air some life. Kept
// text/logo-free by request -- see PublicLayout.tsx for the persistent
// grid + ground plane this sits alongside, and its fog/background colors,
// tuned to match this dome's horizon so distant objects fade into it
// rather than back into the old flat tone.
export function LandingAtmosphere() {
  const skyTexture = useMemo(() => {
    const w = 2;
    const h = 512;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#fdf6e6'); // zenith
    gradient.addColorStop(0.55, '#f3dcb8');
    gradient.addColorStop(1, '#eab278'); // horizon
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const glowTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(244, 186, 112, 0.85)');
    gradient.addColorStop(0.45, 'rgba(240, 178, 100, 0.4)');
    gradient.addColorStop(1, 'rgba(240, 178, 100, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <group>
      {/* Gradient sky dome -- large enough to sit behind the fog's far
          distance, drawn from the inside. */}
      <mesh renderOrder={-10}>
        <sphereGeometry args={[150, 32, 32]} />
        <meshBasicMaterial map={skyTexture} side={THREE.BackSide} fog={false} depthWrite={false} />
      </mesh>

      {/* Warm stage glow under the building cluster, just above the ground
          plane and below the grid lines. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 3]}>
        <circleGeometry args={[20, 48]} />
        <meshBasicMaterial map={glowTexture} transparent depthWrite={false} />
      </mesh>

      <Sparkles
        count={220}
        scale={[42, 11, 36]}
        position={[0, 4.5, 2]}
        size={5}
        speed={0.2}
        opacity={0.9}
        noise={1}
        color="#f2ab4e"
      />
    </group>
  );
}
