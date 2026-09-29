import React from 'react';
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  BookOpen,
  Home,
  Sparkles,
  Navigation,
  Mic,
  Gauge,
  Clock,
} from 'lucide-react';
import { FeedbackNotice } from '../game/types';

interface HUDProps {
  score: number;
  timeSeconds: number;
  currentSpeed: number;
  instructionText: string;
  subHint?: string;
  checkpointProgress: { current: number; total: number };
  distanceToCheckpoint: number;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSignGuide: () => void;
  onReturnToMenu: () => void;
  onSpeakInstruction: () => void;
  activeNotice: FeedbackNotice | null;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  timeSeconds,
  currentSpeed,
  instructionText,
  subHint,
  checkpointProgress,
  distanceToCheckpoint,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
  onOpenSignGuide,
  onReturnToMenu,
  onSpeakInstruction,
  activeNotice,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const speedKmh = Math.round(currentSpeed * 10);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Top Header Section */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Left Side: Back to Menu & Encyclopedia */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onReturnToMenu}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow-md backdrop-blur-sm transition-transform active:scale-95 text-xs font-bold"
            title="Kembali ke Menu Utama"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <button
            type="button"
            onClick={onOpenSignGuide}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-900/90 hover:bg-indigo-800 text-indigo-100 rounded-xl border border-indigo-500/50 shadow-md backdrop-blur-sm transition-transform active:scale-95 text-xs font-bold"
            title="Buka Kamus Rambu Kota"
          >
            <BookOpen className="w-4 h-4 text-indigo-300" />
            <span className="hidden sm:inline">Kamus Rambu</span>
          </button>
        </div>

        {/* Center: Dynamic Indonesian Instruction Box (Materi Bahasa Indonesia Kelas 4 SD) */}
        <div className="flex-1 max-w-2xl pointer-events-auto">
          <div className="bg-slate-900/95 border-2 border-amber-400/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md transition-all">
            <div className="flex items-center justify-between mb-1 text-[11px] text-amber-300 font-bold tracking-wide">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>PETUNJUK ARAH (LANGKAH {checkpointProgress.current} DARI {checkpointProgress.total})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Jarak:</span>
                <span className="text-white font-mono font-extrabold bg-slate-800 px-2 py-0.5 rounded">
                  {Math.round(distanceToCheckpoint)}m
                </span>
                <button
                  type="button"
                  onClick={onSpeakInstruction}
                  className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors"
                  title="Dengarkan Suara Petunjuk"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-sm md:text-base font-extrabold text-white leading-snug">
              {instructionText}
            </p>

            {subHint && (
              <p className="text-[11px] text-amber-200/90 mt-1 font-medium flex items-center gap-1">
                <span>💡</span> {subHint}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Score, Speed, Fullscreen, Audio */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Score Counter */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 text-slate-950 font-black rounded-xl border-2 border-amber-300 shadow-lg">
            <Sparkles className="w-4 h-4 text-slate-950" />
            <div className="text-xs uppercase tracking-tight">Skor:</div>
            <div className="text-lg font-black leading-none">{score}</div>
          </div>

          {/* Speedometer */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 border border-slate-700 text-slate-200 rounded-xl font-bold text-xs">
            <Gauge className="w-4 h-4 text-sky-400" />
            <span>{speedKmh} km/h</span>
          </div>

          {/* Timer */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 border border-slate-700 text-slate-200 rounded-xl font-mono font-bold text-xs">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{formatTime(timeSeconds)}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:text-white'
            }`}
            title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Fullscreen Button (Crucial for IFP classroom setups!) */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mulai Layar Penuh (IFP)'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Joyful Learning Toast Notification Banner (Real-time Feedback) */}
      <div className="flex justify-center w-full my-auto pointer-events-none">
        {activeNotice && (
          <div
            className={`px-5 py-2.5 rounded-2xl border-2 shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce ${
              activeNotice.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100'
                : activeNotice.type === 'warning'
                ? 'bg-amber-950/95 border-amber-400 text-amber-100'
                : 'bg-sky-950/95 border-sky-400 text-sky-100'
            }`}
          >
            <span className="text-2xl">
              {activeNotice.type === 'success' ? '✨' : activeNotice.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <div className="font-extrabold text-sm md:text-base leading-tight">
              {activeNotice.message}
            </div>
          </div>
        )}
      </div>

      {/* Bottom spacer handled by child overlay components (DPad and Actions) */}
      <div className="h-2" />
    </div>
  );
};
