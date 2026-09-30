import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface ModelProps {
  thermalMode: boolean;
  exploded: boolean;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  isEmergencyStop: boolean;
  fanSpeed: number;
}

export function ServerRackModel({
  thermalMode,
  exploded,
  selectedComponentId,
  onSelectComponent,
  isEmergencyStop,
  fanSpeed
}: ModelProps) {
  const fansRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (isEmergencyStop) return;
    if (fansRef.current) {
      fansRef.current.children.forEach((fan) => {
        fan.rotation.z += delta * (fanSpeed / 10);
      });
    }
  });

  const frameColor = thermalMode ? '#f43f5e' : '#1e293b';
  const bladeColor = thermalMode ? '#38bdf8' : '#0f172a';
  const fanColor = thermalMode ? '#f59e0b' : '#334155';
  const selectedHighlight = '#10b981';

  const explodeOffset = exploded ? 0.6 : 0;

  return (
    <group position={[0, -1.2, 0]}>
      {/* Outer Server Chassis / Frame */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[2.2, 3.8, 1.8]} />
        <meshStandardMaterial
          color={frameColor}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Server Blades (Stacked) */}
      {[0, 1, 2, 3].map((idx) => {
        const bladeId = idx % 2 === 0 ? 'blade_1' : 'blade_2';
        const isSelected = selectedComponentId === bladeId;
        const zOffset = (idx - 1.5) * explodeOffset;

        return (
          <group key={idx} position={[0, 0.6 + idx * 0.8, zOffset]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectComponent(bladeId);
              }}
            >
              <boxGeometry args={[1.8, 0.6, 1.4]} />
              <meshStandardMaterial
                color={isSelected ? selectedHighlight : bladeColor}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* LED Status Indicators on Blade Front */}
            <mesh position={[0.7, 0, 0.72]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial
                color={isEmergencyStop ? '#f43f5e' : thermalMode ? '#eab308' : '#10b981'}
                emissive={isEmergencyStop ? '#f43f5e' : '#10b981'}
                emissiveIntensity={1.2}
              />
            </mesh>
          </group>
        );
      })}

      {/* Fan Matrix Array at Rear */}
      <group
        ref={fansRef}
        position={[0, 1.8, -0.9 - explodeOffset]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent('fan_array');
        }}
      >
        {[-0.6, 0, 0.6].map((xPos, idx) => (
          <group key={idx} position={[xPos, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.35, 0.35, 0.1, 16]} />
              <meshStandardMaterial
                color={selectedComponentId === 'fan_array' ? selectedHighlight : fanColor}
                wireframe={thermalMode}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
