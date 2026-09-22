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
import { soundEngine } from './utils/soundEngine';

gsap.registerPlugin(ScrollTrigger);

export const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextSceneIndex, setNextSceneIndex] = useState<number | undefined>(undefined);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const { lenis, scrollTo } = useLenis();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Set up single deterministic scroll engine (eliminates any boundary flicker or event competition)
  useEffect(() => {
    if (!isLoaded) return;

    const totalWeight = SCENES.reduce((acc, s) => acc + s.scrollWeight, 0);
    const sceneRanges = SCENES.map((scene, idx) => {
      const prevWeight = SCENES.slice(0, idx).reduce((acc, s) => acc + s.scrollWeight, 0);
      const start = prevWeight / totalWeight;
      const end = (prevWeight + scene.scrollWeight) / totalWeight;
      return { start, end };
    });

    let ticking = false;

    const syncScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        ticking = false;
        return;
      }

      const globalProgress = Math.max(0, Math.min(1, scrollY / maxScroll));

      // Find active scene deterministically - exactly ONE scene matches
      let activeIndex = 0;
      for (let i = 0; i < sceneRanges.length; i++) {
        if (globalProgress >= sceneRanges[i].start && (globalProgress < sceneRanges[i].end || i === sceneRanges.length - 1)) {
          activeIndex = i;
          break;
        }
      }

      const range = sceneRanges[activeIndex];
      const localProg = Math.max(0, Math.min(1, (globalProgress - range.start) / (range.end - range.start)));

      setCurrentSceneIndex(activeIndex);
      setSceneProgress(localProg);

      // Boundary soft crossfade
      if (localProg > 0.92 && activeIndex < SCENES.length - 1) {
        setIsTransitioning(true);
        setNextSceneIndex(activeIndex + 1);
        setTransitionProgress((localProg - 0.92) / 0.08);
      } else {
        setIsTransitioning(false);
        setNextSceneIndex(undefined);
        setTransitionProgress(0);
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(syncScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial sync
    syncScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [isLoaded]);

  // Unlock background audio on first interaction or once loaded
  useEffect(() => {
    if (isLoaded) {
      soundEngine.play();
    }
    const unlockAudio = () => {
      soundEngine.play();
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [isLoaded]);

  const handleSelectScene = useCallback(
    (index: number) => {
      const totalWeight = SCENES.reduce((acc, s) => acc + s.scrollWeight, 0);
      const prevWeight = SCENES.slice(0, index).reduce((acc, s) => acc + s.scrollWeight, 0);
      const targetProg = prevWeight / totalWeight;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const targetY = Math.round(targetProg * maxScroll);
      scrollTo(targetY, { offset: 0, duration: 1.2 });
    },
    [scrollTo]
  );

  const handleRestart = useCallback(() => {
    setIsAutoScrolling(false);
    soundEngine.restartFromBeginning();
    handleSelectScene(0);
  }, [handleSelectScene]);

  // Auto-scroll loop
  useEffect(() => {
    if (!isAutoScrolling) return;

    let animId: number;
    const speed = 2.85; // Calibrated swift cinematic velocity (~38 FPS playback)

    const step = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= maxScroll - 8) {
        setIsAutoScrolling(false);
        return;
      }

      if (lenis) {
        lenis.scrollTo(window.scrollY + speed, { immediate: true });
      } else {
        window.scrollBy(0, speed);
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    // Pause auto-scroll if user manually scrolls or drags
    const handleUserIntervention = () => {
      setIsAutoScrolling(false);
    };

    window.addEventListener('wheel', handleUserIntervention, { passive: true });
    window.addEventListener('touchmove', handleUserIntervention, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('wheel', handleUserIntervention);
      window.removeEventListener('touchmove', handleUserIntervention);
    };
  }, [isAutoScrolling, lenis]);

  const toggleAutoScroll = useCallback(() => {
    setIsAutoScrolling((prev) => {
      const next = !prev;
      if (next) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= maxScroll - 30) {
          handleRestart();
          return true;
        }
      }
      return next;
    });
  }, [handleRestart]);

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

      {/* Minimal HUD Navigation with Auto Tour toggle */}
      <Navigation
        currentSceneIndex={currentSceneIndex}
        totalScenes={SCENES.length}
        onSelectScene={handleSelectScene}
        isAutoScrolling={isAutoScrolling}
        onToggleAutoScroll={toggleAutoScroll}
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
