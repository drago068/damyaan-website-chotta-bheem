import React, { useState } from 'react';
import { Volume2, VolumeX, Menu, X, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { SCENES } from '../scenes/sceneData';

interface NavigationProps {
  currentSceneIndex: number;
  totalScenes: number;
  onSelectScene: (index: number) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentSceneIndex,
  totalScenes,
  onSelectScene,
}) => {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleSound = () => {
    const active = soundEngine.toggle();
    setIsAudioActive(active);
  };

  const currentScene = SCENES[currentSceneIndex] || SCENES[0];
  const formattedIndex = String(currentSceneIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalScenes).padStart(2, '0');

  return (
    <>
      {/* Top Header Bar */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: 'max(1.25rem, env(safe-area-inset-top)) max(1.5rem, env(safe-area-inset-right)) 1rem max(1.5rem, env(safe-area-inset-left))',
          pointerEvents: 'none',
        }}
      >
        {/* Top-Left: Logo & Subtitle */}
        <div style={{ pointerEvents: 'auto' }}>
          <h1
            style={{
              fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
              fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
              fontWeight: 900,
              letterSpacing: '0.22em',
              color: '#f8fafc',
              margin: 0,
              lineHeight: 1.1,
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            DAMYAAN
          </h1>
          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(0.55rem, 1vw, 0.68rem)',
              letterSpacing: '0.35em',
              color: '#34d399',
              margin: '0.2rem 0 0 0',
              textTransform: 'uppercase',
              opacity: 0.9,
            }}
          >
            THE FORBIDDEN LAIR
          </p>
        </div>

        {/* Top-Right: Sound toggle and Menu */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            pointerEvents: 'auto',
          }}
        >
          {/* Audio Ambient Toggle */}
          <button
            onClick={toggleSound}
            id="btn-sound-toggle"
            aria-label={isAudioActive ? 'Mute ambient sound' : 'Unmute ambient sound'}
            title={isAudioActive ? 'Mute temple drone' : 'Unmute temple drone'}
            style={{
              backgroundColor: isAudioActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${isAudioActive ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255, 255, 255, 0.12)'}`,
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isAudioActive ? '#6ee7b7' : '#94a3b8',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.25s ease',
            }}
          >
            {isAudioActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            id="btn-menu-open"
            aria-label="Open Chapter Index & Lore"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.72rem',
              letterSpacing: '0.2em',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#e2e8f0',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '0.55rem 1rem',
              borderRadius: '2px',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.6)';
              e.currentTarget.style.color = '#34d399';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#e2e8f0';
            }}
          >
            <Menu size={14} />
            <span className="hidden sm:inline">CHRONICLES</span>
          </button>
        </div>
      </header>

      {/* Bottom Bar: Chapter indicator & Scroll Cue */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 35,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '1rem max(1.5rem, env(safe-area-inset-right)) max(1.25rem, env(safe-area-inset-bottom)) max(1.5rem, env(safe-area-inset-left))',
          pointerEvents: 'none',
        }}
      >
        {/* Bottom-Left: Chapter 01 / 07 */}
        <div
          style={{
            pointerEvents: 'auto',
            fontFamily: "'Cinzel', serif",
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.45rem',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.3rem)',
              fontWeight: 800,
              color: currentScene.colorAccent,
              letterSpacing: '0.1em',
              textShadow: `0 0 15px ${currentScene.colorAccent}60`,
            }}
          >
            {formattedIndex}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.35)', fontWeight: 600 }}>
            / {formattedTotal}
          </span>
          <span
            className="hidden md:inline"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              color: 'rgba(226, 232, 240, 0.5)',
              marginLeft: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            — {currentScene.title}
          </span>
        </div>

        {/* Bottom-Right: Scroll to Descend */}
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(0.65rem, 1.1vw, 0.72rem)',
            letterSpacing: '0.25em',
            color: 'rgba(226, 232, 240, 0.65)',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            animation: 'scrollCueFloat 2.2s ease-in-out infinite',
          }}
        >
          <span>SCROLL TO DESCEND</span>
          <span style={{ color: '#10b981', fontSize: '0.9rem' }}>↓</span>
        </div>
      </footer>

      {/* Chapters & Lore Modal Drawer */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chronicles and Scene Directory"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(2, 5, 3, 0.88)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '85vh',
              overflowY: 'auto',
              backgroundColor: '#050a06',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '4px',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(16, 185, 129, 0.15)',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              id="btn-menu-close"
              aria-label="Close Chronicles"
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.5rem',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={16} color="#10b981" />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '0.7rem', letterSpacing: '0.3em', color: '#10b981' }}>
                SUBTERRANEAN CODEX
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
                fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                color: '#f8fafc',
                margin: '0 0 0.5rem 0',
                letterSpacing: '0.15em',
              }}
            >
              DAMYAAN'S LAIR
            </h2>

            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(226, 232, 240, 0.7)',
                marginBottom: '1.8rem',
              }}
            >
              Select any chapter below to traverse directly through the forbidden subterranean chambers.
            </p>

            {/* Chapter Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {SCENES.map((s, idx) => {
                const isActive = idx === currentSceneIndex;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectScene(idx);
                      setIsMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.1rem',
                      backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isActive ? 'rgba(52, 211, 153, 0.6)' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: '0.65rem',
                          letterSpacing: '0.2em',
                          color: s.colorAccent,
                          marginBottom: '0.2rem',
                        }}
                      >
                        CHAPTER {s.chapterNumber}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          color: isActive ? '#ffffff' : '#cbd5e1',
                        }}
                      >
                        {s.title}
                      </div>
                    </div>

                    <span
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '0.75rem',
                        color: s.colorAccent,
                        opacity: isActive ? 1 : 0.4,
                      }}
                    >
                      {isActive ? 'CURRENT' : 'JUMP →'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scrollCueFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </>
  );
};
