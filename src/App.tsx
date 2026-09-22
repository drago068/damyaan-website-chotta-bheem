import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCENES } from './scenes/sceneData';
import { CinematicViewport } from './components/CinematicViewport';
import { AtmosphereLayer } from './components/AtmosphereLayer';
import { SceneNarrative } from './components/SceneNarrative';
import { Navigation } from './components/Navigation';
import { SceneProgressDots } from './components/SceneProgressDots';
import { Preloader } from './components/Preloader';
import { useLenis } from './hooks/useLenis';

gsap.registerPlugin(ScrollTrigger);

export const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextSceneIndex, setNextSceneIndex] = useState<number | undefined>(undefined);
  const [transitionProgress, setTransitionProgress] = useState(0);

  const { scrollTo } = useLenis();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Set up ScrollTrigger instances for each scene
  useEffect(() => {
    if (!isLoaded) return;

    // Small delay to ensure layout has calculated
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();

      SCENES.forEach((_, index) => {
        const sectionEl = document.getElementById(`scene-trigger-${index}`);
        if (!sectionEl) return;

        ScrollTrigger.create({
          trigger: sectionEl,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            const prog = self.progress;

            // When this scene is active
            if (self.isActive) {
              setCurrentSceneIndex(index);
              setSceneProgress(prog);

              // Boundary transition logic:
              // When progress is between 0.88 and 1.0 and there is a next scene, initiate soft dissolve crossfade
              if (prog > 0.88 && index < SCENES.length - 1) {
                setIsTransitioning(true);
                setNextSceneIndex(index + 1);
                const tProg = (prog - 0.88) / 0.12;
                setTransitionProgress(tProg);
              } else {
                setIsTransitioning(false);
                setNextSceneIndex(undefined);
                setTransitionProgress(0);
              }
            }
          },
        });
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [isLoaded]);

  const handleSelectScene = useCallback(
    (index: number) => {
      const sectionEl = document.getElementById(`scene-trigger-${index}`);
      if (sectionEl) {
        scrollTo(sectionEl, { offset: 0, duration: 1.4 });
      }
    },
    [scrollTo]
  );

  const handleRestart = useCallback(() => {
    handleSelectScene(0);
  }, [handleSelectScene]);

  const activeScene = SCENES[currentSceneIndex] || SCENES[0];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        backgroundColor: '#020503',
        color: '#f8fafc',
        width: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      {/* Initial Preloader Screen */}
      {!isLoaded && <Preloader onComplete={() => setIsLoaded(true)} />}

      {/* Fixed Cinematic Viewport (The Core Video/Frame Canvas) */}
      <CinematicViewport
        currentSceneIndex={currentSceneIndex}
        sceneProgress={sceneProgress}
        isTransitioning={isTransitioning}
        nextSceneIndex={nextSceneIndex}
        transitionProgress={transitionProgress}
      />

      {/* Atmospheric Particle & Lighting Overlay */}
      <AtmosphereLayer
        colorAccent={activeScene.colorAccent}
        vignetteStrength={activeScene.vignetteStrength}
      />

      {/* Minimal HUD Navigation */}
      <Navigation
        currentSceneIndex={currentSceneIndex}
        totalScenes={SCENES.length}
        onSelectScene={handleSelectScene}
      />

      {/* Right Rail Scene Progress Indicator */}
      <SceneProgressDots
        currentSceneIndex={currentSceneIndex}
        onSelectScene={handleSelectScene}
      />

      {/* Text Narrative Overlays */}
      <SceneNarrative
        currentSceneIndex={currentSceneIndex}
        sceneProgress={sceneProgress}
        onRestart={handleRestart}
      />

      {/* Virtual Scroll Canvas Sections */}
      {/* Height scaled according to each scene's scrollWeight (180vh to 320vh) */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {SCENES.map((scene, idx) => {
          const sectionHeight = Math.round(scene.scrollWeight * 200);
          return (
            <section
              key={scene.id}
              id={`scene-trigger-${idx}`}
              style={{
                height: `${sectionHeight}vh`,
                position: 'relative',
                pointerEvents: 'none',
              }}
              aria-label={`Chapter ${scene.chapterNumber}: ${scene.title}`}
            />
          );
        })}
      </main>
    </div>
  );
};
