import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface VirtualDPadProps {
  onDirectionChange: (dir: { up: boolean; down: boolean; left: boolean; right: boolean }) => void;
  activeDirections: { up: boolean; down: boolean; left: boolean; right: boolean };
}

export const VirtualDPad: React.FC<VirtualDPadProps> = ({
  onDirectionChange,
  activeDirections,
}) => {
  const setKey = (key: 'up' | 'down' | 'left' | 'right', value: boolean) => {
    onDirectionChange({
      ...activeDirections,
      [key]: value,
    });
  };

  const handlePointerDown = (key: 'up' | 'down' | 'left' | 'right', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setKey(key, true);
  };

  const handlePointerUp = (key: 'up' | 'down' | 'left' | 'right', e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setKey(key, false);
  };

  return (
    <div
      className="relative w-48 h-48 select-none touch-none pointer-events-auto"
      style={{ touchAction: 'none' }}
    >
      {/* Up Button */}
      <button
        type="button"
        onPointerDown={(e) => handlePointerDown('up', e)}
        onPointerUp={(e) => handlePointerUp('up', e)}
        onPointerCancel={(e) => handlePointerUp('up', e)}
        onPointerLeave={(e) => handlePointerUp('up', e)}
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-lg transition-transform active:scale-90 border-2 ${
          activeDirections.up
            ? 'bg-amber-500 border-amber-300 scale-95 shadow-amber-500/50'
            : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-600'
        }`}
        aria-label="Maju (Atas)"
      >
        <ArrowUp className="w-8 h-8" />
        <span className="text-[10px] uppercase tracking-wider font-extrabold -mt-1">Maju</span>
      </button>

      {/* Down Button */}
      <button
        type="button"
        onPointerDown={(e) => handlePointerDown('down', e)}
        onPointerUp={(e) => handlePointerUp('down', e)}
        onPointerCancel={(e) => handlePointerUp('down', e)}
        onPointerLeave={(e) => handlePointerUp('down', e)}
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-lg transition-transform active:scale-90 border-2 ${
          activeDirections.down
            ? 'bg-amber-500 border-amber-300 scale-95 shadow-amber-500/50'
            : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-600'
        }`}
        aria-label="Mundur (Bawah)"
      >
        <ArrowDown className="w-8 h-8" />
        <span className="text-[10px] uppercase tracking-wider font-extrabold -mt-1">Mundur</span>
      </button>

      {/* Left Button */}
      <button
        type="button"
        onPointerDown={(e) => handlePointerDown('left', e)}
        onPointerUp={(e) => handlePointerUp('left', e)}
        onPointerCancel={(e) => handlePointerUp('left', e)}
        onPointerLeave={(e) => handlePointerUp('left', e)}
        className={`absolute top-1/2 left-0 -translate-y-1/2 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-lg transition-transform active:scale-90 border-2 ${
          activeDirections.left
            ? 'bg-amber-500 border-amber-300 scale-95 shadow-amber-500/50'
            : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-600'
        }`}
        aria-label="Belok Kiri"
      >
        <ArrowLeft className="w-8 h-8" />
        <span className="text-[10px] uppercase tracking-wider font-extrabold -mt-1">Kiri</span>
      </button>

      {/* Right Button */}
      <button
        type="button"
        onPointerDown={(e) => handlePointerDown('right', e)}
        onPointerUp={(e) => handlePointerUp('right', e)}
        onPointerCancel={(e) => handlePointerUp('right', e)}
        onPointerLeave={(e) => handlePointerUp('right', e)}
        className={`absolute top-1/2 right-0 -translate-y-1/2 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-lg transition-transform active:scale-90 border-2 ${
          activeDirections.right
            ? 'bg-amber-500 border-amber-300 scale-95 shadow-amber-500/50'
            : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-600'
        }`}
        aria-label="Belok Kanan"
      >
        <ArrowRight className="w-8 h-8" />
        <span className="text-[10px] uppercase tracking-wider font-extrabold -mt-1">Kanan</span>
      </button>

      {/* Center D-Pad Hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900 border border-slate-700 pointer-events-none flex items-center justify-center text-slate-500 text-xs font-black">
        IFP
      </div>
    </div>
  );
};
