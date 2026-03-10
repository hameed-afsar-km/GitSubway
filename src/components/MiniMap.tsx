import React from 'react';
import { MetroStationData } from '../types';

interface MiniMapProps {
  stations: MetroStationData[];
  activeStation: MetroStationData | null;
  onStationClick: (station: MetroStationData) => void;
}

export function MiniMap({ stations, activeStation, onStationClick }: MiniMapProps) {
  if (stations.length === 0) return null;

  // Calculate bounds
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  stations.forEach(s => {
    if (s.position[0] < minX) minX = s.position[0];
    if (s.position[0] > maxX) maxX = s.position[0];
    if (s.position[2] < minZ) minZ = s.position[2];
    if (s.position[2] > maxZ) maxZ = s.position[2];
  });

  const padding = 10;
  const width = maxX - minX + padding * 2;
  const height = maxZ - minZ + padding * 2;

  // Scale to fit within a 200x200 box
  const scale = Math.min(200 / width, 200 / height);

  return (
    <div className="hidden md:block absolute bottom-8 right-8 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 z-10 pointer-events-auto shadow-2xl">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Network Map</h3>
      <div className="relative w-[200px] h-[200px] bg-black/50 rounded-xl overflow-hidden">
        <svg width="200" height="200" className="absolute inset-0">
          {/* Draw lines */}
          <polyline
            points={stations.map(s => {
              const x = (s.position[0] - minX + padding) * scale;
              const y = (s.position[2] - minZ + padding) * scale;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#4ade80"
            strokeWidth="2"
            opacity="0.5"
          />
          {/* Draw stations */}
          {stations.map(s => {
            const x = (s.position[0] - minX + padding) * scale;
            const y = (s.position[2] - minZ + padding) * scale;
            const isActive = activeStation?.repo.id === s.repo.id;
            return (
              <circle
                key={s.repo.id}
                cx={x}
                cy={y}
                r={isActive ? 4 : 2}
                fill={s.color}
                stroke={isActive ? '#ffffff' : 'none'}
                strokeWidth={isActive ? 1 : 0}
                className="cursor-pointer hover:r-[5px] transition-all"
                onClick={() => onStationClick(s)}
              >
                <title>{s.repo.name}</title>
              </circle>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
