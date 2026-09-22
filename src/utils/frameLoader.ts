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

    // Search outward for ANY loaded frame in this scene to guarantee zero black frames
    for (let offset = 1; offset <= scene.frameCount; offset++) {
      const lower = clampedFrame - offset;
      if (lower >= 1) {
        const lKey = this.getFrameKey(sceneIndex, lower);
        if (this.cache.has(lKey)) return this.cache.get(lKey)!;
      }
      const upper = clampedFrame + offset;
      if (upper <= scene.frameCount) {
        const uKey = this.getFrameKey(sceneIndex, upper);
        if (this.cache.has(uKey)) return this.cache.get(uKey)!;
      }
    }

    return null;
  }

  /**
   * Preload critical initial frames across all scenes so entering any chapter is 100% instant
   */
  public async preloadInitial(onProgress: (percent: number) => void): Promise<void> {
    const scene0 = SCENES[0];
    const initialScene0Count = this.isMobile ? 25 : 40;
    const initialOtherCount = this.isMobile ? 10 : 15;
    const totalToLoad = initialScene0Count + (SCENES.length - 1) * initialOtherCount;
    let loaded = 0;

    const promises: Promise<HTMLImageElement>[] = [];

    // 1. Preload Scene 0 opening sequence
    for (let i = 1; i <= Math.min(initialScene0Count, scene0.frameCount); i++) {
      promises.push(
        this.loadImage(0, i).then((img) => {
          loaded++;
          onProgress(Math.min(95, Math.round((loaded / totalToLoad) * 100)));
          return img;
        })
      );
    }

    // 2. Preload opening frames for all subsequent chapters (01..06)
    for (let s = 1; s < SCENES.length; s++) {
      for (let f = 1; f <= initialOtherCount; f++) {
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

    // Prune distant frames on mobile to save memory
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

      // On mobile, skip every other frame during background prefetch to conserve memory and bandwidth
      const step = this.isMobile ? 2 : 1;

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
    // Keep cached frames within distance <= 1
    for (const [key] of this.cache.entries()) {
      const [sIdxStr] = key.split('_');
      const sIdx = parseInt(sIdxStr, 10);
      if (Math.abs(sIdx - centerSceneIndex) > 1) {
        this.cache.delete(key);
      }
    }
  }
}

export const frameLoader = new FrameLoader();
