import React from 'react';

interface SpeedometerCurvedProps {
  speedKmh: number;
  maxSpeedKmh?: number;
}

export const SpeedometerCurved: React.FC<SpeedometerCurvedProps> = ({
  speedKmh,
  maxSpeedKmh = 45,
}) => {
  // Speed percentage for radial arc
  const clampedSpeed = Math.max(0, Math.min(maxSpeedKmh, Math.round(speedKmh)));
  const ratio = clampedSpeed / maxSpeedKmh;

  // Arc path calculation (SVG 180-degree or 120-degree curve)
  const radius = 64;
  const strokeWidth = 8;
  const circumference = Math.PI * radius; // half circle
  const dashOffset = circumference * (1 - ratio);

  return (
    <div className="relative select-none pointer-events-none flex flex-col items-center">
      {/* Panel melengkung abu-abu gelap / hitam transparan */}
      <div className="relative w-44 h-24 sm:w-52 sm:h-28 bg-slate-950/75 border-t-2 border-x-2 border-white/25 rounded-t-[5rem] backdrop-blur-md shadow-2xl flex flex-col items-center justify-end pb-2 overflow-hidden">
        {/* Curved Speed Glow Arc */}
        <svg
          className="absolute top-1 left-1/2 -translate-x-1/2 w-36 h-20 overflow-visible"
          viewBox="0 0 160 80"
        >
          {/* Background curved track */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active speed colored curve */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke={clampedSpeed > 30 ? '#ef4444' : clampedSpeed > 20 ? '#facc15' : '#38bdf8'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-150 ease-out"
          />
        </svg>

        {/* Digital Speed Number */}
        <div className="flex flex-col items-center z-10 -mt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-md">
              {clampedSpeed}
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-400 font-mono tracking-wider">
              km/h
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest -mt-1">
            Skuter Klasik
          </span>
        </div>
      </div>
    </div>
  );
};
