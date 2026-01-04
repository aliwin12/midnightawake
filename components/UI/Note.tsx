import React from 'react';
import { useGameStore } from '../../store';
import { GamePhase } from '../../types';

export const Note: React.FC = () => {
  const setPhase = useGameStore((state) => state.setPhase);

  const handleClose = () => {
    setPhase(GamePhase.GAMEPLAY);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-[#f4e4bc] text-black p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] transform rotate-1 rounded-sm border border-[#d3c092]">
        {/* Paper texture effect overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
        
        <div className="relative z-10 font-['Courier_Prime']">
          <p className="mb-6 text-lg leading-relaxed font-semibold text-gray-900">
            Я решил уехать отсюда,<br />
            мне надоело уже скучно жить,<br />
            я хочу провести хотя бы пару дней по особенному,<br />
            надеюсь ты это прочитал, не знаю, приеду ли я или нет.
          </p>
          
          <div className="mt-12 text-right">
            <p className="text-xl font-bold mb-1">- Джон</p>
            <p className="text-sm text-gray-700">06.04.2019</p>
          </div>
        </div>

        <button 
          onClick={handleClose}
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white hover:text-red-500 transition-colors uppercase tracking-widest text-sm font-bold"
        >
          [ Продолжить ]
        </button>
      </div>
    </div>
  );
};