import React, { useEffect, useRef } from 'react';
import { X, Sparkles, Navigation, MapPin } from 'lucide-react';
import { Mission } from '../game/types';

interface RouteMemoryModalProps {
  mission: Mission;
  playerPos: { x: number; z: number };
  onClose: () => void;
}

export const RouteMemoryModal: React.FC<RouteMemoryModalProps> = ({
  mission,
  playerPos,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let pulseTime = 0;

    const render = () => {
      pulseTime += 0.06;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const toX = (worldX: number) => ((worldX + 210) / 420) * (w - 60) + 30;
      const toY = (worldZ: number) => ((worldZ + 210) / 420) * (h - 50) + 25;

      // Base
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Parks
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(toX(130), toY(-120), toX(210) - toX(130), toY(20) - toY(-120));

      // Railway
      const railY = toY(60);
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, railY - 3, w, 6);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      for (let rx = 10; rx < w; rx += 12) {
        ctx.beginPath();
        ctx.moveTo(rx, railY - 6);
        ctx.lineTo(rx, railY + 6);
        ctx.stroke();
      }

      // Roads
      const hRoads = [-120, 0, 120];
      const vRoads = [-140, -20, 100, 180];

      hRoads.forEach((z) => {
        const ry = toY(z);
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, ry - 14, w, 28);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(0, ry);
        ctx.lineTo(w, ry);
        ctx.stroke();
      });

      vRoads.forEach((x) => {
        const rx = toX(x);
        ctx.fillStyle = '#334155';
        ctx.fillRect(rx - 13, 0, 26, h);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, h);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Landmarks
      const landmarks = [
        { x: toX(-140), y: toY(-160), name: 'Balai Kota', icon: '🏛️' },
        { x: toX(-20), y: toY(-165), name: 'SDN Gajahrejo', icon: '🏫' },
        { x: toX(100), y: toY(-160), name: 'Puskesmas', icon: '🏥' },
        { x: toX(-55), y: toY(-30), name: 'Perpustakaan', icon: '📚' },
        { x: toX(40), y: toY(-40), name: 'Supermarket', icon: '🛒' },
        { x: toX(-140), y: toY(120), name: 'Rumah', icon: '🏡' },
        { x: toX(-80), y: toY(45), name: 'Stasiun KA', icon: '🚆' },
        { x: toX(100), y: toY(140), name: 'Pasar', icon: '🍉' },
        { x: toX(180), y: toY(-45), name: 'Taman Kota', icon: '🌳' },
      ];

      landmarks.forEach((lm) => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(lm.x - 30, lm.y - 10, 60, 20);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(lm.x - 30, lm.y - 10, 60, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${lm.icon} ${lm.name}`, lm.x, lm.y);
      });

      // Golden Path
      ctx.save();
      const glow = (Math.sin(pulseTime) + 1) / 2;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8 + glow * 6;
      ctx.beginPath();
      ctx.moveTo(toX(mission.startPoint.x), toY(mission.startPoint.z));
      mission.checkpoints.forEach((cp) => {
        ctx.lineTo(toX(cp.x), toY(cp.z));
      });
      ctx.lineTo(toX(mission.targetPoint.x), toY(mission.targetPoint.z));
      ctx.stroke();

      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = -pulseTime * 15;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Start A & Goal B
      const sX = toX(mission.startPoint.x);
      const sY = toY(mission.startPoint.z);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(sX, sY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', sX, sY);

      const gX = toX(mission.targetPoint.x);
      const gY = toY(mission.targetPoint.z);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(gX, gY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'black 9px sans-serif';
      ctx.fillText('B', gX, gY);

      // Player current position indicator (Cyan pulsing dot)
      const pX = toX(playerPos.x);
      const pY = toY(playerPos.z);
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(pX, pY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mission, playerPos]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 max-w-xl w-full shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Denah Rute Hafalan Kota</h3>
              <p className="text-[11px] text-amber-300 font-medium">
                {mission.locationFrom} ➡️ {mission.locationTo}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-700">
          <canvas ref={canvasRef} width={460} height={345} className="w-full h-full block" />
          <div className="absolute top-2 left-2 bg-slate-900/80 px-2.5 py-1 rounded-lg text-[10px] text-sky-300 border border-slate-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block animate-ping" />
            <span>Posisi Kamu Saat Ini</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-400">
            Titik Hijau (A) = Awal • Titik Kuning (B) = Tujuan • Garis Emas = Rute Ideal
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
          >
            Tutup & Lanjutkan Menyetir
          </button>
        </div>
      </div>
    </div>
  );
};
