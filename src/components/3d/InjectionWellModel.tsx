import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { InjectionWell } from '@/types';
import * as THREE from 'three';

interface InjectionWellModelProps {
  well: InjectionWell;
  onClick: () => void;
}

export function InjectionWellModel({ well, onClick }: InjectionWellModelProps) {
  const [hovered, setHovered] = useState(false);
  const statusLightRef = useRef<THREE.Mesh>(null);
  const buildingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (statusLightRef.current) {
      const mat = statusLightRef.current.material as THREE.MeshBasicMaterial;
      if (well.status !== 'normal') {
        mat.opacity = Math.sin(t * 5) * 0.3 + 0.7;
      } else {
        mat.opacity = 1;
      }
    }
    if (buildingRef.current) {
      const mat = buildingRef.current.material as THREE.MeshStandardMaterial;
      if (well.status === 'warning') {
        mat.emissive.set('#FF8C00');
        mat.emissiveIntensity = Math.sin(t * 3) * 0.2 + 0.15;
      } else {
        mat.emissive.set('#000000');
        mat.emissiveIntensity = 0;
      }
    }
  });

  const getStatusColor = () => {
    if (well.status === 'alarm') return '#FF3B30';
    if (well.status === 'warning') return '#FF8C00';
    return '#A855F7';
  };

  const statusColor = getStatusColor();

  return (
    <group
      position={[well.position.x, well.position.y, well.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 底座 */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[1, 1.2, 0.6, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* 注水管柱 */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 3.5, 8]} />
        <meshStandardMaterial color="#4C1D95" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* 顶部阀门组 */}
      <mesh ref={buildingRef} position={[0, 4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.8, 1.2]} />
        <meshStandardMaterial color="#5B21B6" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* 压力指示环 */}
      <mesh position={[0, 4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.1, 8, 16]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={0.3}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* 状态灯 */}
      <mesh ref={statusLightRef} position={[0, 4.8, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={statusColor} transparent />
      </mesh>

      {/* 选中高亮 */}
      {hovered && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.8, 32]} />
          <meshBasicMaterial color="#A855F7" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 标签 */}
      {hovered && (
        <Html position={[0, 5.5, 0]} center distanceFactor={10}>
          <div className="bg-dark-800/95 border border-tech-purple/40 rounded-lg px-3 py-2 backdrop-blur-sm whitespace-nowrap pointer-events-none">
            <div className="text-tech-purple font-display text-sm font-bold">{well.name}</div>
            <div className="text-xs text-gray-300 mt-1">
              压力: <span className={well.injectionPressure > 22 ? 'text-status-warning' : 'text-status-normal'}>{well.injectionPressure.toFixed(1)}MPa</span>
            </div>
            <div className="text-xs text-gray-300">
              水量: <span className="text-tech-purple">{well.injectionRate.toFixed(1)}m³/d</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
