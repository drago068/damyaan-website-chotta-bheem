export interface SceneResponsiveConfig {
  objectPosition: string;
  scale?: number;
  textPosition: 'center' | 'bottom-left' | 'bottom-center' | 'top-center' | 'bottom-right';
  textMaxWidth: string;
}

export interface SceneConfig {
  id: string;
  index: number;
  chapterNumber: string; // e.g. "01"
  folderName: string;
  frameCount: number;
  title: string;
  subtitle: string;
  storyDetail?: string;
  eyebrow?: string;
  cta?: string;
  isClimax?: boolean;
  isHero?: boolean;
  colorAccent: string;
  vignetteStrength: number;
  scrollWeight: number; // proportional scroll space allocation
  desktop: SceneResponsiveConfig;
  mobile: SceneResponsiveConfig;
}
