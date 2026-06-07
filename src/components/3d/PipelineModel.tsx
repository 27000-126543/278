import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Pipeline } from '@/types';
import * as THREE from 'three';

interface PipelineModelProps {
  pipeline: Pipeline;
}

export function PipelineModel({ pipeline }: PipelineModelProps) {
  const tubeRef = useRef<THREE.Mesh>(null);
  const flowTextureRef = useRef<THREE.Texture | null>(null);

  const { curve, leakPoints } = useMemo(() => {
    const start = new THREE.Vector3(pipeline.startPoint.x, pipeline.startPoint.y, pipeline.startPoint.z);
    const end = new THREE.Vector3(pipeline.endPoint.x, pipeline.endPoint.y, pipeline.endPoint.z);

    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    midPoint.y += 0.3;

    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);

    const leaks = pipeline.pressurePoints.filter(p => p.isLeak).map(point => {
      const t = point.position / pipeline.length;
      const pos = curve.getPoint(Math.min(Math.max(t, 0), 1));
      return { id: point.id, position: pos };
    });

    return { curve, leakPoints: leaks };
  }, [pipeline]);

  useFrame(({ clock }) => {
    if (flowTextureRef.current) {
      flowTextureRef.current.offset.x = clock.getElapsedTime() * 0.2;
    }
  });

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, 0.15, 8, false);
  }, [curve]);

  const getColor = () => {
    if (pipeline.status === 'leak') return '#FF3B30';
    if (pipeline.status === 'warning') return '#FF8C00';
    return '#00D4FF';
  };

  return (
    <group>
      {/* 管线本体 */}
      <mesh ref={tubeRef} geometry={tubeGeometry}>
        <meshStandardMaterial
          color={getColor()}
          metalness={0.7}
          roughness={0.3}
          emissive={getColor()}
          emissiveIntensity={pipeline.status === 'leak' ? 0.5 : 0.15}
        />
      </mesh>

      {/* 管线发光效果 */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color={getColor()}
          transparent
          opacity={pipeline.status === 'leak' ? 0.3 : 0.1}
        />
      </mesh>

      {/* 泄漏点标记 */}
      {leakPoints.map((leak) => (
        <group key={leak.id} position={leak.position}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.7, 32]} />
            <meshBasicMaterial color="#FF3B30" transparent opacity={0.8 + Math.sin(Date.now() * 0.01) * 0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.4, 32]} />
            <meshBasicMaterial color="#FF3B30" transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#FF3B30" transparent opacity={0.8 + Math.sin(Date.now() * 0.015) * 0.2} />
          </mesh>
        </group>
      ))}

      {/* 压力监测点 */}
      {pipeline.pressurePoints.map((point) => {
        const t = point.position / pipeline.length;
        const pos = curve.getPoint(Math.min(Math.max(t, 0), 1));
        return (
          <mesh key={point.id} position={pos}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color={point.isLeak ? '#FF3B30' : '#34C759'} />
          </mesh>
        );
      })}
    </group>
  );
}
