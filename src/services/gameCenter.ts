import { registerPlugin } from '@capacitor/core';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// These IDs must exactly match what you create in App Store Connect
// (Your App -> Features -> Game Center).
export const GAME_CENTER_CONFIG = {
  LEADERBOARD_ID: 'timing_orbit_high_score',
  ACHIEVEMENTS: {
    FIRST_BULLSEYE: 'timing_orbit_first_bullseye',
    COMBO_10: 'timing_orbit_combo_10',
    COMBO_25: 'timing_orbit_combo_25',
  },
} as const;
// ──────────────────────────────────────────────────────────────────────────────

export interface GameCenterPluginInterface {
  authenticate(): Promise<{ authenticated: boolean }>;
  isAuthenticated(): Promise<{ authenticated: boolean }>;
  submitScore(options: { score: number; leaderboardId: string }): Promise<{ submitted: boolean }>;
  reportAchievement(options: { achievementId: string; percentComplete: number }): Promise<{ reported: boolean }>;
  showLeaderboard(): Promise<void>;
  showAchievements(): Promise<void>;
}

const GameCenterNative = registerPlugin<GameCenterPluginInterface>('GameCenter');

class GameCenterServiceClass {
  private authenticated = false;
  private reportedThisSession = new Set<string>();

  /**
   * Call once at startup (after splash), mirroring UnityAdsService.preload().
   * If the player isn't already signed into Game Center, iOS shows its own
   * login sheet automatically — we don't need to build any UI for that.
   */
  async authenticate(): Promise<void> {
    try {
      const result = await GameCenterNative.authenticate();
      this.authenticated = result.authenticated;
      console.log('[GameCenterService] Authenticated:', this.authenticated);
    } catch (e) {
      this.authenticated = false;
      console.warn('[GameCenterService] Authentication failed (user may have declined):', e);
    }
  }

  get isAuthenticated(): boolean {
    return this.authenticated;
  }

  /**
   * Submit the player's (new) high score to the leaderboard.
   * Safe to call every game over — Game Center only keeps the best score anyway.
   */
  async submitScore(score: number): Promise<void> {
    if (!this.authenticated || score <= 0) return;
    try {
      await GameCenterNative.submitScore({
        score,
        leaderboardId: GAME_CENTER_CONFIG.LEADERBOARD_ID,
      });
    } catch (e) {
      console.warn('[GameCenterService] submitScore failed:', e);
    }
  }

  /**
   * Report achievement progress. percentComplete defaults to 100 (one-shot unlock).
   * De-dupes 100%-complete achievements within a session so we don't spam calls.
   */
  async reportAchievement(achievementId: string, percentComplete = 100): Promise<void> {
    if (!this.authenticated) return;
    if (percentComplete >= 100 && this.reportedThisSession.has(achievementId)) return;

    try {
      await GameCenterNative.reportAchievement({ achievementId, percentComplete });
      if (percentComplete >= 100) this.reportedThisSession.add(achievementId);
    } catch (e) {
      console.warn('[GameCenterService] reportAchievement failed:', e);
    }
  }

  async showLeaderboard(): Promise<void> {
    if (!this.authenticated) {
      console.warn('[GameCenterService] Not authenticated — cannot show leaderboard');
      return;
    }
    try {
      await GameCenterNative.showLeaderboard();
    } catch (e) {
      console.warn('[GameCenterService] showLeaderboard failed:', e);
    }
  }

  async showAchievements(): Promise<void> {
    if (!this.authenticated) {
      console.warn('[GameCenterService] Not authenticated — cannot show achievements');
      return;
    }
    try {
      await GameCenterNative.showAchievements();
    } catch (e) {
      console.warn('[GameCenterService] showAchievements failed:', e);
    }
  }
}

export const GameCenterService = new GameCenterServiceClass();
