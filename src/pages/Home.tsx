import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Train, Sparkles, Github, ArrowRight } from 'lucide-react';

export function Home() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/subway/${username.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBWMGgtLjV2NDBIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Sparkles className="text-emerald-400" size={16} />
            <span className="text-sm font-medium tracking-wide text-zinc-300">Powered by AI Insights</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            GitSubway
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 font-light leading-relaxed">
            Explore your GitHub like a Metro System. Transform your repositories into an interactive 3D network.
          </p>

          <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto mb-20">
            <div className="relative flex items-center">
              <Github className="absolute left-6 text-zinc-400" size={24} />
              <input
                type="text"
                placeholder="Enter GitHub username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-full py-6 pl-16 pr-32 text-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-2xl"
              />
              <button
                type="submit"
                disabled={!username.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-full px-6 py-3 transition-colors disabled:opacity-50 disabled:hover:bg-emerald-500 flex items-center gap-2"
              >
                Generate
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Map className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">3D Visualization</h3>
            <p className="text-zinc-400 leading-relaxed">
              Watch your repositories transform into interconnected stations along a chronological timeline.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl"
          >
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Train className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Interactive Journey</h3>
            <p className="text-zinc-400 leading-relaxed">
              Ride the train through your developer history, exploring languages, stars, and forks at each stop.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Insights</h3>
            <p className="text-zinc-400 leading-relaxed">
              Get intelligent analysis of your coding patterns, preferred languages, and project impact.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
