import React, { useEffect, useRef, useState } from 'react';
import {
  Navigation,
  Volume2,
  ChevronRight,
  CheckCircle2,
  Circle,
  Wifi,
  Battery,
  MapPin,
  Lightbulb,
  Sparkles,
  Map,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Mission, Checkpoint } from '../game/types';
import { ROADS_3D } from '../game/cityData';

interface SmartPhoneGPSPanelProps {
  mission: Mission;
  currentCheckpointIndex: number;
  playerPos: { x: number; z: number; angle: number };
  distanceToCheckpoint: number;
  isHintActive: boolean;
  onActivateHint: () => void;
  onOpenRouteMap: () => void;
  answeredSignCount?: number;
  totalSignsCount?: number;
}

export const SmartPhoneGPSPanel: React.FC<SmartPhoneGPSPanelProps> = ({
  mission,
  currentCheckpointIndex,
  playerPos,
  distanceToCheckpoint,
  isHintActive,
  onActivateHint,
  onOpenRouteMap,
  answeredSignCount = 0,
  totalSignsCount = 7,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showChecklistDetails, setShowChecklistDetails] = useState(false);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeCheckpoint = mission.checkpoints[currentCheckpointIndex] as Checkpoint | undefined;

  // Render 2D Minimap Radar inside Smartphone Screen
  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Map bounds: [-210, 210] to [0, w]
    const mapMinX = -210;
    const mapMaxX = 210;
    const mapMinZ = -200;
    const mapMaxZ = 200;

    const toScreenX = (x: number) => ((x - mapMinX) / (mapMaxX - mapMinX)) * w;
    const toScreenY = (z: number) => ((z - mapMinZ) / (mapMaxZ - mapMinZ)) * h;

    // Background Map Base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);

    // Subtle parks
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(toScreenX(130), toScreenY(-120), toScreenX(210) - toScreenX(130), toScreenY(20) - toScreenY(-120));

    // Draw Roads
    ctx.fillStyle = '#475569';
    ROADS_3D.forEach((r) => {
      const sx = toScreenX(r.x - r.width / 2);
      const sy = toScreenY(r.z - r.depth / 2);
      const sw = ((r.width) / (mapMaxX - mapMinX)) * w;
      const sh = ((r.depth) / (mapMaxZ - mapMinZ)) * h;
      ctx.fillRect(sx, sy, sw, sh);
    });

    // Draw Target Point B (Goal)
    const target = mission.targetPoint;
    const tx = toScreenX(target.x);
    const ty = toScreenY(target.z);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(tx, ty, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // If Hint is active: draw checkpoint guide
    if (isHintActive && activeCheckpoint) {
      const cx = toScreenX(activeCheckpoint.x);
      const cy = toScreenY(activeCheckpoint.z);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dotted hint line from player to checkpoint
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(toScreenX(playerPos.x), toScreenY(playerPos.z));
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Player Vehicle Position & Heading
    const px = toScreenX(playerPos.x);
    const py = toScreenY(playerPos.z);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(playerPos.angle);

    // Vehicle Marker (Blue with Heading Arrow)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Arrow pointer
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(1, -3);
    ctx.lineTo(1, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [playerPos, activeCheckpoint, mission, isHintActive]);

  return (
    <div
      className={`fixed top-4 right-4 z-30 transition-all duration-300 pointer-events-auto select-none ${
        isCollapsed ? 'translate-x-[calc(100%-2.5rem)]' : 'translate-x-0'
      }`}
    >
      <div className="relative w-72 sm:w-80 max-w-[340px] bg-slate-900 rounded-[2.2rem] shadow-2xl border-4 border-slate-700 text-slate-100 overflow-hidden flex flex-col">
        {/* Collapse Tab for Small Screens / IFP */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-9 top-14 w-9 h-11 bg-slate-800 border-y-2 border-l-2 border-slate-600 rounded-l-xl flex items-center justify-center text-amber-400 shadow-md cursor-pointer"
          title={isCollapsed ? 'Buka GPS' : 'Kecilkan GPS'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 rotate-180" />}
        </button>

        {/* Smartphone Notch & Status Bar */}
        <div className="bg-slate-950 px-5 pt-2 pb-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>08:15</span>
          <div className="w-16 h-3 bg-slate-800 rounded-full" />
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* GPS App Header with Memory Mode Badge */}
        <div className="bg-gradient-to-r from-sky-700 to-indigo-800 text-white px-4 py-2.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-amber-300 fill-amber-300" />
            <div>
              <div className="text-[10px] uppercase font-black tracking-wider text-sky-200 leading-none flex items-center gap-1">
                <span>PETA PINTAR GPS</span>
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black text-[8px]">
                  MEMORI
                </span>
              </div>
              <div className="text-xs font-black truncate max-w-[150px]">
                {mission.locationTo}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenRouteMap}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-900/80 hover:bg-sky-600 text-amber-300 border border-sky-400/40 text-[10px] font-bold transition-colors cursor-pointer"
            title="Buka Denah Peta Hafalan"
          >
            <Map className="w-3 h-3" />
            <span>Peta</span>
          </button>
        </div>

        {/* Memory Navigation Mode Banner */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-col gap-2">
          {/* Active Hint Status or Memory Mode */}
          {isHintActive && activeCheckpoint ? (
            <div className="p-2.5 rounded-xl bg-sky-950/90 border-2 border-sky-400 text-sky-100 flex flex-col gap-1 shadow-lg animate-pulse">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  PETUNJUK PAK POLISI (AKTIF)
                </span>
                <span className="bg-sky-600 text-white px-1.5 py-0.5 rounded font-mono text-[9px]">
                  {Math.round(distanceToCheckpoint)}m
                </span>
              </div>
              <p className="text-xs font-black leading-snug text-white">
                "{activeCheckpoint.instructionText}"
              </p>
              {activeCheckpoint.subHint && (
                <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                  <span>💡</span> {activeCheckpoint.subHint}
                </div>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col gap-1 text-left">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-emerald-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  MODE MEMORI MANDIRI
                </span>
                <span className="text-[9px] text-slate-400">
                  Checkpoint #{currentCheckpointIndex + 1}/{mission.checkpoints.length}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200 leading-tight">
                Jalankan kendaraanmu sesuai hafalan denah & ikuti rambu-rambu di jalan raya!
              </p>
              <div className="flex items-center justify-between text-[10px] bg-slate-950/70 px-2 py-1 rounded-lg border border-slate-800 text-amber-300 font-bold mt-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Kuis Rambu Terjawab:
                </span>
                <span className="font-black font-mono text-emerald-400">
                  {answeredSignCount} / {totalSignsCount}
                </span>
              </div>
            </div>
          )}

          {/* Interactive Bantuan / Hint Button */}
          <div className="grid grid-cols-2 gap-2 mt-0.5">
            <button
              type="button"
              onClick={onActivateHint}
              className={`py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${
                isHintActive
                  ? 'bg-amber-400 text-slate-950 border-2 border-white'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 border border-amber-300'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
              <span>{isHintActive ? 'Suara Hint Aktif' : 'Bantuan (Hint)'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenRouteMap}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-600 font-black text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Map className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Denah Rute</span>
            </button>
          </div>
        </div>

        {/* 2D Minimap Radar */}
        <div className="p-2 bg-slate-950 flex flex-col items-center">
          <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-900">
            <canvas
              ref={minimapCanvasRef}
              width={260}
              height={120}
              className="w-full h-full block"
            />
            <div className="absolute bottom-1 left-2 text-[8px] font-black text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
              RADAR KOTA
            </div>
            {isHintActive && (
              <div className="absolute top-1 right-2 text-[8px] font-black text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/50 animate-pulse">
                PANDUAN HINT AKTIF
              </div>
            )}
          </div>
        </div>

        {/* Route Progress Toggle & Checklist */}
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-400" />
              <span>Progres Rute Hafalan</span>
            </span>
            <button
              type="button"
              onClick={() => setShowChecklistDetails(!showChecklistDetails)}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              {showChecklistDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showChecklistDetails ? 'Sembunyikan' : 'Buka Rincian'}</span>
            </button>
          </div>

          {/* Simple step meter */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-sky-400 h-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (currentCheckpointIndex / mission.checkpoints.length) * 100)}%`,
              }}
            />
          </div>

          {showChecklistDetails && (
            <div className="max-h-28 overflow-y-auto space-y-1 pt-1 pr-1 border-t border-slate-800/80">
              {mission.checkpoints.map((cp, idx) => {
                const isDone = idx < currentCheckpointIndex;
                const isCurrent = idx === currentCheckpointIndex;

                return (
                  <div
                    key={cp.id}
                    className={`text-[10px] p-1.5 rounded-lg flex items-start gap-1.5 transition-colors ${
                      isCurrent
                        ? 'bg-sky-950/80 font-bold text-sky-200 border border-sky-400/50'
                        : isDone
                        ? 'text-emerald-400 font-medium bg-emerald-950/30'
                        : 'text-slate-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    ) : isCurrent ? (
                      <Circle className="w-3 h-3 text-sky-400 fill-sky-400 shrink-0 mt-0.5 animate-pulse" />
                    ) : (
                      <Circle className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                    )}
                    <span className="truncate">
                      {isDone ? cp.streetName || `Titik #${idx + 1}` : isCurrent ? cp.instructionText : `Titik Jalan #${idx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Smartphone Home Indicator Bar */}
        <div className="bg-slate-950 py-1 flex justify-center">
          <div className="w-16 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
