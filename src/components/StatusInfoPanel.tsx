import React from 'react';
import {
  Camera,
  Clock,
  Sparkles,
  ShieldCheck,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  BookOpen,
  Home,
} from 'lucide-react';
import { CameraMode } from '../game/types';

interface StatusInfoPanelProps {
  score: number;
  timeSeconds: number;
  vehicleCondition: number; // 0 to 100
  cameraMode: CameraMode;
  onCycleCamera: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSignGuide: () => void;
  onReturnToMenu: () => void;
}

export const StatusInfoPanel: React.FC<StatusInfoPanelProps> = ({
  score,
  timeSeconds,
  vehicleCondition,
  cameraMode,
  onCycleCamera,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  onOpenSignGuide,
  onReturnToMenu,
}) => {
  const getCameraLabel = () => {
    switch (cameraMode) {
      case 'third_near':
        return 'POV Dekat';
      case 'third_far':
        return 'POV Jauh';
      case 'first_person':
        return 'POV Setang';
      case 'top_down':
        return 'POV Drone';
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 left-4 z-30 flex flex-col gap-2.5 pointer-events-auto select-none">
      {/* 1. Tombol Ikon Kamera Berwarna Putih (PRD Requirement) */}
      <button
        type="button"
        onClick={onCycleCamera}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-black/45 hover:bg-black/60 active:scale-95 border-2 border-white/80 rounded-2xl backdrop-blur-md text-white shadow-xl transition-all cursor-pointer"
        title="Ganti Sudut Pandang Kamera"
      >
        <Camera className="w-5 h-5 text-white" />
        <span className="text-xs font-black tracking-wide uppercase">{getCameraLabel()}</span>
      </button>

      {/* 2. Deretan Kotak Informasi Kecil Bersusun */}
      <div className="flex flex-col gap-1.5 w-48">
        {/* Kotak 1: Total Skor Poin */}
        <div className="bg-black/45 border border-white/20 rounded-xl px-3 py-1.5 backdrop-blur-md flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Skor:</span>
          </div>
          <div className="text-sm font-black text-white font-mono">{score} Poin</div>
        </div>

        {/* Kotak 2: Sisa Waktu / Timer */}
        <div className="bg-black/45 border border-white/20 rounded-xl px-3 py-1.5 backdrop-blur-md flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-sky-300 font-bold">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Waktu:</span>
          </div>
          <div className="text-sm font-black text-white font-mono">{formatTime(timeSeconds)}</div>
        </div>

        {/* Kotak 3: Kondisi Kendaraan (Health Bar) */}
        <div className="bg-black/45 border border-white/20 rounded-xl px-3 py-2 backdrop-blur-md flex flex-col gap-1 shadow-lg">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
            <div className="flex items-center gap-1 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Kondisi Skuter:</span>
            </div>
            <span className="font-mono text-white">{vehicleCondition}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                vehicleCondition > 50
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : vehicleCondition > 25
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${vehicleCondition}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Bar Aksi Cepat (Suara, Fullscreen, Kamus, Menu) */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onReturnToMenu}
          className="p-2 bg-black/45 hover:bg-black/60 border border-white/20 rounded-xl text-white backdrop-blur-md shadow-md active:scale-95"
          title="Kembali ke Menu"
        >
          <Home className="w-4 h-4 text-amber-400" />
        </button>

        <button
          type="button"
          onClick={onOpenSignGuide}
          className="p-2 bg-black/45 hover:bg-black/60 border border-white/20 rounded-xl text-white backdrop-blur-md shadow-md active:scale-95"
          title="Buka Kamus Rambu"
        >
          <BookOpen className="w-4 h-4 text-indigo-300" />
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          className="p-2 bg-black/45 hover:bg-black/60 border border-white/20 rounded-xl text-white backdrop-blur-md shadow-md active:scale-95"
          title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-2 bg-black/45 hover:bg-black/60 border border-white/20 rounded-xl text-white backdrop-blur-md shadow-md active:scale-95"
          title={isFullscreen ? 'Keluar Fullscreen' : 'Mulai Fullscreen (IFP)'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
