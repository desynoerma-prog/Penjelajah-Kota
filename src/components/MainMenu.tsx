import React from 'react';
import {
  Play,
  Maximize,
  Minimize,
  BookOpen,
  Volume2,
  VolumeX,
  Compass,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Mission } from '../game/types';

interface MainMenuProps {
  selectedMissionId: number;
  onSelectMission: (id: number) => void;
  missions: Mission[];
  onStartGame: () => void;
  onOpenSignGuide: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onTestHorn: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedMissionId,
  onSelectMission,
  missions,
  onStartGame,
  onOpenSignGuide,
  isFullscreen,
  onToggleFullscreen,
  isMuted,
  onToggleMute,
  onTestHorn,
}) => {
  const [showControlsGuide, setShowControlsGuide] = React.useState(false);

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-[2px] flex flex-col justify-between p-4 sm:p-6 overflow-y-auto select-none">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-3 w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-amber-500 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/30 flex items-center gap-1.5 text-sm">
            <span>🛵</span>
            <span className="font-extrabold hidden sm:inline">3D Driving Simulator</span>
          </div>
          <span className="text-xs text-amber-200/90 font-bold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
            Tata Tertib & Bahasa Indonesia Kelas 4 SD
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

          {/* Fullscreen Button (PRD Requirement) */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white rounded-xl border border-sky-400/50 shadow-md font-extrabold text-xs transition-transform active:scale-95 cursor-pointer"
            title="Layar Penuh untuk IFP / Monitor Besar"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span>{isFullscreen ? 'Keluar Fullscreen' : 'Mulai Fullscreen (IFP)'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl mx-auto my-auto py-4 flex flex-col items-center text-center gap-6">
        {/* Game Title */}
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 font-extrabold text-xs tracking-wider uppercase mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>3D Driving Simulator Indonesia</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 drop-shadow-md tracking-tight">
            PENJELAJAH KOTA 3D
          </h1>
          <p className="text-sm sm:text-base text-slate-200 font-semibold max-w-xl mt-1">
            Kemudikan skuter klasik biru mudamu melintasi jalanan kota Indonesia dengan trotoar
            hitam-putih, patuhi rambu edukasi, dan ikuti petunjuk GPS smartphone!
          </p>
        </div>

        {/* Karakter & Kendaraan Showcase Card */}
        <div className="w-full max-w-2xl bg-slate-900/90 border-2 border-sky-400/60 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 shadow-2xl backdrop-blur-md text-left">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-5xl shadow-xl shrink-0 border-2 border-sky-200">
            🛵
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-black text-amber-300 tracking-wider">
                Karakter & Kendaraan Utama
              </span>
              <button
                type="button"
                onClick={onTestHorn}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>Klakson Tet-Tet</span>
              </button>
            </div>
            <h3 className="text-lg font-black text-white">
              Pengendara Berjaket & Berhelm Hijau
            </h3>
            <p className="text-xs text-sky-200 font-semibold">
              Sepeda Motor Skuter Klasik Biru Muda (Vintage Curves & Chrome Trim)
            </p>
            <p className="text-xs text-slate-300 leading-snug">
              Dilengkapi kamera third-person di belakang motor yang dapat diganti sudut pandangnya,
              dashboard speedometer melengkung, dan sistem navigasi smartphone GPS di sisi kanan.
            </p>
          </div>
        </div>

        {/* Panel Pemilihan Misi */}
        <div className="w-full">
          <div className="text-xs uppercase tracking-widest font-black text-amber-400 mb-2 flex items-center justify-center gap-1.5">
            <span>PILIH TUGAS MISI PERJALANAN KELAS 4 SD</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            {missions.map((m) => {
              const isSelected = selectedMissionId === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMission(m.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900/95 border-amber-400 ring-2 ring-amber-400/30 shadow-lg scale-[1.02]'
                      : 'bg-slate-900/70 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-amber-400">MISI #{m.id}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h4 className="text-sm font-extrabold text-white leading-tight mb-2">
                    {m.title.replace(`Misi ${m.id}: `, '')}
                  </h4>
                  <div className="text-[11px] text-slate-300 space-y-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-400">Dari:</span> {m.locationFrom}
                    </div>
                    <div>
                      <span className="text-amber-300 font-bold">Ke:</span> {m.locationTo}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Mulai Petualangan & Panduan */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl">
          <button
            type="button"
            onClick={onStartGame}
            className="w-full flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg sm:text-xl rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-2.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>MULAI SIMULATOR 3D</span>
          </button>

          <button
            type="button"
            onClick={onOpenSignGuide}
            className="w-full sm:w-auto py-4 px-5 bg-slate-900/90 hover:bg-slate-800 text-indigo-200 border-2 border-indigo-500/40 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Kamus Rambu</span>
          </button>

          <button
            type="button"
            onClick={() => setShowControlsGuide(true)}
            className="w-full sm:w-auto py-4 px-4 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            title="Cara Bermain"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="sm:hidden">Petunjuk</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-2">
          <span>🎮 Kontrol Sentuh IFP / Keyboard Laptop (W/A/S/D / Tombol Panah & Spasi)</span>
        </div>
        <div className="font-semibold text-slate-300">
          Trotoar Cat Blok Hitam-Putih Indonesia & Poin Kepatuhan Realtime (+10)
        </div>
      </div>

      {/* Petunjuk Kontrol Modal */}
      {showControlsGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl">
            <h3 className="text-xl font-black text-amber-400 mb-3 flex items-center gap-2">
              <Compass className="w-5 h-5" />
              <span>Petunjuk Kontrol 3D Simulator</span>
            </h3>

            <div className="space-y-3 text-sm text-slate-200">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="font-extrabold text-white mb-1">📱 Kontrol Layar Sentuh IFP:</div>
                <div className="text-xs space-y-1 text-slate-300">
                  <div>• <b>Kiri Bawah</b>: Dua lingkaran panah putih untuk belok kiri & kanan</div>
                  <div>• <b>Kanan Bawah</b>: Chevron ganda atas untuk GAS, chevron ganda bawah untuk REM</div>
                  <div>• <b>Kiri Atas</b>: Tombol kamera putih untuk ganti sudut pandang 3D</div>
                  <div>• <b>Kanan Layar</b>: Layar smartphone GPS untuk petunjuk arah & minimap</div>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="font-extrabold text-white mb-1">💻 Keyboard Laptop:</div>
                <div className="text-xs space-y-0.5 text-slate-300">
                  <div>• <b>W / Panah Atas</b> : Gas maju ke depan</div>
                  <div>• <b>S / Panah Bawah</b> : Rem / mundur</div>
                  <div>• <b>A / Panah Kiri</b> : Belok kiri</div>
                  <div>• <b>D / Panah Kanan</b> : Belok kanan</div>
                  <div>• <b>C</b> : Ganti sudut pandang kamera 3D</div>
                  <div>• <b>H</b> : Klakson skuter</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowControlsGuide(false)}
              className="mt-5 w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
            >
              Mengerti, Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
