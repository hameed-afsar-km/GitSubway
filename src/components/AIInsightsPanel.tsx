import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { UserProfile, Repository } from '../types';
import { generateAIInsights } from '../services/aiInsights';

interface AIInsightsPanelProps {
  user: UserProfile | null;
  repos: Repository[];
  isOpen: boolean;
  onClose: () => void;
}

export function AIInsightsPanel({ user, repos, isOpen, onClose }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          setInsights('Failed to generate insights.');
          setLoading(false);
        });
    }
  }, [isOpen, user, repos, insights]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute bottom-0 left-0 w-full md:w-1/2 lg:w-1/3 max-h-[60vh] bg-zinc-900/95 backdrop-blur-md border-t border-r border-white/10 p-6 overflow-y-auto z-40 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-tr-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Sparkles className="text-emerald-400" size={24} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">AI Insights</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="prose prose-invert prose-emerald max-w-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>Analyzing developer profile...</p>
              </div>
            ) : (
              <div className="markdown-body">
                <Markdown>{insights || 'No insights available.'}</Markdown>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
