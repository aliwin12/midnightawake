import React, { useState } from 'react';
import { useGameStore } from '../../store';
import { GamePhase } from '../../types';

export const GameOverlay: React.FC = () => {
  const phase = useGameStore((state) => state.phase);
  const stamina = useGameStore((state) => state.stamina);
  const flashlightBattery = useGameStore((state) => state.flashlightBattery);
  const isFlashlightOn = useGameStore((state) => state.isFlashlightOn);
  const setPhase = useGameStore((state) => state.setPhase);
  const isJumpscareActive = useGameStore((state) => state.isJumpscareActive);
  
  // Story
  const lockedHouseDoorHealth = useGameStore((state) => state.lockedHouseDoorHealth);
  const dawnProgress = useGameStore((state) => state.dawnProgress);
  
  // Settings & Cheats
  const mouseSensitivity = useGameStore((state) => state.mouseSensitivity);
  const setMouseSensitivity = useGameStore((state) => state.setMouseSensitivity);
  
  const areCheatsUnlocked = useGameStore((state) => state.areCheatsUnlocked);
  const cheatFlyMode = useGameStore((state) => state.cheatFlyMode);
  const cheatDayTime = useGameStore((state) => state.cheatDayTime);
  const cheatInfiniteStamina = useGameStore((state) => state.cheatInfiniteStamina);
  const cheatInfiniteBattery = useGameStore((state) => state.cheatInfiniteBattery);
  const toggleCheatFlyMode = useGameStore((state) => state.toggleCheatFlyMode);
  const toggleCheatDayTime = useGameStore((state) => state.toggleCheatDayTime);
  const toggleCheatInfiniteStamina = useGameStore((state) => state.toggleCheatInfiniteStamina);
  const toggleCheatInfiniteBattery = useGameStore((state) => state.toggleCheatInfiniteBattery);

  const [menuView, setMenuView] = useState<'MAIN' | 'SETTINGS' | 'CHEATS'>('MAIN');

  const handleResume = () => {
    setPhase(GamePhase.GAMEPLAY);
    setMenuView('MAIN');
  };

  const handleToMenu = () => {
    setPhase(GamePhase.MENU);
    setMenuView('MAIN');
  };
  
  const renderCheatToggle = (label: string, value: boolean, toggle: () => void) => (
    <button 
      onClick={toggle}
      className={`flex items-center justify-between w-full p-3 border ${value ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-black'} hover:bg-gray-900 transition-all text-sm`}
    >
      <span className={value ? 'text-green-400' : 'text-gray-400'}>{label}</span>
      <span className={`font-mono font-bold ${value ? 'text-green-500' : 'text-red-500'}`}>
        {value ? 'ON' : 'OFF'}
      </span>
    </button>
  );

  // DAWN VICTORY SCREEN
  if (phase === GamePhase.DAWN) {
      return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white animate-fade-in duration-[5000ms]">
            <h1 className="text-6xl text-black font-['Courier_Prime'] mb-4">You Survived.</h1>
            <p className="text-xl text-gray-700">The nightmare fades with the light.</p>
            <button onClick={handleToMenu} className="mt-12 text-black border border-black px-6 py-2 hover:bg-black hover:text-white transition-all">
                Main Menu
            </button>
        </div>
      );
  }

  // Pause Menu
  if (phase === GamePhase.PAUSED) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
        <h2 className="text-4xl font-['Nosifer'] text-white mb-12 tracking-widest">PAUSED</h2>
        
        {menuView === 'MAIN' && (
          <div className="flex flex-col gap-6 font-['Courier_Prime'] items-center">
            <button onClick={handleResume} className="text-xl text-gray-400 hover:text-white hover:tracking-widest transition-all">
              RESUME
            </button>
            <button onClick={() => setMenuView('SETTINGS')} className="text-xl text-gray-400 hover:text-white hover:tracking-widest transition-all">
              SETTINGS
            </button>
            {areCheatsUnlocked && (
               <button onClick={() => setMenuView('CHEATS')} className="text-xl text-green-600 hover:text-green-400 hover:tracking-widest transition-all">
                  CHEATS
               </button>
            )}
            <button onClick={handleToMenu} className="text-xl text-gray-400 hover:text-red-500 hover:tracking-widest transition-all">
              MAIN MENU
            </button>
          </div>
        )}

        {menuView === 'SETTINGS' && (
          <div className="flex flex-col gap-6 w-96 font-['Courier_Prime'] bg-black/50 p-8 border border-gray-800">
            <div className="text-2xl text-red-500 border-b border-gray-700 pb-2 mb-4">SETTINGS</div>
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
            <button onClick={() => setMenuView('MAIN')} className="mt-8 text-lg text-gray-500 hover:text-white">
              [ BACK ]
            </button>
          </div>
        )}
        
        {menuView === 'CHEATS' && (
           <div className="flex flex-col gap-4 w-96 font-['Courier_Prime'] bg-black/50 p-8 border border-green-900">
            <div className="text-2xl text-green-500 border-b border-green-900 pb-2 mb-4">DEV CHEATS</div>
            {renderCheatToggle("GOD MODE (FLY)", cheatFlyMode, toggleCheatFlyMode)}
            {renderCheatToggle("SET TIME: DAY", cheatDayTime, toggleCheatDayTime)}
            {renderCheatToggle("INF STAMINA", cheatInfiniteStamina, toggleCheatInfiniteStamina)}
            {renderCheatToggle("INF BATTERY", cheatInfiniteBattery, toggleCheatInfiniteBattery)}
            <button onClick={() => setMenuView('MAIN')} className="mt-8 text-lg text-gray-500 hover:text-white">
              [ BACK ]
            </button>
           </div>
        )}
      </div>
    );
  }

  const activePhases = [GamePhase.GAMEPLAY, GamePhase.CHASE, GamePhase.WAITING_FOR_DAWN];

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-8">
      
      {/* Jumpscare Overlay */}
      {isJumpscareActive && (
         <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center animate-pulse">
            <img 
               src="https://media.istockphoto.com/id/1152069736/photo/scary-woman-face.jpg?s=612x612&w=0&k=20&c=6k9gKj3a0u_mZ_tJ_d-y_X_q_w_z-p_l_x_c_v_b" 
               alt="scare" 
               className="w-full h-full object-cover mix-blend-luminosity brightness-50"
            />
         </div>
      )}

      {/* Chase / Dawn Overlays */}
      {phase === GamePhase.CHASE && (
          <div className="absolute top-24 w-full text-center animate-pulse">
              <h1 className="text-5xl text-red-600 font-['Nosifer'] tracking-widest drop-shadow-[0_0_10px_red]">RUN BACK TO THE FOREST</h1>
          </div>
      )}
      {phase === GamePhase.WAITING_FOR_DAWN && (
          <div className="absolute top-24 w-full text-center">
              <h1 className="text-3xl text-orange-300 font-['Courier_Prime'] tracking-widest animate-pulse opacity-80">
                  SURVIVE UNTIL DAWN
              </h1>
              {dawnProgress > 0 && (
                  <div className="w-64 h-1 bg-gray-800 mx-auto mt-4 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${dawnProgress * 100}%` }}></div>
                  </div>
              )}
          </div>
      )}

      {/* Crosshair & Interaction Prompts */}
      {activePhases.includes(phase) && (
        <>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50">
                <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_2px_white]"></div>
            </div>
            
            {lockedHouseDoorHealth > 0 && phase === GamePhase.GAMEPLAY && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 mt-8 text-white/50 text-sm font-mono">
                    [ Press F to Interact ]
                </div>
            )}
        </>
      )}

      {/* Gameplay HUD */}
      {activePhases.includes(phase) && (
        <div className="flex justify-between items-end w-full mt-auto">
          <div className="text-white/20 text-xs font-mono">
            WASD: Move • SHIFT: Run • F: Action/Flashlight • ESC: Pause
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Flashlight Battery */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold font-mono ${flashlightBattery < 20 && !cheatInfiniteBattery ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                FLASHLIGHT {cheatInfiniteBattery ? '∞' : Math.round(flashlightBattery) + '%'}
              </span>
              <div className="w-32 h-1.5 bg-gray-900 rounded-full border border-gray-800 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${isFlashlightOn ? 'bg-yellow-100 shadow-[0_0_8px_rgba(255,255,200,0.5)]' : 'bg-yellow-900/50'}`}
                  style={{ width: `${flashlightBattery}%` }}
                />
              </div>
            </div>

            {/* Stamina Bar */}
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold font-mono text-gray-500">STMN</span>
               <div className="w-32 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                  <div 
                    className={`h-full bg-white shadow-[0_0_5px_white] transition-all duration-100 ease-linear ${cheatInfiniteStamina ? 'bg-green-400 shadow-green-400' : ''}`}
                    style={{ width: `${stamina}%`, opacity: stamina < 100 ? 0.8 : 0.3 }}
                  />
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};