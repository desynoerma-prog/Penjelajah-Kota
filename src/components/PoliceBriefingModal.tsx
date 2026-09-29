import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Play,
  Navigation,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Mission, VehicleType, CharacterType } from '../game/types';
import { VEHICLES, CHARACTERS } from '../game/cityData';
import { sound } from '../game/sound';

interface PoliceBriefingModalProps {
  mission: Mission;
  vehicleType: VehicleType;
  characterType: CharacterType;
  onStartSimulation: () => void;
  onBackToSelection: () => void;
}

export const PoliceBriefingModal: React.FC<PoliceBriefingModalProps> = ({
  mission,
  vehicleType,
  characterType,
  onStartSimulation,
  onBackToSelection,
}) => {
  const [dialogStep, setDialogStep] = useState<number>(0);
  const [memoryTimer, setMemoryTimer] = useState<number>(10);
  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const vehicle = VEHICLES[vehicleType] || VEHICLES.motor;
  const character = CHARACTERS[characterType] || CHARACTERS.laki_laki;

  // Countdown timer for memorizing route
  useEffect(() => {
    const timerInterval = window.setInterval(() => {
      setMemoryTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Personalized dialog script
  const dialogSteps = [
    {
      speaker: 'Pak Polisi Aipda Santoso',
      role: 'Petugas Pengatur Lalu Lintas & Sahabat Anak',
      avatar: '👮‍♂️',
      text: `Halo ${character.name.split(' ')[0]}! Senang melihatmu siap berkendara menggunakan ${vehicle.name.toLowerCase()} dengan perlengkapan berkendara SNI yang rapi. Sebelum kamu tancap gas, mari kita pelajari denah kota dan hafalkan rute perjalananmu!`,
      highlight: `Hafalkan rute sebelum masuk ke jalanan 3D`,
    },
    {
      speaker: 'Pak Polisi Aipda Santoso',
      role: 'Petugas Pengatur Lalu Lintas & Sahabat Anak',
      avatar: '👮‍♂️',
      text: `Misimu hari ini adalah menempuh perjalanan dari ${mission.locationFrom} menuju ${mission.locationTo}. Amati garis rute emas yang berkedip di peta: hafalkan jalan mana yang harus kamu lewati dan di persimpangan mana kamu harus berbelok!`,
      highlight: `Dari: ${mission.locationFrom} ➡️ Ke: ${mission.locationTo}`,
    },
    {
      speaker: 'Pak Polisi Aipda Santoso',
      role: 'Petugas Pengatur Lalu Lintas & Sahabat Anak',
      avatar: '👮‍♂️',
      text: `Perhatian penting: Saat simulasi 3D dimulai, SEMUA PANDUAN OTOMATIS AKAN DIMATIKAN! Kamu harus menyusuri jalan murni menggunakan ingatanmu dan membaca rambu lalu lintas. Jika tersesat, tekan tombol 'Bantuan Hint' di layar. Siap tunjukkan ingatan hebatmu?`,
      highlight: `Panduan otomatis dimatikan! Berjalanlah dengan daya ingat & rambu jalan`,
    },
  ];

  const currentDialog = dialogSteps[dialogStep];

  const speakCurrent = () => {
    sound.speakIndonesian(currentDialog.text);
  };

  useEffect(() => {
    speakCurrent();
  }, [dialogStep]);

  // Draw Interactive Route Map with glowing golden path
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let pulseTime = 0;

    const renderMap = () => {
      pulseTime += 0.05;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Coordinate converter from 3D world [-210, 210] to 2D Canvas [0, w] & [0, h]
      const toX = (worldX: number) => ((worldX + 210) / 420) * (w - 60) + 30;
      const toY = (worldZ: number) => ((worldZ + 210) / 420) * (h - 50) + 25;

      // 1. Map Background (Clean city planner layout)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);

      // Parks & Greenery
      ctx.fillStyle = '#064e3b';
      // Taman Kota area (around x: 180, z: -50)
      ctx.fillRect(toX(130), toY(-120), toX(210) - toX(130), toY(20) - toY(-120));

      // 2. Railway tracks crossing (at z = 60)
      const railY = toY(60);
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, railY - 4, w, 8);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      for (let rx = 10; rx < w; rx += 12) {
        ctx.beginPath();
        ctx.moveTo(rx, railY - 7);
        ctx.lineTo(rx, railY + 7);
        ctx.stroke();
      }

      // 3. Roads Grid
      const roadColor = '#334155';
      const curbColor = '#e2e8f0';

      const hRoads = [
        { z: -120, label: 'Jl. Pendidikan (Sekolah & Puskesmas)' },
        { z: 0, label: 'Jl. Garuda Raya (Boulevard Utama)' },
        { z: 120, label: 'Jl. Melati Sejahtera (Rumah & Pasar)' },
      ];

      const vRoads = [
        { x: -140, label: 'Jl. Merdeka Barat' },
        { x: -20, label: 'Jl. Pahlawan (Rel KA)' },
        { x: 100, label: 'Jl. Kartini Timur' },
        { x: 180, label: 'Jl. Diponegoro' },
      ];

      // Draw horizontal roads
      hRoads.forEach((r) => {
        const ry = toY(r.z);
        const rh = 28;
        ctx.fillStyle = roadColor;
        ctx.fillRect(0, ry - rh / 2, w, rh);

        // Curbs (black & white dashed)
        ctx.strokeStyle = curbColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(0, ry - rh / 2, w, rh);

        // Center line
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(0, ry);
        ctx.lineTo(w, ry);
        ctx.stroke();
      });

      // Draw vertical roads
      vRoads.forEach((r) => {
        const rx = toX(r.x);
        const rw = 26;
        ctx.fillStyle = roadColor;
        ctx.fillRect(rx - rw / 2, 0, rw, h);

        ctx.strokeStyle = curbColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(rx - rw / 2, 0, rw, h);

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, h);
        ctx.stroke();
      });

      ctx.setLineDash([]);

      // 4. Key Buildings & Landmarks
      const landmarks = [
        { x: toX(-140), y: toY(-160), name: 'Balai Kota', icon: '🏛️', color: '#a855f7' },
        { x: toX(-20), y: toY(-165), name: 'SDN Gajahrejo 1', icon: '🏫', color: '#ef4444' },
        { x: toX(100), y: toY(-160), name: 'Puskesmas', icon: '🏥', color: '#10b981' },
        { x: toX(-55), y: toY(-30), name: 'Perpustakaan', icon: '📚', color: '#3b82f6' },
        { x: toX(40), y: toY(-40), name: 'Supermarket', icon: '🛒', color: '#f59e0b' },
        { x: toX(-140), y: toY(120), name: 'Rumah', icon: '🏡', color: '#f97316' },
        { x: toX(-80), y: toY(45), name: 'Stasiun KA', icon: '🚆', color: '#ec4899' },
        { x: toX(100), y: toY(140), name: 'Pasar', icon: '🍉', color: '#eab308' },
        { x: toX(180), y: toY(-45), name: 'Taman Kota', icon: '🌳', color: '#22c55e' },
      ];

      landmarks.forEach((lm) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(lm.x - 34, lm.y - 12, 68, 24);
        ctx.strokeStyle = lm.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(lm.x - 34, lm.y - 12, 68, 24);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${lm.icon} ${lm.name}`, lm.x, lm.y);
      });

      // 5. Highlighted Golden Route Traced from Actual Mission Checkpoints
      ctx.save();
      const glowAlpha = (Math.sin(pulseTime) + 1) / 2;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10 + glowAlpha * 8;
      ctx.beginPath();

      const startPt = { x: toX(mission.startPoint.x), y: toY(mission.startPoint.z) };
      ctx.moveTo(startPt.x, startPt.y);

      mission.checkpoints.forEach((cp) => {
        ctx.lineTo(toX(cp.x), toY(cp.z));
      });

      const goalPt = { x: toX(mission.targetPoint.x), y: toY(mission.targetPoint.z) };
      ctx.lineTo(goalPt.x, goalPt.y);
      ctx.stroke();

      // Pulsing animated route dashes
      ctx.setLineDash([8, 12]);
      ctx.lineDashOffset = -pulseTime * 18;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // Checkpoint Markers along the golden path
      mission.checkpoints.forEach((cp, idx) => {
        const cx = toX(cp.x);
        const cy = toY(cp.z);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}`, cx, cy - 6);
      });

      // 6. Start Pin (Titik A)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(startPt.x, startPt.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', startPt.x, startPt.y);

      // Goal Pin (Titik B)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(goalPt.x, goalPt.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 10px sans-serif';
      ctx.fillText('B', goalPt.x, goalPt.y);

      animId = requestAnimationFrame(renderMap);
    };

    animId = requestAnimationFrame(renderMap);
    return () => cancelAnimationFrame(animId);
  }, [mission]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 overflow-y-auto select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <button
          type="button"
          onClick={onBackToSelection}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 shadow-md font-bold text-xs transition-transform active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Kembali ke Pemilihan Misi</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-xs uppercase flex items-center gap-1.5">
            <Navigation className="w-4 h-4" />
            <span>Tahap 3: Pengarahan Denah & Hafalan Rute</span>
          </div>
        </div>
      </div>

      {/* Main Content: Split View between Map & Police Dialog */}
      <div className="w-full max-w-6xl mx-auto my-auto py-2 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Interactive Route Map Denah Kota (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          <div className="bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-3.5 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-800 text-xs font-black text-amber-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                DENAH KOTA & JALUR EMAS (TITIK A ➡️ B)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {memoryTimer > 0 ? `Hafalkan: ${memoryTimer}s` : 'Rute Siap'}
              </span>
            </div>

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mt-2 bg-slate-950 border border-slate-700">
              <canvas
                ref={mapCanvasRef}
                width={440}
                height={330}
                className="w-full h-full block"
              />
            </div>

            {/* Route summary labels */}
            <div className="mt-2.5 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center font-black text-[10px] border border-emerald-400">
                  A
                </span>
                <span className="truncate max-w-[130px]">{mission.locationFrom}</span>
              </div>
              <span className="text-amber-400 font-black">➡️</span>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center font-black text-[10px] border border-amber-400 text-slate-950 bg-amber-400">
                  B
                </span>
                <span className="truncate max-w-[130px]">{mission.locationTo}</span>
              </div>
            </div>

            {/* Memory Timer Alert */}
            <div className="mt-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-[11px] text-amber-300 font-bold flex items-center justify-between">
              <span>🧠 Ingat garis emas & nama jalan</span>
              <span className="text-[10px] text-slate-300">Panduan 3D akan nonaktif</span>
            </div>
          </div>
        </div>

        {/* Right: Police Dialogue & Instructions (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 text-left">
          {/* Officer & Rider Profiles Showcase */}
          <div className="flex items-center gap-4 bg-slate-900/90 border-2 border-sky-400/60 rounded-3xl p-4 shadow-xl">
            {/* Officer Avatar */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-4xl shadow-lg border-2 border-sky-300 shrink-0">
              👮‍♂️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">{currentDialog.speaker}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-extrabold border border-sky-400/40">
                  POLISI SAHABAT ANAK
                </span>
              </div>
              <p className="text-xs text-sky-200 font-semibold">{currentDialog.role}</p>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 font-medium">
                <span>Pengendara: <b>{character.name} {character.avatar}</b></span>
                <span>•</span>
                <span>Kendaraan: <b>{vehicle.name} ({vehicle.icon})</b></span>
              </div>
            </div>
          </div>

          {/* Dialogue Speech Balloon */}
          <div className="relative bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-amber-400">
            {/* Dialogue Bubble Arrow */}
            <div className="absolute -top-3.5 left-10 w-7 h-7 bg-white border-t-4 border-l-4 border-amber-400 rotate-45" />

            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                Instruksi Petugas {dialogStep + 1} dari {dialogSteps.length}
              </span>
              <button
                type="button"
                onClick={speakCurrent}
                className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow"
                title="Dengarkan Suara Pak Polisi"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Dengarkan Suara</span>
              </button>
            </div>

            <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              "{currentDialog.text}"
            </p>

            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-amber-800 font-extrabold flex items-center gap-1.5">
              <span>💡 Kunci Hafalan:</span>
              <span className="text-slate-800 font-semibold">{currentDialog.highlight}</span>
            </div>
          </div>

          {/* Dialog Navigation & Big Start Simulation Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            {dialogStep < dialogSteps.length - 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setDialogStep((prev) => prev + 1)}
                  className="w-full sm:flex-1 py-4 px-6 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Lanjut Penjelasan Berikutnya</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={onStartSimulation}
                  className="w-full sm:w-auto py-4 px-5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-black text-sm rounded-2xl border border-amber-400/50 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Saya Sudah Hafal Rute!</span>
                  <Play className="w-4 h-4 fill-amber-300" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onStartSimulation}
                  className="w-full flex-1 py-4 px-8 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg sm:text-xl rounded-2xl shadow-2xl shadow-amber-500/30 border-2 border-amber-200 flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer animate-soft-pulse"
                >
                  <Play className="w-6 h-6 fill-slate-950" />
                  <span>SAYA SUDAH HAFAL, MULAI SIMULASI! 🛵💨</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDialogStep(0)}
                  className="py-4 px-4 bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  title="Dengarkan Ulang dari Awal"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ulangi Arahan</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-6xl mx-auto text-center text-xs text-slate-400 pt-2 border-t border-slate-800/60">
        Perhatikan jalur emas pada denah rute. Saat masuk ke kota 3D, panduan jalan otomatis akan nonaktif demi melatih daya ingatmu!
      </div>
    </div>
  );
};
