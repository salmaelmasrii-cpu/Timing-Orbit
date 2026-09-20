import UIKit
import Capacitor
import GameKit

// MARK: - Capacitor Plugin

@objc(GameCenterPlugin)
public class GameCenterPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier   = "GameCenterPlugin"
    public let jsName       = "GameCenter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authenticate",      returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isAuthenticated",   returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submitScore",       returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reportAchievement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showLeaderboard",   returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showAchievements",  returnType: CAPPluginReturnPromise),
    ]

    // MARK: - authenticate

    @objc func authenticate(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let localPlayer = GKLocalPlayer.local

            localPlayer.authenticateHandler = { [weak self] viewController, error in
                guard let self = self else { return }

                if let viewController = viewController {
                    // Game Center needs to present its own login sheet.
                    DispatchQueue.main.async {
                        self.bridge?.viewController?.present(viewController, animated: true)
                    }
                    return
                }

                if let error = error {
                    print("[GameCenter] Authentication failed: \(error)")
                    call.reject("Game Center authentication failed: \(error.localizedDescription)")
                    return
                }

                print("[GameCenter] Authenticated: \(localPlayer.isAuthenticated)")
                call.resolve(["authenticated": localPlayer.isAuthenticated])
            }
        }
    }

    // MARK: - isAuthenticated

    @objc func isAuthenticated(_ call: CAPPluginCall) {
        call.resolve(["authenticated": GKLocalPlayer.local.isAuthenticated])
    }

    // MARK: - submitScore

    @objc func submitScore(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Not authenticated with Game Center")
            return
        }
        let score = call.getInt("score") ?? 0
        let leaderboardID = call.getString("leaderboardId") ?? ""
        guard !leaderboardID.isEmpty else {
            call.reject("leaderboardId is required")
            return
        }

        GKLeaderboard.submitScore(
            score,
            context: 0,
            player: GKLocalPlayer.local,
            leaderboardIDs: [leaderboardID]
        ) { error in
            if let error = error {
                print("[GameCenter] submitScore failed: \(error)")
                call.reject("Failed to submit score: \(error.localizedDescription)")
            } else {
                call.resolve(["submitted": true])
            }
        }
    }

    // MARK: - reportAchievement

    @objc func reportAchievement(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Not authenticated with Game Center")
            return
        }
        let achievementID = call.getString("achievementId") ?? ""
        let percentComplete = call.getDouble("percentComplete") ?? 100.0
        guard !achievementID.isEmpty else {
            call.reject("achievementId is required")
            return
        }

        let achievement = GKAchievement(identifier: achievementID)
        achievement.percentComplete = percentComplete
        achievement.showsCompletionBanner = true

        GKAchievement.report([achievement]) { error in
            if let error = error {
                print("[GameCenter] reportAchievement failed: \(error)")
                call.reject("Failed to report achievement: \(error.localizedDescription)")
            } else {
                call.resolve(["reported": true])
            }
        }
    }

    // MARK: - showLeaderboard

    @objc func showLeaderboard(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Not authenticated with Game Center")
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let presenter = self.bridge?.viewController else {
                call.reject("No view controller available")
                return
            }
            let gcVC = GKGameCenterViewController(state: .leaderboards)
            gcVC.gameCenterDelegate = GameCenterPresentationDelegate.shared
            GameCenterPresentationDelegate.shared.presenter = presenter
            presenter.present(gcVC, animated: true)
            call.resolve()
        }
    }

    // MARK: - showAchievements

    @objc func showAchievements(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Not authenticated with Game Center")
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let presenter = self.bridge?.viewController else {
                call.reject("No view controller available")
                return
            }
            let gcVC = GKGameCenterViewController(state: .achievements)
            gcVC.gameCenterDelegate = GameCenterPresentationDelegate.shared
            GameCenterPresentationDelegate.shared.presenter = presenter
            presenter.present(gcVC, animated: true)
            call.resolve()
        }
    }
}

// MARK: - Game Center View Controller Presentation Delegate

private final class GameCenterPresentationDelegate: NSObject, GKGameCenterControllerDelegate {
    static let shared = GameCenterPresentationDelegate()
    weak var presenter: UIViewController?

    func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        presenter?.dismiss(animated: true)
    }
}
