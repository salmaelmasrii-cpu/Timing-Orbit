/**
 * Timing Orbit - Principal Mobile Game Architecture
 * A high-precision, single-tap casual mobile arcade game
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  GameSettings,
  PlayerProfile,
  MissDetails,
  NodeSkinId,
  TrailId,
  LevelProgress,
  LevelCompleteStats,
} from './types/game';
import { THEMES } from './themes/gameThemes';
import { soundSynth } from './audio/SoundSynth';
import { adService } from './services/AdService';
import { GameCenterService, GAME_CENTER_CONFIG } from './services/gameCenter';
import {
  loadSettings,
  saveSettings,
  loadProfile,
  saveProfile,
} from './utils/storage';
import { GameEngine } from './engine/GameEngine';

import { GameCanvas } from './components/GameCanvas';
import { PlayingHUD } from './components/PlayingHUD';
import { MainMenuOverlay } from './components/MainMenuOverlay';
import { GameOverOverlay } from './components/GameOverOverlay';
import { SettingsModal } from './components/SettingsModal';
import { UnlocksModal } from './components/UnlocksModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { PauseModal } from './components/PauseModal';
import { SplashScreen } from './components/SplashScreen';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { LevelCompleteOverlay } from './components/LevelCompleteOverlay';

export default function App() {
  // Saved user profile & settings
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);
  const [settings, setSettings] = useState<GameSettings>(loadSettings);

  // Active Game State - boot with Splash Screen
  const [gameState, setGameState] = useState<GameState>(GameState.SPLASH);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null);
  const [levelCompleteStats, setLevelCompleteStats] = useState<LevelCompleteStats | null>(null);
  const [feverMeter, setFeverMeter] = useState(0);
  const [isFever, setIsFever] = useState(false);
  const [missDetails, setMissDetails] = useState<MissDetails | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [maxComboRun, setMaxComboRun] = useState(0);
  const [orbsEarnedThisRun, setOrbsEarnedThisRun] = useState(0);
  const [reviveUsed, setReviveUsed] = useState(false);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showUnlocks, setShowUnlocks] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Reference to engine
  const engineRef = useRef<GameEngine | null>(null);

  // Sync sound settings to synth
  useEffect(() => {
    soundSynth.soundEnabled = settings.soundFX;
    soundSynth.melodyEnabled = settings.melodicSynth;
    soundSynth.droneEnabled = settings.ambientDrone;
    soundSynth.hapticsEnabled = settings.haptics;
  }, [settings]);

  // Update Settings Handler
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  // Reset Progress Handler
  const handleResetProgress = () => {
    const freshProfile: PlayerProfile = {
      highScore: 0,
      totalHits: 0,
      totalBullseyes: 0,
      gamesPlayed: 0,
      maxComboEver: 0,
      currentLevel: 1,
      orbs: 0,
      unlockedThemes: ['cyber-neon', 'solar-eclipse', 'monochrome-precision', 'emerald-glitch'],
      unlockedSkins: ['dot'],
      unlockedTrails: ['plasma'],
      selectedTheme: 'monochrome-precision',
      selectedSkin: 'dot',
      selectedTrail: 'plasma',
      previewSkin: null,
      previewSkinRunsLeft: 0,
      hasAcceptedPrivacyPolicy: true,
    };
    setProfile(freshProfile);
    saveProfile(freshProfile);
  };

  // Privacy Policy Acceptance Handler
  const handleAcceptPrivacyPolicy = () => {
    setProfile((prev) => {
      const updated = { ...prev, hasAcceptedPrivacyPolicy: true };
      saveProfile(updated);
      return updated;
    });
    setShowPrivacyPolicy(false);
  };

  // Game Engine Callbacks
  const engineCallbacks = useRef({
    onScoreChange: (score: number) => {
      setCurrentScore(score);
    },
    onComboChange: (combo: number) => {
      setCurrentCombo(combo);
    },
    onLevelChange: (lvl: number) => {
      setCurrentLevel(lvl);
    },
    onLevelProgress: (progress: LevelProgress) => {
      setLevelProgress(progress);
    },
    onLevelComplete: (stats: LevelCompleteStats) => {
      setLevelCompleteStats(stats);
      setGameState(GameState.LEVEL_COMPLETE);
      // Persist furthest level reached so "Play" resumes here next time
      setProfile((prev) => {
        const updated: PlayerProfile = {
          ...prev,
          currentLevel: Math.max(prev.currentLevel, stats.levelNumber + 1),
        };
        saveProfile(updated);
        return updated;
      });
    },
    onFeverChange: (fever: number, active: boolean) => {
      setFeverMeter(fever);
      setIsFever(active);
    },
    onHit: (res: { type: string; points: number }) => {
      setProfile((prev) => {
        const isBullseye = res.type === 'BULLSEYE';
        if (isBullseye && prev.totalBullseyes === 0) {
          // First bullseye ever — one-shot Game Center achievement
          GameCenterService.reportAchievement(GAME_CENTER_CONFIG.ACHIEVEMENTS.FIRST_BULLSEYE);
        }
        const updated: PlayerProfile = {
          ...prev,
          totalHits: prev.totalHits + 1,
          totalBullseyes: prev.totalBullseyes + (isBullseye ? 1 : 0),
        };
        saveProfile(updated);
        return updated;
      });
    },
    onGameOver: (score: number, maxCombo: number, miss: MissDetails) => {
      setFinalScore(score);
      setMaxComboRun(maxCombo);
      setMissDetails(miss);
      setGameState(GameState.GAME_OVER);

      // Show interstitial every 3rd game over
      adService.onGameOverCycle();

      // Decrement trial skin if active
      setProfile((prev) => {
        const newHighScore = Math.max(prev.highScore, score);
        const newMaxCombo = Math.max(prev.maxComboEver, maxCombo);

        // Game Center: submit best score, unlock combo achievements
        GameCenterService.submitScore(newHighScore);
        if (maxCombo >= 10) {
          GameCenterService.reportAchievement(GAME_CENTER_CONFIG.ACHIEVEMENTS.COMBO_10);
        }
        if (maxCombo >= 25) {
          GameCenterService.reportAchievement(GAME_CENTER_CONFIG.ACHIEVEMENTS.COMBO_25);
        }

        const remainingRuns = prev.previewSkinRunsLeft > 0 ? prev.previewSkinRunsLeft - 1 : 0;
        const activePreview = remainingRuns > 0 ? prev.previewSkin : null;

        const updated: PlayerProfile = {
          ...prev,
          highScore: newHighScore,
          maxComboEver: newMaxCombo,
          gamesPlayed: prev.gamesPlayed + 1,
          previewSkin: activePreview,
          previewSkinRunsLeft: remainingRuns,
        };
        saveProfile(updated);
        return updated;
      });
    },
    onOrbsEarned: (amount: number) => {
      setOrbsEarnedThisRun((prev) => prev + amount);
      setProfile((prev) => {
        const updated = { ...prev, orbs: prev.orbs + amount };
        saveProfile(updated);
        return updated;
      });
    },
  }).current;

  // Tap handler (Canvas / Screen)
  const handleScreenTap = useCallback(() => {
    if (showSettings || showUnlocks || showHowToPlay) return;

    if (gameState === GameState.MAIN_MENU) {
      handleStartGame();
    } else if (gameState === GameState.PLAYING) {
      engineRef.current?.handleTap();
    } else if (gameState === GameState.GAME_OVER) {
      handleStartGame();
    }
  }, [gameState, showSettings, showUnlocks, showHowToPlay]);

  // Banner ad: only on the bare main menu — hidden the instant any modal opens
  // over it (it's a native view above the WebView, so it would otherwise sit
  // on top of Settings/Unlocks/etc.), and hidden everywhere else entirely.
  useEffect(() => {
    const bannerShouldShow =
      gameState === GameState.MAIN_MENU && !showSettings && !showUnlocks && !showHowToPlay && !showPrivacyPolicy;

    if (bannerShouldShow) {
      adService.showBannerAd();
    } else {
      adService.hideBannerAd();
    }
  }, [gameState, showSettings, showUnlocks, showHowToPlay, showPrivacyPolicy]);

  // Start new run
  const handleStartGame = () => {
    setGameState(GameState.PLAYING);
    setReviveUsed(false);
    setOrbsEarnedThisRun(0);
    engineRef.current?.startRun(profile.currentLevel || 1);
  };

  // Retry the level just failed (score/orbs already earned this expedition are kept)
  const handleRetryLevel = () => {
    setGameState(GameState.PLAYING);
    setReviveUsed(false);
    engineRef.current?.retryLevel();
  };

  // Continue to the next level after a Level Complete screen
  const handleContinueToNextLevel = () => {
    setGameState(GameState.PLAYING);
    setReviveUsed(false);
    setOrbsEarnedThisRun(0);
    engineRef.current?.advanceToNextLevel();
  };

  // Revive run (Second Chance)
  const handleReviveGame = () => {
    setReviveUsed(true);
    setGameState(GameState.PLAYING);
    engineRef.current?.reviveRun();
  };

  // Pause & Resume
  const handlePauseGame = () => {
    if (gameState === GameState.PLAYING) {
      setGameState(GameState.PAUSED);
      if (engineRef.current) engineRef.current.state = GameState.PAUSED;
      soundSynth.stopAmbientDrone();
    }
  };

  const handleResumeGame = () => {
    setGameState(GameState.PLAYING);
    if (engineRef.current) engineRef.current.state = GameState.PLAYING;
    soundSynth.startAmbientDrone();
  };

  const handleGoHome = () => {
    setGameState(GameState.MAIN_MENU);
    if (engineRef.current) engineRef.current.state = GameState.MAIN_MENU;
    soundSynth.stopAmbientDrone();
  };

  // Cosmetic actions
  const handleEquipSkin = (skinId: NodeSkinId) => {
    setProfile((prev) => {
      const updated = { ...prev, selectedSkin: skinId, previewSkin: null, previewSkinRunsLeft: 0 };
      saveProfile(updated);
      return updated;
    });
  };

  const handleEquipTrail = (trailId: TrailId) => {
    setProfile((prev) => {
      const updated = { ...prev, selectedTrail: trailId };
      saveProfile(updated);
      return updated;
    });
  };

  const handleUnlockSkinWithOrbs = (skinId: NodeSkinId, cost: number) => {
    setProfile((prev) => {
      if (prev.orbs < cost) return prev;
      const updated: PlayerProfile = {
        ...prev,
        orbs: prev.orbs - cost,
        unlockedSkins: Array.from(new Set([...prev.unlockedSkins, skinId])),
        selectedSkin: skinId,
        previewSkin: null,
      };
      saveProfile(updated);
      return updated;
    });
    soundSynth.playOrbEarn();
  };

  const handleUnlockTrailWithOrbs = (trailId: TrailId, cost: number) => {
    setProfile((prev) => {
      if (prev.orbs < cost) return prev;
      const updated: PlayerProfile = {
        ...prev,
        orbs: prev.orbs - cost,
        unlockedTrails: Array.from(new Set([...prev.unlockedTrails, trailId])),
        selectedTrail: trailId,
      };
      saveProfile(updated);
      return updated;
    });
    soundSynth.playOrbEarn();
  };

  const handlePreviewSkinGranted = (skinId: NodeSkinId) => {
    setProfile((prev) => {
      const updated: PlayerProfile = {
        ...prev,
        previewSkin: skinId,
        previewSkinRunsLeft: 3,
      };
      saveProfile(updated);
      return updated;
    });
    setShowUnlocks(false);
  };

  const handleDoubleOrbsGranted = (bonus: number) => {
    setProfile((prev) => {
      const updated = { ...prev, orbs: prev.orbs + bonus };
      saveProfile(updated);
      return updated;
    });
    soundSynth.playOrbEarn();
  };

  const handleToggleSound = () => {
    handleUpdateSettings({ soundFX: !settings.soundFX });
  };

  const currentTheme = THEMES[settings.themeId] || THEMES['monochrome-precision'] || THEMES['cyber-neon'];
  const activeColors = settings.isDarkMode ? currentTheme.dark : currentTheme.light;

  return (
    <main
      id="timing-orbit-root"
      className="relative w-screen h-screen overflow-hidden select-none"
      style={
        {
          backgroundColor: settings.isDarkMode ? '#0A0A0F' : '#F4F4F8',
          '--scroll-thumb': `${activeColors.nodeFill}66`,
          '--scroll-thumb-hover': activeColors.nodeFill,
        } as React.CSSProperties
      }
    >
      {/* 1. Core Canvas Stage */}
      <GameCanvas
        settings={settings}
        profile={profile}
        onEngineReady={(eng) => {
          engineRef.current = eng;
        }}
        callbacks={engineCallbacks}
        onCanvasTap={handleScreenTap}
      />

      {/* Geometric Balance Ambient Overlay (Vignettes & Axis Crosshairs) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        <div
          className="absolute top-0 left-0 w-full h-32 opacity-80"
          style={{
            background: settings.isDarkMode
              ? 'linear-gradient(to bottom, #0A0A0F, transparent)'
              : 'linear-gradient(to bottom, #F4F4F8, transparent)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-32 opacity-80"
          style={{
            background: settings.isDarkMode
              ? 'linear-gradient(to top, #0A0A0F, transparent)'
              : 'linear-gradient(to top, #F4F4F8, transparent)',
          }}
        />
        <div
          className="absolute left-1/2 top-0 h-full w-[1px]"
          style={{ backgroundColor: settings.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
        />
        <div
          className="absolute top-1/2 left-0 w-full h-[1px]"
          style={{ backgroundColor: settings.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
        />
      </div>

      {/* 0. Splash Screen Sequence */}
      {gameState === GameState.SPLASH && (
        <SplashScreen
          theme={currentTheme}
          isDarkMode={settings.isDarkMode}
          skinId={profile.selectedSkin || 'dot'}
          trailId={profile.selectedTrail || 'plasma'}
          onFinish={() => {
            if (!profile.hasAcceptedPrivacyPolicy) {
              setShowPrivacyPolicy(true);
            }
            setGameState(GameState.MAIN_MENU);
            // Preload Unity Ads after splash — SDK has had time to initialize
            adService.preloadAds();
            // Authenticate Game Center (shows Apple's own login sheet if needed)
            GameCenterService.authenticate();
          }}
        />
      )}

      {/* 2. Main Menu Overlay */}
      {gameState === GameState.MAIN_MENU && (
        <MainMenuOverlay
          profile={profile}
          theme={currentTheme}
          isDarkMode={settings.isDarkMode}
          bannerVisible={!showSettings && !showUnlocks && !showHowToPlay && !showPrivacyPolicy}
          onStartGame={handleStartGame}
          onOpenSettings={() => setShowSettings(true)}
          onOpenUnlocks={() => setShowUnlocks(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenPrivacyPolicy={() => setShowPrivacyPolicy(true)}
          onOpenLeaderboard={() => GameCenterService.showLeaderboard()}
        />
      )}

      {/* 3. In-Game HUD */}
      {gameState === GameState.PLAYING && (
        <PlayingHUD
          score={currentScore}
          combo={currentCombo}
          level={currentLevel}
          feverMeter={feverMeter}
          isFever={isFever}
          theme={currentTheme}
          isDarkMode={settings.isDarkMode}
          levelProgress={levelProgress}
          onPause={handlePauseGame}
        />
      )}

      {/* 4. Game Over Overlay */}
      {gameState === GameState.GAME_OVER && (
        <GameOverOverlay
          score={finalScore}
          maxCombo={maxComboRun}
          missDetails={missDetails}
          orbsEarned={orbsEarnedThisRun}
          profile={profile}
          theme={currentTheme}
          isDarkMode={settings.isDarkMode}
          reviveUsed={reviveUsed}
          levelNumber={currentLevel}
          onRetry={handleRetryLevel}
          onRevive={handleReviveGame}
          onGoHome={handleGoHome}
          onDoubleOrbsGranted={handleDoubleOrbsGranted}
        />
      )}

      {/* 4b. Level Complete Overlay */}
      {gameState === GameState.LEVEL_COMPLETE && levelCompleteStats && (
        <LevelCompleteOverlay
          stats={levelCompleteStats}
          theme={currentTheme}
          isDarkMode={settings.isDarkMode}
          onContinue={handleContinueToNextLevel}
        />
      )}

      {/* 5. Pause Modal */}
      {gameState === GameState.PAUSED && (
        <PauseModal
          score={currentScore}
          level={currentLevel}
          theme={currentTheme}
          isDarkMode={settings.isDarkMode}
          onResume={handleResumeGame}
          onRestart={handleStartGame}
          onOpenSettings={() => setShowSettings(true)}
          onGoHome={handleGoHome}
        />
      )}

      {/* 6. Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          theme={currentTheme}
          isDarkMode={settings.isDarkMode}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onOpenUnlocks={() => setShowUnlocks(true)}
          onReplaySplash={() => {
            setShowSettings(false);
            setGameState(GameState.SPLASH);
          }}
          onOpenPrivacyPolicy={() => {
            setShowSettings(false);
            setShowPrivacyPolicy(true);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 7. Unlocks / Cosmetics Modal */}
      {showUnlocks && (
        <UnlocksModal
          profile={profile}
          theme={currentTheme}
          isDarkMode={settings.isDarkMode}
          onEquipSkin={handleEquipSkin}
          onEquipTrail={handleEquipTrail}
          onUnlockSkinWithOrbs={handleUnlockSkinWithOrbs}
          onUnlockTrailWithOrbs={handleUnlockTrailWithOrbs}
          onPreviewSkinGranted={handlePreviewSkinGranted}
          onClose={() => setShowUnlocks(false)}
        />
      )}

      {/* 8. How to Play Guide Modal */}
      {showHowToPlay && (
        <HowToPlayModal
          theme={currentTheme}
          isDarkMode={settings.isDarkMode}
          onClose={() => setShowHowToPlay(false)}
        />
      )}

      {/* 9. Privacy Policy & Terms Modal */}
      {showPrivacyPolicy && (
        <PrivacyPolicyModal
          theme={currentTheme}
          isDarkMode={settings.isDarkMode}
          isConsentMode={!profile.hasAcceptedPrivacyPolicy}
          onAccept={handleAcceptPrivacyPolicy}
          onClose={() => setShowPrivacyPolicy(false)}
        />
      )}
    </main>
  );
}
