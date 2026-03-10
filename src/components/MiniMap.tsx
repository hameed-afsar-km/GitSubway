import React from 'react';
import { MetroStationData } from '../types';

interface MiniMapProps {
  stations: MetroStationData[];
  activeStation: MetroStationData | null;
  onStationClick: (station: MetroStationData) => void;
}

export function MiniMap({ stations, activeStation, onStationClick }: MiniMapProps) {
  if (stations.length === 0) return null;

  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  // Calculate bounds based on the track (the widest spanned element)
  stations.forEach(s => {
    const p = s.trackPosition || s.position; // fallback for older data just in case
    if (p[0] < minX) minX = p[0];
    if (p[0] > maxX) maxX = p[0];
    if (p[2] < minZ) minZ = p[2];
    if (p[2] > maxZ) maxZ = p[2];
  });

  const padding = 12;
  const w = maxX - minX + padding * 2;
  const h = maxZ - minZ + padding * 2;
  const scale = Math.min(190 / w, 190 / h);

  const mapW = 190;
  const mapH = 190;

  return (
    <div
      className="hidden md:block"
      style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 10,
        background: 'rgba(6,8,24,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,229,160,0.15)',
        borderRadius: 16,
        padding: '12px 14px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,229,160,0.04)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 4px #00e5a0' }} />
        <span style={{
          fontSize: '0.62rem', fontWeight: 700, color: '#475569',
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Network Map
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.62rem', color: '#00e5a0', fontWeight: 600 }}>
          {stations.length} stations
        </span>
      </div>

      <div style={{
        position: 'relative', width: mapW, height: mapH,
        background: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        {/* City grid bg */}
        <svg width={mapW} height={mapH} style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i * 19} y1={0} x2={i * 19} y2={mapH} stroke="#0d2060" strokeWidth="0.5" />
              <line x1={0} y1={i * 19} x2={mapW} y2={i * 19} stroke="#0d2060" strokeWidth="0.5" />
            </React.Fragment>
          ))}
        </svg>

        <svg width={mapW} height={mapH} style={{ position: 'absolute', inset: 0 }}>
          {/* Metro track line */}
          <polyline
            points={stations.map(s => {
              const tp = s.trackPosition || s.position;
              const x = (tp[0] - minX + padding) * scale;
              const y = (tp[2] - minZ + padding) * scale;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#00e5a0"
            strokeWidth="1.5"
            opacity="0.4"
          />
          {/* Second track offset */}
          <polyline
            points={stations.map(s => {
              const tp = s.trackPosition || s.position;
              const x = (tp[0] - minX + padding) * scale + 2;
              const y = (tp[2] - minZ + padding) * scale + 2;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#00e5a0"
            strokeWidth="1"
            opacity="0.2"
          />

          {/* Stations */}
          {stations.map(s => {
            const x = (s.position[0] - minX + padding) * scale;
            const y = (s.position[2] - minZ + padding) * scale;
            const isActive = activeStation?.repo.id === s.repo.id;
            return (
              <g key={s.repo.id}>
                {isActive && (
                  <circle cx={x} cy={y} r={8} fill={s.color} opacity={0.2} />
                )}
                <circle
                  cx={x} cy={y}
                  r={isActive ? 5 : 3}
                  fill={s.color}
                  stroke={isActive ? '#ffffff' : 'rgba(0,0,0,0.5)'}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  style={{
                    cursor: 'pointer',
                    filter: isActive ? `drop-shadow(0 0 4px ${s.color})` : 'none',
                  }}
                  onClick={() => onStationClick(s)}
                >
                  <title>{s.repo.name}</title>
                </circle>
              </g>
            );
          })}

          {/* Active station label */}
          {activeStation && (() => {
            const s = activeStation;
            const x = (s.position[0] - minX + padding) * scale;
            const y = (s.position[2] - minZ + padding) * scale;
            const above = y > 20;
            return (
              <text
                x={x}
                y={above ? y - 9 : y + 16}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="7"
                fontWeight="700"
                style={{ pointerEvents: 'none' }}
              >
                {s.repo.name.length > 14 ? s.repo.name.slice(0, 12) + '…' : s.repo.name}
              </text>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
