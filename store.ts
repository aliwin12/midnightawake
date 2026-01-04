import { create } from 'zustand';
import { GamePhase, GameState } from './types';

export const useGameStore = create<GameState>((set) => ({
  phase: GamePhase.WARNING, // Start in Warning Screen
  showTimeOverlay: false,
  stamina: 100,
  
  isFlashlightOn: false,
  flashlightBattery: 100,
  
  isBackDoorOpen: false,
  isSideDoorOpen: false,
  
  // Story Defaults
  lockedHouseDoorHealth: 3,
  isJohnFound: false,
  dawnProgress: 0,
  
  isJumpscareActive: false,

  mouseSensitivity: 1.0,
  
  // Cheat Defaults
  areCheatsUnlocked: false,
  cheatFlyMode: false,
  cheatDayTime: false,
  cheatInfiniteStamina: false,
  cheatInfiniteBattery: false,

  setPhase: (phase) => set({ phase }),
  setShowTimeOverlay: (show) => set({ showTimeOverlay: show }),
  setStamina: (stamina) => set({ stamina }),
  setFlashlightOn: (isOn) => set({ isFlashlightOn: isOn }),
  setFlashlightBattery: (level) => set({ flashlightBattery: level }),
  setMouseSensitivity: (val) => set({ mouseSensitivity: val }),
  
  setCheatsUnlocked: (val) => set({ areCheatsUnlocked: val }),
  toggleCheatFlyMode: () => set((state) => ({ cheatFlyMode: !state.cheatFlyMode })),
  toggleCheatDayTime: () => set((state) => ({ cheatDayTime: !state.cheatDayTime })),
  toggleCheatInfiniteStamina: () => set((state) => ({ cheatInfiniteStamina: !state.cheatInfiniteStamina })),
  toggleCheatInfiniteBattery: () => set((state) => ({ cheatInfiniteBattery: !state.cheatInfiniteBattery })),
  
  toggleBackDoor: () => set((state) => ({ isBackDoorOpen: !state.isBackDoorOpen })),
  toggleSideDoor: () => set((state) => ({ isSideDoorOpen: !state.isSideDoorOpen })),
  
  kickLockedDoor: () => set((state) => ({ lockedHouseDoorHealth: Math.max(0, state.lockedHouseDoorHealth - 1) })),
  setDawnProgress: (val) => set({ dawnProgress: val }),
  
  setJumpscareActive: (active) => set({ isJumpscareActive: active }),
}));