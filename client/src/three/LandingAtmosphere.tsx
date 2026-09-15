import { useMemo } from 'react';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Ambient dressing for the public landing scene -- the buildings used to
// sit on a bare grid with nothing else going on. A soft warm glow "stages"
// the building cluster, and a handful of slow-drifting motes give the air
// some life, without competing with the buildings or adding any text/logo
// (kept deliberately quiet — see PublicLayout.tsx for the persistent grid
// + ground plane this sits alongside).
export function LandingAtmosphere() {
  const glowTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 247, 227, 0.55)');
    gradient.addColorStop(0.45, 'rgba(247, 238, 214, 0.28)');
    gradient.addColorStop(1, 'rgba(247, 238, 214, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <group>
      {/* Warm stage glow under the building cluster, just above the ground
          plane and below the grid lines. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 3]}>
        <circleGeometry args={[19, 48]} />
        <meshBasicMaterial map={glowTexture} transparent depthWrite={false} />
      </mesh>

      <Sparkles
        count={110}
        scale={[38, 9, 34]}
        position={[0, 4, 2]}
        size={3.4}
        speed={0.15}
        opacity={0.6}
        noise={1.2}
        color="#c9973f"
      />
    </group>
  );
}
