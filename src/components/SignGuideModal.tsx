import React from 'react';
import { X, BookOpen, CheckCircle, Navigation } from 'lucide-react';
import { TRAFFIC_SIGNS_3D } from '../game/cityData';
import { TrafficSign } from '../game/types';

interface SignGuideModalProps {
  onClose: () => void;
}

export const SignGuideModal: React.FC<SignGuideModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-indigo-400 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/30 rounded-xl text-indigo-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Kamus Rambu & Tata Tertib Kota</h3>
              <p className="text-xs text-indigo-300 font-semibold">
                Materi Edukasi Bahasa Indonesia & Tata Tertib Siswa Kelas 4 SD
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-left">
          {/* Section 1: Rambu-rambu Jalan */}
          <div>
            <div className="text-xs uppercase tracking-wider font-extrabold text-amber-400 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Rambu Lalu Lintas Yang Wajib Dipatuhi:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRAFFIC_SIGNS_3D.map((sign: TrafficSign) => (
                <div
                  key={sign.id}
                  className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300">{sign.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700 font-bold uppercase text-slate-300 text-[10px]">
                      {sign.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-snug">{sign.description}</p>
                  <div className="text-[11px] font-bold text-emerald-300 mt-1 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/50">
                    💡 Cara Bertindak: {sign.meaning}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Kosakata Arah & Bahasa Indonesia Kelas 4 SD */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700">
            <div className="text-xs uppercase tracking-wider font-extrabold text-sky-400 mb-2 flex items-center gap-1.5">
              <Navigation className="w-4 h-4" />
              <span>Kosakata Arah & Denah (Materi Bahasa Indonesia):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                <div className="font-extrabold text-amber-300">🧭 Utara / Selatan</div>
                <div className="text-slate-300 text-[11px] mt-0.5">Ke atas layar / Ke bawah layar</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                <div className="font-extrabold text-amber-300">🧭 Timur / Barat</div>
                <div className="text-slate-300 text-[11px] mt-0.5">Ke kanan layar / Ke kiri layar</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                <div className="font-extrabold text-amber-300">🚦 Perempatan</div>
                <div className="text-slate-300 text-[11px] mt-0.5">Persilangan empat ruas jalan</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                <div className="font-extrabold text-amber-300">🦓 Zebra Cross</div>
                <div className="text-slate-300 text-[11px] mt-0.5">Jalur khusus penyeberang jalan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Tutup & Lanjut Bermain
          </button>
        </div>
      </div>
    </div>
  );
};
