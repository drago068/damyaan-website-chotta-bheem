import React, { useEffect, useState } from 'react';
import { frameLoader } from '../utils/frameLoader';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [statusText, setStatusText] = useState('AWAKENING THE SERPENT...');

  useEffect(() => {
    let isMounted = true;

    frameLoader.preloadInitial((pct) => {
      if (!isMounted) return;
      setProgress(pct);
      if (pct < 30) {
        setStatusText('AWAKENING THE SERPENT...');
      } else if (pct < 70) {
        setStatusText('UNSEALING THE STONE CHAMBERS...');
      } else if (pct < 99) {
        setStatusText('REVEALING THE FORBIDDEN LAIR...');
      } else {
        setStatusText('THE LAIR IS OPEN');
      }
    }).then(() => {
      if (!isMounted) return;
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          onComplete();
        }, 900);
      }, 400);
    });

    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020503] transition-opacity duration-1000 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100svh',
        backgroundColor: '#020503',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isFading ? 0 : 1,
        pointerEvents: isFading ? 'none' : 'auto',
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(2, 5, 3, 0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Serpent Insignia */}
      <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '2rem' }}>
        {/* Outer Rotating Ancient Rune Ring */}
        <svg
          viewBox="0 0 100 100"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            animation: 'spinSlow 18s linear infinite',
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(16, 185, 129, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 6 12 6"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="rgba(212, 175, 55, 0.3)"
            strokeWidth="1"
            strokeDasharray="2 8"
          />
        </svg>

        {/* Pulsing Serpent Eye Emblem */}
        <div
          style={{
            position: 'absolute',
            inset: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'eyePulse 2.4s ease-in-out infinite',
          }}
        >
          <svg viewBox="0 0 60 60" width="48" height="48" fill="none">
            {/* Ouroboros / Serpentine curves */}
            <path
              d="M30 6 C42 6 52 16 52 30 C52 44 42 54 30 54 C18 54 8 44 8 30 C8 20 15 12 24 8"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="90"
              strokeDashoffset={90 - (progress / 100) * 90}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
            {/* Serpent Slit Eye */}
            <path
              d="M20 30 Q30 20 40 30 Q30 40 20 30 Z"
              fill="#064e3b"
              stroke="#34d399"
              strokeWidth="1.5"
            />
            <ellipse cx="30" cy="30" rx="2.5" ry="6.5" fill="#a7f3d0" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1
        style={{
          fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
          fontSize: 'clamp(1rem, 2.8vw, 1.4rem)',
          letterSpacing: '0.45em',
          color: '#e2e8f0',
          margin: '0 0 0.5rem 0.45em',
          textTransform: 'uppercase',
          textAlign: 'center',
          fontWeight: 700,
          textShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
        }}
      >
        DAMYAAN
      </h1>

      <p
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
          letterSpacing: '0.3em',
          color: '#6ee7b7',
          opacity: 0.85,
          margin: '0 0 2rem 0.3em',
          textTransform: 'uppercase',
        }}
      >
        ENTERING THE LAIR
      </p>

      {/* Progress Bar Container */}
      <div
        style={{
          width: 'clamp(180px, 40vw, 260px)',
          height: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '1px',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #059669 0%, #10b981 70%, #6ee7b7 100%)',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
            transition: 'width 0.25s ease-out',
          }}
        />
      </div>

      {/* Status & Numeric Percentage */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: 'clamp(180px, 40vw, 260px)',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          color: 'rgba(226, 232, 240, 0.5)',
          textTransform: 'uppercase',
        }}
      >
        <span>{statusText}</span>
        <span style={{ color: '#10b981', fontWeight: 600 }}>{progress}%</span>
      </div>

      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes eyePulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.4)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 14px rgba(16, 185, 129, 0.8)); }
        }
      `}</style>
    </div>
  );
};
