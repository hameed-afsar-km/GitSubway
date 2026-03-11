import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrainFront } from 'lucide-react';

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(onFinish, 800);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#060610',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Animated Background Rings */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2.5, opacity: 0.1 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeOut"
              }}
              style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                border: '2px solid #3b82f6',
                borderRadius: '50%',
              }}
            />
          ))}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ 
              width: 80, height: 80, 
              background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)'
            }}>
              <TrainFront size={40} color="white" />
            </div>

            <h1 className="prism-text-gradient" style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              letterSpacing: '-0.04em',
              margin: 0
            }}>
              GitSubway
            </h1>
            
            <motion.div 
              style={{ 
                height: 3, 
                background: '#3b82f6', 
                width: 0, 
                marginTop: 12,
                borderRadius: 2
              }}
              animate={{ width: 140 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            
            <p style={{ color: '#64748b', marginTop: 16, fontSize: '0.9rem', fontWeight: 500 }}>
              ESTABLISHING NEURAL TRACKS...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
