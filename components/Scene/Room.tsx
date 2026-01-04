import React, { useRef } from 'react';
import { Box, Plane } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store';

const AnimatedDoor: React.FC<{ 
  position: [number, number, number], 
  isOpen: boolean, 
  hingeOffset: [number, number, number],
  dimensions: [number, number, number],
  direction: number // 1 or -1 for opening direction
}> = ({ position, isOpen, hingeOffset, dimensions, direction }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      const targetRotation = isOpen ? Math.PI / 2 * direction : 0;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, 
        targetRotation, 
        delta * 2 // Speed of door opening
      );
    }
  });

  return (
    <group position={position}>
      {/* Pivot Point Group */}
      <group ref={groupRef} position={hingeOffset}>
        {/* The actual door mesh, offset back so it rotates around the hinge */}
        <group position={[-hingeOffset[0], -hingeOffset[1], -hingeOffset[2]]}>
            <Box args={dimensions} position={[0, dimensions[1]/2, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#222" roughness={0.7} />
            </Box>
            <mesh position={[dimensions[0]/2 - 0.2, dimensions[1]/2, dimensions[2] + 0.05]} castShadow>
              <sphereGeometry args={[0.05]} />
              <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
            </mesh>
        </group>
      </group>
    </group>
  );
};

export const Room: React.FC = () => {
  const isBackDoorOpen = useGameStore((state) => state.isBackDoorOpen);
  const isSideDoorOpen = useGameStore((state) => state.isSideDoorOpen);

  return (
    <group>
      {/* Floor - Dark Wood */}
      <Plane 
        args={[10, 10]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <meshStandardMaterial color="#1a120b" roughness={0.6} metalness={0.1} />
      </Plane>

      {/* Ceiling */}
      <Plane 
        args={[10, 10]} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 3, 0]} 
      >
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </Plane>

      {/* Back Wall (Door) */}
      <group position={[0, 1.5, -5]}>
        <Box args={[4, 3, 0.2]} position={[-3, 0, 0]} receiveShadow castShadow>
          <meshPhysicalMaterial color="#1f1f1f" roughness={0.8} />
        </Box>
        <Box args={[4, 3, 0.2]} position={[3, 0, 0]} receiveShadow castShadow>
          <meshPhysicalMaterial color="#1f1f1f" roughness={0.8} />
        </Box>
        <Box args={[2, 1, 0.2]} position={[0, 1, 0]} receiveShadow castShadow>
           <meshPhysicalMaterial color="#1f1f1f" roughness={0.8} />
        </Box>
        
        {/* Animated Back Door - Hinge on the left (-1) */}
        <AnimatedDoor 
          position={[0, -1.5, 0]} 
          isOpen={isBackDoorOpen} 
          dimensions={[1.9, 2, 0.1]}
          hingeOffset={[-0.95, 0, 0]} 
          direction={-1} // Opens outward/left
        />
      </group>

      {/* Left Wall */}
      <Box args={[0.2, 3, 10]} position={[-5, 1.5, 0]} receiveShadow>
         <meshPhysicalMaterial color="#2a2a2a" roughness={0.9} />
      </Box>

      {/* Right Wall (Door) */}
      <group position={[5, 1.5, 0]}>
        <Box args={[0.2, 3, 4]} position={[0, 0, 3]} receiveShadow>
           <meshPhysicalMaterial color="#2a2a2a" roughness={0.9} />
        </Box>
        <Box args={[0.2, 3, 4]} position={[0, 0, -3]} receiveShadow>
           <meshPhysicalMaterial color="#2a2a2a" roughness={0.9} />
        </Box>
        <Box args={[0.2, 1, 2]} position={[0, 1, 0]} receiveShadow>
           <meshPhysicalMaterial color="#2a2a2a" roughness={0.9} />
        </Box>
        
        {/* Animated Side Door - Hinge on the left (z-back) */}
        {/* Note: Rotated context means coordinates are tricky. 
            We are inside a group at x=5. 
            Standard box is local.
        */}
        <group position={[0, -1.5, 0]}>
             {/* We manually reconstruct the door logic here because the wall is rotated 90 deg 
                 effectively by being on the X axis, but the Box geometry is axis aligned. 
                 Actually, simpler to just use the AnimatedDoor with careful props.
             */}
             <Box args={[0.1, 2, 1.8]} position={[0, 1, 0]} visible={false} /> {/* Placeholder for spacing */}
             
             {/* Custom pivot for side door */}
             <group position={[0, 0, -0.9]} rotation={[0, isSideDoorOpen ? -Math.PI/2 : 0, 0]}>
                {/* Door Mesh */}
                <group position={[0, 0, 0.9]}>
                    <Box args={[0.1, 2, 1.8]} position={[0, 1, 0]} castShadow receiveShadow>
                        <meshStandardMaterial color="#1a1005" roughness={0.7} />
                    </Box>
                    <mesh position={[-0.08, 1, 0.7]} castShadow>
                        <sphereGeometry args={[0.05]} />
                        <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.2} />
                    </mesh>
                </group>
             </group>
        </group>
      </group>

      {/* Bed */}
      <group position={[0, 0.4, 2]}>
        <Box args={[2, 0.4, 3]} castShadow receiveShadow>
          <meshStandardMaterial color="#0f0f0f" />
        </Box>
        <Box args={[1.4, 0.2, 0.6]} position={[0, 0.3, -1.1]} castShadow>
          <meshStandardMaterial color="#444" roughness={1} />
        </Box>
        <Box args={[2.05, 0.3, 2]} position={[0, 0.1, 0.5]} castShadow>
           <meshStandardMaterial color="#1a1a1a" roughness={1} />
        </Box>
      </group>

    </group>
  );
};
