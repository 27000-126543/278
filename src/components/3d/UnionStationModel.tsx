import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { UnionStation } from '@/types';
import * as THREE from 'three';

interface UnionStationModelProps {
  station: UnionStation;
  onClick: () => void;
}

export function UnionStationModel({ station, onClick }: UnionStationModelProps) {
  const [hovered, setHovered] = useState(false);
  const statusLightRef = useRef<THREE.Mesh>(null);
  const separatorRefs = useRef<Map<string, THREE.Mesh>>(new Map());

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

    station.separators.forEach((sep) => {
      const mesh = separatorRefs.current.get(sep.id);
      if (mesh) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (sep.isActive) {
          if (sep.isStandby) {
            mat.emissive.set('#34C759');
            mat.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.1;
            mat.color.set('#1E40AF');
          } else {
            mat.emissive.set('#1E40AF');
            mat.emissiveIntensity = 0.2;
            mat.color.set('#1E40AF');
          }
        } else {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0;
          mat.color.set('#374151');
        }
      }
    });
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
      {/* 大型底座 */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[12, 1, 10]} />
        <meshStandardMaterial color="#1F2937" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* 主厂房 */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[8, 4, 6]} />
        <meshStandardMaterial color="#374151" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* 厂房屋顶 */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <boxGeometry args={[9, 0.5, 7]} />
        <meshStandardMaterial color="#4B5563" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* 分离器组 */}
      {station.separators.map((sep, index) => (
        <group key={sep.id} position={[-4 + index * 3, 2.5, 2.5]}>
          <mesh
            ref={(el) => {
              if (el) separatorRefs.current.set(sep.id, el);
            }}
            castShadow
          >
            <cylinderGeometry args={[0.8, 0.9, 3, 12]} />
            <meshStandardMaterial
              color={sep.isActive ? '#1E40AF' : '#374151'}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          {/* 液位指示 */}
          <mesh position={[0, (sep.liquidLevel / 100) * 1.5 - 1.5, 0.81]}>
            <boxGeometry args={[0.3, (sep.liquidLevel / 100) * 2.8, 0.05]} />
            <meshBasicMaterial color={sep.liquidLevel > 80 ? '#FF3B30' : '#34C759'} />
          </mesh>
          {/* 备用标签 */}
          {sep.isStandby && sep.isActive && (
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#34C759" />
            </mesh>
          )}
        </group>
      ))}

      {/* 储油罐 */}
      {[-3.5, 3.5].map((x, i) => (
        <mesh key={i} position={[x, 2.5, -2.5]} castShadow>
          <cylinderGeometry args={[1.5, 1.7, 4, 16]} />
          <meshStandardMaterial color="#1E3A5F" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* 烟囱/放空管 */}
      <mesh position={[4, 6, -1]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 6, 8]} />
        <meshStandardMaterial color="#6B7280" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 状态灯 */}
      <mesh ref={statusLightRef} position={[0, 7, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color={statusColor} transparent />
      </mesh>

      {/* 选中高亮 */}
      {hovered && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[7, 7.5, 32]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 标签 */}
      {hovered && (
        <Html position={[0, 8, 0]} center distanceFactor={15}>
          <div className="bg-dark-800/95 border border-tech-blue/40 rounded-lg px-3 py-2 backdrop-blur-sm whitespace-nowrap pointer-events-none">
            <div className="text-tech-blue font-display text-sm font-bold">{station.name}</div>
            <div className="text-xs text-gray-300 mt-1">
              分离器: {station.separators.filter(s => s.isActive).length} 运行中
            </div>
            {station.separators.some(s => s.isStandby && s.isActive) && (
              <div className="text-xs text-status-normal mt-1">
                ✓ 备用分离器运行中
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
