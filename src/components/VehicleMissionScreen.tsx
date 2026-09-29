import React from 'react';
import {
  Volume2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  Sparkles,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Mission, VehicleType, VehicleConfig, CharacterType } from '../game/types';
import { VEHICLES, CHARACTERS } from '../game/cityData';

interface VehicleMissionScreenProps {
  selectedCharacter: CharacterType;
  onSelectCharacter: (char: CharacterType) => void;
  selectedVehicle: VehicleType;
  onSelectVehicle: (type: VehicleType) => void;
  selectedMissionId: number;
  onSelectMission: (id: number) => void;
  missions: Mission[];
  onProceedToBriefing: () => void;
  onBackToStart: () => void;
  onTestHorn: (vehicle: VehicleType) => void;
}

export const VehicleMissionScreen: React.FC<VehicleMissionScreenProps> = ({
  selectedCharacter,
  onSelectCharacter,
  selectedVehicle,
  onSelectVehicle,
  selectedMissionId,
  onSelectMission,
  missions,
  onProceedToBriefing,
  onBackToStart,
  onTestHorn,
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 overflow-y-auto select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <button
          type="button"
          onClick={onBackToStart}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 shadow-md font-bold text-xs transition-transform active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Kembali ke Halaman Depan</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-xs uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Tahap 2: Pilih Karakter, Kendaraan & Misi</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl mx-auto my-auto py-3 flex flex-col gap-5 text-center">
        {/* Section 1: Pemilihan Karakter Pengendara (Laki-laki / Perempuan) */}
        <div>
          <div className="text-xs uppercase tracking-widest font-black text-emerald-400 mb-2 flex items-center justify-center gap-2">
            <User className="w-4 h-4" />
            <span>1. PILIH KARAKTER PENGENDARA (LAKI-LAKI ATAU PEREMPUAN)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-3xl mx-auto">
            {Object.values(CHARACTERS).map((c) => {
              const isSelected = selectedCharacter === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCharacter(c.id as CharacterType)}
                  className={`p-4 rounded-3xl border-2 text-left cursor-pointer transition-all transform flex items-center gap-4 ${
                    isSelected
                      ? 'bg-slate-900/95 border-emerald-400 ring-4 ring-emerald-400/30 scale-[1.02] shadow-2xl'
                      : 'bg-slate-900/70 border-slate-700 hover:border-slate-500 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-4xl shadow-md border-2 border-emerald-400/50 shrink-0">
                    <span>{c.avatar}</span>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs border border-white shadow">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className="text-base font-black text-white truncate">{c.name}</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                        {c.id === 'laki_laki' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-300 font-bold mb-1">{c.badge}</p>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                      {c.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: c.jacketColor }}
                        />
                        Jaket Hijau
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: c.helmetColor }}
                        />
                        Helm Standar SNI
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Pemilihan Kendaraan */}
        <div>
          <div className="text-xs uppercase tracking-widest font-black text-amber-400 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>2. PILIH KENDARAAN (MOTOR, MOBIL, ATAU SEPEDA)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {Object.values(VEHICLES).map((v: VehicleConfig) => {
              const isSelected = selectedVehicle === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => {
                    onSelectVehicle(v.id as VehicleType);
                    onTestHorn(v.id as VehicleType);
                  }}
                  className={`p-4 rounded-3xl border-2 text-left cursor-pointer transition-all transform ${
                    isSelected
                      ? 'bg-slate-900/95 border-amber-400 ring-4 ring-amber-400/30 scale-[1.02] shadow-2xl'
                      : 'bg-slate-900/70 border-slate-700 hover:border-slate-500 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">{v.icon}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTestHorn(v.id as VehicleType);
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Tes Suara</span>
                    </button>
                  </div>
                  <h3 className="text-base font-black text-white">{v.name}</h3>
                  <p className="text-xs text-amber-300 font-bold mb-1">{v.tagline}</p>
                  <p className="text-xs text-slate-300 leading-snug mb-2">{v.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <span>Maks Speed: {Math.round(v.maxSpeed * 3.2)} km/h</span>
                    <span>Akselerasi: {v.id === 'mobil' ? 'Tinggi' : v.id === 'motor' ? 'Sedang' : 'Santai'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Pemilihan Misi Perjalanan */}
        <div>
          <div className="text-xs uppercase tracking-widest font-black text-sky-400 mb-2 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>3. PILIH MISI PENJELAJAHAN KOTA (TITIK A KE TITIK B)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-left">
            {missions.map((m) => {
              const isSelected = selectedMissionId === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMission(m.id)}
                  className={`p-3.5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900/95 border-sky-400 ring-4 ring-sky-400/30 shadow-xl scale-[1.02]'
                      : 'bg-slate-900/70 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-sky-400">MISI #{m.id}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                    <h4 className="text-xs font-black text-white leading-tight mb-2">
                      {m.title.replace(`Misi ${m.id}: `, '')}
                    </h4>
                  </div>
                  <div className="text-[10px] text-slate-300 space-y-1 bg-slate-950/70 p-2 rounded-xl border border-slate-800 mt-2">
                    <div className="truncate">
                      <span className="text-slate-400">Dari:</span> {m.locationFrom}
                    </div>
                    <div className="truncate">
                      <span className="text-amber-300 font-bold">Ke:</span> {m.locationTo}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tombol Lanjut ke Pengarahan Rute Pak Polisi */}
        <div className="flex justify-center mt-1">
          <button
            type="button"
            onClick={onProceedToBriefing}
            className="w-full max-w-md py-3.5 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-2xl shadow-emerald-500/30 border-2 border-emerald-300 flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer"
          >
            <span>Lanjut ke Pengarahan Pak Polisi</span>
            <ArrowRight className="w-5 h-5 text-slate-950 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-6xl mx-auto text-center text-xs text-slate-400 pt-1">
        Pilihlah karakter, kendaraan, dan misi. Selanjutnya kamu akan menghafal peta denah kota bersama Pak Polisi!
      </div>
    </div>
  );
};
