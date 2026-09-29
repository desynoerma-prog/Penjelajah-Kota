import React from 'react';
import { ChevronsUp, ChevronsDown } from 'lucide-react';

interface PedalTouchControlsProps {
  onThrottleChange: (throttle: { gas: boolean; brake: boolean }) => void;
  activeThrottle: { gas: boolean; brake: boolean };
  isTouchVisible: boolean;
}

export const PedalTouchControls: React.FC<PedalTouchControlsProps> = ({
  onThrottleChange,
  activeThrottle,
  isTouchVisible,
}) => {
  const handleGasDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onThrottleChange({ gas: true, brake: false });
  };

  const handleGasUp = (e: React.PointerEvent) => {
    e.preventDefault();
    onThrottleChange({ gas: false, brake: activeThrottle.brake });
  };

  const handleBrakeDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onThrottleChange({ gas: false, brake: true });
  };

  const handleBrakeUp = (e: React.PointerEvent) => {
    e.preventDefault();
    onThrottleChange({ gas: activeThrottle.gas, brake: false });
  };

  return (
    <div
      className={`flex flex-col items-center gap-4 sm:gap-5 select-none touch-none transition-all duration-500 ease-in-out ${
        isTouchVisible
          ? 'opacity-100 pointer-events-auto translate-y-0 scale-100'
          : 'opacity-0 pointer-events-none translate-y-4 scale-95'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Tombol Chevron Atas Ganda (Gas / Akselerasi - Hitbox Besar IFP ~1.75x) */}
      <button
        type="button"
        onPointerDown={handleGasDown}
        onPointerUp={handleGasUp}
        onPointerCancel={handleGasUp}
        onPointerLeave={handleGasUp}
        className={`w-26 h-24 sm:w-30 sm:h-28 lg:w-32 lg:h-30 rounded-3xl border-3 flex flex-col items-center justify-center backdrop-blur-md transition-all active:scale-90 shadow-2xl ${
          activeThrottle.gas
            ? 'bg-emerald-500/55 border-emerald-300 ring-8 ring-emerald-400/40 scale-95 shadow-emerald-500/50'
            : 'bg-black/40 hover:bg-black/50 border-white/80'
        }`}
        aria-label="Gas / Akselerasi Skuter"
      >
        <ChevronsUp className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white stroke-[4] animate-pulse drop-shadow-md" />
        <span className="text-[11px] sm:text-xs uppercase font-black tracking-widest text-white -mt-1 drop-shadow">
          GAS MAJU
        </span>
      </button>

      {/* Tombol Chevron Bawah Ganda (Rem / Mundur - Hitbox Besar IFP ~1.75x) */}
      <button
        type="button"
        onPointerDown={handleBrakeDown}
        onPointerUp={handleBrakeUp}
        onPointerCancel={handleBrakeUp}
        onPointerLeave={handleBrakeUp}
        className={`w-26 h-24 sm:w-30 sm:h-28 lg:w-32 lg:h-30 rounded-3xl border-3 flex flex-col items-center justify-center backdrop-blur-md transition-all active:scale-90 shadow-2xl ${
          activeThrottle.brake
            ? 'bg-rose-600/55 border-rose-300 ring-8 ring-rose-400/40 scale-95 shadow-rose-600/50'
            : 'bg-black/40 hover:bg-black/50 border-white/80'
        }`}
        aria-label="Rem / Mundur Skuter"
      >
        <ChevronsDown className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white stroke-[4] drop-shadow-md" />
        <span className="text-[11px] sm:text-xs uppercase font-black tracking-widest text-white -mt-1 drop-shadow">
          REM BERHENTI
        </span>
      </button>
    </div>
  );
};
