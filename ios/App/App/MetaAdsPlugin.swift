import UIKit
import Capacitor
import FBAudienceNetwork

// MARK: - Capacitor Plugin
//
// Third, independent ad network alongside UnityAdsPlugin.swift and
// InMobiAdsPlugin.swift. Meta Audience Network uses separate classes per
// format (FBInterstitialAd, FBRewardedVideoAd, FBAdView), unlike InMobi
// which shares one class between interstitial and rewarded.

@objc(MetaAdsPlugin)
public class MetaAdsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier   = "MetaAdsPlugin"
    public let jsName       = "MetaAds"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize",      returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadRewardedAd",  returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showRewardedAd",  returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadInterstitial",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showInterstitial",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadBanner",      returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showBanner",      returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hideBanner",      returnType: CAPPluginReturnPromise),
    ]

    private static var sdkInitialized = false

    private var rewardedAd: FBRewardedVideoAd?
    private var rewardedDelegate: MetaRewardedResolver?
    private var interstitialAd: FBInterstitialAd?
    private var interstitialDelegate: MetaInterstitialResolver?
    private var bannerView: FBAdView?
    private var bannerDelegate: MetaBannerResolver?
    private var bannerLoadCall: CAPPluginCall?

    // MARK: - initialize

    @objc func initialize(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if MetaAdsPlugin.sdkInitialized {
                print("[MetaAds] Plugin already initialized")
                call.resolve()
                return
            }

            FBAudienceNetworkAds.initialize(with: nil) { result in
                print("[MetaAds] SDK initialized, success: \(result.isSuccess), message: \(result.message)")
                MetaAdsPlugin.sdkInitialized = true
                call.resolve()
            }
        }
    }

    // MARK: - loadRewardedAd

    @objc func loadRewardedAd(_ call: CAPPluginCall) {
        guard let placementId = placementIdArg(call) else { return }
        loadRewardedClass(placementId: placementId) { [weak self] ad, errorMsg in
            if let errorMsg {
                call.reject(errorMsg)
            } else {
                self?.rewardedAd = ad
                call.resolve(["placementId": placementId])
            }
        }
    }

    // MARK: - showRewardedAd

    @objc func showRewardedAd(_ call: CAPPluginCall) {
        guard let placementId = placementIdArg(call) else { return }
        guard let viewController = bridge?.viewController else {
            call.reject("No view controller available")
            return
        }

        guard let ad = rewardedAd, ad.placementID == placementId, ad.isAdValid else {
            loadRewardedClass(placementId: placementId) { [weak self] ad, errorMsg in
                if let errorMsg {
                    call.reject(errorMsg)
                } else {
                    self?.rewardedAd = ad
                    self?.showRewardedAd(call)
                }
            }
            return
        }

        print("[MetaAds] Showing rewarded placement: \(placementId)")
        let resolver = MetaRewardedResolver(call: call) { [weak self] in
            self?.rewardedAd = nil
            self?.rewardedDelegate = nil
        }
        rewardedDelegate = resolver
        ad.delegate = resolver
        ad.show(fromRootViewController: viewController)
    }

    // MARK: - loadInterstitial

    @objc func loadInterstitial(_ call: CAPPluginCall) {
        guard let placementId = placementIdArg(call) else { return }
        loadInterstitialClass(placementId: placementId) { [weak self] ad, errorMsg in
            if let errorMsg {
                call.reject(errorMsg)
            } else {
                self?.interstitialAd = ad
                call.resolve(["placementId": placementId])
            }
        }
    }

    // MARK: - showInterstitial

    @objc func showInterstitial(_ call: CAPPluginCall) {
        guard let placementId = placementIdArg(call) else { return }
        guard let viewController = bridge?.viewController else {
            call.reject("No view controller available")
            return
        }

        guard let ad = interstitialAd, ad.placementID == placementId, ad.isAdValid else {
            loadInterstitialClass(placementId: placementId) { [weak self] ad, errorMsg in
                if let errorMsg {
                    call.reject(errorMsg)
                } else {
                    self?.interstitialAd = ad
                    self?.showInterstitial(call)
                }
            }
            return
        }

        print("[MetaAds] Showing interstitial placement: \(placementId)")
        let resolver = MetaInterstitialResolver(call: call) { [weak self] in
            self?.interstitialAd = nil
            self?.interstitialDelegate = nil
        }
        interstitialDelegate = resolver
        ad.delegate = resolver
        ad.show(fromRootViewController: viewController)
    }

    // MARK: - loadBanner

    @objc func loadBanner(_ call: CAPPluginCall) {
        guard let placementId = placementIdArg(call) else { return }
        guard let viewController = bridge?.viewController else {
            call.reject("No view controller available")
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let self else { return }

            self.bannerView?.removeFromSuperview()

            let banner = FBAdView(
                placementID: placementId,
                adSize: kFBAdSizeHeight50Banner,
                rootViewController: viewController
            )
            let delegate = MetaBannerResolver(
                onLoad: { [weak self] in
                    self?.bannerLoadCall?.resolve()
                    self?.bannerLoadCall = nil
                },
                onError: { [weak self] errorMsg in
                    self?.bannerLoadCall?.reject(errorMsg)
                    self?.bannerLoadCall = nil
                }
            )
            banner.delegate = delegate
            self.bannerDelegate = delegate
            self.bannerView = banner
            self.bannerLoadCall = call

            banner.translatesAutoresizingMaskIntoConstraints = false
            banner.isHidden = true
            viewController.view.addSubview(banner)
            NSLayoutConstraint.activate([
                banner.centerXAnchor.constraint(equalTo: viewController.view.centerXAnchor),
                banner.widthAnchor.constraint(equalToConstant: 320),
                banner.heightAnchor.constraint(equalToConstant: 50),
                banner.bottomAnchor.constraint(
                    equalTo: viewController.view.safeAreaLayoutGuide.bottomAnchor, constant: -6
                ),
            ])

            banner.loadAd()
        }
    }

    // MARK: - showBanner / hideBanner

    @objc func showBanner(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            self?.bannerView?.isHidden = false
            call.resolve()
        }
    }

    @objc func hideBanner(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            self?.bannerView?.isHidden = true
            call.resolve()
        }
    }

    // MARK: - Private helpers

    private func placementIdArg(_ call: CAPPluginCall) -> String? {
        let raw = call.getString("placementId") ?? ""
        guard !raw.isEmpty else {
            call.reject("placementId is required")
            return nil
        }
        return raw
    }

    private func loadInterstitialClass(placementId: String, completion: @escaping (_ ad: FBInterstitialAd?, _ errorMsg: String?) -> Void) {
        print("[MetaAds] Loading interstitial placement: \(placementId)")
        DispatchQueue.main.async {
            let ad = FBInterstitialAd(placementID: placementId)
            let loadResolver = MetaInterstitialLoadResolver { errorMsg in
                if let errorMsg {
                    print("[MetaAds] Failed to load interstitial \(placementId): \(errorMsg)")
                    completion(nil, errorMsg)
                } else {
                    print("[MetaAds] Loaded interstitial placement: \(placementId)")
                    completion(ad, nil)
                }
            }
            objc_setAssociatedObject(ad, &AssociatedKeys.interstitialLoadResolver, loadResolver, .OBJC_ASSOCIATION_RETAIN)
            ad.delegate = loadResolver
            ad.load()
        }
    }

    private func loadRewardedClass(placementId: String, completion: @escaping (_ ad: FBRewardedVideoAd?, _ errorMsg: String?) -> Void) {
        print("[MetaAds] Loading rewarded placement: \(placementId)")
        DispatchQueue.main.async {
            let ad = FBRewardedVideoAd(placementID: placementId)
            let loadResolver = MetaRewardedLoadResolver { errorMsg in
                if let errorMsg {
                    print("[MetaAds] Failed to load rewarded \(placementId): \(errorMsg)")
                    completion(nil, errorMsg)
                } else {
                    print("[MetaAds] Loaded rewarded placement: \(placementId)")
                    completion(ad, nil)
                }
            }
            objc_setAssociatedObject(ad, &AssociatedKeys.rewardedLoadResolver, loadResolver, .OBJC_ASSOCIATION_RETAIN)
            ad.delegate = loadResolver
            ad.load()
        }
    }
}

