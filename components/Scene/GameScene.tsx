import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Plane, Box } from '@react-three/drei';
import { Room } from './Room';
import { CinematicController } from './CinematicController';
import { EffectComposer, Noise, Vignette, Glitch } from '@react-three/postprocessing';
import { BlendFunction, GlitchMode } from 'postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store';
import { GamePhase } from '../../types';

// Darker Tree
const Tree: React.FC<{ position: [number, number, number], scale?: number }> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 2, 6]} />
        <meshStandardMaterial color="#050302" roughness={1} />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow>
        <coneGeometry args={[1.5, 2.5, 7]} />
        <meshStandardMaterial color="#020502" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[1.2, 2.5, 7]} />
        <meshStandardMaterial color="#020502" roughness={0.9} />
      </mesh>
    </group>
  );
};

const Forest: React.FC = () => {
  const trees = useMemo(() => {
    const temp = [];
    // More trees for larger map
    for (let i = 0; i < 400; i++) {
      // Create a corridor for the road (x between -4 and 4 is empty)
      let x = (Math.random() - 0.5) * 120;
      if (Math.abs(x) < 5) x = x > 0 ? 5 + Math.random() * 5 : -5 - Math.random() * 5;

      const z = -20 - Math.random() * 350; // Map extended to -370
      const scale = 0.8 + Math.random() * 1.5;
      temp.push({ position: [x, 0, z] as [number, number, number], scale, key: i });
    }
    return temp;
  }, []);

  return (
    <group>
      {/* Ground extended */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -150]} receiveShadow>
        <planeGeometry args={[200, 400]} />
        <meshStandardMaterial color="#010101" roughness={1} />
      </mesh>
      {trees.map((t) => (
        <Tree key={t.key} position={t.position} scale={t.scale} />
      ))}
    </group>
  );
};

// The Road
const Road: React.FC = () => {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -160]} receiveShadow>
            <planeGeometry args={[4, 320]} />
            <meshStandardMaterial color="#0f0f0f" roughness={0.9} />
        </mesh>
    );
};

