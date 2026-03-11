import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ArrowRight, TrainFront, Compass, MapPin } from 'lucide-react';

export function Home() {
  const [username, setUsername] = useState('');
  const [isEntering, setIsEntering] = useState(false);
  const navigate = useNavigate();

  // Floating particles background effect
  const [particles, setParticles] = useState<{ x: number, y: number, s: number, d: number }[]>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 0.5 + Math.random() * 1.5,
        d: 2 + Math.random() * 4,
      }))
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsEntering(true);
      // Add a slight delay for the zoom/fade animation before navigating
      setTimeout(() => {
        navigate(`/subway/${username.trim()}`);
      }, 1200);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#040b16',
      color: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Dynamic Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        zIndex: 0
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(3)',
        transformOrigin: 'top center',
        zIndex: 0,
      }} />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          animate={{
            y: [p.y + '%', p.y - 20 + '%'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.d,
            repeat: Infinity,
            ease: "linear",
            delay: p.d * Math.random()
          }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            width: p.s,
            height: p.s,
            borderRadius: '50%',
            background: '#38bdf8',
            boxShadow: '0 0 10px #38bdf8',
            zIndex: 1
          }}
        />
      ))}

      {/* Main Content Container */}
      <AnimatePresence>
        {!isEntering ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              maxWidth: 600,
              padding: '0 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Logo Icon */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                width: 72, height: 72,
                borderRadius: 24,
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
                boxShadow: '0 0 40px rgba(37,99,235,0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
                position: 'relative'
              }}
            >
              <TrainFront size={36} color="#ffffff" strokeWidth={1.5} />
              <div style={{ position: 'absolute', inset: -4, border: '2px solid rgba(56,189,248,0.3)', borderRadius: 28 }} />
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ textAlign: 'center', marginBottom: 48 }}
            >
              <h1 style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: '0 0 16px',
                background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Board the <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>GitSubway</span>
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                maxWidth: 480,
                margin: '0 auto',
                lineHeight: 1.6
              }}>
                A beautiful, interactive 3D metro rail visualization of your entire GitHub developer journey.
              </p>
            </motion.div>

            {/* Interactive "Ticket" Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                padding: '8px',
                display: 'flex',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
                background: 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                <Github size={24} color="#64748b" />
              </div>

              <input
                type="text"
                placeholder="Enter a GitHub username..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  outline: 'none',
                  padding: '16px 0',
                  fontFamily: 'Inter, sans-serif'
                }}
              />

              <button
                type="submit"
                disabled={!username.trim()}
                style={{
                  background: username.trim() ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'rgba(255,255,255,0.05)',
                  color: username.trim() ? '#ffffff' : '#475569',
                  border: 'none',
                  borderRadius: 16,
                  padding: '0 28px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: username.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: username.trim() ? '0 0 20px rgba(37,99,235,0.4)' : 'none',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <span>Enter World</span>
                <ArrowRight size={18} />
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              style={{
                display: 'flex', gap: 24, marginTop: 40,
                color: '#475569', fontSize: '0.85rem', fontWeight: 500
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Compass size={16} /> Explorable 3D WebGL
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} /> Track Waypoints
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="hyperdrive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0,
              background: '#ffffff',
              zIndex: 50,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {/* Giant light blast transition effect */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
