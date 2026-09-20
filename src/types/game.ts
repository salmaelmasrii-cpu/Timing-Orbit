export enum GameState {
  SPLASH = 'SPLASH',
  MAIN_MENU = 'MAIN_MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  SETTINGS = 'SETTINGS',
  UNLOCKS = 'UNLOCKS',
  HOW_TO_PLAY = 'HOW_TO_PLAY',
  AD_VIEW = 'AD_VIEW',
}

export enum HitType {
  BULLSEYE = 'BULLSEYE',
  SAFE = 'SAFE',
  MISS_EARLY = 'MISS_EARLY',
  MISS_LATE = 'MISS_LATE',
}

export type ThemeId = 'geometric-balance' | 'cyber-neon' | 'solar-eclipse' | 'monochrome-precision' | 'emerald-glitch';
export type NodeSkinId = 'dot' | 'pulse' | 'halo' | 'quantum' | 'shuriken' | 'diamond' | 'star' | 'fireball';
export type TrailId = 'plasma' | 'flare' | 'scanline' | 'sparkles' | 'ribbon' | 'glitch';
export type AppIconId = 'dark' | 'light' | 'bubble';

export interface ThemeColors {
  id: ThemeId;
  name: string;
  dark: {
    bg: string;
    bgGradient: string;
    ringTrack: string;
    ringGlow: string;
    safeZone: string;
    safeZoneGlow: string;
    bullseye: string;
    bullseyeGlow: string;
    nodeFill: string;
    nodeGlow: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    feverAura: string;
    particleColors: string[];
    gridColor: string;
  };
  light: {
    bg: string;
    bgGradient: string;
    ringTrack: string;
    ringGlow: string;
    safeZone: string;
    safeZoneGlow: string;
    bullseye: string;
    bullseyeGlow: string;
    nodeFill: string;
    nodeGlow: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    feverAura: string;
    particleColors: string[];
    gridColor: string;
  };
}

export interface NodeSkin {
  id: NodeSkinId;
  name: string;
  description: string;
  unlockLevel: number;
  priceOrbs: number;
  icon: string;
}

export interface TrailEffect {
  id: TrailId;
  name: string;
  description: string;
  unlockLevel: number;
  priceOrbs: number;
}

export interface HitResult {
  type: HitType;
  points: number;
  combo: number;
  diffAngleDeg: number;
  diffTimeSec: number;
  timestamp: number;
  isDirectionReversed?: boolean;
}

export interface MissDetails {
  type: HitType.MISS_EARLY | HitType.MISS_LATE;
  angularDiffDeg: number;
  timeDiffSec: number;
  description: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'square' | 'spark' | 'ring' | 'diamond';
  rotation?: number;
  vRot?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  decay: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

export interface GameSettings {
  soundFX: boolean;
  melodicSynth: boolean;
  ambientDrone: boolean;
  haptics: boolean;
  themeId: ThemeId;
  isDarkMode: boolean;
}

export interface PlayerProfile {
  highScore: number;
  totalHits: number;
  totalBullseyes: number;
  gamesPlayed: number;
  maxComboEver: number;
  currentLevel: number;
  orbs: number;
  unlockedThemes: ThemeId[];
  unlockedSkins: NodeSkinId[];
  unlockedTrails: TrailId[];
  selectedTheme: ThemeId;
  selectedSkin: NodeSkinId;
  selectedTrail: TrailId;
  previewSkin: NodeSkinId | null;
  previewSkinRunsLeft: number;
  hasAcceptedPrivacyPolicy?: boolean;
  selectedAppIcon?: AppIconId;
}

export interface AdRequest {
  type: 'REVIVE' | 'DOUBLE_ORBS' | 'PREVIEW_SKIN' | 'INTERSTITIAL';
  rewardSkinId?: NodeSkinId;
  title: string;
  description: string;
  rewardDescription: string;
}

/**
 * Per-level procedural configuration (see src/config/levels.ts).
 * A "level" is a self-contained challenge: reach targetHits AND survive
 * minDurationSec (and, on EXTREME levels, reach comboGoal at least once)
 * to clear it. One miss fails the current level only (retry, no full reset).
 */
export interface LevelConfig {
  levelNumber: number;
  isExtreme: boolean;
  targetHits: number;
  minDurationSec: number;
  comboGoal: number | null;
  baseSpeed: number;
  waveAmplitude: number;
  wavePeriodSec: number;
  targetArcSpanDeg: number;
  bullseyeSpanDeg: number;
  directionFlipMinSec: number;
  directionFlipMaxSec: number;
}

export interface LevelProgress {
  hits: number;
  targetHits: number;
  elapsedSec: number;
  minDurationSec: number;
  comboGoal: number | null;
  bestComboThisLevel: number;
  isExtreme: boolean;
}

export interface LevelCompleteStats {
  levelNumber: number;
  isExtreme: boolean;
  runScore: number;
  maxCombo: number;
  orbsEarned: number;
  timeSec: number;
}
