import React, { useEffect, useRef } from 'react';
import { SCENES } from '../scenes/sceneData';
import { frameLoader } from '../utils/frameLoader';
import { SceneConfig } from '../types/scene';

interface CinematicViewportProps {
  currentSceneIndex: number;
  sceneProgress: number; // 0.0 to 1.0 within the current scene
  isTransitioning?: boolean;
  nextSceneIndex?: number;
  transitionProgress?: number; // 0.0 to 1.0 crossfade
}

export const CinematicViewport: React.FC<CinematicViewportProps> = ({
  currentSceneIndex,
  sceneProgress,
  isTransitioning = false,
  nextSceneIndex,
  transitionProgress = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Store target and smoothed frame numbers in refs to avoid re-renders
  const frameStateRef = useRef({
    currentScene: currentSceneIndex,
    currentFrame: 1,
    targetFrame: 1,
    nextScene: nextSceneIndex,
    nextFrame: 1,
    isTransitioning: isTransitioning,
    transitionProgress: transitionProgress,
  });

  const lastImagesRef = useRef<{ [key: number]: HTMLImageElement }>({});

  // Keep state updated without re-rendering
  useEffect(() => {
    const scene = SCENES[currentSceneIndex];
    if (!scene) return;

    const targetFrameNumber = Math.max(
      1,
      Math.min(scene.frameCount, Math.round(sceneProgress * (scene.frameCount - 1)) + 1)
    );

    // If transitioning to a different scene, snap frame position immediately to prevent interpolating across scenes
    if (frameStateRef.current.currentScene !== currentSceneIndex) {
      frameStateRef.current.currentScene = currentSceneIndex;
      frameStateRef.current.currentFrame = targetFrameNumber;
    }

    frameStateRef.current.targetFrame = targetFrameNumber;
    frameStateRef.current.isTransitioning = isTransitioning;
    frameStateRef.current.nextScene = nextSceneIndex;
    frameStateRef.current.transitionProgress = transitionProgress;

    if (isTransitioning && nextSceneIndex !== undefined) {
      const nextScene = SCENES[nextSceneIndex];
      if (nextScene) {
        frameStateRef.current.nextFrame = Math.max(
          1,
          Math.min(nextScene.frameCount, Math.round(transitionProgress * (nextScene.frameCount * 0.15)) + 1)
        );
      }
    }

    frameLoader.setActiveScene(currentSceneIndex);
  }, [currentSceneIndex, sceneProgress, isTransitioning, nextSceneIndex, transitionProgress]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = Math.round(window.innerWidth * dpr);
      height = canvas.height = Math.round(window.innerHeight * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    const drawSceneFrame = (
      scene: SceneConfig,
      frameNum: number,
      targetCtx: CanvasRenderingContext2D,
      cWidth: number,
      cHeight: number,
      alpha: number = 1.0
    ) => {
      let img = frameLoader.getFrameImage(scene.index, Math.round(frameNum));
      if (img && img.complete && img.naturalWidth > 0) {
        lastImagesRef.current[scene.index] = img;
      } else if (lastImagesRef.current[scene.index]) {
        img = lastImagesRef.current[scene.index];
      }
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const isMobile = window.innerWidth < 768;
      const config = isMobile ? scene.mobile : scene.desktop;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const imgAspect = imgW / imgH; // 720 / 1280 = 0.5625

      targetCtx.save();
      targetCtx.globalAlpha = alpha;

      if (isMobile) {
        // Mobile portrait: fit cover with tuned object position
        let renderW = cWidth;
        let renderH = cWidth / imgAspect;

        if (renderH < cHeight) {
          renderH = cHeight;
          renderW = cHeight * imgAspect;
        }

        // Parse object-position percentage
        const posParts = config.objectPosition.split(' ');
        let posYPct = 0.5;
        if (posParts.length === 2 && posParts[1].endsWith('%')) {
          posYPct = parseFloat(posParts[1]) / 100;
        }

        const renderX = (cWidth - renderW) * 0.5;
        const renderY = (cHeight - renderH) * posYPct;

        targetCtx.drawImage(img, renderX, renderY, renderW, renderH);
      } else {
        // Desktop widescreen:
        // 1. Draw subtle ambient blurred background extension to gracefully fill widescreen viewports
        const bgScale = Math.max(cWidth / imgW, cHeight / imgH) * 1.05;
        const bgW = imgW * bgScale;
        const bgH = imgH * bgScale;
        const bgX = (cWidth - bgW) * 0.5;
        const bgY = (cHeight - bgH) * 0.5;

        targetCtx.save();
        targetCtx.filter = 'blur(30px) brightness(0.28) contrast(1.1)';
        targetCtx.drawImage(img, bgX, bgY, bgW, bgH);
        targetCtx.restore();

        // 2. Foreground high-clarity hero frame
        // On desktop, maintain vertical presentation with cinematic pillar framing or contained zoom
        let heroH = cHeight;
        let heroW = cHeight * imgAspect;

        // If screen is wider than standard, allow subtle scale
        const scale = config.scale || 1.0;
        heroW *= scale;
        heroH *= scale;

        const posParts = config.objectPosition.split(' ');
        let posYPct = 0.5;
        if (posParts.length === 2 && posParts[1].endsWith('%')) {
          posYPct = parseFloat(posParts[1]) / 100;
        }

        const heroX = (cWidth - heroW) * 0.5;
        const heroY = (cHeight - heroH) * posYPct;

        targetCtx.drawImage(img, heroX, heroY, heroW, heroH);

        // Soft side-feathering gradients to blend pillar edges seamlessly into dark background
        const fadeWidth = Math.max(20, (cWidth - heroW) * 0.5);
        if (fadeWidth > 0) {
          const leftGrad = targetCtx.createLinearGradient(heroX - 2, 0, heroX + 45, 0);
          leftGrad.addColorStop(0, 'rgba(2, 5, 3, 0.95)');
          leftGrad.addColorStop(1, 'rgba(2, 5, 3, 0)');
          targetCtx.fillStyle = leftGrad;
          targetCtx.fillRect(heroX - 2, 0, 47, cHeight);

          const rightGrad = targetCtx.createLinearGradient(heroX + heroW - 45, 0, heroX + heroW + 2, 0);
          rightGrad.addColorStop(0, 'rgba(2, 5, 3, 0)');
          rightGrad.addColorStop(1, 'rgba(2, 5, 3, 0.95)');
          targetCtx.fillStyle = rightGrad;
          targetCtx.fillRect(heroX + heroW - 45, 0, 47, cHeight);
        }
      }

      targetCtx.restore();
    };

    const render = () => {
      const state = frameStateRef.current;
      const currentScene = SCENES[state.currentScene];

      if (currentScene) {
        // Smooth frame interpolation (lerp)
        const frameDiff = state.targetFrame - state.currentFrame;
        // Fast yet smooth response
        state.currentFrame += frameDiff * 0.65;
        if (Math.abs(frameDiff) < 0.05) {
          state.currentFrame = state.targetFrame;
        }

        // Fill background with lair dark
        ctx.fillStyle = '#020503';
        ctx.fillRect(0, 0, width, height);

        // If in transition between scenes, draw both with crossfade
        if (state.isTransitioning && state.nextScene !== undefined && SCENES[state.nextScene]) {
          const nextScene = SCENES[state.nextScene];
          const t = Math.max(0, Math.min(1, state.transitionProgress));

          // Draw current scene fading out
          drawSceneFrame(currentScene, state.currentFrame, ctx, width, height, 1.0 - t);
          // Draw next scene fading in
          drawSceneFrame(nextScene, state.nextFrame, ctx, width, height, t);
        } else {
          // Standard single scene render
          drawSceneFrame(currentScene, state.currentFrame, ctx, width, height, 1.0);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100svh',
        zIndex: 10,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};
