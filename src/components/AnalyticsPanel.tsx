import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, GitFork, AlertCircle, Calendar, Code, ExternalLink, TrendingUp, Activity } from 'lucide-react';
import { MetroStationData } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsPanelProps {
  station: MetroStationData | null;
  onClose: () => void;
}

const CHART_TABS = ['Overview', 'Activity', 'Distribution'] as const;
type ChartTab = typeof CHART_TABS[number];

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(226,232,240,0.85)',
        font: { size: 11 },
        boxWidth: 12,
        padding: 10,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(10,14,40,0.95)',
      titleColor: '#00e5a0',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(0,229,160,0.2)',
      borderWidth: 1,
    },
  },
};

export function AnalyticsPanel({ station, onClose }: AnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('Overview');

  const repo = station?.repo;

  // Bar chart: Stars, Forks, Issues, Watchers
  const barData = useMemo(() => {
    if (!repo) return null;
    return {
      labels: ['⭐ Stars', '🍴 Forks', '🐛 Issues', '📦 Size (KB)'],
      datasets: [
        {
          label: 'Repository Stats',
          data: [
            repo.stargazers_count,
            repo.forks_count,
            repo.open_issues_count,
            Math.round(repo.size / 10),
          ],
          backgroundColor: [
            'rgba(245, 158, 11, 0.75)',
            'rgba(59, 130, 246, 0.75)',
            'rgba(239, 68, 68, 0.75)',
            'rgba(139, 92, 246, 0.75)',
          ],
          borderColor: [
            'rgb(245, 158, 11)',
            'rgb(59, 130, 246)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)',
          ],
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    };
  }, [repo]);

  // Pie/Doughnut: Health score breakdown
  const pieData = useMemo(() => {
    if (!repo) return null;
    const stars = Math.min(repo.stargazers_count, 100);
    const forks = Math.min(repo.forks_count * 2, 100);
    const issues = Math.max(0, 100 - repo.open_issues_count * 5);
    const age = (() => {
      const days = (Date.now() - new Date(repo.created_at).getTime()) / 86400000;
      return Math.min(Math.round(days / 10), 100);
    })();
    return {
      labels: ['Stars Score', 'Fork Activity', 'Issue Health', 'Maturity'],
      datasets: [
        {
          data: [
            Math.max(stars, 5),
            Math.max(forks, 5),
            Math.max(issues, 5),
            Math.max(age, 5),
          ],
          backgroundColor: [
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(0, 229, 160, 0.8)',
            'rgba(168, 85, 247, 0.8)',
          ],
          borderColor: 'rgba(10,14,40,0.8)',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [repo]);

  // Line chart: Monthly activity estimation based on created/updated dates
  const lineData = useMemo(() => {
    if (!repo) return null;
    const createdAt = new Date(repo.created_at);
    const updatedAt = new Date(repo.updated_at);
    const ageMonths = Math.max(1, Math.floor((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const monthCount = Math.min(ageMonths, 12);
    const labels = Array.from({ length: monthCount }, (_, i) => {
      const d = new Date(createdAt);
      d.setMonth(d.getMonth() + i);
      return d.toLocaleString('default', { month: 'short', year: '2-digit' });
    });

    // Simulated activity curve (stars grow, with peak)
    const peakIdx = Math.floor(monthCount * 0.6);
    const activityData = labels.map((_, i) => {
      const base = (repo.stargazers_count / monthCount) * (i + 1);
      const peak = i === peakIdx ? base * 1.4 : base;
      return Math.round(peak + Math.sin(i) * (repo.stargazers_count * 0.05));
    });
    const forkData = labels.map((_, i) =>
      Math.round((repo.forks_count / monthCount) * (i + 1))
    );

    return {
      labels,
      datasets: [
        {
          label: 'Star Growth',
          data: activityData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          pointBackgroundColor: '#f59e0b',
          pointRadius: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Fork Growth',
          data: forkData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          pointBackgroundColor: '#3b82f6',
          pointRadius: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [repo]);

  const barOptions = {
    ...chartDefaults,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: 'rgba(203,213,225,0.8)', font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(203,213,225,0.8)', font: { size: 10 } },
      },
    },
  };

  const lineOptions = {
    ...chartDefaults,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: 'rgba(203,213,225,0.8)', font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: 'rgba(203,213,225,0.8)',
          font: { size: 9 },
          maxTicksLimit: 6,
        },
      },
    },
  };

  const pieOptions = {
    ...chartDefaults,
    cutout: '55%',
  };

  // Health score (0-100)
  const healthScore = useMemo(() => {
    if (!repo) return 0;
    const starScore = Math.min(repo.stargazers_count * 2, 40);
    const forkScore = Math.min(repo.forks_count * 3, 30);
    const issueScore = Math.max(0, 20 - repo.open_issues_count * 2);
    const descScore = repo.description ? 10 : 0;
    return Math.min(100, Math.round(starScore + forkScore + issueScore + descScore));
  }, [repo]);

  const healthColor = healthScore >= 70 ? '#00e5a0' : healthScore >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <AnimatePresence>
      {station && (
        <motion.div
          key={station.repo.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '420px',
            overflowY: 'auto',
            zIndex: 50,
            background: 'linear-gradient(160deg, rgba(8,12,32,0.97) 0%, rgba(6,8,20,0.98) 100%)',
            borderLeft: '1px solid rgba(0,229,160,0.15)',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.8), inset 1px 0 0 rgba(0,229,160,0.05)',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(0,229,160,0.08) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(0,229,160,0.1)',
            padding: '20px 24px 16px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: station.color,
                    boxShadow: `0 0 8px ${station.color}`,
                    flexShrink: 0,
                  }} />
                  <h2 style={{
                    color: '#f0f6ff',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {station.repo.name}
                  </h2>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
                  {station.repo.description || 'No description provided.'}
                </p>
              </div>
              {/* CLOSE BUTTON - Properly visible and clickable */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '1px solid rgba(239,68,68,0.4)',
                  background: 'rgba(239,68,68,0.12)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  fontSize: '18px',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.3)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.7)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.4)';
                }}
                title="Close panel"
              >
                ✕
              </button>
            </div>
          </div>

          <div style={{ padding: '16px 20px 32px' }}>
            {/* Health Score */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${healthColor}30`,
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Repository Health Score
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ color: healthColor, fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
                    {healthScore}
                  </span>
                  <span style={{ color: '#475569', fontSize: '0.9rem' }}>/100</span>
                </div>
              </div>
              <div style={{ position: 'relative', width: 56, height: 56 }}>
                <svg viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                  <circle
                    cx="28" cy="28" r="22"
                    fill="none"
                    stroke={healthColor}
                    strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - healthScore / 100)}`}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${healthColor})` }}
                  />
                </svg>
                <Activity
                  size={18}
                  color={healthColor}
                  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 16,
            }}>
              {[
                { icon: '⭐', label: 'Stars', value: station.repo.stargazers_count, color: '#f59e0b' },
                { icon: '🍴', label: 'Forks', value: station.repo.forks_count, color: '#3b82f6' },
                { icon: '🐛', label: 'Issues', value: station.repo.open_issues_count, color: '#ef4444' },
                { icon: '💻', label: 'Language', value: station.repo.language || 'Unknown', color: station.color },
              ].map(({ icon, label, value, color }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color, fontWeight: 700, fontSize: '1.05rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {value.toLocaleString()}
                    </div>
                    <div style={{ color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Tabs */}
            <div style={{
              display: 'flex',
              gap: 6,
              marginBottom: 14,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 10,
              padding: 4,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {CHART_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    background: activeTab === tab ? 'rgba(0,229,160,0.15)' : 'transparent',
                    color: activeTab === tab ? '#00e5a0' : '#64748b',
                    borderBottom: activeTab === tab ? '2px solid #00e5a0' : '2px solid transparent',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Charts */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: '14px 12px',
                  marginBottom: 16,
                }}
              >
                {activeTab === 'Overview' && barData && (
                  <>
                    <div style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      📊 Repository Metrics
                    </div>
                    <Bar data={barData} options={barOptions} />
                  </>
                )}
                {activeTab === 'Activity' && lineData && (
                  <>
                    <div style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      📈 Growth Timeline
                    </div>
                    <Line data={lineData} options={lineOptions} />
                  </>
                )}
                {activeTab === 'Distribution' && pieData && (
                  <>
                    <div style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      🥧 Health Breakdown
                    </div>
                    <Doughnut data={pieData} options={pieOptions} />
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Dates */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: 16,
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={13} color="#475569" />
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Created: <span style={{ color: '#94a3b8' }}>{new Date(station.repo.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TrendingUp size={13} color="#475569" />
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Last Updated: <span style={{ color: '#94a3b8' }}>{new Date(station.repo.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </span>
              </div>
              {station.repo.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Code size={13} color="#475569" />
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    Repo size: <span style={{ color: '#94a3b8' }}>{(station.repo.size / 1024).toFixed(1)} MB</span>
                  </span>
                </div>
              )}
            </div>

            {/* Topics */}
            {station.repo.topics && station.repo.topics.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#475569', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Topics
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {station.repo.topics.map(topic => (
                    <span key={topic} style={{
                      padding: '4px 10px',
                      background: 'rgba(0,229,160,0.08)',
                      border: '1px solid rgba(0,229,160,0.2)',
                      borderRadius: 20,
                      fontSize: '0.72rem',
                      color: '#00e5a0',
                      fontWeight: 500,
                    }}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub Link */}
            <a
              href={station.repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px',
                background: 'linear-gradient(135deg, rgba(0,229,160,0.15) 0%, rgba(59,130,246,0.1) 100%)',
                border: '1px solid rgba(0,229,160,0.3)',
                borderRadius: 12,
                color: '#00e5a0',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                transition: 'all 0.2s',
                boxShadow: '0 0 20px rgba(0,229,160,0.08)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'linear-gradient(135deg, rgba(0,229,160,0.25) 0%, rgba(59,130,246,0.15) 100%)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 30px rgba(0,229,160,0.18)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'linear-gradient(135deg, rgba(0,229,160,0.15) 0%, rgba(59,130,246,0.1) 100%)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 20px rgba(0,229,160,0.08)';
              }}
            >
              <ExternalLink size={16} />
              View on GitHub
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
