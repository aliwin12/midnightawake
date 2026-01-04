import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store';
import { GamePhase } from '../../types';

export const CinematicController: React.FC = () => {
  const { camera } = useThree();
  const phase = useGameStore((state) => state.phase);
  const setPhase = useGameStore((state) => state.setPhase);
  const setStamina = useGameStore((state) => state.setStamina);
  const setJumpscareActive = useGameStore((state) => state.setJumpscareActive);
  
  // Flashlight state
  const isFlashlightOn = useGameStore((state) => state.isFlashlightOn);
  const setFlashlightOn = useGameStore((state) => state.setFlashlightOn);
  const setFlashlightBattery = useGameStore((state) => state.setFlashlightBattery);
  
  // Story / Village
  const lockedHouseDoorHealth = useGameStore((state) => state.lockedHouseDoorHealth);
  const kickLockedDoor = useGameStore((state) => state.kickLockedDoor);
  const setDawnProgress = useGameStore((state) => state.setDawnProgress);
  
  // Doors
  const toggleBackDoor = useGameStore((state) => state.toggleBackDoor);
  const toggleSideDoor = useGameStore((state) => state.toggleSideDoor);

  // Settings & Cheats
  const mouseSensitivity = useGameStore((state) => state.mouseSensitivity);
  const cheatFlyMode = useGameStore((state) => state.cheatFlyMode);
  const cheatInfiniteStamina = useGameStore((state) => state.cheatInfiniteStamina);
  const cheatInfiniteBattery = useGameStore((state) => state.cheatInfiniteBattery);
  
  // Refs for logic loop
  const flashlightBatteryRef = useRef(100);
  const staminaRef = useRef(100);
  const dawnTimerRef = useRef(0);

  // Audio Refs
  const footstepAudio = useRef<HTMLAudioElement | null>(null);
  const doorAudio = useRef<HTMLAudioElement | null>(null);
  const heartbeatAudio = useRef<HTMLAudioElement | null>(null);
  const whisperAudio = useRef<HTMLAudioElement | null>(null);
  const screamAudio = useRef<HTMLAudioElement | null>(null);
  const kickAudio = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    footstepAudio.current = new Audio('https://actions.google.com/sounds/v1/foley/footsteps_on_grass.ogg'); 
    footstepAudio.current.loop = true;
    footstepAudio.current.volume = 0.45;

    doorAudio.current = new Audio('https://actions.google.com/sounds/v1/doors/wood_door_open.ogg');
    doorAudio.current.volume = 0.75;
    
    heartbeatAudio.current = new Audio('https://actions.google.com/sounds/v1/human/heartbeat_fast.ogg');
    heartbeatAudio.current.loop = true;
    heartbeatAudio.current.volume = 0.8;

    whisperAudio.current = new Audio('https://actions.google.com/sounds/v1/horror/female_ghost_whisper.ogg');
    whisperAudio.current.volume = 0.5;

    // Monster Sound - Pitch Shifted in logic or just pretend here
    screamAudio.current = new Audio('https://actions.google.com/sounds/v1/horror/monster_screaming.ogg');
    screamAudio.current.volume = 1.0; 
    
    kickAudio.current = new Audio('https://actions.google.com/sounds/v1/foley/door_pound.ogg');
    kickAudio.current.volume = 1.0;
  }, []);

  // Movement state
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    up: false, // For flight
    down: false // For flight
  });

  // Animation state
  const timeRef = useRef(0);
  const whisperTimer = useRef(0);
  
  // Reset state when entering cutscene
  useEffect(() => {
    if (phase === GamePhase.CUTSCENE) {
      // Reset logic refs
      staminaRef.current = 100;
      flashlightBatteryRef.current = 100;
      setFlashlightBattery(100);
      setStamina(100);
      setFlashlightOn(false);
      setJumpscareActive(false);

      // Initialize camera for "Lying on bed"
      camera.position.set(0, 0.8, 2); 
      camera.rotation.set(Math.PI / 4, 0, 0); 
      
      // Cutscene transition to gameplay
      setTimeout(() => {
        setPhase(GamePhase.GAMEPLAY);
      }, 7000);
    }
  }, [phase, camera, setPhase, setFlashlightBattery, setStamina, setFlashlightOn, setJumpscareActive]);

  // Keyboard listeners for movement & actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Pause Toggles
      if (e.code === 'Escape' || e.code === 'Backquote') {
        if (phase === GamePhase.GAMEPLAY) setPhase(GamePhase.PAUSED);
        else if (phase === GamePhase.PAUSED) setPhase(GamePhase.GAMEPLAY);
      }

      // Gameplay controls (Works in GAMEPLAY and CHASE and WAITING_FOR_DAWN)
      const canMove = phase === GamePhase.GAMEPLAY || phase === GamePhase.CHASE || phase === GamePhase.WAITING_FOR_DAWN || phase === GamePhase.DAWN;
      
      if (canMove) {
        switch (e.code) {
          case 'KeyW': moveState.current.forward = true; break;
          case 'KeyS': moveState.current.backward = true; break;
          case 'KeyA': moveState.current.left = true; break;
          case 'KeyD': moveState.current.right = true; break;
          case 'ShiftLeft': moveState.current.sprint = true; break;
          case 'KeyF': 
             // Toggle Flashlight if just F, but check for kick first
             const playerPos = camera.position;
             // LOCKED HOUSE DOOR (Approx coords from GameScene)
             if (playerPos.distanceTo(new THREE.Vector3(5, 1.5, -325)) < 4 && lockedHouseDoorHealth > 0) {
                 // Kick Mechanic
                 kickAudio.current?.play().catch(()=>{});
                 kickLockedDoor();
                 
                 // Shake camera slightly
                 camera.position.y -= 0.1;
                 setTimeout(() => camera.position.y += 0.1, 100);
                 
                 if (lockedHouseDoorHealth <= 1) { // Will be 0 after this update cycles
                    // Door Broken!
                    setTimeout(() => {
                        setPhase(GamePhase.CHASE);
                        // Play Mega Loud Monster Sound
                        if (screamAudio.current) {
                            screamAudio.current.playbackRate = 0.5; // LOW TONE
                            screamAudio.current.volume = 1.0;
                            screamAudio.current.loop = true;
                            screamAudio.current.play().catch(()=>{});
                        }
                    }, 500);
                 }
             } else {
                 setFlashlightOn(!useGameStore.getState().isFlashlightOn); 
             }
             break;
          // Flight controls
          case 'Space': if(cheatFlyMode) moveState.current.up = true; break;
          case 'ControlLeft': if(cheatFlyMode) moveState.current.down = true; break;
          
          // Interaction
          case 'KeyE': {
             const playerPos = camera.position;
             // Check Back Door
             if (playerPos.distanceTo(new THREE.Vector3(0, 1.5, -5)) < 3) {
                toggleBackDoor();
                doorAudio.current?.play().catch(() => {});
             }
             // Check Side Door
             if (playerPos.distanceTo(new THREE.Vector3(5, 1.5, 0)) < 3) {
                toggleSideDoor();
                doorAudio.current?.play().catch(() => {});
             }
             break;
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const canMove = phase === GamePhase.GAMEPLAY || phase === GamePhase.CHASE || phase === GamePhase.WAITING_FOR_DAWN || phase === GamePhase.DAWN;
      if (canMove) {
        switch (e.code) {
          case 'KeyW': moveState.current.forward = false; break;
          case 'KeyS': moveState.current.backward = false; break;
          case 'KeyA': moveState.current.left = false; break;
          case 'KeyD': moveState.current.right = false; break;
          case 'ShiftLeft': moveState.current.sprint = false; break;
          case 'Space': moveState.current.up = false; break;
          case 'ControlLeft': moveState.current.down = false; break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, setPhase, setFlashlightOn, cheatFlyMode, toggleBackDoor, toggleSideDoor, camera, lockedHouseDoorHealth, kickLockedDoor]);

  useFrame((state, delta) => {
    const activePhases = [GamePhase.GAMEPLAY, GamePhase.CHASE, GamePhase.WAITING_FOR_DAWN, GamePhase.DAWN];
    
    // --- FLASHLIGHT LOGIC ---
    if (activePhases.includes(phase) || phase === GamePhase.CUTSCENE) {
        const DRAIN_RATE = 2.0; 
        const CHARGE_RATE = 1.0; 

        if (isFlashlightOn) {
            if (!cheatInfiniteBattery) {
              flashlightBatteryRef.current = Math.max(0, flashlightBatteryRef.current - DRAIN_RATE * delta);
              if (flashlightBatteryRef.current <= 0) {
                  setFlashlightOn(false); 
              }
            }
        } else {
            flashlightBatteryRef.current = Math.min(100, flashlightBatteryRef.current + CHARGE_RATE * delta);
        }
        setFlashlightBattery(flashlightBatteryRef.current);
    }

    // --- CUTSCENE LOGIC ---
    if (phase === GamePhase.CUTSCENE) {
      timeRef.current += delta;
      
      const t = Math.min(timeRef.current / 6, 1);
      const smoothT = t * t * (3 - 2 * t); 

      const startPos = new THREE.Vector3(0, 0.8, 2);
      const endPos = new THREE.Vector3(0, 1.7, 0); 
      
      camera.position.lerpVectors(startPos, endPos, smoothT * 0.8);

      const lookAtStart = new THREE.Vector3(0, 10, 2); 
      const lookAtEnd = new THREE.Vector3(0, 1.5, -5); 
      
      const currentLook = new THREE.Vector3().lerpVectors(lookAtStart, lookAtEnd, smoothT);
      camera.lookAt(currentLook);
    
    // --- MOVEMENT LOGIC (SHARED) ---
    } else if (activePhases.includes(phase)) {
      const isMoving = moveState.current.forward || moveState.current.backward || moveState.current.left || moveState.current.right || (cheatFlyMode && (moveState.current.up || moveState.current.down));
      
      // Stamina
      const STAMINA_DRAIN_RATE = 25; 
      const STAMINA_REGEN_RATE = 15; 
      
      let isSprinting = false;

      if (moveState.current.sprint && isMoving && staminaRef.current > 0 && !cheatFlyMode) {
        isSprinting = true;
        if (!cheatInfiniteStamina) {
          staminaRef.current = Math.max(0, staminaRef.current - STAMINA_DRAIN_RATE * delta);
        }
      } else {
        staminaRef.current = Math.min(100, staminaRef.current + STAMINA_REGEN_RATE * delta);
      }
      setStamina(staminaRef.current);

      // Horror Audio Logic
      // Heartbeat
      if (staminaRef.current < 50 && phase !== GamePhase.DAWN) {
         if (heartbeatAudio.current && heartbeatAudio.current.paused) heartbeatAudio.current.play().catch(()=>{});
      } else {
         if (heartbeatAudio.current) heartbeatAudio.current.pause();
      }
      
      // Whispers (Only in early gameplay)
      if (phase === GamePhase.GAMEPLAY) {
        whisperTimer.current += delta;
        if (whisperTimer.current > 20) { 
           if (Math.random() > 0.7) {
              whisperAudio.current?.play().catch(()=>{});
              whisperTimer.current = 0;
           } else {
              whisperTimer.current = 10; 
           }
        }
      }

      // CHASE LOGIC
      if (phase === GamePhase.CHASE) {
         // Check if escaped (Back in forest approx z > -100)
         // Village is at -300. Forest ends around -300, starts around -20.
         // Let's say safe zone is z > -100
         if (camera.position.z > -100) {
            setPhase(GamePhase.WAITING_FOR_DAWN);
            if (screamAudio.current) {
                screamAudio.current.pause();
                screamAudio.current.currentTime = 0;
            }
         }
      }
      
      // DAWN TIMER LOGIC
      if (phase === GamePhase.WAITING_FOR_DAWN) {
          dawnTimerRef.current += delta;
          const DURATION = 90; // 1.5 minutes
          const progress = Math.min(dawnTimerRef.current / DURATION, 1);
          setDawnProgress(progress);
          
          if (progress >= 1) {
              setPhase(GamePhase.DAWN);
          }
      }

      // JUMPSCARE (Deep Forest boundary check - still active but moved further?)
      // Map is bigger now (-400). Let's disable the old jumpscare or move it to side boundaries.
      // Let's keep side boundaries logic.
      if ((camera.position.x > 50 || camera.position.x < -50) && !cheatFlyMode && phase === GamePhase.GAMEPLAY) {
         setJumpscareActive(true);
         screamAudio.current?.play().catch(()=>{});
         setPhase(GamePhase.MENU);
         camera.position.set(0,0,0); 
      }

      // Movement Sound Logic
      if (isMoving && !cheatFlyMode) {
         if (footstepAudio.current) {
            if (footstepAudio.current.paused) footstepAudio.current.play().catch(() => {});
            footstepAudio.current.playbackRate = isSprinting ? 1.5 : 0.8; 
         }
      } else {
         if (footstepAudio.current && !footstepAudio.current.paused) {
            footstepAudio.current.pause();
            footstepAudio.current.currentTime = 0;
         }
      }

      // Speed Config
      let moveSpeed = isSprinting ? 5.0 : 2.5;
      if (cheatFlyMode) moveSpeed = isSprinting ? 20.0 : 8.0; 

      if (cheatFlyMode) {
        // --- FLY MODE ---
        if (moveState.current.forward) camera.translateZ(-moveSpeed * delta);
        if (moveState.current.backward) camera.translateZ(moveSpeed * delta);
        if (moveState.current.left) camera.translateX(-moveSpeed * delta);
        if (moveState.current.right) camera.translateX(moveSpeed * delta);
        if (moveState.current.up) camera.translateY(moveSpeed * delta);
        if (moveState.current.down) camera.translateY(-moveSpeed * delta);

      } else {
        // --- WALKING MODE ---
        const direction = new THREE.Vector3();
        const frontVector = new THREE.Vector3(
          0,
          0,
          Number(moveState.current.backward) - Number(moveState.current.forward)
        );
        const sideVector = new THREE.Vector3(
          Number(moveState.current.left) - Number(moveState.current.right),
          0,
          0
        );

        direction
          .subVectors(frontVector, sideVector)
          .normalize()
          .multiplyScalar(moveSpeed * delta)
          .applyEuler(camera.rotation);

        camera.position.x += direction.x;
        camera.position.z += direction.z;
        camera.position.y = 1.7; // Head height
      }
    } else {
        // Stop sounds
         if (footstepAudio.current) footstepAudio.current.pause();
         if (heartbeatAudio.current) heartbeatAudio.current.pause();
    }
  });

  // Helper helper to determine if pointer controls active
  const activePhases = [GamePhase.GAMEPLAY, GamePhase.CHASE, GamePhase.WAITING_FOR_DAWN, GamePhase.DAWN];
  if (activePhases.includes(phase)) return <PointerLockControls pointerSpeed={mouseSensitivity} />;

  return null;
};