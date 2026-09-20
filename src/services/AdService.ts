import { AdRequest, NodeSkinId } from '../types/game';
import { UnityAdsService } from './unityAds';
import { InMobiAdsService } from './inmobiAds';

type AdCallback = {
  onAdLoaded?: () => void;
  onAdCompleted?: (rewardGranted: boolean) => void;
  onAdFailed?: (error: string) => void;
};

/**
 * AdServiceController
 * Wired to two independent ad networks — Unity Ads (primary) and InMobi
 * (fallback). Not true mediation (no bidding between them); simple rule:
 * try Unity first, and only reach for InMobi when Unity has no fill. This
 * maximizes fill rate without needing Unity LevelPlay's separate platform.
 * - Rewarded: shown for Revive, Double Orbs, Skin Preview
 * - Interstitial: shown every 3 game overs
 * - Banner: main menu only
 */
class AdServiceController {
  private gameOverCycles = 0;
  private isAdCurrentlyShowing = false;
  private bannerNetwork: 'unity' | 'inmobi' | null = null;

  // Legacy listeners kept for compatibility
  private showAdModalListeners: ((request: AdRequest, durationSec: number) => void)[] = [];
  private closeAdModalListeners: (() => void)[] = [];

  public registerShowAdListener(fn: (request: AdRequest, durationSec: number) => void) {
    this.showAdModalListeners.push(fn);
    return () => {
      this.showAdModalListeners = this.showAdModalListeners.filter((l) => l !== fn);
    };
  }

  public registerCloseAdListener(fn: () => void) {
    this.closeAdModalListeners.push(fn);
    return () => {
      this.closeAdModalListeners = this.closeAdModalListeners.filter((l) => l !== fn);
    };
  }

  /**
   * Call this once after app starts (e.g. after splash screen) to preload ads
   * on both networks.
   */
  public preloadAds(): void {
    console.log('[AdService] Preloading ads (Unity + InMobi)...');
    UnityAdsService.preload().catch((e) =>
      console.warn('[AdService] Unity preload error:', e)
    );
    UnityAdsService.loadBanner().catch(() => {});
    InMobiAdsService.preload().catch((e) =>
      console.warn('[AdService] InMobi preload error:', e)
    );
  }

  /**
   * Show the banner (currently used on the main menu only, hidden everywhere
   * else — including behind any modal — since it renders as a native view
   * above the WebView and would otherwise sit on top of modal content).
   * Tries Unity first; falls back to InMobi if Unity has no fill.
   */
  public showBannerAd(): void {
    UnityAdsService.showBanner()
      .then(() => {
        this.bannerNetwork = 'unity';
      })
      .catch((e) => {
        console.warn('[AdService] Unity showBannerAd error, trying InMobi:', e);
        this.bannerNetwork = 'inmobi';
        InMobiAdsService.showBanner().catch((e2) =>
          console.warn('[AdService] InMobi showBannerAd error:', e2)
        );
      });
  }

  public hideBannerAd(): void {
    UnityAdsService.hideBanner().catch((e) => console.warn('[AdService] hideBannerAd error:', e));
    InMobiAdsService.hideBanner().catch(() => {});
  }