private struct AssociatedKeys {
    static var interstitialLoadResolver = "interstitialLoadResolver"
    static var rewardedLoadResolver = "rewardedLoadResolver"
}

// MARK: - Interstitial load-only delegate (used only until first load completes)

private final class MetaInterstitialLoadResolver: NSObject, FBInterstitialAdDelegate {
    private let completion: (_ errorMsg: String?) -> Void
    private var didComplete = false

    init(completion: @escaping (_ errorMsg: String?) -> Void) {
        self.completion = completion
    }

    func interstitialAdDidLoad(_ interstitialAd: FBInterstitialAd) {
        guard !didComplete else { return }
        didComplete = true
        completion(nil)
    }

    func interstitialAd(_ interstitialAd: FBInterstitialAd, didFailWithError error: Error) {
        guard !didComplete else { return }
        didComplete = true
        completion("Ad failed to load: \(error.localizedDescription)")
    }
}

// MARK: - Interstitial show delegate

private final class MetaInterstitialResolver: NSObject, FBInterstitialAdDelegate {
    private let call: CAPPluginCall
    private let onFinish: () -> Void
    private var didResolve = false

    init(call: CAPPluginCall, onFinish: @escaping () -> Void) {
        self.call = call
        self.onFinish = onFinish
    }

    func interstitialAdDidLoad(_ interstitialAd: FBInterstitialAd) {
        // Not used in the show path — load already completed before show() was called.
    }

