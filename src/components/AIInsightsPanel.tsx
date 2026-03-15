import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, BarChart2, Brain, TrendingUp, Code2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { UserProfile, Repository } from '../types';
import { generateAIInsights } from '../services/aiInsights';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler
);

interface AIInsightsPanelProps {
  user: UserProfile | null;
  repos: Repository[];
  isOpen: boolean;
  onClose: () => void;
}

const AI_TABS = ['AI Analysis', 'Language Stats', 'Activity'] as const;
type AITab = typeof AI_TABS[number];

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', 'C#': '#178600', Go: '#00ADD8',
  Rust: '#dea584', PHP: '#4F5D95', HTML: '#e34c26', CSS: '#563d7c',
  Ruby: '#701516', Kotlin: '#A97BFF', Dart: '#00B4AB', Swift: '#F05138',
  Shell: '#89e051', Vue: '#41b883',
};

const getLangColor = (lang: string) => LANG_COLORS[lang] || `hsl(${lang.charCodeAt(0) * 17 % 360}, 70%, 60%)`;

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
      titleColor: '#3b82f6',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(59,130,246,0.2)',
      borderWidth: 1,
    },
  },
};

export function AIInsightsPanel({ user, repos, isOpen, onClose }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AITab>('AI Analysis');

  useEffect(() => {
    if (isOpen && user && repos.length > 0 && !insights) {
      setLoading(true);
      generateAIInsights(user, repos)
        .then(res => {
          setInsights(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setInsights('Failed to generate insights. Please check your API key configuration.');
          setLoading(false);
        });
    }
  }, [isOpen, user, repos, insights]);

  // Language breakdown
  const langData = useMemo(() => {
    if (!repos.length) return null;
    const langMap: Record<string, number> = {};
    repos.forEach(r => {
      if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
    });
    const sorted = Object.entries(langMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    return {
      labels: sorted.map(([lang]) => lang),
      datasets: [{
        label: 'Repositories',
        data: sorted.map(([, count]) => count),
        backgroundColor: sorted.map(([lang]) => getLangColor(lang) + 'cc'),
        borderColor: sorted.map(([lang]) => getLangColor(lang)),
        borderWidth: 1.5,
        borderRadius: 5,
      }],
    };
  }, [repos]);

  const langPieData = useMemo(() => {
    if (!repos.length) return null;
    const langMap: Record<string, number> = {};
    repos.forEach(r => {
      if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
    });
    const sorted = Object.entries(langMap).sort(([, a], [, b]) => b - a).slice(0, 8);
    return {
      labels: sorted.map(([lang]) => lang),
      datasets: [{
        data: sorted.map(([, count]) => count),
        backgroundColor: sorted.map(([lang]) => getLangColor(lang) + 'cc'),
        borderColor: 'rgba(8,12,32,0.8)',
        borderWidth: 2,
        hoverOffset: 6,
      }],
    };
  }, [repos]);

  // Activity over years
  const activityData = useMemo(() => {
    if (!repos.length) return null;
    const yearMap: Record<string, { count: number; stars: number }> = {};
    repos.forEach(r => {
      const year = new Date(r.created_at).getFullYear().toString();
      if (!yearMap[year]) yearMap[year] = { count: 0, stars: 0 };
      yearMap[year].count += 1;
      yearMap[year].stars += r.stargazers_count;
    });
    const years = Object.keys(yearMap).sort();
    return {
      labels: years,
      datasets: [
        {
          label: 'Repos Created',
          data: years.map(y => yearMap[y].count),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.12)',
          pointBackgroundColor: '#3b82f6',
          pointRadius: 4,
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Total Stars',
          data: years.map(y => yearMap[y].stars),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.06)',
          pointBackgroundColor: '#f59e0b',
          pointRadius: 4,
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };
  }, [repos]);

  // Top starred repos bar chart
  const topReposData = useMemo(() => {
    if (!repos.length) return null;
    const top = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 8);
    return {
      labels: top.map(r => r.name.length > 16 ? r.name.slice(0, 14) + '…' : r.name),
      datasets: [{
        label: '⭐ Stars',
        data: top.map(r => r.stargazers_count),
        backgroundColor: top.map(r => getLangColor(r.language || '') + 'aa'),
        borderColor: top.map(r => getLangColor(r.language || '')),
        borderWidth: 1.5,
        borderRadius: 6,
      }],
    };
  }, [repos]);

  const barOptions = {
    ...chartDefaults,
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(203,213,225,0.7)', font: { size: 10 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: 'rgba(203,213,225,0.8)', font: { size: 10 } },
      },
    },
  };

  const activityOptions = {
    ...chartDefaults,
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(203,213,225,0.7)', font: { size: 10 } }, position: 'left' as const },
      y1: { beginAtZero: true, grid: { display: false }, ticks: { color: 'rgba(245,158,11,0.8)', font: { size: 10 } }, position: 'right' as const },
      x: { grid: { display: false }, ticks: { color: 'rgba(203,213,225,0.7)', font: { size: 10 } } },
    },
  };

  const pieOptions = {
    ...chartDefaults,
    plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, position: 'right' as const } },
  };

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  const langCount = new Set(repos.map(r => r.language).filter(Boolean)).size;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Neural Fog) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.8)',
              backdropFilter: 'blur(8px)', zIndex: 500,
            }}
          />

          {/* Panel Container (Centered Wrapper) */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 510,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', pointerEvents: 'none'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                width: '100%', maxWidth: 1000, maxHeight: '90vh',
                background: 'linear-gradient(165deg, rgba(8, 12, 32, 0.95) 0%, rgba(4, 6, 16, 0.98) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 32, overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(0,0,0,0.8), inset 0 0 40px rgba(59,130,246,0.05)',
                display: 'flex', flexDirection: 'column',
                pointerEvents: 'auto'
              }}
            >
              {/* Header */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
                padding: '24px 32px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="gradient-button" style={{
                      width: 52, height: 52, borderRadius: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#3b82f6', border: 'none'
                    }}>
                      <Brain size={28} />
                    </div>
                    <div>
                      <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                        NEURAL ANALYSIS
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={12} color="#3b82f6" />
                        <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                          Quantum Core v2.0 · {user?.login}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#94a3b8', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Cyber Stats Grid */}
                <div style={{ 
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 
                }}>
                  {[
                    { label: 'Network Units', value: repos.length, color: '#3b82f6' },
                    { label: 'Stellar Stars', value: totalStars.toLocaleString(), color: '#f59e0b' },
                    { label: 'Syntaxes', value: langCount, color: '#10b981' },
                    { label: 'Active Reach', value: user?.followers.toLocaleString() || '0', color: '#8b5cf6' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 20, padding: '14px 18px', position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 12, right: 12, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                      <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.25rem', marginBottom: 2 }}>{value}</div>
                      <div style={{ color: '#475569', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div style={{
                display: 'flex', gap: 8, padding: '0 32px',
                background: 'rgba(6, 8, 24, 0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                {AI_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '18px 20px', border: 'none', background: 'transparent',
                      cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800,
                      color: activeTab === tab ? '#3b82f6' : '#475569',
                      position: 'relative', transition: 'all 0.3s'
                    }}
                  >
                    <span style={{ letterSpacing: '0.04em' }}>{tab.toUpperCase()}</span>
                    {activeTab === tab && (
                      <motion.div
                        layoutId="neuralTab"
                        style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          height: 3, background: '#3b82f6',
                          boxShadow: '0 0 15px rgba(59,130,246,0.6)'
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Scrollable Content */}
              <div style={{ 
                flex: 1, overflowY: 'auto', padding: '32px',
                scrollbarWidth: 'thin', scrollbarColor: 'rgba(59,130,246,0.3) transparent'
              }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'AI Analysis' && (
                      <div style={{ maxWidth: 900, margin: '0 auto' }}>
                        {loading ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: 20 }}>
                            <div className="neural-spinner" style={{
                              width: 64, height: 64, borderRadius: '50%',
                              border: '3px solid rgba(59,130,246,0.1)',
                              borderTopColor: '#3b82f6',
                              animation: 'neural-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                            }} />
                            <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.02em' }}>
                              DECODING DEVELOPER SIGNAL...
                            </p>
                            <style>{`@keyframes neural-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                          </div>
                        ) : (
                          <div className="markdown-body">
                            <Markdown>{insights || 'Neural log empty.'}</Markdown>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'Language Stats' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
                        <div style={{
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 24, padding: '24px',
                        }}>
                          <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
                            Syntax Frequency
                          </div>
                          {langPieData && <Pie data={langPieData} options={pieOptions} />}
                        </div>
                        <div style={{
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 24, padding: '24px',
                        }}>
                          <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
                            Velocity Metrics
                          </div>
                          {topReposData && <Bar data={topReposData} options={barOptions} />}
                        </div>
                      </div>
                    )}

                    {activeTab === 'Activity' && (
                      <div style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 24, padding: '24px',
                      }}>
                        <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
                          Temporal Impact Graph
                        </div>
                        {activityData && <Line data={activityData} options={activityOptions} />}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