  /**
   * Show a Rewarded Ad. Tries Unity first; falls back to InMobi if Unity
   * fails to load/show. Grants reward only if user watches the full ad,
   * on whichever network actually served it.
   */
  public async showRewardedAd(request: AdRequest, callbacks: AdCallback): Promise<void> {
    if (this.isAdCurrentlyShowing) {
      console.warn('[AdService] Ad already showing — ignoring request');
      return;
    }

    this.isAdCurrentlyShowing = true;
    console.log('[AdService] showRewardedAd:', request.type);

    try {
      callbacks.onAdLoaded?.();
      let rewarded: boolean;
      try {
        rewarded = await UnityAdsService.showRewarded();
        console.log('[AdService] Rewarded complete (Unity), rewarded:', rewarded);
      } catch (unityErr) {
        console.warn('[AdService] Unity rewarded failed, trying InMobi:', unityErr);
        rewarded = await InMobiAdsService.showRewarded();
        console.log('[AdService] Rewarded complete (InMobi), rewarded:', rewarded);
      }
      callbacks.onAdCompleted?.(rewarded);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AdService] Rewarded ad failed on both networks:', msg);
      callbacks.onAdFailed?.(msg);
    } finally {
      this.isAdCurrentlyShowing = false;
    }
  }

  /**
   * Called on every game over.
   * Shows an interstitial every 3rd game over.
   */
  public onGameOverCycle(callbacks?: AdCallback): boolean {
    this.gameOverCycles++;
    console.log('[AdService] Game over cycle:', this.gameOverCycles);

    if (this.gameOverCycles % 3 === 0) {
      console.log('[AdService] Showing interstitial (every 3rd game over)');
      this.showInterstitialAd(callbacks);
      return true;
    }
    return false;
  }

  /**
   * Tries Unity first; falls back to InMobi if Unity has no fill.
   */
  private async showInterstitialAd(callbacks?: AdCallback): Promise<void> {
    if (this.isAdCurrentlyShowing) return;
    this.isAdCurrentlyShowing = true;

    try {
      try {
        await UnityAdsService.showInterstitial();
        console.log('[AdService] Interstitial shown (Unity)');
      } catch (unityErr) {
        console.warn('[AdService] Unity interstitial failed, trying InMobi:', unityErr);
        await InMobiAdsService.showInterstitial();
        console.log('[AdService] Interstitial shown (InMobi)');
      }
      callbacks?.onAdCompleted?.(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AdService] Interstitial failed on both networks:', msg);
      callbacks?.onAdFailed?.(msg);
    } finally {
      this.isAdCurrentlyShowing = false;
    }
  }

  public isShowingAd(): boolean {
    return this.isAdCurrentlyShowing;
  }

  public completeCurrentAd(rewardGranted: boolean) {
    this.isAdCurrentlyShowing = false;
    this.closeAdModalListeners.forEach((fn) => fn());
  }

  public dismissCurrentAd(granted: boolean) {
    this.completeCurrentAd(granted);
  }

  // ─── Pre-configured helpers ──────────────────────────────────────────────────

  public requestReviveAd(onReviveSuccess: () => void, onFailed?: () => void) {
    this.showRewardedAd(
      {
        type: 'REVIVE',
        title: 'Revive Run',
        description: 'Watch a short ad to continue',
        rewardDescription: '1x Free Run Revive',
      },
      {
        onAdCompleted: (granted) => {
          if (granted) onReviveSuccess();
          else onFailed?.();
        },
        onAdFailed: (err) => {
          console.error('[AdService] Revive ad error:', err);
          onFailed?.();
        },
      }
    );
  }

  public requestDoubleOrbsAd(orbsEarned: number, onDoubleGranted: (extraOrbs: number) => void) {
    this.showRewardedAd(
      {
        type: 'DOUBLE_ORBS',
        title: 'Double Orbs',
        description: 'Watch an ad to double your orbs',
        rewardDescription: `+${orbsEarned} Bonus Orbs`,
      },
      {
        onAdCompleted: (granted) => {
          if (granted) onDoubleGranted(orbsEarned);
        },
        onAdFailed: (err) => console.error('[AdService] Double orbs ad error:', err),
      }
    );
  }

  public requestSkinRentalAd(skinId: NodeSkinId, skinName: string, onGranted: () => void) {
    this.showRewardedAd(
      {
        type: 'PREVIEW_SKIN',
        rewardSkinId: skinId,
        title: `Test Drive: ${skinName}`,
        description: `Watch an ad to try ${skinName} for 3 runs`,
        rewardDescription: `3 Free Trial Runs with ${skinName}`,
      },
      {
        onAdCompleted: (granted) => {
          if (granted) onGranted();
        },
        onAdFailed: (err) => console.error('[AdService] Skin rental ad error:', err),
      }
    );
  }
}

export const adService = new AdServiceController();
