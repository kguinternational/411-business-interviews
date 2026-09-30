import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface ModelProps {
  thermalMode: boolean;
  exploded: boolean;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  isEmergencyStop: boolean;
}

export function TurbineModel({
  thermalMode,
  exploded,
  selectedComponentId,
  onSelectComponent,
  isEmergencyStop
}: ModelProps) {
  const rotorRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (isEmergencyStop) return;
    if (rotorRef.current) {
      rotorRef.current.rotation.z -= delta * 1.5;
    }
  });

  const towerColor = thermalMode ? '#f43f5e' : '#64748b';
  const nacelleColor = thermalMode ? '#fb923c' : '#334155';
  const bladeColor = thermalMode ? '#fef08a' : '#0284c7';
  const selectedHighlight = '#10b981';

  const explodeOffset = exploded ? 1.0 : 0;

  return (
    <group position={[0, -2, 0]}>
      {/* Tower Base & Cylinder */}
      <mesh
        position={[0, 2.5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent('yaw_bearing');
        }}
      >
        <cylinderGeometry args={[0.3, 0.7, 5, 32]} />
        <meshStandardMaterial
          color={selectedComponentId === 'yaw_bearing' ? selectedHighlight : towerColor}
          metalness={0.7}
          roughness={0.3}
          wireframe={thermalMode}
        />
      </mesh>

      {/* Nacelle */}
      <group position={[0, 5.2 + explodeOffset * 0.5, 0]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent('gearbox');
          }}
        >
          <boxGeometry args={[1.2, 1.0, 2.2]} />
          <meshStandardMaterial
            color={selectedComponentId === 'gearbox' ? selectedHighlight : nacelleColor}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Internal Gearbox Thermal Visual */}
        {thermalMode && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.0, 0.8, 1.8]} />
            <meshStandardMaterial color="#f43f5e" wireframe />
          </mesh>
        )}

        {/* Rotor Hub & Blades */}
        <group ref={rotorRef} position={[0, 0, 1.2 + explodeOffset]}>
          {/* Hub */}
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelectComponent('blade_assembly');
            }}
          >
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial
              color={selectedComponentId === 'blade_assembly' ? selectedHighlight : '#0e7490'}
            />
          </mesh>

          {/* 3 Blades */}
          {[0, 120, 240].map((angle, idx) => (
            <group key={idx} rotation={[0, 0, (angle * Math.PI) / 180]}>
              <mesh
                position={[0, 2.0, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent('blade_assembly');
                }}
              >
                <boxGeometry args={[0.2, 3.8, 0.05]} />
                <meshStandardMaterial
                  color={selectedComponentId === 'blade_assembly' ? selectedHighlight : bladeColor}
                  metalness={0.4}
                  roughness={0.3}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}
