import React, { useState, useCallback } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import clsx from 'clsx';

const PET_STYLES = [
  { id: 'cat', emoji: '🐱', name: '小猫咪' },
  { id: 'dog', emoji: '🐶', name: '小狗狗' },
  { id: 'nailong', image: '/pet-nailong.png', name: '奶龙' },
  { id: 'fox', emoji: '🦊', name: '小狐狸' },
  { id: 'penguin', emoji: '🐧', name: '企鹅酱' },
];

const PET_CLICK_MESSAGES = [
  '今天也要加油哦~',
  '摸摸头~',
  '有我在呢！',
  '你真棒！',
];

export default function Pet() {
  const { petStyle, petMessage } = useExpenses();
  const [bouncing, setBouncing] = useState(false);
  const [clickMessage, setClickMessage] = useState(null);

  const style = PET_STYLES.find(s => s.id === petStyle) || PET_STYLES[0];

  const handlePetClick = useCallback(() => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 500);
    const msg = PET_CLICK_MESSAGES[Math.floor(Math.random() * PET_CLICK_MESSAGES.length)];
    const id = Date.now().toString();
    setClickMessage({ id, text: msg });
    setTimeout(() => {
      setClickMessage(prev => prev?.id === id ? null : prev);
    }, 3000);
  }, []);

  const displayMessage = petMessage || clickMessage;

  return (
    <div className="fixed bottom-20 right-4 z-30 flex flex-col items-end gap-2">
      {/* Speech bubble */}
      {displayMessage && (
        <div
          key={displayMessage.id}
          className="relative bg-white text-neutral-700 text-sm font-medium px-4 py-2 rounded-2xl rounded-br-md shadow-lg border border-neutral-200 max-w-[200px]"
          style={{
            animation: 'petBubbleIn 0.3s ease-out',
          }}
        >
          {displayMessage.text}
        </div>
      )}

      {/* Pet body */}
      <button
        onClick={handlePetClick}
        className={clsx(
          'w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2 border-neutral-200 bg-white cursor-pointer select-none transition-all hover:shadow-xl hover:scale-105 active:scale-95',
          bouncing && 'animate-bounce'
        )}
        title={style.name}
        style={{
          animation: !bouncing ? 'petFloat 3s ease-in-out infinite' : undefined,
        }}
      >
        {style.image ? (
          <img src={style.image} alt={style.name} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <span className="text-3xl leading-none">{style.emoji}</span>
        )}
      </button>

      {/* Inject keyframe animations */}
      <style>{`
        @keyframes petFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes petBubbleIn {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
