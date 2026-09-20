import UIKit
import Capacitor
import UnityAds

// MARK: - Capacitor Plugin

@objc(UnityAdsPlugin)
public class UnityAdsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier   = "UnityAdsPlugin"
    public let jsName       = "UnityAds"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize",      returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadRewardedAd",  returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showRewardedAd",  returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadInterstitial",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showInterstitial",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isAdLoaded",      returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadBanner",      returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showBanner",      returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hideBanner",      returnType: CAPPluginReturnPromise),
    ]

    private var rewardedAd: UADSRewardedAd?
    private var rewardedPlacementId: String?
    private var rewardedShowResolver: UnityAdsRewardedShowResolver?
    private var interstitialAd: UADSInterstitialAd?
    private var interstitialPlacementId: String?
    private var interstitialShowResolver: UnityAdsInterstitialShowResolver?
    private var bannerView: UADSBannerView?
    private var bannerDelegate: UnityAdsBannerDelegate?
    private var bannerLoadCall: CAPPluginCall?
    private var bannerBottomConstraint: NSLayoutConstraint?

    // MARK: - initialize

    @objc func initialize(_ call: CAPPluginCall) {
        let gameId   = call.getString("gameId") ?? ""
        let testMode = call.getBool("testMode") ?? true

        guard !gameId.isEmpty else {
            call.reject("gameId is required")
            return
        }

        let configuration = UADSInitializationConfigurationBuilder(gameId: gameId)
            .with(testMode: testMode)
            .build()

        DispatchQueue.main.async {
            if UnityAds.isInitialized() {
                print("[UnityAds] Plugin already initialized")
                call.resolve()
                return
            }

            UnityAds.initialize(configuration) { error in
                if let error {
                    print("[UnityAds] Plugin initialization failed: \(error)")
                    call.reject("Unity Ads initialization failed: \(error)")
                } else {
                    print("[UnityAds] Plugin initialized successfully")
                    call.resolve()
                }
            }
        }
    }

    // MARK: - loadRewardedAd

    @objc func loadRewardedAd(_ call: CAPPluginCall) {
        let placementId = call.getString("placementId") ?? ""
        guard !placementId.isEmpty else {
            call.reject("placementId is required")
            return
        }

        loadRewardedAd(placementId: placementId) { errorMsg in
            if let errorMsg {
                call.reject(errorMsg)
            } else {
                call.resolve(["placementId": placementId])
            }
        }
    }

    // MARK: - showRewardedAd

    @objc func showRewardedAd(_ call: CAPPluginCall) {
        let placementId = call.getString("placementId") ?? ""
        guard !placementId.isEmpty else {
            call.reject("placementId is required")
            return
        }
        showRewardedAd(placementId: placementId, call: call)
    }

    // MARK: - loadInterstitial

    @objc func loadInterstitial(_ call: CAPPluginCall) {
        let placementId = call.getString("placementId") ?? ""
        guard !placementId.isEmpty else {
            call.reject("placementId is required")
            return
        }

        loadInterstitial(placementId: placementId) { errorMsg in
            if let errorMsg {
                call.reject(errorMsg)
            } else {
                call.resolve(["placementId": placementId])
            }
        }
    }

    // MARK: - showInterstitial

    @objc func showInterstitial(_ call: CAPPluginCall) {
        let placementId = call.getString("placementId") ?? ""
        guard !placementId.isEmpty else {
            call.reject("placementId is required")
            return
        }
        showInterstitial(placementId: placementId, call: call)
    }

    // MARK: - loadBanner

    @objc func loadBanner(_ call: CAPPluginCall) {
        let placementId = call.getString("placementId") ?? ""
        guard !placementId.isEmpty else {
            call.reject("placementId is required")
            return
        }
        guard let viewController = bridge?.viewController else {
            call.reject("No view controller available")
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let self else { return }

            // Tear down any existing banner before loading a fresh one.
            self.bannerView?.removeFromSuperview()

            let banner = UADSBannerView(placementId: placementId, size: CGSize(width: 320, height: 50))
            let delegate = UnityAdsBannerDelegate(
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
            ])
            let bottomConstraint = banner.bottomAnchor.constraint(
                equalTo: viewController.view.safeAreaLayoutGuide.bottomAnchor, constant: -6
            )
            bottomConstraint.isActive = true
            self.bannerBottomConstraint = bottomConstraint

            banner.load()
        }
    }

    // MARK: - showBanner

    @objc func showBanner(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            self?.bannerView?.isHidden = false
            call.resolve()
        }
    }

    // MARK: - hideBanner

    @objc func hideBanner(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            self?.bannerView?.isHidden = true
            call.resolve()
        }
    }

    // MARK: - isAdLoaded

    @objc func isAdLoaded(_ call: CAPPluginCall) {
        let placementId = call.getString("placementId") ?? ""
        guard !placementId.isEmpty else {
            call.reject("placementId is required")
            return
        }
        let loaded = rewardedPlacementId == placementId || interstitialPlacementId == placementId
        call.resolve(["loaded": loaded])
    }

    // MARK: - Private helpers: Rewarded

    private func loadRewardedAd(placementId: String, completion: @escaping (_ errorMsg: String?) -> Void) {
        print("[UnityAds] Loading rewarded placement: \(placementId)")
        let configuration = UADSLoadConfigurationBuilder(placementId: placementId).build()

        DispatchQueue.main.async {
            UADSRewardedAd.load(configuration) { [weak self] ad, error in
                if let error {
                    print("[UnityAds] Failed to load rewarded \(placementId): \(error)")
                    completion("Ad failed to load: \(error)")
                    return
                }
                guard let ad else {
                    completion("Ad failed to load: no ad returned")
                    return
                }
                print("[UnityAds] Loaded rewarded placement: \(placementId)")
                self?.rewardedAd = ad
                self?.rewardedPlacementId = placementId
                completion(nil)
            }
        }
    }

    private func showRewardedAd(placementId: String, call: CAPPluginCall) {
        guard let viewController = bridge?.viewController else {
            call.reject("No view controller available")
            return
        }

        if rewardedAd == nil || rewardedPlacementId != placementId {
            loadRewardedAd(placementId: placementId) { [weak self] errorMsg in
                if let errorMsg {
                    call.reject(errorMsg)
                } else {
                    self?.showRewardedAd(placementId: placementId, call: call)
                }
            }
            return
        }

        guard let rewardedAd else {
            call.reject("Rewarded ad is not loaded")
            return
        }

        print("[UnityAds] Showing rewarded placement: \(placementId)")
        let configuration = UADSShowConfigurationBuilder()
            .with(viewController: viewController)
            .build()
        let resolver = UnityAdsRewardedShowResolver(call: call) { [weak self] in
            self?.rewardedAd = nil
            self?.rewardedPlacementId = nil
            self?.rewardedShowResolver = nil
        }
        rewardedShowResolver = resolver
        rewardedAd.show(configuration, delegate: resolver)
    }

    // MARK: - Private helpers: Interstitial

    private func loadInterstitial(placementId: String, completion: @escaping (_ errorMsg: String?) -> Void) {
        print("[UnityAds] Loading interstitial placement: \(placementId)")
        let configuration = UADSLoadConfigurationBuilder(placementId: placementId).build()

        DispatchQueue.main.async {
            UADSInterstitialAd.load(configuration) { [weak self] ad, error in
                if let error {
                    print("[UnityAds] Failed to load interstitial \(placementId): \(error)")
                    completion("Ad failed to load: \(error)")
                    return
                }
                guard let ad else {
                    completion("Ad failed to load: no ad returned")
                    return
                }
                print("[UnityAds] Loaded interstitial placement: \(placementId)")
                self?.interstitialAd = ad
                self?.interstitialPlacementId = placementId
                completion(nil)
            }
        }
    }

    private func showInterstitial(placementId: String, call: CAPPluginCall) {
        guard let viewController = bridge?.viewController else {
            call.reject("No view controller available")
            return
        }

        if interstitialAd == nil || interstitialPlacementId != placementId {
            loadInterstitial(placementId: placementId) { [weak self] errorMsg in
                if let errorMsg {
                    call.reject(errorMsg)
                } else {
                    self?.showInterstitial(placementId: placementId, call: call)
                }
            }
            return
        }

        guard let interstitialAd else {
            call.reject("Interstitial ad is not loaded")
            return
        }

        print("[UnityAds] Showing interstitial placement: \(placementId)")
        let configuration = UADSShowConfigurationBuilder()
            .with(viewController: viewController)
            .build()
        let resolver = UnityAdsInterstitialShowResolver(call: call) { [weak self] in
            self?.interstitialAd = nil
            self?.interstitialPlacementId = nil
            self?.interstitialShowResolver = nil
        }
        interstitialShowResolver = resolver
        interstitialAd.show(configuration, delegate: resolver)
    }
}

