import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, GitFork, AlertCircle, Calendar, Code } from 'lucide-react';
import { MetroStationData } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsPanelProps {
  station: MetroStationData | null;
  onClose: () => void;
}

export function AnalyticsPanel({ station, onClose }: AnalyticsPanelProps) {
  const chartData = useMemo(() => {
    if (!station) return null;
    return {
      labels: ['Stars', 'Forks', 'Issues'],
      datasets: [
        {
          label: 'Repository Stats',
          data: [station.repo.stargazers_count, station.repo.forks_count, station.repo.open_issues_count],
          backgroundColor: [
            'rgba(250, 204, 21, 0.8)', // yellow-400
            'rgba(96, 165, 250, 0.8)', // blue-400
            'rgba(248, 113, 113, 0.8)', // red-400
          ],
          borderColor: [
            'rgb(250, 204, 21)',
            'rgb(96, 165, 250)',
            'rgb(248, 113, 113)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [station]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      }
    },
  };

  return (
    <AnimatePresence>
      {station && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 right-0 h-full w-96 bg-zinc-900/95 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto z-50 text-white shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mt-8">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: station.color }}
              />
              <h2 className="text-2xl font-bold tracking-tight truncate">
                {station.repo.name}
              </h2>
            </div>
            
            <p className="text-zinc-400 text-sm mb-6">
              {station.repo.description || 'No description provided.'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                <Star className="text-yellow-400 mb-2" size={24} />
                <span className="text-2xl font-semibold">{station.repo.stargazers_count}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Stars</span>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                <GitFork className="text-blue-400 mb-2" size={24} />
                <span className="text-2xl font-semibold">{station.repo.forks_count}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Forks</span>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                <AlertCircle className="text-red-400 mb-2" size={24} />
                <span className="text-2xl font-semibold">{station.repo.open_issues_count}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Issues</span>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                <Code className="text-emerald-400 mb-2" size={24} />
                <span className="text-lg font-semibold truncate w-full text-center">
                  {station.repo.language || 'Unknown'}
                </span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Language</span>
              </div>
            </div>

            {chartData && (
              <div className="mb-8 bg-zinc-800/30 p-4 rounded-xl border border-white/5">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Metrics Overview</h3>
                <Bar data={chartData} options={chartOptions} />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <Calendar size={16} className="text-zinc-500" />
                <span>Created: {new Date(station.repo.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <Calendar size={16} className="text-zinc-500" />
                <span>Updated: {new Date(station.repo.updated_at).toLocaleDateString()}</span>
              </div>
            </div>

            {station.repo.topics && station.repo.topics.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {station.repo.topics.map(topic => (
                    <span key={topic} className="px-2 py-1 bg-zinc-800 text-xs rounded-md text-zinc-300 border border-white/5">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <a
                href={station.repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