// Village
const Village: React.FC = () => {
    const lockedHouseDoorHealth = useGameStore((state) => state.lockedHouseDoorHealth);
    
    return (
        <group position={[0, 0, -325]}>
             {/* Random Houses */}
             <Box args={[6, 4, 6]} position={[-15, 2, 0]}><meshStandardMaterial color="#111" /></Box>
             <Box args={[6, 4, 6]} position={[-12, 2, -15]}><meshStandardMaterial color="#111" /></Box>
             <Box args={[6, 4, 6]} position={[12, 2, -10]}><meshStandardMaterial color="#111" /></Box>

             {/* The Locked House (Target) */}
             <group position={[5, 0, 0]}>
                 {/* Structure */}
                 <Box args={[8, 5, 8]} position={[0, 2.5, 0]} castShadow receiveShadow>
                     <meshStandardMaterial color="#222" />
                 </Box>
                 {/* Door Frame */}
                 <Box args={[2.2, 3.2, 0.5]} position={[0, 1.5, 4]}><meshStandardMaterial color="#000" /></Box>
                 
                 {/* The Door itself */}
                 {lockedHouseDoorHealth > 0 && (
                     <Box args={[2, 3, 0.2]} position={[0, 1.5, 4.1]}>
                        <meshStandardMaterial color={lockedHouseDoorHealth === 3 ? "#3a2a1a" : lockedHouseDoorHealth === 2 ? "#4a2a1a" : "#6a2a1a"} />
                     </Box>
                 )}
                 
                 {/* Interior Content (Visible when door breaks) */}
                 {lockedHouseDoorHealth <= 0 && (
                     <group>
                        {/* John */}
                        <mesh position={[0, 0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
                             <capsuleGeometry args={[0.4, 1.5]} />
                             <meshStandardMaterial color="blue" />
                        </mesh>
                        {/* Knife */}
                        <mesh position={[0.8, 0.1, 0.5]} rotation={[0, 0, Math.PI/2]}>
                             <boxGeometry args={[0.1, 0.5, 0.05]} />
                             <meshStandardMaterial color="silver" />
                        </mesh>
                     </group>
                 )}
             </group>
        </group>
    );
}

// The Monster (Only during Chase)
const Monster: React.FC = () => {
    const phase = useGameStore((state) => state.phase);
    const playerPos = useRef<THREE.Vector3>(new THREE.Vector3());
    const monsterRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (phase === GamePhase.CHASE && monsterRef.current) {
            // Move towards player
            playerPos.current.copy(state.camera.position);
            
            // Simple follow AI
            const dir = new THREE.Vector3().subVectors(playerPos.current, monsterRef.current.position);
            dir.y = 0; // Stay on ground
            dir.normalize();
            
            const speed = 5.2; // Slightly faster than sprinting player? Or slightly slower to allow running? Player sprint is 5.0. 
            // Monster should be menacing but escapable. 4.9 is good.
            
            monsterRef.current.position.add(dir.multiplyScalar(4.8 * delta));
            monsterRef.current.lookAt(playerPos.current.x, monsterRef.current.position.y, playerPos.current.z);
        }
    });

    if (phase !== GamePhase.CHASE) return null;

    return (
        <group ref={monsterRef} position={[5, 0, -325]}>
            <group scale={2}>
                 {/* Scary Body */}
                 <mesh position={[0, 1.5, 0]} castShadow>
                     <capsuleGeometry args={[0.5, 2]} />
                     <meshStandardMaterial color="#100000" />
                 </mesh>
                 {/* Long Arms */}
                 <mesh position={[0.6, 1.5, 0.2]} rotation={[0,0,-0.2]}>
                     <cylinderGeometry args={[0.1, 0.1, 2]} />
                     <meshStandardMaterial color="#100000" />
                 </mesh>
                 <mesh position={[-0.6, 1.5, 0.2]} rotation={[0,0,0.2]}>
                     <cylinderGeometry args={[0.1, 0.1, 2]} />
                     <meshStandardMaterial color="#100000" />
                 </mesh>
                 {/* Glowing Eyes */}
                 <mesh position={[0.2, 2.2, 0.4]}>
                     <sphereGeometry args={[0.1]} />
                     <meshBasicMaterial color="red" />
                 </mesh>
                 <mesh position={[-0.2, 2.2, 0.4]}>
                     <sphereGeometry args={[0.1]} />
                     <meshBasicMaterial color="red" />
                 </mesh>
            </group>
            {/* Light emitter from monster */}
            <pointLight distance={10} intensity={2} color="red" position={[0, 2, 0]} />
        </group>
    );
}

// Flashlight component attached to camera
const PlayerFlashlight: React.FC = () => {
  const isFlashlightOn = useGameStore((state) => state.isFlashlightOn);
  const battery = useGameStore((state) => state.flashlightBattery);
  const cheatInfiniteBattery = useGameStore((state) => state.cheatInfiniteBattery);
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(new THREE.Object3D());

  useFrame(() => {
    if (lightRef.current) {
      // Flicker effect when battery is low (unless cheating)
      if (isFlashlightOn && battery < 20 && !cheatInfiniteBattery) {
         lightRef.current.intensity = Math.random() > 0.8 ? 0 : 2;
      } else {
         lightRef.current.intensity = isFlashlightOn ? 2.5 : 0;
      }
    }
  });

  return (
    <>
      <primitive object={targetRef.current} position={[0, 0, -10]} />
      <spotLight
        ref={lightRef}
        target={targetRef.current}
        position={[0.2, -0.3, 0]} 
        angle={0.6}
        penumbra={0.5}
        distance={40}
        decay={2}
        color="#fffeb0"
        castShadow
      />
    </>
  );
};