// MARK: - Rewarded Show Delegate

private final class UnityAdsRewardedShowResolver: NSObject, UADSRewardedShowDelegate {
    private let call: CAPPluginCall
    private let onFinish: () -> Void
    private var didReward = false

    init(call: CAPPluginCall, onFinish: @escaping () -> Void) {
        self.call = call
        self.onFinish = onFinish
    }

    func showDidStart(_ unityAd: UADSRewardedAd) {
        print("[UnityAds] Rewarded ad started")
    }

    func showDidClick(_ unityAd: UADSRewardedAd) {
        print("[UnityAds] Rewarded ad clicked")
    }

    // Called when user earns the reward (watched to completion)
    func showDidReceiveReward(_ unityAd: UADSRewardedAd) {
        didReward = true
        print("[UnityAds] Rewarded ad reward received")
    }

    func showDidComplete(_ unityAd: UADSRewardedAd, with state: UADSShowFinishState) {
        let completed = state == .completed
        print("[UnityAds] Rewarded ad completed: \(completed), rewarded: \(didReward)")
        call.resolve(["rewarded": completed && didReward])
        onFinish()
    }

    // FIXED: was showDidFailed — correct SDK method is showDidFail
    func showDidFail(_ unityAd: UADSRewardedAd, error: any UnityAdsError) {
        print("[UnityAds] Rewarded ad failed to show: \(error)")
        call.reject("Ad failed to show: \(error)")
        onFinish()
    }
}

