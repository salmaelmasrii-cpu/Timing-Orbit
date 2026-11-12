import UIKit
import Capacitor
import InMobiSDK

// MARK: - Capacitor Plugin
//
// Second, independent ad network alongside UnityAdsPlugin.swift.
// InMobi's SDK uses IMInterstitial for BOTH interstitial and rewarded formats —
// which one you get depends on how the placement is configured on the InMobi
// dashboard, not on the class you use in code.

@objc(InMobiAdsPlugin)
public class InMobiAdsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier   = "InMobiAdsPlugin"
    public let jsName       = "InMobiAds"
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

    private var rewardedAd: IMInterstitial?
    private var rewardedDelegate: InMobiInterstitialResolver?
    private var interstitialAd: IMInterstitial?
    private var interstitialDelegate: InMobiInterstitialResolver?
    private var bannerView: IMBanner?
    private var bannerDelegate: InMobiBannerResolver?
    private var bannerLoadCall: CAPPluginCall?

    // MARK: - initialize

    @objc func initialize(_ call: CAPPluginCall) {
        let accountId = call.getString("accountId") ?? ""
        guard !accountId.isEmpty else {
            call.reject("accountId is required")
            return
        }

        DispatchQueue.main.async {
            if InMobiAdsPlugin.sdkInitialized {
                print("[InMobiAds] Plugin already initialized")
                call.resolve()
                return
            }

            IMSdk.initWithAccountID(accountId, consentDictionary: nil, andCompletionHandler: { error in
                if let error {
                    print("[InMobiAds] Initialization failed: \(error.localizedDescription)")
                    call.reject("InMobi initialization failed: \(error.localizedDescription)")
                } else {
                    print("[InMobiAds] SDK initialized successfully")
                    InMobiAdsPlugin.sdkInitialized = true
                    call.resolve()
                }
            })
        }
    }

    // MARK: - loadRewardedAd

    @objc func loadRewardedAd(_ call: CAPPluginCall) {
        guard let placementId = placementIdArg(call) else { return }
        loadInterstitialClass(placementId: placementId) { [weak self] ad, errorMsg in
            if let errorMsg {
                call.reject(errorMsg)
            } else {
                self?.rewardedAd = ad
                call.resolve(["placementId": "\(placementId)"])
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

        guard let ad = rewardedAd, ad.placementId == placementId else {
            loadInterstitialClass(placementId: placementId) { [weak self] ad, errorMsg in
                if let errorMsg {
                    call.reject(errorMsg)
                } else {
                    self?.rewardedAd = ad
                    self?.showRewardedAd(call)
                }
            }
            return
        }

        print("[InMobiAds] Showing rewarded placement: \(placementId)")
        let resolver = InMobiInterstitialResolver(call: call, isRewarded: true) { [weak self] in
            self?.rewardedAd = nil
            self?.rewardedDelegate = nil
        }
        rewardedDelegate = resolver
        ad.delegate = resolver
        ad.show(from: viewController)
    }

    // MARK: - loadInterstitial

    @objc func loadInterstitial(_ call: CAPPluginCall) {
        guard let placementId = placementIdArg(call) else { return }
        loadInterstitialClass(placementId: placementId) { [weak self] ad, errorMsg in
            if let errorMsg {
                call.reject(errorMsg)
            } else {
                self?.interstitialAd = ad
                call.resolve(["placementId": "\(placementId)"])
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

        guard let ad = interstitialAd, ad.placementId == placementId else {
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

        print("[InMobiAds] Showing interstitial placement: \(placementId)")
        let resolver = InMobiInterstitialResolver(call: call, isRewarded: false) { [weak self] in
            self?.interstitialAd = nil
            self?.interstitialDelegate = nil
        }
        interstitialDelegate = resolver
        ad.delegate = resolver
        ad.show(from: viewController)
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

            let banner = IMBanner(
                frame: CGRect(x: 0, y: 0, width: 320, height: 50),
                placementId: Int64(placementId)
            )
            let delegate = InMobiBannerResolver(
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

            banner.load()
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

    /// Reads + validates the "placementId" string arg, converting to Int64
    /// (InMobi placement IDs are numeric, unlike Unity's string placement IDs).
    private func placementIdArg(_ call: CAPPluginCall) -> Int64? {
        let raw = call.getString("placementId") ?? ""
        guard let value = Int64(raw) else {
            call.reject("placementId must be a numeric InMobi placement ID, got: \(raw)")
            return nil
        }
        return value
    }

    private func loadInterstitialClass(placementId: Int64, completion: @escaping (_ ad: IMInterstitial?, _ errorMsg: String?) -> Void) {
        print("[InMobiAds] Loading placement: \(placementId)")
        DispatchQueue.main.async {
            let ad = IMInterstitial(placementId: placementId)
            let loadResolver = InMobiLoadResolver { errorMsg in
                if let errorMsg {
                    print("[InMobiAds] Failed to load \(placementId): \(errorMsg)")
                    completion(nil, errorMsg)
                } else {
                    print("[InMobiAds] Loaded placement: \(placementId)")
                    completion(ad, nil)
                }
            }
            // Keep the resolver alive for the duration of the load callback.
            objc_setAssociatedObject(ad, &AssociatedKeys.loadResolver, loadResolver, .OBJC_ASSOCIATION_RETAIN)
            ad.delegate = loadResolver
            ad.load()
        }
    }
}

private struct AssociatedKeys {
    static var loadResolver = "loadResolver"
}

// MARK: - Load-only delegate (used only until first load completes)

private final class InMobiLoadResolver: NSObject, IMInterstitialDelegate {
    private let completion: (_ errorMsg: String?) -> Void
    private var didComplete = false

    init(completion: @escaping (_ errorMsg: String?) -> Void) {
        self.completion = completion
    }

    func interstitialDidFinishLoading(_ interstitial: IMInterstitial) {
        guard !didComplete else { return }
        didComplete = true
        completion(nil)
    }

    func interstitial(_ interstitial: IMInterstitial, didFailToLoadWithError error: IMRequestStatus) {
        guard !didComplete else { return }
        didComplete = true
        completion("Ad failed to load: \(error.localizedDescription)")
    }
}

// MARK: - Show delegate (interstitial + rewarded share IMInterstitial)

private final class InMobiInterstitialResolver: NSObject, IMInterstitialDelegate {
    private let call: CAPPluginCall
    private let isRewarded: Bool
    private let onFinish: () -> Void
    private var didReward = false
    private var didResolve = false

    init(call: CAPPluginCall, isRewarded: Bool, onFinish: @escaping () -> Void) {
        self.call = call
        self.isRewarded = isRewarded
        self.onFinish = onFinish
    }

    func interstitialDidFinishLoading(_ interstitial: IMInterstitial) {
        // Not used in the show path — load already completed before show() was called.
    }

    func interstitial(_ interstitial: IMInterstitial, didFailToLoadWithError error: IMRequestStatus) {
        // Not used in the show path.
    }

    func interstitial(_ interstitial: IMInterstitial, didFailToPresentWithError error: IMRequestStatus) {
        guard !didResolve else { return }
        didResolve = true
        print("[InMobiAds] Ad failed to show: \(error.localizedDescription)")
        call.reject("Ad failed to show: \(error.localizedDescription)")
        onFinish()
    }

    func interstitial(_ interstitial: IMInterstitial, rewardActionCompletedWithRewards rewards: [String: Any]) {
        didReward = true
        print("[InMobiAds] Reward action completed: \(rewards)")
    }

    func interstitialDidDismiss(_ interstitial: IMInterstitial) {
        guard !didResolve else { return }
        didResolve = true
        print("[InMobiAds] Ad dismissed, rewarded: \(didReward)")
        if isRewarded {
            call.resolve(["placementId": "\(interstitial.placementId)", "rewarded": didReward])
        } else {
            call.resolve(["placementId": "\(interstitial.placementId)", "completed": true])
        }
        onFinish()
    }
}

// MARK: - Banner Delegate

private final class InMobiBannerResolver: NSObject, IMBannerDelegate {
    private let onLoad: () -> Void
    private let onError: (String) -> Void

    init(onLoad: @escaping () -> Void, onError: @escaping (String) -> Void) {
        self.onLoad = onLoad
        self.onError = onError
    }

    func bannerDidFinishLoading(_ banner: IMBanner) {
        print("[InMobiAds] Banner loaded")
        onLoad()
    }

    func banner(_ banner: IMBanner, didFailToLoadWithError error: IMRequestStatus) {
        print("[InMobiAds] Banner failed to load: \(error.localizedDescription)")
        onError("Banner failed to load: \(error.localizedDescription)")
    }
}
