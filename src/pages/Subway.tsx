import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Map, Loader2, ChevronLeft, ChevronRight, Search, Share2, Filter } from 'lucide-react';
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

  // Update active station if it gets filtered out
  useEffect(() => {
    if (filteredStations.length > 0) {
      const stillExists = filteredStations.find(s => s.repo.id === activeStationId);
      if (!stillExists) {
        setActiveStationId(filteredStations[0].repo.id);
      }
    } else {
      setActiveStationId(null);
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
    const shareText = `Check out ${username}'s GitSubway - an interactive 3D metro visualization of their GitHub repositories!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GitSubway',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-emerald-500 mb-6" size={48} />
        <h2 className="text-2xl font-bold mb-2">Connecting to GitHub...</h2>
        <p className="text-zinc-400">Mapping developer journey for {username}</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">Connection Failed</h2>
          <p className="text-zinc-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <MetroScene
          stations={filteredStations}
          activeStation={activeStation}
          onStationClick={handleStationClick}
        />
      </div>

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex flex-col md:flex-row items-start md:items-center justify-between pointer-events-none gap-4">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={() => navigate('/')}
            className="p-3 bg-zinc-900/80 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors text-white"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-2 flex items-center gap-4 pr-6">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-10 h-10 rounded-full border border-white/20"
            />
            <div>
              <h1 className="text-white font-bold leading-tight">{user.name || user.login}</h1>
              <p className="text-zinc-400 text-xs">{stations.length} Repositories</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
          <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
            <Filter className="text-zinc-400 mr-2" size={16} />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none appearance-none cursor-pointer"
            >
              {availableYears.map(year => (
                <option key={year} value={year} className="bg-zinc-900 text-white">
                  {year === 'All' ? 'All Years' : year}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 w-48 md:w-64 transition-all"
            />
          </div>

          <button
            onClick={() => setShowAIInsights(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-full border border-emerald-500/30 transition-colors font-medium text-sm"
          >
            <Sparkles size={16} />
            <span className="hidden md:inline">AI Insights</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 bg-zinc-900/80 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors text-white"
            title="Share"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Timeline Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center gap-6 shadow-2xl">
          <button
            onClick={handlePrevStation}
            disabled={activeStationIndex === null || activeStationIndex === 0}
            className="p-3 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-white"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col items-center min-w-[200px]">
            <span className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Current Station</span>
            <span className="text-white font-bold truncate max-w-[180px]">
              {activeStation?.repo.name || 'Select a station'}
            </span>
            {activeStation && (
              <span className="text-xs text-zinc-500 mt-1">
                {new Date(activeStation.repo.created_at).getFullYear()}
              </span>
            )}
          </div>

          <button
            onClick={handleNextStation}
            disabled={activeStationIndex === null || activeStationIndex === filteredStations.length - 1}
            className="p-3 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-white"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Mini Map */}
      <MiniMap
        stations={filteredStations}
        activeStation={activeStation}
        onStationClick={handleStationClick}
      />

      {/* Panels */}
      <AnalyticsPanel
        station={activeStation}
        onClose={() => setActiveStationId(null)}
      />

      <AIInsightsPanel
        user={user}
        repos={repos}
        isOpen={showAIInsights}
        onClose={() => setShowAIInsights(false)}
      />
    </div>
  );
}
