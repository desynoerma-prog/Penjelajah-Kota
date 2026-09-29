import React from 'react';
import { MapPin, Compass, Award, Play } from 'lucide-react';
import { Mission } from '../game/types';

interface MissionIntroModalProps {
  mission: Mission;
  onStart: () => void;
}

export const MissionIntroModal: React.FC<MissionIntroModalProps> = ({
  mission,
  onStart,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col gap-5 relative overflow-hidden animate-soft-pulse">
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-xs px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          <span>Materi Bahasa Indonesia Kelas 4 SD</span>
        </div>

        {/* Title */}
        <div>
          <div className="text-amber-400 font-extrabold text-sm uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            <span>Tugas Misi Simulator 3D</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {mission.title}
          </h2>
        </div>

        {/* Route Card (Titik A -> Titik B) */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black border border-emerald-500/40">
              A
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Titik Awal (Asal)</div>
              <div className="text-base font-black text-white">{mission.locationFrom}</div>
            </div>
          </div>

          <div className="border-l-2 border-dashed border-amber-400/50 ml-4 h-3" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black border border-amber-500/40">
              B
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Titik Sasaran (Tujuan)</div>
              <div className="text-base font-black text-white">{mission.locationTo}</div>
            </div>
          </div>
        </div>

        {/* Story & Educational Briefing */}
        <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Cerita & Instruksi:</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {mission.storyDescription}
          </p>
        </div>

        {/* Vehicle & Controls info */}
        <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛵</span>
            <span className="font-bold">Skuter Klasik Biru Muda (Pengendara Berhelm Hijau)</span>
          </div>
          <div className="text-amber-400 font-bold hidden sm:inline">
            Trotoar Cat Blok Hitam-Putih
          </div>
        </div>

        {/* Big Start Button */}
        <button
          type="button"
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>MULAI SIMULATOR 3D!</span>
        </button>
      </div>
    </div>
  );
};
