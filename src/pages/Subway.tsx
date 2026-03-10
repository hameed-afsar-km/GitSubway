import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, ChevronLeft, ChevronRight, Search, Share2, Filter, MapPin, Train, User } from 'lucide-react';
import { MetroScene } from '../components/MetroScene';
import { AnalyticsPanel } from '../components/AnalyticsPanel';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { MiniMap } from '../components/MiniMap';
import { fetchUserProfile, fetchUserRepositories } from '../services/githubApi';
import { generateMetroSystem } from '../utils/visualMapping';
import { UserProfile, Repository, MetroStationData } from '../types';

export function Subway() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [stations, setStations] = useState<MetroStationData[]>([]);

  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');

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
    // If the currently selected station is filtered out, deselect it
    if (activeStationId !== null) {
      const stillExists = filteredStations.find(s => s.repo.id === activeStationId);
      if (!stillExists) {
        setActiveStationId(null);
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

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #040410 0%, #060614 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#e2e8f0', fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '2px solid rgba(0,229,160,0.15)',
            borderTopColor: '#00e5a0',
            animation: 'spin 0.9s linear infinite',
          }} />
          <Train size={24} color="#00e5a0" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Boarding the Metro…</h2>
        <p style={{ color: '#475569', margin: 0 }}>Mapping developer journey for <span style={{ color: '#00e5a0' }}>@{username}</span></p>
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
              background: 'rgba(0,229,160,0.12)',
              border: '1px solid rgba(0,229,160,0.3)',
              borderRadius: 100,
              color: '#00e5a0',
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

  /* ─── Main ─── */
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* 3D Scene */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MetroScene
          stations={filteredStations}
          activeStation={activeStation}
          onStationClick={handleStationClick}
        />
      </div>

      {/* ─── Top Nav ─── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%',
        padding: '16px 20px',
        zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
        background: 'linear-gradient(180deg, rgba(4,4,16,0.85) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>

        {/* Left: back + user info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(6,8,24,0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,229,160,0.2)',
              color: '#00e5a0', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(6,8,24,0.85)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,229,160,0.15)',
            borderRadius: 12, padding: '8px 16px 8px 10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            <img src={user.avatar_url} alt={user.login} style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(0,229,160,0.3)' }} />
            <div>
              <div style={{ color: '#f0f6ff', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
                {user.name || user.login}
              </div>
              <div style={{ color: '#475569', fontSize: '0.7rem' }}>
                <span style={{ color: '#00e5a0' }}>{stations.length}</span> stations on the line
              </div>
            </div>
          </div>
        </div>

        {/* Right: controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto', flexWrap: 'wrap' }}>

          {/* Year filter */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(6,8,24,0.85)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 100, padding: '7px 14px',
          }}>
            <Filter size={13} color="#475569" />
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              style={{
                background: 'transparent', border: 'none',
                color: '#e2e8f0', fontSize: '0.8rem', outline: 'none',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              {availableYears.map(year => (
                <option key={year} value={year} style={{ background: '#0d0d20' }}>
                  {year === 'All' ? 'All Years' : year}
                </option>
              ))}
            </select>
          </div>

          {/* Search Repos */}
          <div style={{ position: 'relative' }}>
            <Search size={13} color="#475569" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search repos…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(6,8,24,0.85)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 100, padding: '8px 14px 8px 32px',
                color: '#e2e8f0', fontSize: '0.8rem', outline: 'none',
                width: 150, fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,229,160,0.3)'; e.target.style.width = '190px'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.width = '150px'; }}
            />
          </div>

          {/* Search Other User Profile */}
          <div style={{ position: 'relative' }}>
            <User size={13} color="#475569" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Find profile…"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value.trim();
                  if (val) {
                    navigate(`/subway/${val}`);
                    e.currentTarget.value = '';
                  }
                }
              }}
              style={{
                background: 'rgba(6,8,24,0.85)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 100, padding: '8px 14px 8px 32px',
                color: '#e2e8f0', fontSize: '0.8rem', outline: 'none',
                width: 130, fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.width = '160px'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.width = '130px'; }}
            />
          </div>
          {/* AI Insights button */}
          <button
            onClick={() => setShowAIInsights(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              background: 'rgba(0,229,160,0.1)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0,229,160,0.3)',
              borderRadius: 100, color: '#00e5a0',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
              boxShadow: '0 0 16px rgba(0,229,160,0.08)',
              transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,160,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,160,0.1)'; }}
          >
            <Sparkles size={14} />
            <span>AI Insights</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(6,8,24,0.85)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            title="Share"
          >
            <Share2 size={16} />
          </button>
        </div>



        {/* ─── Bottom Timeline Controls ─── */}
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10,
        }}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              background: 'rgba(6,8,24,0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,229,160,0.15)',
              borderRadius: 100,
              padding: '6px 8px',
              display: 'flex', alignItems: 'center', gap: 4,
              boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,229,160,0.05)',
            }}
          >
            <button
              onClick={handlePrevStation}
              disabled={activeStationIndex === null || activeStationIndex === 0}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                border: 'none', background: 'transparent',
                color: activeStationIndex === 0 ? '#2d3748' : '#94a3b8',
                cursor: activeStationIndex === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft size={22} />
            </button>

            <div style={{ paddingInline: 16, textAlign: 'center', minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
                <MapPin size={10} color="#00e5a0" />
                <span style={{ color: '#475569', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Station {activeStationIndex !== null ? activeStationIndex + 1 : '–'} / {filteredStations.length}
                </span>
              </div>
              <div style={{ color: '#f0f6ff', fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                {activeStation?.repo.name || 'Select a Station'}
              </div>
              {activeStation && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: activeStation.color, boxShadow: `0 0 4px ${activeStation.color}` }} />
                  <span style={{ color: '#475569', fontSize: '0.65rem' }}>
                    {activeStation.repo.language || 'Unknown'} · {new Date(activeStation.repo.created_at).getFullYear()}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleNextStation}
              disabled={activeStationIndex === null || activeStationIndex === filteredStations.length - 1}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                border: 'none', background: 'transparent',
                color: activeStationIndex === filteredStations.length - 1 ? '#2d3748' : '#94a3b8',
                cursor: activeStationIndex === filteredStations.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <ChevronRight size={22} />
            </button>
          </motion.div>
        </div>

        {/* ─── Mini Map ─── */}
        <MiniMap
          stations={filteredStations}
          activeStation={activeStation}
          onStationClick={handleStationClick}
        />

        {/* ─── Analytics Panel ─── */}
        <AnalyticsPanel
          station={activeStation}
          onClose={() => setActiveStationId(null)}
        />

        {/* ─── AI Insights Panel ─── */}
        <AIInsightsPanel
          user={user}
          repos={repos}
          isOpen={showAIInsights}
          onClose={() => setShowAIInsights(false)}
        />
      </div>
    </div>
  );
}
