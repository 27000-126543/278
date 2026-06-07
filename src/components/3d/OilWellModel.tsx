import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { OilWell } from '@/types';
import * as THREE from 'three';

interface OilWellModelProps {
  well: OilWell;
  isSelected: boolean;
  onClick: () => void;
}

export function OilWellModel({ well, isSelected, onClick }: OilWellModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const horseHeadRef = useRef<THREE.Mesh>(null);
  const walkingBeamRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (horseHeadRef.current && walkingBeamRef.current) {
      const angle = Math.sin(t * 2) * 0.3;
      horseHeadRef.current.rotation.x = angle;
      walkingBeamRef.current.rotation.x = angle;
    }
  });

  const getStatusColor = () => {
    if (well.status === 'alarm') return '#FF3B30';
    if (well.status === 'warning') return '#FF8C00';
    if (well.status === 'maintenance') return '#94A3B8';
    return '#00D4FF';
  };

  const statusColor = getStatusColor();
  const shouldBlink = well.status === 'alarm' || well.status === 'warning';

  return (
    <group
      ref={groupRef}
      position={[well.position.x, well.position.y, well.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 底座 */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.5, 0.6, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* 井架 */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 4, 8]} />
        <meshStandardMaterial color="#6B7280" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 游梁 */}
      <mesh ref={walkingBeamRef} position={[0, 4, 0.5]} castShadow>
        <boxGeometry args={[0.3, 0.3, 4]} />
        <meshStandardMaterial color="#4B5563" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* 驴头 */}
      <mesh ref={horseHeadRef} position={[0, 4, 2.8]} castShadow>
        <sphereGeometry args={[0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={statusColor} metalness={0.5} roughness={0.3} emissive={statusColor} emissiveIntensity={hovered || isSelected ? 0.5 : 0.2} />
      </mesh>

      {/* 抽油杆 */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 电机 */}
      <mesh position={[-0.8, 0.8, -0.5]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.8]} />
        <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* 状态指示灯 */}
      <mesh position={[0, 5.2, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={statusColor} transparent opacity={shouldBlink ? (Math.sin(Date.now() * 0.01) * 0.3 + 0.7) : 1} />
      </mesh>

      {/* 选中高亮环 */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.2, 32]} />
          <meshBasicMaterial color={isSelected ? '#00D4FF' : '#FFFFFF'} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 信息标签 */}
      {(hovered || isSelected) && (
        <Html position={[0, 6, 0]} center distanceFactor={10}>
          <div className="bg-dark-800/95 border border-tech-blue/40 rounded-lg px-3 py-2 backdrop-blur-sm whitespace-nowrap pointer-events-none">
            <div className="text-tech-blue font-display text-sm font-bold">{well.wellNumber}</div>
            <div className="text-xs text-gray-300 mt-1">
              产液: <span className="text-status-normal">{well.productionRate.toFixed(1)}m³/d</span>
            </div>
            <div className="text-xs text-gray-300">
              泵效: <span className={well.pumpEfficiency < 30 ? 'text-status-alarm' : 'text-status-normal'}>{well.pumpEfficiency.toFixed(1)}%</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
