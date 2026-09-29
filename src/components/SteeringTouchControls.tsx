import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface SteeringTouchControlsProps {
  onSteerChange: (dir: { left: boolean; right: boolean }) => void;
  activeSteer: { left: boolean; right: boolean };
  isTouchVisible: boolean;
}

export const SteeringTouchControls: React.FC<SteeringTouchControlsProps> = ({
  onSteerChange,
  activeSteer,
  isTouchVisible,
}) => {
  const handleLeftDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onSteerChange({ left: true, right: false });
  };

  const handleLeftUp = (e: React.PointerEvent) => {
    e.preventDefault();
    onSteerChange({ left: false, right: activeSteer.right });
  };

  const handleRightDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onSteerChange({ left: false, right: true });
  };

  const handleRightUp = (e: React.PointerEvent) => {
    e.preventDefault();
    onSteerChange({ left: activeSteer.left, right: false });
  };

  return (
    <div
      className={`flex items-center gap-5 sm:gap-6 select-none touch-none transition-all duration-500 ease-in-out ${
        isTouchVisible
          ? 'opacity-100 pointer-events-auto translate-y-0 scale-100'
          : 'opacity-0 pointer-events-none translate-y-4 scale-95'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Tombol Lingkaran Transparan Belok Kiri (Hitbox Besar IFP ~1.75x) */}
      <button
        type="button"
        onPointerDown={handleLeftDown}
        onPointerUp={handleLeftUp}
        onPointerCancel={handleLeftUp}
        onPointerLeave={handleLeftUp}
        className={`w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-3 flex flex-col items-center justify-center backdrop-blur-md transition-all active:scale-90 shadow-2xl ${
          activeSteer.left
            ? 'bg-white/45 border-white ring-8 ring-white/30 scale-95 shadow-white/40'
            : 'bg-black/40 hover:bg-black/50 border-white/80'
        }`}
        aria-label="Kemudi Belok Kiri"
      >
        <ArrowLeft className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white stroke-[4] drop-shadow-md" />
        <span className="text-[10px] sm:text-xs font-black uppercase text-white tracking-widest -mt-1 drop-shadow">
          Kiri
        </span>
      </button>

      {/* Tombol Lingkaran Transparan Belok Kanan (Hitbox Besar IFP ~1.75x) */}
      <button
        type="button"
        onPointerDown={handleRightDown}
        onPointerUp={handleRightUp}
        onPointerCancel={handleRightUp}
        onPointerLeave={handleRightUp}
        className={`w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-3 flex flex-col items-center justify-center backdrop-blur-md transition-all active:scale-90 shadow-2xl ${
          activeSteer.right
            ? 'bg-white/45 border-white ring-8 ring-white/30 scale-95 shadow-white/40'
            : 'bg-black/40 hover:bg-black/50 border-white/80'
        }`}
        aria-label="Kemudi Belok Kanan"
      >
        <ArrowRight className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white stroke-[4] drop-shadow-md" />
        <span className="text-[10px] sm:text-xs font-black uppercase text-white tracking-widest -mt-1 drop-shadow">
          Kanan
        </span>
      </button>
    </div>
  );
};
