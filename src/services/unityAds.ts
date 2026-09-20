import { registerPlugin } from '@capacitor/core';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
export const UNITY_CONFIG = {
  GAME_ID: '800365846',
  REWARDED_PLACEMENT_ID: 'Rewarded_iOS',
  INTERSTITIAL_PLACEMENT_ID: 'Interstitial_iOS',
  // Create a placement with this exact ID in the Unity Ads dashboard
  // (Monetization > Placements > Add Placement > Banner) before this will fill.
  BANNER_PLACEMENT_ID: 'Banner_iOS',
} as const;
// ──────────────────────────────────────────────────────────────────────────────

export interface UnityAdsPluginInterface {
  initialize(options: { gameId: string; testMode: boolean }): Promise<void>;
  loadRewardedAd(options: { placementId: string }): Promise<{ placementId: string }>;
  showRewardedAd(options: { placementId: string }): Promise<{ placementId: string; rewarded: boolean }>;
  loadInterstitial(options: { placementId: string }): Promise<{ placementId: string }>;
  showInterstitial(options: { placementId: string }): Promise<{ placementId: string; completed: boolean }>;
  isAdLoaded(options: { placementId: string }): Promise<{ loaded: boolean }>;
  loadBanner(options: { placementId: string }): Promise<void>;
  showBanner(): Promise<void>;
  hideBanner(): Promise<void>;
  addListener(
    event: string,
    listener: (data: Record<string, unknown>) => void
  ): Promise<{ remove: () => void }>;
}

const UnityAdsNative = registerPlugin<UnityAdsPluginInterface>('UnityAds');

// ─── Internal state ───────────────────────────────────────────────────────────
let rewardedLoaded = false;
let interstitialLoaded = false;
let bannerLoaded = false;
let bannerLoadPromise: Promise<void> | null = null;

class UnityAdsServiceClass {

  /**
   * Preload both ad types. Called once at startup.
   * AppDelegate already initialized the SDK — we just load placements.
   */
  async preload(): Promise<void> {
    console.log('[UnityAdsService] Starting preload...');

    // Load rewarded
    try {
      await UnityAdsNative.loadRewardedAd({ placementId: UNITY_CONFIG.REWARDED_PLACEMENT_ID });
      rewardedLoaded = true;
      console.log('[UnityAdsService] ✅ Rewarded ad loaded');
    } catch (e) {
      console.warn('[UnityAdsService] ⚠️ Rewarded load failed:', e);
      rewardedLoaded = false;
    }

    // Load interstitial
    try {
      await UnityAdsNative.loadInterstitial({ placementId: UNITY_CONFIG.INTERSTITIAL_PLACEMENT_ID });
      interstitialLoaded = true;
      console.log('[UnityAdsService] ✅ Interstitial ad loaded');
    } catch (e) {
      console.warn('[UnityAdsService] ⚠️ Interstitial load failed:', e);
      interstitialLoaded = false;
    }
  }

  // ─── Rewarded ───────────────────────────────────────────────────────────────

  async loadRewarded(): Promise<void> {
    console.log('[UnityAdsService] Loading rewarded...');
    try {
      await UnityAdsNative.loadRewardedAd({ placementId: UNITY_CONFIG.REWARDED_PLACEMENT_ID });
      rewardedLoaded = true;
      console.log('[UnityAdsService] ✅ Rewarded loaded');
    } catch (e) {
      rewardedLoaded = false;
      console.warn('[UnityAdsService] ⚠️ Rewarded load error:', e);
      throw e;
    }
  }

  /**
   * Load (if not already loaded) then show rewarded ad.
   * Returns true if user earned the reward (watched full ad).
   */
  async showRewarded(): Promise<boolean> {
    console.log('[UnityAdsService] showRewarded called, loaded:', rewardedLoaded);

    if (!rewardedLoaded) {
      console.log('[UnityAdsService] Not loaded — loading now...');
      await this.loadRewarded();
    }

    try {
      console.log('[UnityAdsService] Calling showRewardedAd...');
      const result = await UnityAdsNative.showRewardedAd({
        placementId: UNITY_CONFIG.REWARDED_PLACEMENT_ID,
      });
      rewardedLoaded = false; // consumed — need to reload
      console.log('[UnityAdsService] Rewarded result:', result);

      // Reload for next time
      this.loadRewarded().catch(() => {});

      return result.rewarded;
    } catch (e) {
      rewardedLoaded = false;
      console.error('[UnityAdsService] ❌ showRewarded error:', e);
      throw e;
    }
  }

  // ─── Interstitial ────────────────────────────────────────────────────────────

  async loadInterstitial(): Promise<void> {
    console.log('[UnityAdsService] Loading interstitial...');
    try {
      await UnityAdsNative.loadInterstitial({ placementId: UNITY_CONFIG.INTERSTITIAL_PLACEMENT_ID });
      interstitialLoaded = true;
      console.log('[UnityAdsService] ✅ Interstitial loaded');
    } catch (e) {
      interstitialLoaded = false;
      console.warn('[UnityAdsService] ⚠️ Interstitial load error:', e);
      throw e;
    }
  }

  async showInterstitial(): Promise<void> {
    console.log('[UnityAdsService] showInterstitial called, loaded:', interstitialLoaded);

    if (!interstitialLoaded) {
      console.log('[UnityAdsService] Not loaded — loading now...');
      await this.loadInterstitial();
    }

    try {
      console.log('[UnityAdsService] Calling showInterstitial...');
      await UnityAdsNative.showInterstitial({
        placementId: UNITY_CONFIG.INTERSTITIAL_PLACEMENT_ID,
      });
      interstitialLoaded = false;
      console.log('[UnityAdsService] ✅ Interstitial completed');

      // Reload for next time
      this.loadInterstitial().catch(() => {});
    } catch (e) {
      interstitialLoaded = false;
      console.error('[UnityAdsService] ❌ showInterstitial error:', e);
      throw e;
    }
  }

  // ─── Banner ───────────────────────────────────────────────────────────────

  /**
   * Load the banner once (idempotent — safe to call repeatedly). Loaded hidden;
   * call showBanner()/hideBanner() to toggle visibility per screen.
   */
  async loadBanner(): Promise<void> {
    if (bannerLoaded) return;
    if (bannerLoadPromise) return bannerLoadPromise;

    console.log('[UnityAdsService] Loading banner...');
    bannerLoadPromise = UnityAdsNative.loadBanner({ placementId: UNITY_CONFIG.BANNER_PLACEMENT_ID })
      .then(() => {
        bannerLoaded = true;
        console.log('[UnityAdsService] ✅ Banner loaded');
      })
      .catch((e) => {
        console.warn('[UnityAdsService] ⚠️ Banner load failed (placement may not exist yet):', e);
        bannerLoaded = false;
      })
      .finally(() => {
        bannerLoadPromise = null;
      });

    return bannerLoadPromise;
  }

  async showBanner(): Promise<void> {
    await this.loadBanner();
    if (!bannerLoaded) return; // silently no-op if the placement isn't set up yet
    try {
      await UnityAdsNative.showBanner();
    } catch (e) {
      console.warn('[UnityAdsService] ⚠️ showBanner error:', e);
    }
  }

  async hideBanner(): Promise<void> {
    try {
      await UnityAdsNative.hideBanner();
    } catch (e) {
      console.warn('[UnityAdsService] ⚠️ hideBanner error:', e);
    }
  }
}

export const UnityAdsService = new UnityAdsServiceClass();
