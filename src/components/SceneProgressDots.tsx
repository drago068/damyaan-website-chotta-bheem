import React from 'react';
import { SCENES } from '../scenes/sceneData';

interface SceneProgressDotsProps {
  currentSceneIndex: number;
  onSelectScene: (index: number) => void;
}

export const SceneProgressDots: React.FC<SceneProgressDotsProps> = ({
  currentSceneIndex,
  onSelectScene,
}) => {
  return (
    <nav
      aria-label="Scene Navigator"
      style={{
        position: 'fixed',
        right: 'max(1.25rem, env(safe-area-inset-right))',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 35,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.9rem',
      }}
    >
      {SCENES.map((scene, idx) => {
        const isActive = idx === currentSceneIndex;
        return (
          <button
            key={scene.id}
            onClick={() => onSelectScene(idx)}
            aria-label={`Jump to Chapter ${scene.chapterNumber}: ${scene.title}`}
            aria-current={isActive ? 'step' : undefined}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '4px',
              position: 'relative',
              outline: 'none',
            }}
          >
            {/* Tooltip on hover (desktop only) */}
            <span
              className="hidden lg:block"
              style={{
                position: 'absolute',
                right: '28px',
                fontFamily: "'Cinzel', serif",
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                color: isActive ? scene.colorAccent : 'rgba(226, 232, 240, 0.4)',
                opacity: isActive ? 1 : 0,
                pointerEvents: 'none',
                transition: 'opacity 0.25s ease, transform 0.25s ease',
                transform: isActive ? 'translateX(0)' : 'translateX(6px)',
                textShadow: '0 2px 8px rgba(0,0,0,0.9)',
              }}
            >
              {scene.chapterNumber} · {scene.title}
            </span>

            {/* Custom Dot / Glyph indicator */}
            <div
              style={{
                width: isActive ? '8px' : '4px',
                height: isActive ? '24px' : '10px',
                backgroundColor: isActive ? scene.colorAccent : 'rgba(255, 255, 255, 0.22)',
                borderRadius: '2px',
                boxShadow: isActive ? `0 0 12px ${scene.colorAccent}` : 'none',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </button>
        );
      })}
    </nav>
  );
};
