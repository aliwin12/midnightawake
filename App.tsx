import React from 'react';
import { GameScene } from './components/Scene/GameScene';
import { GameOverlay } from './components/UI/GameOverlay';
import { MainMenu } from './components/UI/MainMenu';
import { WarningScreen } from './components/UI/WarningScreen';
import { useGameStore } from './store';
import { GamePhase } from './types';

function App() {
  const phase = useGameStore((state) => state.phase);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <GameScene />
      </div>

      {/* UI Overlay Layer */}
      <GameOverlay />

      {/* Modal Layers */}
      {phase === GamePhase.WARNING && <WarningScreen />}
      {phase === GamePhase.MENU && <MainMenu />}
    </div>
  );
}

export default App;