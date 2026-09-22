import { SCENES } from '../scenes/sceneData';

class FrameLoader {
  private cache: Map<string, HTMLImageElement> = new Map();
  private loadingSet: Set<string> = new Set();
  private sceneLoadedCounts: number[] = SCENES.map(() => 0);
  private isMobile: boolean = false;
  private currentActiveScene: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 768;
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth < 768;
      });
    }
  }

  public getFrameKey(sceneIndex: number, frameNumber: number): string {
    return `${sceneIndex}_${frameNumber}`;
  }

  public getFrameUrl(sceneIndex: number, frameNumber: number): string {
    const scene = SCENES[sceneIndex];
    if (!scene) return '';
    const padded = String(Math.min(Math.max(1, frameNumber), scene.frameCount)).padStart(3, '0');
    return `/frames/${encodeURIComponent(scene.folderName)}/ezgif-frame-${padded}.jpg`;
  }

  public loadImage(sceneIndex: number, frameNumber: number): Promise<HTMLImageElement> {
    const key = this.getFrameKey(sceneIndex, frameNumber);
    if (this.cache.has(key)) {
      return Promise.resolve(this.cache.get(key)!);
    }

    if (this.loadingSet.has(key)) {
      // Return a promise that resolves once the image in cache is populated
      return new Promise((resolve) => {
        const check = () => {
          if (this.cache.has(key)) {
            resolve(this.cache.get(key)!);
          } else {
            setTimeout(check, 16);
          }
        };
        check();
      });
    }

    this.loadingSet.add(key);
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = this.getFrameUrl(sceneIndex, frameNumber);
      img.onload = () => {
        this.cache.set(key, img);
        this.loadingSet.delete(key);
        this.sceneLoadedCounts[sceneIndex]++;
        resolve(img);
      };
      img.onerror = () => {
        this.loadingSet.delete(key);
        // Fallback: resolve anyway to avoid hanging
        resolve(img);
      };
    });
  }

  public getFrameImage(sceneIndex: number, frameNumber: number): HTMLImageElement | null {
    const scene = SCENES[sceneIndex];
    if (!scene) return null;

    const clampedFrame = Math.min(Math.max(1, frameNumber), scene.frameCount);
    const exactKey = this.getFrameKey(sceneIndex, clampedFrame);
    if (this.cache.has(exactKey)) {
      return this.cache.get(exactKey)!;
    }

    // Trigger loading if not yet requested
    this.loadImage(sceneIndex, clampedFrame);

    // 1. Monotonic backward search: hold the most recent loaded past frame (<= clampedFrame)
    for (let f = clampedFrame - 1; f >= 1; f--) {
      const k = this.getFrameKey(sceneIndex, f);
      if (this.cache.has(k)) {
        return this.cache.get(k)!;
      }
    }

    // 2. If no past frame is loaded yet, find earliest available future frame (>= clampedFrame)
    for (let f = clampedFrame + 1; f <= scene.frameCount; f++) {
      const k = this.getFrameKey(sceneIndex, f);
      if (this.cache.has(k)) {
        return this.cache.get(k)!;
      }
    }

    return null;
  }

  /**
   * Preload critical initial frames (1..50) across all scenes so entering any chapter
   * and the entire sequence before and during the title card is 100% cached in memory
   */
  public async preloadInitial(onProgress: (percent: number) => void): Promise<void> {
    const openingFramesCount = 50;
    const totalToLoad = SCENES.reduce((acc, s) => acc + Math.min(openingFramesCount, s.frameCount), 0);
    let loaded = 0;

    const promises: Promise<HTMLImageElement>[] = [];

    for (let s = 0; s < SCENES.length; s++) {
      const scene = SCENES[s];
      const count = Math.min(openingFramesCount, scene.frameCount);
      for (let f = 1; f <= count; f++) {
        promises.push(
          this.loadImage(s, f).then((img) => {
            loaded++;
            onProgress(Math.min(95, Math.round((loaded / totalToLoad) * 100)));
            return img;
          })
        );
      }
    }

    await Promise.all(promises);
    onProgress(100);

    // Kick off progressive background caching for remaining frames
    this.startBackgroundStream(0);
  }

  /**
   * Update active scene from scroll position and dynamically prioritize frame prefetching
   */
  public setActiveScene(sceneIndex: number) {
    if (this.currentActiveScene === sceneIndex) return;
    this.currentActiveScene = sceneIndex;
    this.startBackgroundStream(sceneIndex);

    // Prune distant frames on mobile to save memory (while preserving opening 50 frames)
    if (this.isMobile) {
      this.pruneDistantScenes(sceneIndex);
    }
  }

  private backgroundQueueTimer: number | null = null;

  private startBackgroundStream(centerSceneIndex: number) {
    if (this.backgroundQueueTimer) {
      window.clearTimeout(this.backgroundQueueTimer);
    }

    const priorityScenes = [
      centerSceneIndex,
      centerSceneIndex + 1,
      centerSceneIndex - 1,
      centerSceneIndex + 2,
    ].filter((idx) => idx >= 0 && idx < SCENES.length);

    let currentPriorityIdx = 0;
    let currentFrame = 1;

    const streamNext = () => {
      if (currentPriorityIdx >= priorityScenes.length) return;
      const sIdx = priorityScenes[currentPriorityIdx];
      const scene = SCENES[sIdx];

      // Load consecutive frames without skipping for buttery smooth 60fps playback everywhere
      const step = 1;

      while (currentFrame <= scene.frameCount) {
        const frameToLoad = currentFrame;
        currentFrame += step;
        const key = this.getFrameKey(sIdx, frameToLoad);
        if (!this.cache.has(key) && !this.loadingSet.has(key)) {
          this.loadImage(sIdx, frameToLoad);
          // Yield to main thread
          this.backgroundQueueTimer = window.setTimeout(streamNext, 20);
          return;
        }
      }

      // Move to next priority scene
      currentPriorityIdx++;
      currentFrame = 1;
      this.backgroundQueueTimer = window.setTimeout(streamNext, 25);
    };

    this.backgroundQueueTimer = window.setTimeout(streamNext, 50);
  }

  private pruneDistantScenes(centerSceneIndex: number) {
    // Keep cached frames within distance <= 1, BUT ALWAYS preserve opening 50 frames of all scenes!
    for (const [key] of this.cache.entries()) {
      const [sIdxStr, fNumStr] = key.split('_');
      const sIdx = parseInt(sIdxStr, 10);
      const fNum = parseInt(fNumStr, 10);

      // Pin opening 50 frames of EVERY scene forever
      if (fNum <= 50) continue;

      if (Math.abs(sIdx - centerSceneIndex) > 1) {
        this.cache.delete(key);
      }
    }
  }
}

export const frameLoader = new FrameLoader();