    func interstitialAd(_ interstitialAd: FBInterstitialAd, didFailWithError error: Error) {
        guard !didResolve else { return }
        didResolve = true
        print("[MetaAds] Interstitial failed to show: \(error.localizedDescription)")
        call.reject("Ad failed to show: \(error.localizedDescription)")
        onFinish()
    }

    func interstitialAdDidClose(_ interstitialAd: FBInterstitialAd) {
        guard !didResolve else { return }
        didResolve = true
        print("[MetaAds] Interstitial dismissed")
        call.resolve(["placementId": interstitialAd.placementID, "completed": true])
        onFinish()
    }
}

// MARK: - Rewarded load-only delegate

private final class MetaRewardedLoadResolver: NSObject, FBRewardedVideoAdDelegate {
    private let completion: (_ errorMsg: String?) -> Void
    private var didComplete = false

    init(completion: @escaping (_ errorMsg: String?) -> Void) {
        self.completion = completion
    }

    func rewardedVideoAdDidLoad(_ rewardedVideoAd: FBRewardedVideoAd) {
        guard !didComplete else { return }
        didComplete = true
        completion(nil)
    }

    func rewardedVideoAd(_ rewardedVideoAd: FBRewardedVideoAd, didFailWithError error: Error) {
        guard !didComplete else { return }
        didComplete = true
        completion("Ad failed to load: \(error.localizedDescription)")
    }
}

// MARK: - Rewarded show delegate

private final class MetaRewardedResolver: NSObject, FBRewardedVideoAdDelegate {
    private let call: CAPPluginCall
    private let onFinish: () -> Void
    private var didReward = false
    private var didResolve = false

    init(call: CAPPluginCall, onFinish: @escaping () -> Void) {
        self.call = call
        self.onFinish = onFinish
    }

    func rewardedVideoAdDidLoad(_ rewardedVideoAd: FBRewardedVideoAd) {
        // Not used in the show path — load already completed before show() was called.
    }

    func rewardedVideoAd(_ rewardedVideoAd: FBRewardedVideoAd, didFailWithError error: Error) {
        guard !didResolve else { return }
        didResolve = true
        print("[MetaAds] Rewarded failed to show: \(error.localizedDescription)")
        call.reject("Ad failed to show: \(error.localizedDescription)")
        onFinish()
    }

    /// Fired when the user watches the rewarded video to completion — this is
    /// what determines whether the reward should be granted (mirrors InMobi's
    /// rewardActionCompletedWithRewards).
    func rewardedVideoAdVideoComplete(_ rewardedVideoAd: FBRewardedVideoAd) {
        didReward = true
        print("[MetaAds] Rewarded video watched to completion")
    }

    func rewardedVideoAdDidClose(_ rewardedVideoAd: FBRewardedVideoAd) {
        guard !didResolve else { return }
        didResolve = true
        print("[MetaAds] Rewarded ad closed, rewarded: \(didReward)")
        call.resolve(["placementId": rewardedVideoAd.placementID, "rewarded": didReward])
        onFinish()
    }
}

// MARK: - Banner Delegate

private final class MetaBannerResolver: NSObject, FBAdViewDelegate {
    private let onLoad: () -> Void
    private let onError: (String) -> Void

    init(onLoad: @escaping () -> Void, onError: @escaping (String) -> Void) {
        self.onLoad = onLoad
        self.onError = onError
    }

    func adViewDidLoad(_ adView: FBAdView) {
        print("[MetaAds] Banner loaded")
        onLoad()
    }

    func adView(_ adView: FBAdView, didFailWithError error: Error) {
        print("[MetaAds] Banner failed to load: \(error.localizedDescription)")
        onError("Banner failed to load: \(error.localizedDescription)")
    }
}
