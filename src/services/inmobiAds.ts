import { registerPlugin } from '@capacitor/core';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// From publisher.inmobi.com — Timing Orbit app
export const INMOBI_CONFIG = {
  ACCOUNT_ID: '98c82c630b444946906e8df55d6e442f',
  APP_KEY: '10000233683',
  BANNER_PLACEMENT_ID: '10000818524',
  INTERSTITIAL_PLACEMENT_ID: '10000818525',
  REWARDED_PLACEMENT_ID: '10000818526',
} as const;
// ──────────────────────────────────────────────────────────────────────────────

export interface InMobiAdsPluginInterface {
  initialize(options: { accountId: string }): Promise<void>;
  loadRewardedAd(options: { placementId: string }): Promise<{ placementId: string }>;
  showRewardedAd(options: { placementId: string }): Promise<{ placementId: string; rewarded: boolean }>;
  loadInterstitial(options: { placementId: string }): Promise<{ placementId: string }>;
  showInterstitial(options: { placementId: string }): Promise<{ placementId: string; completed: boolean }>;
  loadBanner(options: { placementId: string }): Promise<void>;
  showBanner(): Promise<void>;
  hideBanner(): Promise<void>;
}

const InMobiAdsNative = registerPlugin<InMobiAdsPluginInterface>('InMobiAds');

// ─── Internal state ───────────────────────────────────────────────────────────
let rewardedLoaded = false;
let interstitialLoaded = false;
let bannerLoaded = false;
let bannerLoadPromise: Promise<void> | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

/**
 * InMobiAdsService
 * Second, independent ad network alongside Unity Ads (see unityAds.ts).
 * Not mediated — AdService.ts decides which network to call per ad slot
 * using simple rules (Unity first, InMobi as fallback when Unity has no fill).
 */
class InMobiAdsServiceClass {

  async initialize(): Promise<void> {
    if (initialized) return;
    if (initPromise) return initPromise;

    console.log('[InMobiAdsService] Initializing...');
    initPromise = InMobiAdsNative.initialize({ accountId: INMOBI_CONFIG.ACCOUNT_ID })
      .then(() => {
        initialized = true;
        console.log('[InMobiAdsService] ✅ Initialized');
      })
      .catch((e) => {
        console.warn('[InMobiAdsService] ⚠️ Initialization failed:', e);
        initialized = false;
      })
      .finally(() => {
        initPromise = null;
      });

    return initPromise;
  }

  /**
   * Preload rewarded + interstitial. Called once at startup, after Unity's preload.
   */
  async preload(): Promise<void> {
    await this.initialize();
    console.log('[InMobiAdsService] Starting preload...');

    try {
      await InMobiAdsNative.loadRewardedAd({ placementId: INMOBI_CONFIG.REWARDED_PLACEMENT_ID });
      rewardedLoaded = true;
      console.log('[InMobiAdsService] ✅ Rewarded ad loaded');
    } catch (e) {
      console.warn('[InMobiAdsService] ⚠️ Rewarded load failed:', e);
      rewardedLoaded = false;
    }

    try {
      await InMobiAdsNative.loadInterstitial({ placementId: INMOBI_CONFIG.INTERSTITIAL_PLACEMENT_ID });
      interstitialLoaded = true;
      console.log('[InMobiAdsService] ✅ Interstitial ad loaded');
    } catch (e) {
      console.warn('[InMobiAdsService] ⚠️ Interstitial load failed:', e);
      interstitialLoaded = false;
    }
  }

  // ─── Rewarded ───────────────────────────────────────────────────────────────

  async loadRewarded(): Promise<void> {
    await this.initialize();
    try {
      await InMobiAdsNative.loadRewardedAd({ placementId: INMOBI_CONFIG.REWARDED_PLACEMENT_ID });
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
      const result = await InMobiAdsNative.showRewardedAd({
        placementId: INMOBI_CONFIG.REWARDED_PLACEMENT_ID,
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
      await InMobiAdsNative.loadInterstitial({ placementId: INMOBI_CONFIG.INTERSTITIAL_PLACEMENT_ID });
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
      await InMobiAdsNative.showInterstitial({
        placementId: INMOBI_CONFIG.INTERSTITIAL_PLACEMENT_ID,
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

    bannerLoadPromise = InMobiAdsNative.loadBanner({ placementId: INMOBI_CONFIG.BANNER_PLACEMENT_ID })
      .then(() => {
        bannerLoaded = true;
      })
      .catch((e) => {
        console.warn('[InMobiAdsService] ⚠️ Banner load failed:', e);
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
      await InMobiAdsNative.showBanner();
    } catch (e) {
      console.warn('[InMobiAdsService] ⚠️ showBanner error:', e);
    }
  }

  async hideBanner(): Promise<void> {
    try {
      await InMobiAdsNative.hideBanner();
    } catch (e) {
      console.warn('[InMobiAdsService] ⚠️ hideBanner error:', e);
    }
  }
}

export const InMobiAdsService = new InMobiAdsServiceClass();