const TheWatcher: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [pos, setPos] = useState<[number,number,number]>([0, -100, 0]);
  
  // Move watcher randomly
  useFrame((state) => {
     if (Math.floor(state.clock.elapsedTime) % 5 === 0 && Math.random() > 0.98) {
        const x = (Math.random() - 0.5) * 30;
        const z = -20 - Math.random() * 20;
        setPos([x, 1.7, z]);
     }
     if (meshRef.current) {
        meshRef.current.lookAt(state.camera.position);
     }
  });

  return (
    <mesh ref={meshRef} position={pos}>
       <boxGeometry args={[0.5, 2, 0.2]} />
       <meshBasicMaterial color="black" />
       <mesh position={[0.1, 0.6, 0.11]}>
         <sphereGeometry args={[0.05]} />
         <meshBasicMaterial color="white" />
       </mesh>
       <mesh position={[-0.1, 0.6, 0.11]}>
         <sphereGeometry args={[0.05]} />
         <meshBasicMaterial color="white" />
       </mesh>
    </mesh>
  );
};

export const GameScene: React.FC = () => {
  const isJumpscareActive = useGameStore((state) => state.isJumpscareActive);
  const cheatDayTime = useGameStore((state) => state.cheatDayTime);
  const dawnProgress = useGameStore((state) => state.dawnProgress); // 0 to 1
  const phase = useGameStore((state) => state.phase);

  // Dynamic Lighting for Dawn
  const dawnColor = new THREE.Color('#000000').lerp(new THREE.Color('#ff8c00'), dawnProgress);
  const skyColor = new THREE.Color(cheatDayTime ? '#87CEEB' : '#000000').lerp(new THREE.Color('#87CEEB'), dawnProgress);
  const fogColor = new THREE.Color(cheatDayTime ? '#87CEEB' : '#000000').lerp(new THREE.Color('#ffcc80'), dawnProgress);

  // Ambient Sound
  useEffect(() => {
    const audio = new Audio('https://actions.google.com/sounds/v1/ambiences/forest_wind.ogg');
    audio.loop = true;
    audio.volume = 0.3; 
    
    const tryPlay = () => {
      audio.play().catch(e => console.log("Audio play failed pending interaction"));
    };
    
    document.addEventListener('click', tryPlay, { once: true });
    
    return () => {
        audio.pause();
        document.removeEventListener('click', tryPlay);
    }
  }, []);

  return (
    <Canvas
      shadows
      className="w-full h-full"
      gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: cheatDayTime ? 1.5 : 0.8 + dawnProgress }}
    >
      {/* Dynamic Environment */}
      <color attach="background" args={[skyColor.getStyle()]} />
      
      {cheatDayTime || dawnProgress > 0 ? (
          <>
            <fog attach="fog" args={[fogColor.getStyle(), 10, 50 + dawnProgress * 100]} />
            <ambientLight intensity={0.8 * dawnProgress + 0.2} />
            <directionalLight position={[50, 50, 25]} intensity={1.5 * dawnProgress} castShadow />
          </>
      ) : (
          <>
            <fog attach="fog" args={['#000000', 0, 15]} />
            <ambientLight intensity={0.01} color="#050510" />
            <spotLight
                position={[0, 20, -20]}
                angle={1.5}
                penumbra={1}
                intensity={0.2}
                color="#0a1a30"
                castShadow
            />
          </>
      )}

      <PerspectiveCamera makeDefault fov={70} near={0.1} far={500}>
        <PlayerFlashlight />
      </PerspectiveCamera>
      
      <Room />
      <Road />
      <Village />
      <Monster />
      <Forest />
      <TheWatcher />
      
      <CinematicController />

      <EffectComposer>
        <Noise opacity={(cheatDayTime || dawnProgress > 0.8) ? 0.1 : 0.3} blendFunction={BlendFunction.OVERLAY} />
        {(!cheatDayTime && dawnProgress < 0.5) && <Vignette eskil={false} offset={0.3} darkness={0.8 - dawnProgress} />}
        {isJumpscareActive && <Glitch mode={GlitchMode.CONSTANT_WILD} ratio={1} />}
      </EffectComposer>
    </Canvas>
  );
};
