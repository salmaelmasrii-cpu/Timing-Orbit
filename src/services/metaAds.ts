import { registerPlugin } from '@capacitor/core';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// From business.facebook.com Monetization Manager — Timing Orbit app
export const META_CONFIG = {
  APP_ID: '2040164579959390',
  BANNER_PLACEMENT_ID: '2040164579959390_2040164719959376',
  INTERSTITIAL_PLACEMENT_ID: '2040164579959390_2040164713292710',
  REWARDED_PLACEMENT_ID: '2040164579959390_2040164703292711',
} as const;
// ──────────────────────────────────────────────────────────────────────────────

export interface MetaAdsPluginInterface {
  initialize(): Promise<void>;
  loadRewardedAd(options: { placementId: string }): Promise<{ placementId: string }>;
  showRewardedAd(options: { placementId: string }): Promise<{ placementId: string; rewarded: boolean }>;
  loadInterstitial(options: { placementId: string }): Promise<{ placementId: string }>;
  showInterstitial(options: { placementId: string }): Promise<{ placementId: string; completed: boolean }>;
  loadBanner(options: { placementId: string }): Promise<void>;
  showBanner(): Promise<void>;
  hideBanner(): Promise<void>;
}

const MetaAdsNative = registerPlugin<MetaAdsPluginInterface>('MetaAds');

// ─── Internal state ───────────────────────────────────────────────────────────
let rewardedLoaded = false;
let interstitialLoaded = false;
let bannerLoaded = false;
let bannerLoadPromise: Promise<void> | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

/**
 * MetaAdsService
 * Third, independent ad network alongside Unity Ads (primary) and InMobi
 * (secondary fallback) — see unityAds.ts / inmobiAds.ts.
 * Not mediated — AdService.ts decides which network to call per ad slot
 * using simple rules (Unity first, then InMobi, then Meta as last resort).
 */
class MetaAdsServiceClass {

  async initialize(): Promise<void> {
    if (initialized) return;
    if (initPromise) return initPromise;

    console.log('[MetaAdsService] Initializing...');
    initPromise = MetaAdsNative.initialize()
      .then(() => {
        initialized = true;
        console.log('[MetaAdsService] ✅ Initialized');
      })
      .catch((e) => {
        console.warn('[MetaAdsService] ⚠️ Initialization failed:', e);
        initialized = false;
      })
      .finally(() => {
        initPromise = null;
      });

    return initPromise;
  }

  /**
   * Preload rewarded + interstitial. Called once at startup, after Unity's
   * and InMobi's preload.
   */
  async preload(): Promise<void> {
    await this.initialize();
    console.log('[MetaAdsService] Starting preload...');

    try {
      await MetaAdsNative.loadRewardedAd({ placementId: META_CONFIG.REWARDED_PLACEMENT_ID });
      rewardedLoaded = true;
      console.log('[MetaAdsService] ✅ Rewarded ad loaded');
    } catch (e) {
      console.warn('[MetaAdsService] ⚠️ Rewarded load failed:', e);
      rewardedLoaded = false;
    }

    try {
      await MetaAdsNative.loadInterstitial({ placementId: META_CONFIG.INTERSTITIAL_PLACEMENT_ID });
      interstitialLoaded = true;
      console.log('[MetaAdsService] ✅ Interstitial ad loaded');
    } catch (e) {
      console.warn('[MetaAdsService] ⚠️ Interstitial load failed:', e);
      interstitialLoaded = false;
    }
  }

  // ─── Rewarded ───────────────────────────────────────────────────────────────

  async loadRewarded(): Promise<void> {
    await this.initialize();
    try {
      await MetaAdsNative.loadRewardedAd({ placementId: META_CONFIG.REWARDED_PLACEMENT_ID });
      rewardedLoaded = true;
    } catch (e) {
      rewardedLoaded = false;
      throw e;
    }
  }

  isRewardedReady(): boolean {
    return rewardedLoaded;
  }

  async showRewarded(): Promise<boolean> {
    if (!rewardedLoaded) {
      await this.loadRewarded();
    }
    try {
      const result = await MetaAdsNative.showRewardedAd({
        placementId: META_CONFIG.REWARDED_PLACEMENT_ID,
      });
      rewardedLoaded = false;
      this.loadRewarded().catch(() => {});
      return result.rewarded;
    } catch (e) {
      rewardedLoaded = false;
      throw e;
    }
  }

  // ─── Interstitial ────────────────────────────────────────────────────────────

  async loadInterstitial(): Promise<void> {
    await this.initialize();
    try {
      await MetaAdsNative.loadInterstitial({ placementId: META_CONFIG.INTERSTITIAL_PLACEMENT_ID });
      interstitialLoaded = true;
    } catch (e) {
      interstitialLoaded = false;
      throw e;
    }
  }

  isInterstitialReady(): boolean {
    return interstitialLoaded;
  }

  async showInterstitial(): Promise<void> {
    if (!interstitialLoaded) {
      await this.loadInterstitial();
    }
    try {
      await MetaAdsNative.showInterstitial({
        placementId: META_CONFIG.INTERSTITIAL_PLACEMENT_ID,
      });
      interstitialLoaded = false;
      this.loadInterstitial().catch(() => {});
    } catch (e) {
      interstitialLoaded = false;
      throw e;
    }
  }

  // ─── Banner ───────────────────────────────────────────────────────────────

  async loadBanner(): Promise<void> {
    await this.initialize();
    if (bannerLoaded) return;
    if (bannerLoadPromise) return bannerLoadPromise;

    bannerLoadPromise = MetaAdsNative.loadBanner({ placementId: META_CONFIG.BANNER_PLACEMENT_ID })
      .then(() => {
        bannerLoaded = true;
      })
      .catch((e) => {
        console.warn('[MetaAdsService] ⚠️ Banner load failed:', e);
        bannerLoaded = false;
      })
      .finally(() => {
        bannerLoadPromise = null;
      });

    return bannerLoadPromise;
  }

  async showBanner(): Promise<void> {
    await this.loadBanner();
    if (!bannerLoaded) return;
    try {
      await MetaAdsNative.showBanner();
    } catch (e) {
      console.warn('[MetaAdsService] ⚠️ showBanner error:', e);
    }
  }

  async hideBanner(): Promise<void> {
    try {
      await MetaAdsNative.hideBanner();
    } catch (e) {
      console.warn('[MetaAdsService] ⚠️ hideBanner error:', e);
    }
  }
}

export const MetaAdsService = new MetaAdsServiceClass();
