import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Instances, Instance, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { PublicArea } from '@/services/public/publicApi';
import { areaFillColor3D, STATUS_COLOR_3D } from '@/three/materials';
import { layoutSeatsInRect, type AreaLayoutRect } from '@/three/layout';
import { usePublicSceneStore } from '@/store/publicSceneStore';

const LOW_TYPES = new Set(['UTILITY', 'CAFETERIA', 'RECEPTION']);
const GAP = 0.1;

interface AreaVolumeProps {
  area: PublicArea;
  rect: AreaLayoutRect;
  onSelect: (area: PublicArea) => void;
}

export function AreaVolume({ area, rect, onSelect }: AreaVolumeProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const setHoveredAreaCode = usePublicSceneStore((s) => s.setHoveredAreaCode);
  const selectedAreaCode = usePublicSceneStore((s) => s.selectedAreaCode);
  const showSeats = usePublicSceneStore((s) => s.showSeats);
  const showLabels = usePublicSceneStore((s) => s.showLabels);

  const height = LOW_TYPES.has(area.type) ? 0.22 : 0.42;
  const isSelected = selectedAreaCode === area.areaCode;
  const color = areaFillColor3D(area.type, area.departmentId?.colorToken);
  const width = Math.max(rect.width - GAP, 0.2);
  const depth = Math.max(rect.depth - GAP, 0.2);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetY = height / 2 + (hovered || isSelected ? 0.08 : 0);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 8, delta);
  });

  const seatPoints =
    showSeats && area.seatingCapacity > 0 ? layoutSeatsInRect(Math.min(area.seatingCapacity, 60), rect) : [];
  const occupiedCount = Math.round((seatPoints.length * area.occupiedSeats) / Math.max(area.seatingCapacity, 1));

  return (
    <group>
      <RoundedBox
        ref={meshRef}
        args={[width, height, depth]}
        radius={Math.min(0.05, width / 6, depth / 6)}
        position={[rect.x, height / 2, rect.z]}
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setHoveredAreaCode(area.areaCode);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          setHoveredAreaCode(null);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(area);
        }}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.02}
          emissive={isSelected ? '#8a4e1a' : hovered ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : hovered ? 0.25 : 0}
        />
      </RoundedBox>

      {isSelected && (
        <mesh position={[rect.x, 0.01, rect.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(width, depth) / 1.7, Math.max(width, depth) / 1.7 + 0.06, 48]} />
          <meshBasicMaterial color="#8a4e1a" />
        </mesh>
      )}

      {showLabels && Math.min(width, depth) > 1.1 && (
        <Billboard position={[rect.x, height + 0.22, rect.z]}>
          <Text
            fontSize={Math.min(0.22, width / 8)}
            color="#2a271f"
            anchorX="center"
            anchorY="bottom"
            maxWidth={width}
            textAlign="center"
            outlineWidth={0.008}
            outlineColor="#ffffff"
          >
            {area.name}
          </Text>
        </Billboard>
      )}

      {seatPoints.length > 0 && (
        <Instances limit={seatPoints.length} castShadow>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshStandardMaterial roughness={0.5} />
          {seatPoints.map((p, i) => (
            <Instance
              key={i}
              position={[p.x, height + 0.1, p.z]}
              color={i < occupiedCount ? STATUS_COLOR_3D.OCCUPIED : STATUS_COLOR_3D.AVAILABLE}
            />
          ))}
        </Instances>
      )}
    </group>
  );
}
