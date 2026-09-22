import React from 'react';
import { SCENES } from '../scenes/sceneData';
import { ChevronUp } from 'lucide-react';

interface SceneNarrativeProps {
  currentSceneIndex: number;
  sceneProgress: number; // 0 to 1
  onRestart: () => void;
}

export const SceneNarrative: React.FC<SceneNarrativeProps> = ({
  currentSceneIndex,
  sceneProgress,
  onRestart,
}) => {
  const scene = SCENES[currentSceneIndex];
  if (!scene) return null;

  // Calculate narrative opacity curve:
  // Fades in gently (0.05 -> 0.25), stays prominent (0.25 -> 0.70), fades out toward transition (0.70 -> 0.95)
  // For hero scene (Scene 04 Damyaan Entry), text appears early and fades earlier so Damyaan is the focus!
  let opacity = 0;
  if (scene.isHero) {
    if (sceneProgress < 0.1) {
      opacity = sceneProgress / 0.1;
    } else if (sceneProgress <= 0.55) {
      opacity = 1;
    } else if (sceneProgress <= 0.8) {
      opacity = 1 - (sceneProgress - 0.55) / 0.25;
    } else {
      opacity = 0;
    }
  } else if (scene.isClimax) {
    // In climax, stays visible and unveils CTA
    if (sceneProgress < 0.15) {
      opacity = sceneProgress / 0.15;
    } else {
      opacity = 1;
    }
  } else {
    if (sceneProgress < 0.15) {
      opacity = sceneProgress / 0.15;
    } else if (sceneProgress <= 0.75) {
      opacity = 1;
    } else if (sceneProgress <= 0.92) {
      opacity = 1 - (sceneProgress - 0.75) / 0.17;
    } else {
      opacity = 0;
    }
  }

  // Slight vertical translateY parallax drift
  const translateY = (1 - opacity) * 16;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 25,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 'clamp(3.5rem, 9vh, 6rem)',
        paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
      }}
    >
      <div
        style={{
          maxWidth: scene.desktop.textMaxWidth,
          width: '100%',
          textAlign: 'center',
          opacity: Math.max(0, Math.min(1, opacity)),
          transform: `translateY(${translateY}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Ancient Eyebrow Tag */}
        {scene.eyebrow && (
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(0.62rem, 1.2vw, 0.75rem)',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: scene.colorAccent,
              marginBottom: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <span style={{ width: '18px', height: '1px', backgroundColor: scene.colorAccent, opacity: 0.6 }} />
            <span>{scene.eyebrow}</span>
            <span style={{ width: '18px', height: '1px', backgroundColor: scene.colorAccent, opacity: 0.6 }} />
          </div>
        )}

        {/* Main Heading */}
        <h2
          style={{
            fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
            fontSize: 'clamp(1.5rem, 4.2vw, 3rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#f8fafc',
            margin: '0 0 0.6rem 0',
            textShadow: `0 4px 24px rgba(0, 0, 0, 0.9), 0 0 35px ${scene.colorAccent}40`,
          }}
        >
          {scene.title}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(0.85rem, 1.8vw, 1.15rem)',
            fontWeight: 600,
            lineHeight: 1.45,
            letterSpacing: '0.15em',
            color: '#a7f3d0',
            margin: '0 0 0.5rem 0',
            textTransform: 'uppercase',
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.95)',
          }}
        >
          {scene.subtitle}
        </p>

        {/* Secondary Lore detail */}
        {scene.storyDetail && (
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(0.75rem, 1.3vw, 0.9rem)',
              fontWeight: 300,
              lineHeight: 1.6,
              letterSpacing: '0.04em',
              color: 'rgba(226, 232, 240, 0.8)',
              margin: '0.2rem 0 0 0',
              maxWidth: '460px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.95)',
            }}
          >
            {scene.storyDetail}
          </p>
        )}

        {/* Climax CTA: ENTER AGAIN button */}
        {scene.cta && sceneProgress > 0.45 && (
          <div
            style={{
              marginTop: '1.8rem',
              pointerEvents: 'auto',
              animation: 'ctaPulse 2.5s ease-in-out infinite',
            }}
          >
            <button
              onClick={onRestart}
              id="cta-enter-again"
              aria-label="Enter Again - Return to beginning of Damyaan's Lair"
              style={{
                fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
                fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#ffffff',
                backgroundColor: 'rgba(5, 150, 105, 0.25)',
                border: '1px solid rgba(52, 211, 153, 0.6)',
                padding: '0.9rem 2.2rem',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.45)';
                e.currentTarget.style.borderColor = '#6ee7b7';
                e.currentTarget.style.boxShadow = '0 0 35px rgba(16, 185, 129, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(5, 150, 105, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.6)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.35)';
              }}
            >
              <ChevronUp size={18} />
              <span>{scene.cta}</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.35); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.65); }
        }
      `}</style>
    </div>
  );
};
