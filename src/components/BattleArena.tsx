import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Swords, Search, Loader2, TrendingUp, Star, Users, Code, Calendar } from 'lucide-react';
import { UserProfile, Repository } from '../types';
import { fetchUserProfile, fetchUserRepositories } from '../services/githubApi';

interface BattleArenaProps {
  currentUser: UserProfile;
  currentRepos: Repository[];
  isOpen: boolean;
  onClose: () => void;
}

interface BattleStats {
  user: UserProfile;
  repos: Repository[];
  metrics: {
    stars: number;
    reposCount: number;
    followers: number;
    languages: number;
    yearsActive: number;
    score: number;
  };
}

export function BattleArena({ currentUser, currentRepos, isOpen, onClose }: BattleArenaProps) {
  const [opponentName, setOpponentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<BattleStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  const currentStats = useMemo(() => calculateStats(currentUser, currentRepos), [currentUser, currentRepos]);

  const handleSearch = async () => {
    if (!opponentName.trim()) return;
    setLoading(true);
    setError(null);
    setOpponent(null);
    setShowStats(false);

    try {
      const [user, repos] = await Promise.all([
        fetchUserProfile(opponentName),
        fetchUserRepositories(opponentName)
      ]);
      const stats = calculateStats(user, repos);
      setOpponent({ user, repos, metrics: stats });
      
      // Delay transition to stats for "Visual Map" first feeling
      setTimeout(() => setShowStats(true), 2000);
    } catch (err) {
      setError('Player not found. Check the username!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, sans-serif', overflowY: 'auto', padding: 20
          }}
        >
          <div style={{
            width: '100%', maxWidth: 900,
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24, padding: 32, position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 20, right: 20,
                background: 'rgba(255, 255, 255, 0.05)', border: 'none',
                color: '#94a3b8', cursor: 'pointer', padding: 8, borderRadius: '50%'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
                <Swords size={32} color="#ef4444" />
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Subway Battle</h1>
              </div>
              <p style={{ color: '#94a3b8' }}>Compare your Git legacy with other developers</p>
            </div>

            {!opponent && (
              <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <Search size={18} color="#475569" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Enter GitHub username…"
                    value={opponentName}
                    onChange={(e) => setOpponentName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    style={{
                      width: '100%', padding: '14px 14px 14px 48px',
                      background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 100, color: '#f1f5f9', outline: 'none', fontSize: '1rem'
                    }}
                  />
                </div>
                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 16 }}>{error}</p>}
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 100,
                    background: 'linear-gradient(90deg, #ef4444, #f43f5e)',
                    color: '#fff', fontWeight: 700, cursor: 'pointer', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <>Start Battle</>}
                </button>
              </div>
            )}

            {opponent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                {/* Visual Map (Radar) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
                  <PlayerMiniCard user={currentUser} stats={currentStats} color="#00e5a0" />
                  
                  <div style={{ position: 'relative', width: 280, height: 280 }}>
                    <RadarChart 
                      stats1={currentStats} 
                      stats2={opponent.metrics} 
                      color1="#00e5a0" 
                      color2="#ef4444" 
                    />
                    <div style={{ 
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <TrendingUp size={24} color="#f1f5f9" />
                    </div>
                  </div>

                  <PlayerMiniCard user={opponent.user} stats={opponent.metrics} color="#ef4444" />
                </div>

                {/* Quantitative Stats */}
                <AnimatePresence>
                  {showStats && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      style={{ 
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20,
                        background: 'rgba(2, 6, 23, 0.4)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <StatRow label="Power Score" val1={currentStats.score} val2={opponent.metrics.score} icon={<Trophy size={16} />} />
                      <StatRow label="GitHub Stars" val1={currentStats.stars} val2={opponent.metrics.stars} icon={<Star size={16} />} />
                      <StatRow label="Base Stations" val1={currentStats.reposCount} val2={opponent.metrics.reposCount} icon={<Code size={16} />} />
                      <StatRow label="Developer Network" val1={currentStats.followers} val2={opponent.metrics.followers} icon={<Users size={16} />} />
                      <StatRow label="Years in Subway" val1={currentStats.yearsActive} val2={opponent.metrics.yearsActive} icon={<Calendar size={16} />} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ textAlign: 'center' }}>
                    <button 
                         onClick={() => { setOpponent(null); setOpponentName(''); setShowStats(false); }}
                         style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '8px 24px', borderRadius: 100, cursor: 'pointer' }}
                    >
                        New Match
                    </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlayerMiniCard({ user, stats, color }: { user: UserProfile; stats: any; color: string }) {
  return (
    <div style={{ textAlign: 'center', width: 140 }}>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <img 
          src={user.avatar_url} 
          alt={user.login} 
          style={{ width: 100, height: 100, borderRadius: '50%', border: `4px solid ${color}`, boxShadow: `0 0 20px ${color}33` }} 
        />
        <div style={{ 
          position: 'absolute', bottom: 0, right: 10, background: color, 
          borderRadius: 100, padding: '4px 10px', fontSize: '0.7rem', fontWeight: 'bold', color: '#fff' 
        }}>
          LVL {Math.floor(stats.score / 100) + 1}
        </div>
      </div>
      <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1rem', fontWeight: 800 }}>{user.name || user.login}</h3>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>@{user.login}</p>
    </div>
  );
}

function StatRow({ label, val1, val2, icon }: { label: string; val1: number; val2: number; icon: React.ReactNode }) {
  const winner = val1 > val2 ? 1 : val2 > val1 ? 2 : 0;
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '0.75rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon}
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: winner === 1 ? '#00e5a0' : '#f1f5f9', fontWeight: winner === 1 ? 800 : 500, fontSize: '1.2rem' }}>{val1}</span>
        <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
        <span style={{ color: winner === 2 ? '#ef4444' : '#f1f5f9', fontWeight: winner === 2 ? 800 : 500, fontSize: '1.2rem' }}>{val2}</span>
      </div>
    </div>
  );
}

