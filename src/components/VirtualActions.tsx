import React from 'react';
import { Volume2, OctagonAlert } from 'lucide-react';

interface VirtualActionsProps {
  onBrakeChange: (braking: boolean) => void;
  isBraking: boolean;
  onHorn: () => void;
  vehicleType: 'sepeda' | 'motor' | 'mobil';
}

export const VirtualActions: React.FC<VirtualActionsProps> = ({
  onBrakeChange,
  isBraking,
  onHorn,
  vehicleType,
}) => {
  const getHornLabel = () => {
    switch (vehicleType) {
      case 'sepeda':
        return 'Bel Kring';
      case 'motor':
        return 'Klakson Tet';
      default:
        return 'Klakson Mobil';
    }
  };

  return (
    <div className="flex items-end gap-3 select-none touch-none pointer-events-auto">
      {/* Horn / Bell Button */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onHorn();
        }}
        className="w-18 h-18 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-90 border-2 border-sky-300 text-white shadow-lg flex flex-col items-center justify-center transition-transform"
        aria-label="Bunyikan Bel / Klakson"
      >
        <Volume2 className="w-8 h-8" />
        <span className="text-[11px] font-extrabold mt-0.5 tracking-tight">{getHornLabel()}</span>
      </button>

      {/* Main Action / Brake Button (Rem & Aksi) */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onBrakeChange(true);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          onBrakeChange(false);
        }}
        onPointerCancel={(e) => {
          e.preventDefault();
          onBrakeChange(false);
        }}
        onPointerLeave={(e) => {
          e.preventDefault();
          onBrakeChange(false);
        }}
        className={`w-24 h-24 rounded-2xl border-4 flex flex-col items-center justify-center font-black text-white shadow-2xl transition-transform active:scale-95 ${
          isBraking
            ? 'bg-red-700 border-white scale-95 shadow-red-600/80 ring-4 ring-red-400'
            : 'bg-red-600 hover:bg-red-500 border-red-300 shadow-red-900/60'
        }`}
        aria-label="Rem dan Berhenti"
      >
        <OctagonAlert className="w-10 h-10 animate-pulse" />
        <span className="text-sm uppercase tracking-wider font-black -mt-0.5">REM</span>
        <span className="text-[10px] font-bold text-red-100">BERHENTI</span>
      </button>
    </div>
  );
};