// MARK: - Interstitial Show Delegate

private final class UnityAdsInterstitialShowResolver: NSObject, UADSInterstitialShowDelegate {
    private let call: CAPPluginCall
    private let onFinish: () -> Void

    init(call: CAPPluginCall, onFinish: @escaping () -> Void) {
        self.call = call
        self.onFinish = onFinish
    }

    func showDidStart(_ unityAd: UADSInterstitialAd) {
        print("[UnityAds] Interstitial ad started")
    }

    func showDidClick(_ unityAd: UADSInterstitialAd) {
        print("[UnityAds] Interstitial ad clicked")
    }

    func showDidComplete(_ unityAd: UADSInterstitialAd, with state: UADSShowFinishState) {
        let completed = state == .completed
        print("[UnityAds] Interstitial ad completed: \(completed)")
        call.resolve(["completed": completed])
        onFinish()
    }

    // FIXED: was showDidFailed — correct SDK method is showDidFail
    func showDidFail(_ unityAd: UADSInterstitialAd, error: any UnityAdsError) {
        print("[UnityAds] Interstitial ad failed to show: \(error)")
        call.reject("Ad failed to show: \(error)")
        onFinish()
    }
}


// MARK: - Banner Delegate

private final class UnityAdsBannerDelegate: NSObject, UADSBannerViewDelegate {
    private let onLoad: () -> Void
    private let onError: (String) -> Void

    init(onLoad: @escaping () -> Void, onError: @escaping (String) -> Void) {
        self.onLoad = onLoad
        self.onError = onError
    }

    func bannerViewDidLoad(_ bannerView: UADSBannerView) {
        print("[UnityAds] Banner loaded")
        onLoad()
    }

    func bannerViewDidClick(_ bannerView: UADSBannerView) {
        print("[UnityAds] Banner clicked")
    }

    func bannerViewDidLeaveApplication(_ bannerView: UADSBannerView) {
        print("[UnityAds] Banner left application")
    }

    func bannerViewDidError(_ bannerView: UADSBannerView, error: UADSBannerError) {
        print("[UnityAds] Banner failed to load: \(error)")
        onError("Banner failed to load: \(error)")
    }
}