function RadarChart({ stats1, stats2, color1, color2 }: any) {
  // Simple Radar implementation with SVG
  const size = 280;
  const center = size / 2;
  const radius = size * 0.4;
  
  const categories = ['stars', 'reposCount', 'followers', 'languages', 'yearsActive'];
  const maxValues = {
    stars: Math.max(stats1.stars, stats2.stars, 50),
    reposCount: Math.max(stats1.reposCount, stats2.reposCount, 20),
    followers: Math.max(stats1.followers, stats2.followers, 50),
    languages: Math.max(stats1.languages, stats2.languages, 10),
    yearsActive: Math.max(stats1.yearsActive, stats2.yearsActive, 5),
  };

  const getPoint = (val: number, max: number, index: number) => {
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const r = (val / max) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  };

  const points1 = categories.map((cat, i) => getPoint((stats1 as any)[cat], (maxValues as any)[cat], i)).join(' ');
  const points2 = categories.map((cat, i) => getPoint((stats2 as any)[cat], (maxValues as any)[cat], i)).join(' ');

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {/* Background circles */}
      {[0.2, 0.4, 0.6, 0.8, 1].map((step) => (
        <circle key={step} cx={center} cy={center} r={radius * step} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {/* Axis lines */}
      {categories.map((_, i) => {
        const angle = (i * 2 * Math.PI) / categories.length - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center} y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="rgba(255,255,255,0.1)"
          />
        );
      })}
      {/* Polygons */}
      <motion.polygon
        points={points1}
        fill={`${color1}33`}
        stroke={color1}
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.polygon
        points={points2}
        fill={`${color2}33`}
        stroke={color2}
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </svg>
  );
}

function calculateStats(user: UserProfile, repos: Repository[]) {
  const stars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
  const reposCount = repos.length;
  const followers = user.followers;
  const languages = new Set(repos.map(r => r.language).filter(Boolean)).size;
  const yearsActive = new Date().getFullYear() - new Date(user.created_at).getFullYear() + 1;
  const score = (stars * 10) + (reposCount * 5) + (followers * 2) + (languages * 20) + (yearsActive * 50);

  return { stars, reposCount, followers, languages, yearsActive, score };
}
