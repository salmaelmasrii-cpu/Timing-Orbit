import { GameSettings, PlayerProfile } from '../types/game';

const SETTINGS_KEY = 'timing_orbit_settings_v1';
const PROFILE_KEY = 'timing_orbit_profile_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  soundFX: true,
  melodicSynth: true,
  ambientDrone: true,
  haptics: true,
  themeId: 'monochrome-precision',
  isDarkMode: true,
};

export const DEFAULT_PROFILE: PlayerProfile = {
  highScore: 0,
  totalHits: 0,
  totalBullseyes: 0,
  gamesPlayed: 0,
  maxComboEver: 0,
  currentLevel: 1,
  orbs: 0,
  unlockedThemes: ['geometric-balance', 'cyber-neon', 'solar-eclipse', 'monochrome-precision', 'emerald-glitch'],
  unlockedSkins: ['dot'],
  unlockedTrails: ['plasma'],
  selectedTheme: 'monochrome-precision',
  selectedSkin: 'dot',
  selectedTrail: 'plasma',
  previewSkin: null,
  previewSkinRunsLeft: 0,
  hasAcceptedPrivacyPolicy: false,
  selectedAppIcon: 'dark',
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // LocalStorage write error ignored
  }
}

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      unlockedThemes: Array.from(new Set([...(parsed.unlockedThemes || []), ...DEFAULT_PROFILE.unlockedThemes])),
      unlockedSkins: Array.from(new Set([...(parsed.unlockedSkins || []), ...DEFAULT_PROFILE.unlockedSkins])),
      unlockedTrails: Array.from(new Set([...(parsed.unlockedTrails || []), ...DEFAULT_PROFILE.unlockedTrails])),
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // LocalStorage write error ignored
  }
}
