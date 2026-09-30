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

export function FactoryModel({
  thermalMode,
  exploded,
  selectedComponentId,
  onSelectComponent,
  isEmergencyStop
}: ModelProps) {
  const joint1Ref = useRef<Group>(null);
  const joint2Ref = useRef<Group>(null);
  const joint3Ref = useRef<Group>(null);

  useFrame((state) => {
    if (isEmergencyStop) return;
    const t = state.clock.getElapsedTime();

    if (joint1Ref.current) {
      joint1Ref.current.rotation.y = Math.sin(t * 0.8) * 0.6;
    }
    if (joint2Ref.current) {
      joint2Ref.current.rotation.z = Math.sin(t * 1.2) * 0.3 + 0.2;
    }
    if (joint3Ref.current) {
      joint3Ref.current.rotation.z = Math.cos(t * 1.5) * 0.4 - 0.2;
    }
  });

  const baseColor = thermalMode ? '#f43f5e' : '#38bdf8';
  const armColor = thermalMode ? '#f97316' : '#0284c7';
  const jointColor = thermalMode ? '#eab308' : '#0ea5e9';
  const selectedHighlight = '#10b981';

  const explodeOffset = exploded ? 0.8 : 0;

  return (
    <group position={[0, -1, 0]}>
      {/* Base Platform */}
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent('joint_1');
        }}
      >
        <cylinderGeometry args={[1.8, 2.2, 0.4, 32]} />
        <meshStandardMaterial
          color={selectedComponentId === 'joint_1' ? selectedHighlight : baseColor}
          metalness={0.8}
          roughness={0.2}
          wireframe={thermalMode}
        />
      </mesh>

      {/* Joint 1 - Base Rotary */}
      <group ref={joint1Ref} position={[0, 0.4 + explodeOffset * 0.2, 0]}>
        <mesh
          position={[0, 0.5, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent('joint_1');
          }}
        >
          <cylinderGeometry args={[1.0, 1.2, 1.0, 32]} />
          <meshStandardMaterial
            color={selectedComponentId === 'joint_1' ? selectedHighlight : jointColor}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* Joint 2 - Lower Arm */}
        <group ref={joint2Ref} position={[0, 1.0 + explodeOffset, 0]}>
          <mesh
            position={[0, 1.2, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectComponent('joint_2');
            }}
          >
            <boxGeometry args={[0.6, 2.4, 0.6]} />
            <meshStandardMaterial
              color={selectedComponentId === 'joint_2' ? selectedHighlight : armColor}
              metalness={0.6}
              roughness={0.4}
              wireframe={thermalMode}
            />
          </mesh>

          {/* Joint 3 - Upper Arm */}
          <group ref={joint3Ref} position={[0, 2.4 + explodeOffset, 0]}>
            <mesh
              position={[0, 1.0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectComponent('joint_3');
              }}
            >
              <boxGeometry args={[0.5, 2.0, 0.5]} />
              <meshStandardMaterial
                color={selectedComponentId === 'joint_3' ? selectedHighlight : jointColor}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>

            {/* End Effector Gripper */}
            <group position={[0, 2.0 + explodeOffset * 0.5, 0]}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent('end_effector');
                }}
              >
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial
                  color={selectedComponentId === 'end_effector' ? selectedHighlight : '#06b6d4'}
                  emissive={thermalMode ? '#f43f5e' : '#000000'}
                  emissiveIntensity={0.5}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
