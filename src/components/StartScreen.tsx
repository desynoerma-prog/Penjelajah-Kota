import React from 'react';
import { Play, Maximize, Minimize, Volume2, VolumeX, BookOpen, Sparkles, Compass } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  onOpenSignGuide: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onOpenSignGuide,
  isFullscreen,
  onToggleFullscreen,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-b from-slate-950/75 via-slate-900/60 to-slate-950/85 backdrop-blur-[2px] flex flex-col justify-between p-6 sm:p-8 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 bg-amber-500 text-slate-950 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/25">
            <span>🚦</span>
            <span>EDUKASI KELAS 4 SD</span>
          </div>
          <span className="text-xs text-amber-200/90 font-bold bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 hidden sm:inline-block">
            Materi Bahasa Indonesia & Tata Tertib
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:text-white'
            }`}
            title={isMuted ? 'Nyalakan Musik & Suara' : 'Bisukan Suara'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow-md font-extrabold text-xs transition-transform active:scale-95 cursor-pointer"
            title="Layar Penuh (IFP)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Layar Normal' : 'Layar Penuh (IFP)'}</span>
          </button>
        </div>
      </div>

      {/* Main Title Center Hero Section (Matching Uploaded Artwork) */}
      <div className="w-full max-w-4xl mx-auto my-auto flex flex-col items-center text-center gap-6 py-6">
        {/* Banner Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 text-emerald-300 font-black text-xs sm:text-sm tracking-wider uppercase backdrop-blur-md animate-soft-pulse">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Game Simulator Berkendara 3D</span>
        </div>

        {/* Big Game Title */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-400 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] tracking-tight uppercase">
            PENJELAJAH KOTA
          </h1>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-md tracking-tight -mt-1 sm:mt-1">
            Petualangan Rambu & Rute
          </h2>
          <div className="mt-3 px-4 py-1.5 rounded-2xl bg-black/60 border border-white/20 text-slate-200 text-xs sm:text-sm font-bold backdrop-blur-md">
            Bahasa Indonesia Kelas 4: Membaca Denah, Arah Jalan, & Kepatuhan Rambu
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-white/90">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center gap-1.5 font-bold">
            <span>🛵</span>
            <span>Skuter Klasik Biru Muda</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center gap-1.5 font-bold">
            <span>🦓</span>
            <span>Trotoar Cat Blok Hitam-Putih</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center gap-1.5 font-bold">
            <span>📱</span>
            <span>Navigasi Smartphone GPS</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center gap-1.5 font-bold">
            <span>👮</span>
            <span>Pengarahan Denah Pak Polisi</span>
          </div>
        </div>

        {/* Big START Button */}
        <div className="flex flex-col items-center gap-3 w-full max-w-sm mt-2">
          <button
            type="button"
            onClick={onStart}
            className="w-full py-5 px-8 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-2xl sm:text-3xl rounded-3xl shadow-2xl shadow-amber-500/40 border-4 border-amber-200 flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer animate-soft-pulse"
          >
            <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-slate-950" />
            <span className="tracking-wider">START</span>
          </button>

          <button
            type="button"
            onClick={onOpenSignGuide}
            className="w-full py-3.5 px-6 bg-slate-900/80 hover:bg-slate-800 text-indigo-200 border-2 border-indigo-400/40 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Kamus Rambu & Tata Tertib Kota</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <span>Dirancang untuk Layar Sentuh IFP Ruang Kelas & Laptop Siswa</span>
        </div>
        <div className="font-semibold text-slate-300 hidden sm:block">
          Sistem Poin Kepatuhan & Joyful Learning
        </div>
      </div>
    </div>
  );
};
