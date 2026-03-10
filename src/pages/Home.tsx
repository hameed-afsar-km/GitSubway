import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Train, Sparkles, Github, ArrowRight, Zap, BarChart2, Building2 } from 'lucide-react';

// Animated city train cars in header
function AnimatedTrain() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <style>{`
        @keyframes trainRide {
          0% { transform: translateX(-400px); }
          100% { transform: translateX(110vw); }
        }
        @keyframes trainRide2 {
          0% { transform: translateX(-500px); }
          100% { transform: translateX(110vw); }
        }
        .train-car {
          position: absolute;
          display: flex;
          gap: 4px;
          animation: trainRide 7s linear infinite;
        }
        .train-car-2 {
          animation: trainRide2 10s linear infinite;
          animation-delay: 3s;
        }
        .car {
          background: linear-gradient(180deg, #f0f4fa 0%, #dce8f4 50%, #2a3a5c 100%);
          border: 1px solid rgba(100,140,220,0.5);
          border-radius: 4px 4px 2px 2px;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25), inset 0 -2px 6px rgba(0,0,0,0.2);
        }
        .car::after {
          content: '';
          position: absolute;
          left: 4px; right: 4px; top: 6px; bottom: 14px;
          background: rgba(140,200,255,0.55);
          border-radius: 2px;
        }
        .car-stripe {
          position: absolute;
          left: 0; right: 0;
          height: 3px;
          background: #e63946;
          top: 58%;
          box-shadow: 0 0 4px rgba(230,57,70,0.6);
        }
        .car-wheels {
          position: absolute;
          bottom: -5px;
          left: 10%;
          right: 10%;
          display: flex;
          justify-content: space-between;
        }
        .wheel {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #333;
          border: 1.5px solid #555;
        }
        .track-line {
          position: absolute;
          height: 2px;
          width: 100%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
      `}</style>

      {/* Track line 1 */}
      <div className="track-line" style={{ top: '18%', background: 'rgba(80,80,80,0.35)' }} />
      <div className="track-line" style={{ top: 'calc(18% + 3px)', background: 'rgba(80,80,80,0.18)' }} />

      {/* Track line 2 */}
      <div className="track-line" style={{ top: '78%', background: 'rgba(80,80,80,0.28)' }} />
      <div className="track-line" style={{ top: 'calc(78% + 3px)', background: 'rgba(80,80,80,0.14)' }} />

      {/* Train 1 — red stripe */}
      <div className="train-car" style={{ top: 'calc(18% - 36px)' }}>
        {[54, 48, 48, 48].map((w, i) => (
          <div key={i} className="car" style={{ width: w, height: 32, borderRadius: i === 0 ? '4px 6px 2px 2px' : '3px 3px 2px 2px' }}>
            <div className="car-stripe" />
            <div className="car-wheels">
              <div className="wheel" />
              <div className="wheel" />
            </div>
          </div>
        ))}
      </div>

      {/* Train 2 — blue stripe, same fast speed */}
      <div className="train-car train-car-2" style={{ top: 'calc(78% - 28px)' }}>
        {[46, 40, 40].map((w, i) => (
          <div key={i} className="car" style={{
            width: w, height: 26,
            borderColor: 'rgba(60,120,220,0.5)',
          }}>
            <div className="car-stripe" style={{ background: '#2563eb', boxShadow: '0 0 4px rgba(37,99,235,0.5)' }} />
            <div className="car-wheels">
              <div className="wheel" />
              <div className="wheel" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Home() {
  const [username, setUsername] = useState('');
  const [bgBuildings] = useState(() =>
    Array.from({ length: 22 }, (_, i) => ({
      x: (i / 22) * 100,
      h: 20 + Math.random() * 45,
      w: 2.5 + Math.random() * 3,
      delay: Math.random() * 2,
    }))
  );
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/subway/${username.trim()}`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #87ceeb 0%, #b8dcf0 30%, #d8eef8 60%, #e8e0d0 100%)',
      color: '#1a2340',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* City skyline silhouette */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', pointerEvents: 'none', zIndex: 0 }}>
        <svg viewBox="0 0 1200 400" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          {bgBuildings.map((b, i) => {
            const x = b.x * 12;
            const h = b.h * 4;
            const w = b.w * 12;
            // Daytime building colors — concrete/glass palette
            const wallShades = ['#c0b8ac', '#b8b0a4', '#ccc4b8', '#d0c8bc', '#b4aca0'];
            const fill = wallShades[i % wallShades.length];
            const glassCol = i % 3 === 0 ? '#8ac0dc' : i % 3 === 1 ? '#6ab0d0' : '#a0cce0';
            return (
              <g key={i}>
                {/* Main wall */}
                <rect x={x} y={400 - h} width={w} height={h} fill={fill} />
                {/* Glass facade (every 2nd building) */}
                {i % 2 === 0 && (
                  <rect x={x + w * 0.1} y={400 - h + h * 0.05} width={w * 0.8} height={h * 0.85}
                    fill={glassCol} opacity={0.35} />
                )}
                {/* Parapet line */}
                <rect x={x} y={400 - h} width={w} height={3} fill="rgba(255,255,255,0.5)" />
                {/* Shadow on right face */}
                <rect x={x + w - 3} y={400 - h} width={3} height={h} fill="rgba(0,0,0,0.12)" />
              </g>
            );
          })}
          {/* Ground strip */}
          <rect x={0} y={395} width={1200} height={5} fill="#c8c0b0" />
        </svg>
      </div>

      <AnimatedTrain />

      {/* Sunlight glare orbs */}
      <div style={{ position: 'absolute', top: '5%', right: '12%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,230,100,0.22) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '15%', left: '8%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.14) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 5, maxWidth: 980, margin: '0 auto', padding: '0 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', width: '100%' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 18px', borderRadius: 100,
              background: 'rgba(37,99,235,0.1)',
              border: '1px solid rgba(37,99,235,0.25)',
              marginBottom: 28,
              boxShadow: '0 4px 16px rgba(37,99,235,0.12)',
            }}
          >
            <Zap size={13} color="#2563eb" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2563eb', letterSpacing: '0.05em' }}>
              AI-Powered Metro Visualization
            </span>
          </motion.div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, #1a2340 0%, #1d4ed8 40%, #0369a1 75%, #0891b2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
          }}>
            GitSubway
          </h1>

          {/* Subtitle metro line decoration */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {['#f59e0b', '#00e5a0', '#3b82f6', '#a855f7', '#ef4444'].map((c, i) => (
              <div key={i} style={{ width: i === 2 ? 32 : 16, height: 5, borderRadius: 4, background: c, boxShadow: `0 0 6px ${c}` }} />
            ))}
          </div>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            color: '#334155',
            marginBottom: 40,
            fontWeight: 300,
            lineHeight: 1.6,
            maxWidth: 580,
            margin: '0 auto 40px',
          }}>
            Transform your GitHub repositories into an{' '}
            <span style={{ color: '#1d4ed8', fontWeight: 500 }}>interactive 3D metro network</span>.
            Ride the city rails through your developer journey.
          </p>

          {/* Search form */}
          <form onSubmit={handleSubmit} style={{ maxWidth: 520, margin: '0 auto 56px', position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Github
                size={22}
                color="#475569"
                style={{ position: 'absolute', left: 20, pointerEvents: 'none', zIndex: 2 }}
              />
              <input
                type="text"
                placeholder="Enter GitHub username..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(37,99,235,0.25)',
                  borderRadius: 100,
                  padding: '18px 140px 18px 58px',
                  fontSize: '1rem',
                  color: '#1a2340',
                  outline: 'none',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                  transition: 'all 0.25s',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(37,99,235,0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1), 0 4px 24px rgba(0,0,0,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(37,99,235,0.25)';
                  e.target.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
                }}
              />
              <button
                type="submit"
                disabled={!username.trim()}
                style={{
                  position: 'absolute', right: 6,
                  background: username.trim()
                    ? 'linear-gradient(135deg, #1d4ed8, #1e40af)'
                    : 'rgba(180,190,210,0.5)',
                  color: username.trim() ? '#fff' : '#94a3b8',
                  border: 'none', borderRadius: 100,
                  padding: '12px 22px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: username.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: 7,
                  transition: 'all 0.25s',
                  boxShadow: username.trim() ? '0 4px 16px rgba(29,78,216,0.4)' : 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Explore
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, width: '100%', maxWidth: 900 }}>
          {[
            {
              icon: Building2, iconColor: '#3b82f6', bgColor: 'rgba(59,130,246,0.08)',
              borderColor: 'rgba(59,130,246,0.15)', delay: 0.2,
              title: '3D City Visualization',
              desc: 'Your repositories become metro stations in a 3D cityscape with buildings, tracks and neon lights.',
            },
            {
              icon: Train, iconColor: '#00e5a0', bgColor: 'rgba(0,229,160,0.08)',
              borderColor: 'rgba(0,229,160,0.15)', delay: 0.3,
              title: 'Metro Train Journey',
              desc: 'A sleek multi-car metro train rides between your repositories as you explore your history.',
            },
            {
              icon: BarChart2, iconColor: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)',
              borderColor: 'rgba(245,158,11,0.15)', delay: 0.4,
              title: 'Rich Analytics',
              desc: 'Pie charts, line graphs, and bar charts give deep insight into your coding patterns and growth.',
            },
            {
              icon: Sparkles, iconColor: '#a855f7', bgColor: 'rgba(168,85,247,0.08)',
              borderColor: 'rgba(168,85,247,0.15)', delay: 0.5,
              title: 'Gemini AI Analysis',
              desc: 'Google Gemini analyzes your entire profile and provides actionable insights and recommendations.',
            },
          ].map(({ icon: Icon, iconColor, bgColor, borderColor, delay, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay }}
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: 16,
                padding: '24px 20px',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
              }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <div style={{
                width: 44, height: 44,
                background: `${iconColor}18`,
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
                border: `1px solid ${iconColor}30`,
              }}>
                <Icon size={22} color={iconColor} />
              </div>
              <h3 style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px' }}>{title}</h3>
              <p style={{ color: '#475569', fontSize: '0.83rem', margin: 0, lineHeight: 1.55 }}>{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Metro line decoration at bottom */}
        <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 0, maxWidth: 600, width: '100%' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 2,
              background: i % 3 === 0 ? 'rgba(0,229,160,0.4)' : 'rgba(0,229,160,0.1)',
              borderRadius: 1,
            }} />
          ))}
          <div style={{ marginLeft: 4, display: 'flex', gap: 4 }}>
            {['#00e5a0', '#3b82f6', '#f59e0b', '#a855f7'].map(c => (
              <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
