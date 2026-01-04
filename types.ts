export enum GamePhase {
  WARNING = 'WARNING',
  MENU = 'MENU',
  CUTSCENE = 'CUTSCENE',
  READING_NOTE = 'READING_NOTE',
  GAMEPLAY = 'GAMEPLAY',
  PAUSED = 'PAUSED',
  CHASE = 'CHASE',
  WAITING_FOR_DAWN = 'WAITING_FOR_DAWN',
  DAWN = 'DAWN'
}

export interface GameState {
  phase: GamePhase;
  showTimeOverlay: boolean;
  stamina: number;
  
  // Flashlight state
  isFlashlightOn: boolean;
  flashlightBattery: number;
  
  // Door States (Home)
  isBackDoorOpen: boolean;
  isSideDoorOpen: boolean;
  
  // Village / Story States
  lockedHouseDoorHealth: number; // 3 kicks to break
  isJohnFound: boolean; // Visual tag
  dawnProgress: number; // 0 to 1 for sky transition
  
  // Horror Elements
  isJumpscareActive: boolean;
  
  // Settings
  mouseSensitivity: number;

  // Cheats
  areCheatsUnlocked: boolean;
  cheatFlyMode: boolean;
  cheatDayTime: boolean;
  cheatInfiniteStamina: boolean;
  cheatInfiniteBattery: boolean;

  setPhase: (phase: GamePhase) => void;
  setShowTimeOverlay: (show: boolean) => void;
  setStamina: (stamina: number) => void;
  setFlashlightOn: (isOn: boolean) => void;
  setFlashlightBattery: (level: number) => void;
  setMouseSensitivity: (val: number) => void;
  
  setCheatsUnlocked: (val: boolean) => void;
  toggleCheatFlyMode: () => void;
  toggleCheatDayTime: () => void;
  toggleCheatInfiniteStamina: () => void;
  toggleCheatInfiniteBattery: () => void;
  
  toggleBackDoor: () => void;
  toggleSideDoor: () => void;
  
  kickLockedDoor: () => void; // Reduces health
  setDawnProgress: (val: number) => void;
  
  setJumpscareActive: (active: boolean) => void;
}