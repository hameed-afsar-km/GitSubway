import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ArrowRight, TrainFront, Compass, MapPin, Search } from 'lucide-react';
import PrismBackground from '../components/PrismBackground';
import { GradientButton } from '../components/ui/gradient-button';

export function Home() {
  const [username, setUsername] = useState('');
  const [isEntering, setIsEntering] = useState(false);
  const navigate = useNavigate();

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
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <PrismBackground
          animationType="hover"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0.5} // Slight shift towards deep blues for the metro theme
          colorFrequency={1}
          noise={0.5}
          glow={1}
          suspendWhenOffscreen={true}
        />
      </div>

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
              <h1 className="prism-text-gradient" style={{
                fontSize: 'clamp(3rem, 10vw, 6rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                margin: '0 0 16px',
              }}>
                GitSubway
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#ffffffff',
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

              <GradientButton
                type="submit"
                disabled={!username.trim()}
                className="ml-2"
              >
                <span>Search Profile</span>
                <Search size={18} className="ml-2" />
              </GradientButton>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              style={{
                display: 'flex', gap: 24, marginTop: 40,
                color: '#fafafaff', fontSize: '0.85rem', fontWeight: 500
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
