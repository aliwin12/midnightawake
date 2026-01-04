import React, { useState } from 'react';
import { useGameStore } from '../../store';
import { GamePhase } from '../../types';

type MenuState = 'MAIN' | 'SETTINGS' | 'CODE' | 'CHEAT_MENU';

export const MainMenu: React.FC = () => {
  const setPhase = useGameStore((state) => state.setPhase);
  const mouseSensitivity = useGameStore((state) => state.mouseSensitivity);
  const setMouseSensitivity = useGameStore((state) => state.setMouseSensitivity);
  
  // Cheats
  const areCheatsUnlocked = useGameStore((state) => state.areCheatsUnlocked);
  const setCheatsUnlocked = useGameStore((state) => state.setCheatsUnlocked);
  const cheatFlyMode = useGameStore((state) => state.cheatFlyMode);
  const cheatDayTime = useGameStore((state) => state.cheatDayTime);
  const cheatInfiniteStamina = useGameStore((state) => state.cheatInfiniteStamina);
  const cheatInfiniteBattery = useGameStore((state) => state.cheatInfiniteBattery);
  const toggleCheatFlyMode = useGameStore((state) => state.toggleCheatFlyMode);
  const toggleCheatDayTime = useGameStore((state) => state.toggleCheatDayTime);
  const toggleCheatInfiniteStamina = useGameStore((state) => state.toggleCheatInfiniteStamina);
  const toggleCheatInfiniteBattery = useGameStore((state) => state.toggleCheatInfiniteBattery);

  const [menuState, setMenuState] = useState<MenuState>('MAIN');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);

  const handleStart = () => {
    setPhase(GamePhase.CUTSCENE);
  };

  const handleCodeSubmit = () => {
    if (code === '003681') {
      setCheatsUnlocked(true);
      setMenuState('CHEAT_MENU');
      setCode('');
    } else {
      setCodeError(true);
      setTimeout(() => setCodeError(false), 1000);
    }
  };

  const renderCheatToggle = (label: string, value: boolean, toggle: () => void) => (
    <button 
      onClick={toggle}
      className={`flex items-center justify-between w-full p-4 border ${value ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-black'} hover:bg-gray-900 transition-all`}
    >
      <span className={value ? 'text-green-400' : 'text-gray-400'}>{label}</span>
      <span className={`font-mono font-bold ${value ? 'text-green-500' : 'text-red-500'}`}>
        {value ? 'ON' : 'OFF'}
      </span>
    </button>
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="ml-24 w-1/3 flex flex-col items-start gap-8">
        <h1 className="font-['Nosifer'] text-7xl text-red-700 drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]">
          MIDNIGHT<br/>AWAKE
        </h1>
        
        <div className="h-px w-32 bg-red-900/50 my-2"></div>

        {menuState === 'MAIN' && (
          <div className="flex flex-col gap-4 items-start w-full max-w-md">
            <button 
              onClick={handleStart}
              className="group relative px-6 py-3 text-2xl font-['Courier_Prime'] text-gray-400 hover:text-white transition-all duration-300 ease-out w-full text-left"
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-full bg-red-900/20 group-hover:w-full transition-all duration-500 ease-out -z-10"></span>
              <span className="group-hover:tracking-widest transition-all duration-300">> START GAME</span>
            </button>

            <button 
              onClick={() => setMenuState('SETTINGS')}
              className="group relative px-6 py-2 text-xl font-['Courier_Prime'] text-gray-500 hover:text-white transition-all duration-300 w-full text-left"
            >
              <span className="group-hover:text-red-500">> SETTINGS</span>
            </button>

            {areCheatsUnlocked ? (
              <button 
                onClick={() => setMenuState('CHEAT_MENU')}
                className="group relative px-6 py-2 text-xl font-['Courier_Prime'] text-green-600 hover:text-green-400 transition-all duration-300 w-full text-left animate-pulse"
              >
                <span className="group-hover:tracking-widest">> CHEATS</span>
              </button>
            ) : (
              <button 
                onClick={() => setMenuState('CODE')}
                className="group relative px-6 py-2 text-xl font-['Courier_Prime'] text-gray-500 hover:text-white transition-all duration-300 w-full text-left"
              >
                <span className="group-hover:text-red-500">> SPECIAL CODE</span>
              </button>
            )}
          </div>
        )}

        {menuState === 'SETTINGS' && (
          <div className="flex flex-col gap-6 w-full animate-fade-in font-['Courier_Prime']">
            <div className="text-2xl text-red-500 border-b border-red-900/30 pb-2">SETTINGS</div>
            
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-lg">MOUSE SENSITIVITY: {mouseSensitivity.toFixed(1)}</label>
              <input 
                type="range" 
                min="0.1" 
                max="3.0" 
                step="0.1"
                value={mouseSensitivity}
                onChange={(e) => setMouseSensitivity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-700"
              />
            </div>

            <button 
              onClick={() => setMenuState('MAIN')}
              className="mt-4 text-gray-500 hover:text-white text-left text-lg"
            >
              [ BACK ]
            </button>
          </div>
        )}

        {menuState === 'CODE' && (
          <div className="flex flex-col gap-6 w-full animate-fade-in font-['Courier_Prime']">
            <div className="text-2xl text-red-500 border-b border-red-900/30 pb-2">ENTER CODE</div>
            
            <div className="flex flex-col gap-4">
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className={`w-full bg-black border ${codeError ? 'border-red-500 text-red-500' : 'border-gray-700 text-white'} p-4 text-3xl font-mono tracking-[1em] focus:outline-none focus:border-red-800 transition-colors`}
              />
              <button 
                onClick={handleCodeSubmit}
                className="bg-gray-900 hover:bg-red-900/40 text-white py-3 border border-gray-800 hover:border-red-500 transition-all"
              >
                SUBMIT
              </button>
            </div>

            <button 
              onClick={() => setMenuState('MAIN')}
              className="mt-4 text-gray-500 hover:text-white text-left text-lg"
            >
              [ BACK ]
            </button>
          </div>
        )}

        {menuState === 'CHEAT_MENU' && (
          <div className="flex flex-col gap-4 w-full animate-fade-in font-['Courier_Prime']">
            <div className="text-2xl text-green-500 border-b border-green-900/30 pb-2">DEV CONSOLE</div>
            
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {renderCheatToggle("GOD MODE (FLY)", cheatFlyMode, toggleCheatFlyMode)}
              {renderCheatToggle("SET TIME: DAY", cheatDayTime, toggleCheatDayTime)}
              {renderCheatToggle("INFINITE STAMINA", cheatInfiniteStamina, toggleCheatInfiniteStamina)}
              {renderCheatToggle("INFINITE BATTERY", cheatInfiniteBattery, toggleCheatInfiniteBattery)}
            </div>

            <button 
              onClick={() => setMenuState('MAIN')}
              className="mt-4 text-gray-500 hover:text-white text-left text-lg"
            >
              [ BACK ]
            </button>
          </div>
        )}

        <div className="fixed bottom-8 left-8 text-xs text-gray-700 font-mono">
          v0.0.1 ALPHA | HEADPHONES RECOMMENDED
        </div>
      </div>
    </div>
  );
};