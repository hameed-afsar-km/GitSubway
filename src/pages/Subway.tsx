import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, ChevronLeft, ChevronRight, Search, Share2, Filter, MapPin, Train, User, Sun, Moon, Leaf, Snowflake, Flower, Mountain, Infinity as InfinityIcon, Rocket, Brain, Shield, ChevronDown, Swords } from 'lucide-react';
import { MetroScene } from '../components/MetroScene';
import { AnalyticsPanel } from '../components/AnalyticsPanel';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { MiniMap } from '../components/MiniMap';
import { fetchUserProfile, fetchUserRepositories } from '../services/githubApi';
import { generateMetroSystem } from '../utils/visualMapping';
import { UserProfile, Repository, MetroStationData, TimeOfDay, Season } from '../types';
import { BattleArena } from '../components/BattleArena';

import AnoAI from '../components/ui/animated-shader-background';

export function Subway() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [stations, setStations] = useState<MetroStationData[]>([]);

  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [season, setSeason] = useState<Season>('summer');

  useEffect(() => {
    if (!username) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userProfile, userRepos] = await Promise.all([
          fetchUserProfile(username),
          fetchUserRepositories(username)
        ]);

        setUser(userProfile);
        setRepos(userRepos);

        const generatedStations = generateMetroSystem(userRepos);
        setStations(generatedStations);

        if (generatedStations.length > 0) {
          setActiveStationId(generatedStations[0].repo.id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load GitHub data. Please check the username and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username]);

  const filteredStations = useMemo(() => {
    let filtered = stations;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.repo.name.toLowerCase().includes(lowerQuery));
    }

    if (selectedYear !== 'All') {
      filtered = filtered.filter(s => new Date(s.repo.created_at).getFullYear().toString() === selectedYear);
    }

    return filtered;
  }, [stations, searchQuery, selectedYear]);

  useEffect(() => {
    // If we have stations but none is active, or the current one is filtered out, select the first one
    if (filteredStations.length > 0) {
      const stillExists = activeStationId !== null ? filteredStations.find(s => s.repo.id === activeStationId) : null;
      if (!stillExists) {
        setActiveStationId(filteredStations[0].repo.id);
      }
    }
  }, [filteredStations, activeStationId]);

  const activeStationIndex = useMemo(() => {
    if (activeStationId === null) return null;
    const index = filteredStations.findIndex(s => s.repo.id === activeStationId);
    return index !== -1 ? index : null;
  }, [filteredStations, activeStationId]);

  const activeStation = activeStationIndex !== null ? filteredStations[activeStationIndex] : null;

  const handleNextStation = () => {
    if (activeStationIndex !== null && activeStationIndex < filteredStations.length - 1) {
      setActiveStationId(filteredStations[activeStationIndex + 1].repo.id);
    }
  };

  const handlePrevStation = () => {
    if (activeStationIndex !== null && activeStationIndex > 0) {
      setActiveStationId(filteredStations[activeStationIndex - 1].repo.id);
    }
  };

  const handleStationClick = (station: MetroStationData) => {
    setActiveStationId(station.repo.id);
    setIsPanelCollapsed(false);
  };

  const availableYears = useMemo(() => {
    const years = new Set(stations.map(s => new Date(s.repo.created_at).getFullYear().toString()));
    return ['All', ...Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))];
  }, [stations]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${username}'s GitSubway — an interactive 3D metro visualization of their GitHub repos!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'GitSubway', text: shareText, url: shareUrl });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('Link copied to clipboard!');
    }
  };

  /* ─── Premium Loading Screen ─── */
  if (loading) {
    return (
      <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden font-sans">
        <AnoAI />
        
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6">
          <div className="relative flex items-center justify-center">
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute w-32 h-32 border-2 border-dashed border-blue-500/20 rounded-full"
            />
            <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 p-5 rounded-3xl shadow-2xl animate-float">
               <Train size={48} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <InfinityIcon className="text-blue-500 animate-pulse" size={24} />
              BOARDING METRO
            </h2>
            <p className="text-blue-400/80 font-medium tracking-wide text-sm bg-blue-500/10 py-1 px-4 rounded-full border border-blue-500/20 inline-block">
              Mapping @{username}'s Journey
            </p>
          </div>

          <div className="flex gap-4 opacity-40">
            <Rocket className="animate-float" style={{ animationDelay: '0.2s' }} size={20} />
            <Brain className="animate-float" style={{ animationDelay: '0.4s' }} size={20} />
            <Shield className="animate-float" style={{ animationDelay: '0.6s' }} size={20} />
          </div>

          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #040410 0%, #060614 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 16,
          padding: '32px 40px',
          maxWidth: 440,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚫</div>
          <h2 style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 12px' }}>
            Connection Failed
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 24px',
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: 100,
              color: '#3b82f6',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ← Return Home
          </button>
        </div>
      </div>
    );
  }

  const TimeButton = ({ type, icon: Icon, label }: { type: TimeOfDay; icon: any; label: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    const active = timeOfDay === type;
    return (
      <div className="relative flex items-center" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <button
          onClick={() => setTimeOfDay(type)}
          style={{
            width: 32, height: 32, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: active ? 'rgba(59,130,246,0.2)' : 'transparent',
            border: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
            color: active ? '#3b82f6' : '#475569',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <Icon size={16} />
        </button>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 10 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-full ml-2 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none"
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const SeasonButton = ({ type, icon: Icon, label }: { type: Season; icon: any; label: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    const active = season === type;
    return (
      <div className="relative flex items-center" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <button
          onClick={() => setSeason(type)}
          style={{
            width: 32, height: 32, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: active ? 'rgba(59,130,246,0.2)' : 'transparent',
            border: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
            color: active ? '#3b82f6' : '#475569',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <Icon size={16} />
        </button>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 10 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-full ml-2 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none"
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  /* ─── Main ─── */
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* 3D Scene */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MetroScene
          stations={filteredStations}
          activeStation={activeStation}
          timeOfDay={timeOfDay}
          season={season}
          onStationClick={handleStationClick}
        />
      </div>

      {/* ─── Environmental Control Module (Right) ─── */}
      <div style={{
        position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
        zIndex: 100, display: 'flex', flexDirection: 'column', gap: 12,
        background: 'rgba(8, 12, 32, 0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, padding: '12px 6px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <TimeButton type="day" icon={Sun} label="Day" />
          <TimeButton type="night" icon={Moon} label="Night" />
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 6px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SeasonButton type="summer" icon={Mountain} label="Summer" />
          <SeasonButton type="autumn" icon={Leaf} label="Autumn" />
          <SeasonButton type="winter" icon={Snowflake} label="Winter" />
          <SeasonButton type="spring" icon={Flower} label="Spring" />
          <SeasonButton type="blossom" icon={Sparkles} label="Blossom" />
        </div>
      </div>

      {/* ─── Top Identity Hub ─── */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        zIndex: 100, display: 'flex', alignItems: 'center', gap: 12,
        pointerEvents: 'none'
      }}>
        <button
          onClick={() => navigate('/')}
          className="gradient-button"
          style={{
            width: 44, height: 44, borderRadius: '50%',
            color: '#3b82f6', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'auto', border: 'none'
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(8, 12, 32, 0.8)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 22, padding: '4px 20px 4px 6px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(59,130,246,0.1)',
          pointerEvents: 'auto'
        }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={user.avatar_url} 
              alt={user.login} 
              style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #3b82f6' }} 
            />
            <div style={{ 
              position: 'absolute', bottom: -2, right: -2, 
              width: 10, height: 10, borderRadius: '50%', 
              background: '#22c55e', border: '2px solid #080c20' 
            }} />
          </div>
          <div>
            <div style={{ color: '#f0f6ff', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.02em' }}>
              {user.login.toUpperCase()}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Line Manifest · {stations.length} Units
            </div>
          </div>
        </div>
      </div>

      {/* Right side environmental control orb moved to Subway Design HUD block below */}

      {/* ─── Unified Console Hub (Bottom) ─── */}
      <div style={{
        position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, width: 'calc(100% - 40px)', maxWidth: 880,
        display: 'flex', alignItems: 'flex-end', gap: 12,
        pointerEvents: 'none'
      }}>
        
        {/* Left Module: Search & Filters (Visible on desktop/larger screens) */}
        <div className="hidden sm:flex" style={{
          background: 'rgba(8, 12, 32, 0.85)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: 12, gap: 8,
          pointerEvents: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <div style={{ position: 'relative' }}>
             <Search size={14} color="#3b82f6" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
             <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 16, padding: '10px 12px 10px 34px',
                  color: '#fff', fontSize: '0.75rem', outline: 'none', width: 100,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onFocus={e => e.target.style.width = '140px'}
                onBlur={e => e.target.style.width = '100px'}
             />
          </div>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 16, padding: '0 12px', color: '#94a3b8', fontSize: '0.75rem',
              outline: 'none', cursor: 'pointer'
            }}
          >
            {availableYears.map(year => (
              <option key={year} value={year} style={{ background: '#0d0d20' }}>
                {year === 'All' ? 'All' : year}
              </option>
            ))}
          </select>
        </div>

        {/* Center Module: Navigation Timeline */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            flex: 1, height: 72,
            background: 'rgba(8, 12, 32, 0.85)', backdropFilter: 'blur(32px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 36, padding: '0 8px',
            display: 'flex', alignItems: 'center', gap: 4,
            pointerEvents: 'auto', 
            boxShadow: '0 12px 48px rgba(0,0,0,0.6), inset 0 0 20px rgba(59,130,246,0.1)'
          }}
        >
          <button
            onClick={handlePrevStation}
            disabled={activeStationIndex === null || activeStationIndex === 0}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              border: 'none', background: 'rgba(59,130,246,0.05)',
              color: activeStationIndex === 0 ? '#1e293b' : '#3b82f6',
              cursor: activeStationIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft size={24} />
          </button>

          <div style={{ flex: 1, textAlign: 'center', minWidth: 0, paddingInline: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
              <div style={{ 
                width: 8, height: 8, borderRadius: '50%', 
                background: activeStation?.color || '#3b82f6',
                boxShadow: `0 0 10px ${activeStation?.color || '#3b82f6'}`
              }} />
              <span style={{ color: '#475569', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {activeStationIndex !== null ? `Station ${activeStationIndex + 1}` : 'Waiting...'}
              </span>
            </div>
            <div style={{ 
              color: '#fff', fontWeight: 900, fontSize: '1rem', 
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              letterSpacing: '-0.01em'
            }}>
              {activeStation?.repo.name.toUpperCase() || 'SELECT ORIGIN'}
            </div>
          </div>

          <button
            onClick={handleNextStation}
            disabled={activeStationIndex === null || activeStationIndex === filteredStations.length - 1}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              border: 'none', background: 'rgba(59,130,246,0.05)',
              color: activeStationIndex === filteredStations.length - 1 ? '#1e293b' : '#3b82f6',
              cursor: activeStationIndex === filteredStations.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <ChevronRight size={24} />
          </button>
        </motion.div>

        {/* Right Module: Tactics & Logic */}
        <div style={{
          background: 'rgba(8, 12, 32, 0.85)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: 12, display: 'flex', gap: 8,
          pointerEvents: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <button
            onClick={() => setShowAIInsights(true)}
            className="gradient-button"
            title="AI Analysis"
            style={{
              width: 44, height: 44, borderRadius: 16, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#3b82f6'
            }}
          >
            <Sparkles size={18} />
          </button>
          <button
            onClick={() => setIsBattleMode(true)}
            className="gradient-button"
            title="Battle Mode"
            style={{
              width: 44, height: 44, borderRadius: 16, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ef4444'
            }}
          >
            <Swords size={18} />
          </button>
          <button
            onClick={handleShare}
            style={{
              width: 44, height: 44, borderRadius: 16, 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', cursor: 'pointer'
            }}
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* ─── Mini Map ─── */}
      <MiniMap
        stations={filteredStations}
        activeStation={activeStation}
        onStationClick={handleStationClick}
      />

      {/* ─── Analytics Panel ─── */}
      <AnalyticsPanel
        station={isPanelCollapsed ? null : activeStation}
        onClose={() => setIsPanelCollapsed(true)}
      />

      {/* ─── Re-open panel tab (shown when panel is collapsed but a station is selected) ─── */}
      {isPanelCollapsed && activeStation && (
        <button
          onClick={() => setIsPanelCollapsed(false)}
          title={`Re-open: ${activeStation.repo.name}`}
          style={{
            position: 'absolute',
            top: '50%',
            right: 0,
            transform: 'translateY(-50%)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '14px 8px',
            background: 'linear-gradient(180deg, rgba(8,12,32,0.97) 0%, rgba(6,8,20,0.98) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRight: 'none',
            borderRadius: '12px 0 0 12px',
            color: '#3b82f6',
            cursor: 'pointer',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(180deg, rgba(59,130,246,0.15) 0%, rgba(8,12,32,0.97) 100%)';
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(180deg, rgba(8,12,32,0.97) 0%, rgba(6,8,20,0.98) 100%)';
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
          }}
        >
          <ChevronDown size={16} style={{ transform: 'rotate(90deg)' }} />
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            color: '#3b82f6',
            maxHeight: 80,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {activeStation.repo.name}
          </span>
        </button>
      )}

      <AIInsightsPanel
        user={user}
        repos={repos}
        isOpen={showAIInsights}
        onClose={() => setShowAIInsights(false)}
      />

      {/* ─── Battle Arena Overlay ─── */}
      <BattleArena
        currentUser={user}
        currentRepos={repos}
        isOpen={isBattleMode}
        onClose={() => setIsBattleMode(false)}
      />
    </div>
  );
}
