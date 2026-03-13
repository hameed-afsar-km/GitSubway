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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 45,
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'absolute', bottom: 0, left: 0,
              width: '100%', maxHeight: '80vh',
              overflowY: 'auto', zIndex: 50,
              background: 'linear-gradient(160deg, rgba(6,8,24,0.98) 0%, rgba(4,6,16,0.99) 100%)',
              borderTop: '1px solid rgba(59,130,246,0.2)',
              borderRight: 'none',
              boxShadow: '0 -20px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(59,130,246,0.05)',
            }}
          >
            {/* Header */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 10,
              background: 'rgba(6,8,24,0.97)',
              backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(59,130,246,0.12)',
            padding: '16px 24px 12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  padding: 8, background: 'rgba(59,130,246,0.12)',
                  borderRadius: 10, display: 'flex', border: '1px solid rgba(59,130,246,0.2)',
                }}>
                  <Sparkles size={18} color="#3b82f6" />
                </div>
                  <div>
                    <h2 style={{ color: '#f0f6ff', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                      AI Developer Analysis
                    </h2>
                    <p style={{ color: '#475569', fontSize: '0.72rem', margin: 0 }}>
                      Powered by Google Gemini · {user?.login}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '1px solid rgba(239,68,68,0.4)',
                    background: 'rgba(239,68,68,0.12)',
                    color: '#ef4444', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.3)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)';
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'Repos', value: repos.length, icon: '📁' },
                  { label: 'Total Stars', value: totalStars.toLocaleString(), icon: '⭐' },
                  { label: 'Total Forks', value: totalForks.toLocaleString(), icon: '🍴' },
                  { label: 'Languages', value: langCount, icon: '💻' },
                  { label: 'Followers', value: user?.followers.toLocaleString() || '0', icon: '👥' },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem' }}>{icon} {value}</div>
                    <div style={{ color: '#475569', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: '0 20px', background: 'rgba(255,255,255,0.01)',
            }}>
              {AI_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 18px', border: 'none', background: 'transparent',
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    color: activeTab === tab ? '#3b82f6' : '#64748b',
                    borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                    transition: 'all 0.2s', marginBottom: -1,
                  }}
                >
                  {tab === 'AI Analysis' && <><Brain size={12} style={{ display: 'inline', marginRight: 5 }} />{tab}</>}
                  {tab === 'Language Stats' && <><Code2 size={12} style={{ display: 'inline', marginRight: 5 }} />{tab}</>}
                  {tab === 'Activity' && <><TrendingUp size={12} style={{ display: 'inline', marginRight: 5 }} />{tab}</>}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ padding: '20px 24px 32px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* AI Analysis Tab */}
                  {activeTab === 'AI Analysis' && (
                    <div style={{ maxWidth: 900, margin: '0 auto' }}>
                      {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 14 }}>
                          <div style={{
                            position: 'relative', width: 56, height: 56,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <div style={{
                              position: 'absolute', inset: 0, borderRadius: '50%',
                              border: '2px solid rgba(59,130,246,0.3)',
                              borderTopColor: '#3b82f6',
                              animation: 'spin 1s linear infinite',
                            }} />
                            <Sparkles size={20} color="#3b82f6" />
                          </div>
                          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                            Gemini is analyzing your developer profile…
                          </p>
                          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                      ) : (
                        <div className="markdown-body">
                          <Markdown>{insights || 'No insights available.'}</Markdown>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Language Stats Tab */}
                  {activeTab === 'Language Stats' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12, padding: '16px 14px',
                      }}>
                        <div style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                          🍕 Language Distribution
                        </div>
                        {langPieData && <Pie data={langPieData} options={pieOptions} />}
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12, padding: '16px 14px',
                      }}>
                        <div style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                          📊 Top Stars by Repo
                        </div>
                        {topReposData && <Bar data={topReposData} options={barOptions} />}
                      </div>
                    </div>
                  )}

                  {/* Activity Tab */}
                  {activeTab === 'Activity' && (
                    <div style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 12, padding: '16px 14px',
                    }}>
                      <div style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                        📈 Yearly Contribution Activity
                      </div>
                      {activityData && <Line data={activityData} options={activityOptions} />}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
