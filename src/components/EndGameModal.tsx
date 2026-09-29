import React from 'react';
import { Star, RotateCcw, ArrowRight, Home, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Mission } from '../game/types';

interface EndGameModalProps {
  mission: Mission;
  score: number;
  timeSeconds: number;
  violationsCount: number;
  answeredSignCount?: number;
  onNextMission: () => void;
  onRetryMission: () => void;
  onReturnToMenu: () => void;
  hasNextMission: boolean;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  mission,
  score,
  timeSeconds,
  violationsCount,
  answeredSignCount = 0,
  onNextMission,
  onRetryMission,
  onReturnToMenu,
  hasNextMission,
}) => {
  // Convert score into 1 to 3 stars
  const calculateStars = () => {
    if (score >= 40) return 3;
    if (score >= 20) return 2;
    return 1;
  };

  const stars = calculateStars();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m} Menit ${s} Detik`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col items-center text-center gap-5 relative overflow-hidden animate-soft-pulse">
        {/* Celebration Header */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mb-2 text-3xl shadow-lg shadow-amber-400/20">
            🏆
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
            MISI SELESAI
          </h2>
          <p className="text-sm font-bold text-slate-300 mt-1">
            Hebat sekali! Skuter birumu berhasil tiba di {mission.locationTo}!
          </p>
        </div>

        {/* 3 Stars Appreciation */}
        <div className="flex items-center gap-3 my-1">
          {[1, 2, 3].map((starIndex) => (
            <div
              key={starIndex}
              className={`p-3 rounded-2xl border-2 transition-transform transform ${
                starIndex <= stars
                  ? 'bg-amber-400/20 border-amber-400 text-amber-400 scale-110 shadow-lg shadow-amber-400/30'
                  : 'bg-slate-800 border-slate-700 text-slate-600'
              }`}
            >
              <Star
                className={`w-9 h-9 ${
                  starIndex <= stars ? 'fill-amber-400' : 'fill-transparent'
                }`}
              />
            </div>
          ))}
        </div>

        <div className="text-xs uppercase tracking-widest font-black text-amber-400">
          {stars === 3
            ? '⭐⭐⭐ LUAR BIASA! PENJELAJAH TERTIB BINTANG TIGA'
            : stars === 2
            ? '⭐⭐ HEBAT! PETUALANG RAMBU YANG CERMAT'
            : '⭐ BAGUS! TETAP SEMANGAT BERLATIH'}
        </div>

        {/* Score & Time Stats Cards */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Total Poin</span>
            </div>
            <div className="text-3xl font-black text-white">{score}</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              + Poin Kepatuhan
            </div>
          </div>

          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-sky-300 font-bold uppercase mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Waktu Tempuh</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {formatTime(timeSeconds)}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Perjalanan Tertib
            </div>
          </div>
        </div>

        {/* Evaluation Summary */}
        <div className="w-full bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5 text-slate-300">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Pemahaman Arah Bahasa Indonesia:
            </span>
            <span className="text-emerald-400">Tuntas 100%</span>
          </div>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              Kepatuhan Rambu & Marka Trotoar:
            </span>
            <span className="text-amber-400">
              {violationsCount === 0 ? 'Sempurna & Tertib' : 'Baik (Terus Berlatih)'}
            </span>
          </div>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Kuis Rambu Terjawab:
            </span>
            <span className="text-sky-300 font-mono">
              {answeredSignCount} Rambu Edukasi (+Poin)
            </span>
          </div>
        </div>

        {/* Large Touch Button for "Misi Baru" & Options */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={hasNextMission ? onNextMission : onReturnToMenu}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <span>Misi Baru</span>
            <ArrowRight className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={onRetryMission}
            className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-600 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi Misi</span>
          </button>

          <button
            type="button"
            onClick={onReturnToMenu}
            className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-600 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
