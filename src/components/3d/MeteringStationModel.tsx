import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { MeteringStation } from '@/types';
import * as THREE from 'three';

interface MeteringStationModelProps {
  station: MeteringStation;
  onClick: () => void;
}

export function MeteringStationModel({ station, onClick }: MeteringStationModelProps) {
  const [hovered, setHovered] = useState(false);
  const statusLightRef = useRef<THREE.Mesh>(null);
  const buildingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (statusLightRef.current) {
      const mat = statusLightRef.current.material as THREE.MeshBasicMaterial;
      if (station.status !== 'normal') {
        mat.opacity = Math.sin(t * 4) * 0.3 + 0.7;
      } else {
        mat.opacity = 1;
      }
    }
    if (buildingRef.current) {
      const mat = buildingRef.current.material as THREE.MeshStandardMaterial;
      if (station.status === 'warning') {
        mat.emissive.set('#FF8C00');
        mat.emissiveIntensity = Math.sin(t * 3) * 0.2 + 0.2;
      } else {
        mat.emissive.set('#000000');
        mat.emissiveIntensity = 0;
      }
    }
  });

  const getStatusColor = () => {
    if (station.status === 'alarm') return '#FF3B30';
    if (station.status === 'warning') return '#FF8C00';
    return '#34C759';
  };

  const statusColor = getStatusColor();

  return (
    <group
      position={[station.position.x, station.position.y, station.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 底座平台 */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[5, 0.6, 4]} />
        <meshStandardMaterial color="#1F2937" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* 主建筑 */}
      <mesh ref={buildingRef} position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[4, 2.4, 3]} />
        <meshStandardMaterial color="#374151" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* 屋顶 */}
      <mesh position={[0, 3.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3, 1, 4]} />
        <meshStandardMaterial color="#4B5563" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* 窗户 */}
      {[-1.2, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 1.8, 1.51]}>
          <boxGeometry args={[0.6, 0.8, 0.05]} />
          <meshStandardMaterial color="#60A5FA" emissive="#60A5FA" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* 储液罐 */}
      <mesh position={[-2, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.9, 2, 12]} />
        <meshStandardMaterial color="#1E3A5F" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* 状态灯 */}
      <mesh position={[0, 3.8, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color={statusColor} transparent opacity={station.status !== 'normal' ? (Math.sin(Date.now() * 0.008) * 0.3 + 0.7) : 1} />
      </mesh>

      {/* 选中高亮 */}
      {hovered && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.5, 4, 32]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 标签 */}
      {hovered && (
        <Html position={[0, 4.5, 0]} center distanceFactor={12}>
          <div className="bg-dark-800/95 border border-tech-blue/40 rounded-lg px-3 py-2 backdrop-blur-sm whitespace-nowrap pointer-events-none">
            <div className="text-tech-blue font-display text-sm font-bold">{station.name}</div>
            <div className="text-xs text-gray-300 mt-1">
              总液量: <span className="text-status-normal">{station.totalLiquid.toFixed(1)}m³/d</span>
            </div>
            <div className="text-xs text-gray-300">
              含水率: <span className="text-status-warning">{station.avgWaterCut.toFixed(1)}%</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
