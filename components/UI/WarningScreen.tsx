import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store';
import { GamePhase } from '../../types';

export const WarningScreen: React.FC = () => {
  const setPhase = useGameStore((state) => state.setPhase);
  const [canClose, setCanClose] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    if (canClose) {
      setPhase(GamePhase.MENU);
    }
  };

  return (
    <div className="absolute inset-0 z-[60] bg-black flex flex-col items-center justify-center text-center p-8 select-none">
      
      <div className="max-w-2xl w-full flex flex-col items-center gap-8 relative z-10 font-['Courier_Prime']">
        <h1 className="text-3xl text-red-600 font-bold uppercase tracking-widest mb-4">
          Предупреждение
        </h1>

        <div className="text-gray-300 space-y-6 text-lg leading-relaxed">
          <p>
            Это ранняя версия игры.
          </p>
          <p>
            Сюда не добавлены никакие элементы сюжета,<br/>
            и не исправлены баги, недочёты, и другие ошибки.<br/>
            Мы занимаемся разработкой дальше, надеемся на ваше терпение.
          </p>
          <p className="text-sm text-gray-500 italic mt-8">
            p.s если игра не выйдет, это будет написано на странице itch.
          </p>
        </div>

        <button 
          onClick={handleClose}
          disabled={!canClose}
          className={`mt-12 px-8 py-3 border transition-all duration-300 text-xl tracking-wider
            ${canClose 
              ? 'border-white text-white hover:bg-white hover:text-black cursor-pointer' 
              : 'border-gray-800 text-gray-700 cursor-not-allowed'
            }`}
        >
          {canClose ? 'ЗАКРЫТЬ' : `ЗАКРЫТЬ (${timeLeft})`}
        </button>
      </div>
    </div>
  );
};