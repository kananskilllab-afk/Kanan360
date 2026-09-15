import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { PublicBranch } from '@/services/public/publicApi';
import { SCENE } from '@/three/materials';
import { usePublicSceneStore } from '@/store/publicSceneStore';

interface BranchBuildingProps {
  branch: PublicBranch;
  position: [number, number, number];
  onSelect: (branch: PublicBranch) => void;
}

// One stylized building per branch — floor count sets its height, a
// hover lifts and lights it, a click hands off to PublicHome's camera
// fly-in before routing to /branch/:code (ARCH-SPEC "3D BRANCH
// EXPERIENCE").
export function BranchBuilding({ branch, position, onSelect }: BranchBuildingProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const setHoveredBranchCode = usePublicSceneStore((s) => s.setHoveredBranchCode);

  const floors = Math.max(branch.totalFloors, 1);
  const height = 1.6 + floors * 1.1;
  const width = 2.6;
  const depth = 2.2;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = hovered ? 0.25 : 0;
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 6, delta);
    const targetScale = hovered ? 1.04 : 1;
    const s = THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6, delta);
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group
      position={position}
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        setHoveredBranchCode(branch.code);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        setHoveredBranchCode(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(branch);
      }}
    >
      {/* podium */}
      <RoundedBox args={[width + 0.6, 0.3, depth + 0.6]} radius={0.06} position={[0, 0.15, 0]} receiveShadow>
        <meshStandardMaterial color={SCENE.buildingBase} roughness={0.85} />
      </RoundedBox>

      {/* tower */}
      <RoundedBox args={[width, height, depth]} radius={0.08} position={[0, 0.3 + height / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color={hovered ? SCENE.buildingAccent : '#f2f1ea'}
          roughness={0.5}
          metalness={0.05}
          emissive={hovered ? SCENE.buildingAccent : '#000000'}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
      </RoundedBox>

      {/* floor seams */}
      {Array.from({ length: floors - 1 }).map((_, i) => (
        <mesh key={i} position={[0, 0.3 + ((i + 1) * height) / floors, depth / 2 + 0.001]}>
          <planeGeometry args={[width, 0.02]} />
          <meshBasicMaterial color={SCENE.wallLine} transparent opacity={0.35} />
        </mesh>
      ))}

      <Billboard position={[0, 0.3 + height, 0]}>
        <Text
          position={[0, 0.45, 0]}
          fontSize={0.32}
          color="#2a271f"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#f5f4ee"
        >
          {branch.name}
        </Text>
        <Text position={[0, 0.14, 0]} fontSize={0.16} color="#8a7f5a" anchorX="center" anchorY="bottom">
          {branch.code} · {branch.location}
        </Text>
      </Billboard>

      {hovered && (
        <Html position={[0, 0.3 + height + 1.2, 0]} center distanceFactor={9} occlude>
          <div className="w-56 rounded-lg border border-black/10 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wide text-neutral-500">{branch.code}</span>
              <span className="font-mono text-xs font-semibold text-[#8a4e1a]">{branch.utilization}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Floors" value={branch.totalFloors} />
              <Stat label="Seats" value={branch.totalSeats} />
              <Stat label="Sq.Ft" value={branch.totalAreaSqFt.toLocaleString('en-IN')} />
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="font-mono text-xs font-semibold text-neutral-800">{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}
