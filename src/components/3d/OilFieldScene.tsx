import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useOilFieldStore } from '@/store/useOilFieldStore';
import { OilWellModel } from './OilWellModel';
import { MeteringStationModel } from './MeteringStationModel';
import { UnionStationModel } from './UnionStationModel';
import { PipelineModel } from './PipelineModel';
import { InjectionWellModel } from './InjectionWellModel';
import * as THREE from 'three';

interface OilFieldSceneProps {
  onWellClick: (wellId: string) => void;
}

export function OilFieldScene({ onWellClick }: OilFieldSceneProps) {
  const { oilWells, meteringStations, unionStations, pipelines, injectionWells, selectedWellId, setSelectedWellId } = useOilFieldStore();

  return (
    <Canvas
      shadows
      camera={{ position: [30, 25, 30], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      onClick={() => setSelectedWellId(null)}
    >
      <color attach="background" args={['#050D1A']} />
      <fog attach="fog" args={['#050D1A', 40, 100]} />

      {/* 环境光照 */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[20, 30, 20]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <hemisphereLight args={['#87CEEB', '#2F4F4F', 0.4]} />

      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial
          color="#1A2634"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* 网格地面 */}
      <gridHelper args={[150, 50, '#00D4FF20', '#00D4FF10']} position={[0, 0, 0]} />

      {/* 地形起伏 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 100,
            -0.05,
            (Math.random() - 0.5) * 100,
          ]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
        >
          <circleGeometry args={[2 + Math.random() * 4, 16]} />
          <meshStandardMaterial color="#0F1C2B" roughness={0.9} />
        </mesh>
      ))}

      {/* 输油管线 */}
      {pipelines.map((pipeline) => (
        <PipelineModel key={pipeline.id} pipeline={pipeline} />
      ))}

      {/* 采油井 */}
      {oilWells.map((well) => (
        <OilWellModel
          key={well.id}
          well={well}
          isSelected={selectedWellId === well.id}
          onClick={() => onWellClick(well.id)}
        />
      ))}

      {/* 计量站 */}
      {meteringStations.map((station) => (
        <MeteringStationModel
          key={station.id}
          station={station}
          onClick={() => {}}
        />
      ))}

      {/* 联合站 */}
      {unionStations.map((station) => (
        <UnionStationModel
          key={station.id}
          station={station}
          onClick={() => {}}
        />
      ))}

      {/* 注水井 */}
      {injectionWells.map((well) => (
        <InjectionWellModel
          key={well.id}
          well={well}
          onClick={() => {}}
        />
      ))}

      {/* 星星背景 */}
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />

      {/* 控制器 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={80}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0.2}
        makeDefault
      />

      {/* 后期处理 */}
      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
