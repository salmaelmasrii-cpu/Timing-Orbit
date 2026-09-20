import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  HelpCircle,
  Play,
  Trophy,
  ShieldCheck,
} from 'lucide-react';
import { PlayerProfile, ThemeColors } from '../types/game';
import { NODE_SKINS } from '../themes/gameThemes';

interface MainMenuOverlayProps {
  profile: PlayerProfile;
  theme: ThemeColors;
  isDarkMode: boolean;
  bannerVisible?: boolean;
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenUnlocks: () => void;
  onOpenHowToPlay: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenLeaderboard?: () => void;
}

export const MainMenuOverlay: React.FC<MainMenuOverlayProps> = ({
  profile,
  theme,
  isDarkMode,
  bannerVisible,
  onStartGame,
  onOpenSettings,
  onOpenUnlocks,
  onOpenHowToPlay,
  onOpenPrivacyPolicy,
  onOpenLeaderboard,
}) => {
  const colors = isDarkMode ? theme.dark : theme.light;
  const currentSkinId = profile.previewSkin || profile.selectedSkin;
  const currentSkin = NODE_SKINS.find((s) => s.id === currentSkinId) || NODE_SKINS[0];

  // Dynamic Viewport & Inner Hub Safe Zone Calculations
  // R_orbit = min(w, h) * 0.30
  // R_hub = R_orbit * 0.60
  const [dimensions, setDimensions] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 400,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const minDim = Math.min(dimensions.w, dimensions.h);
  const isLandscape = dimensions.w > dimensions.h;
  // In landscape, scaled down safely to ensure title and footer fit comfortably
  const orbitRadius = isLandscape
    ? Math.max(70, Math.min(minDim * 0.24, 150))
    : Math.max(85, Math.min(minDim * 0.30, 220));
  const hubRadius = orbitRadius * 0.60;
  const hubDiameter = Math.floor(hubRadius * 2);

  // Play button size inside the center of the orbit
  const playButtonSize = Math.max(54, Math.min(84, Math.floor(hubDiameter * 0.72)));
  const playIconSize = Math.max(22, Math.min(32, Math.floor(playButtonSize * 0.42)));

  return (
    <div
      onClick={onStartGame}
      className="absolute inset-0 z-20 flex flex-col justify-between safe-pt safe-pb safe-pl safe-pr cursor-pointer select-none overflow-hidden"
    >
      {/* 1. Top Section: Header Navigation + Responsive Orientation Title */}
      <div className="w-full max-w-5xl mx-auto z-30 relative flex flex-col">
        {/* Top Header Bar */}
        <header className="flex justify-between items-center w-full">
          {/* Top-Left: Trophy Icon + High Score + Level Badge */}
          <div className="flex items-center gap-2 text-left pointer-events-auto shrink-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center backdrop-blur-md shadow-sm"
              style={{
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-lg sm:text-2xl font-orbitron font-black tracking-tight"
                style={{
                  color: colors.textPrimary,
                  textShadow: isDarkMode ? '0 0 12px rgba(255, 255, 255, 0.4)' : undefined,
                }}
              >
                {profile.highScore.toLocaleString()}
              </span>
              <span
                className="text-[9px] sm:text-[10px] font-orbitron font-bold px-1.5 py-0.5 rounded border"
                style={{
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  color: colors.textSecondary,
                }}
              >
                LVL {profile.currentLevel}
              </span>
            </div>
          </div>

          {/* Top-Center (Horizontal / Landscape Mode ONLY): Compact Title & Emblem fitting directly in between Level and Orbs */}
          {isLandscape && (
            <div className="flex items-center gap-2 px-2 text-center pointer-events-none animate-in fade-in duration-200">
              <div
                className="w-5 h-5 rounded-md border rotate-45 flex items-center justify-center shrink-0"
                style={{
                  borderColor: colors.nodeFill,
                  backgroundColor: isDarkMode ? `${colors.nodeFill}25` : `${colors.nodeFill}18`,
                  boxShadow: `0 0 10px ${colors.nodeGlow}`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-xs rotate-45"
                  style={{
                    backgroundColor: colors.accent,
                    boxShadow: `0 0 6px ${colors.feverAura}`,
                  }}
                />
              </div>
              <h1
                className="text-sm sm:text-base font-orbitron font-black uppercase tracking-wider whitespace-nowrap transition-colors"
                style={{
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  textShadow: isDarkMode
                    ? '0 0 14px rgba(255, 255, 255, 0.35)'
                    : '0 1px 2px rgba(0, 0, 0, 0.1)',
                }}
              >
                Timing Orbit
              </h1>
            </div>
          )}

          {/* Top-Right: Orbs / Currency Pill */}
          <div className="flex items-center gap-3 pointer-events-auto shrink-0">
            <button
              id="btn-top-orbs"
              onClick={(e) => {
                e.stopPropagation();
                onOpenUnlocks();
              }}
              className="flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border font-orbitron font-bold text-[11px] sm:text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-md shadow-sm"
              style={{
                backgroundColor: isDarkMode ? 'rgba(30, 30, 46, 0.6)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: `${colors.nodeFill}55`,
                color: colors.nodeFill,
                boxShadow: isDarkMode ? `0 0 12px ${colors.nodeGlow}` : '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
              aria-label="Orbs Shop"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{profile.orbs.toLocaleString()} ORBS</span>
            </button>
          </div>
        </header>

        {/* Portrait / Vertical Mode ONLY: The full large title & emblem centered with equal top and bottom padding */}
        {!isLandscape && (
          <div className="flex flex-col items-center justify-center text-center pointer-events-none py-5 sm:py-8 z-30 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 mb-1.5">
              {/* Diamond Logo Emblem */}
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border rotate-45 flex items-center justify-center animate-pulse shrink-0"
                style={{
                  borderColor: colors.nodeFill,
                  backgroundColor: isDarkMode ? `${colors.nodeFill}25` : `${colors.nodeFill}18`,
                  boxShadow: `0 0 16px ${colors.nodeGlow}`,
                }}
              >
                <div
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-xs rotate-45"
                  style={{
                    backgroundColor: colors.accent,
                    boxShadow: `0 0 10px ${colors.feverAura}`,
                  }}
                />
              </div>
              {/* Title - Pure white in dark mode, pure black in light mode */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-black uppercase tracking-wider transition-colors"
                style={{
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  textShadow: isDarkMode
                    ? '0 0 20px rgba(255, 255, 255, 0.35), 0 0 40px rgba(255, 255, 255, 0.15)'
                    : '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                Timing Orbit
              </h1>
            </div>
            <p
              className="text-[10px] sm:text-[11px] font-rajdhani uppercase tracking-[0.3em] font-bold transition-colors"
              style={{
                color: colors.textSecondary,
              }}
            >
              Precision Orbital Rhythm
            </p>
          </div>
        )}
      </div>

      {/* 2. Central Play Button: Holographic Glass Hub (Compact Inner Hub safely inside orbit track) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10 flex items-center justify-center">
        <button
          id="btn-main-play-center"
          onClick={(e) => {
            e.stopPropagation();
            onStartGame();
          }}
          className="group relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-106 active:scale-95 select-none rounded-full"
          style={{
            width: `${Math.max(68, Math.min(106, Math.floor(orbitRadius * 0.90)))}px`,
            height: `${Math.max(68, Math.min(106, Math.floor(orbitRadius * 0.90)))}px`,
            backgroundColor: isDarkMode
              ? 'rgba(15, 17, 26, 0.65)'
              : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1.5px solid ${colors.nodeFill}35`,
            boxShadow: isDarkMode
              ? `0 0 25px ${colors.nodeGlow}20, inset 0 0 20px ${colors.nodeFill}10`
              : `0 8px 24px rgba(0, 0, 0, 0.08), inset 0 0 14px ${colors.nodeFill}08`,
          }}
          aria-label="Play Game"
        >
          {/* Concentric Decorative Orbit Ring */}
          <div
            className="absolute inset-1.5 sm:inset-2 rounded-full border border-dashed opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"
            style={{
              borderColor: colors.nodeFill,
            }}
          />

          {/* Solid Theme-Filled Play Triangle */}
          <div className="relative flex items-center justify-center z-10">
            <Play
              style={{
                width: `${Math.max(22, Math.min(36, Math.floor(orbitRadius * 0.28)))}px`,
                height: `${Math.max(22, Math.min(36, Math.floor(orbitRadius * 0.28)))}px`,
                color: colors.nodeFill,
                fill: colors.nodeFill,
              }}
              className="translate-x-0.5 transition-transform group-hover:scale-110 duration-200"
            />
          </div>

          {/* Solid Theme-Filled PLAY Label */}
          <span
            className="font-orbitron font-black tracking-[0.25em] uppercase text-[9px] sm:text-[11px] mt-0.5 z-10 transition-colors"
            style={{
              color: colors.nodeFill,
            }}
          >
            PLAY
          </span>
        </button>
      </div>

      {/* 3. Bottom Footer Bar */}
      <footer
        className="w-full max-w-5xl mx-auto flex justify-between items-end z-30 relative transition-[margin] duration-200"
        style={{ marginBottom: bannerVisible ? 58 : 0 }}
      >
        {/* Left: Active Skin Indicator */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenUnlocks();
          }}
          className="flex items-center gap-2.5 p-2 px-3 rounded-2xl border backdrop-blur-md cursor-pointer group hover:scale-102 transition-all shadow-sm"
          style={{
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.85)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          }}
          aria-label="Active Skin"
        >
          <div
            className="w-8 h-8 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              borderColor: `${colors.nodeFill}55`,
              backgroundColor: isDarkMode ? `${colors.nodeFill}25` : `${colors.nodeFill}18`,
            }}
          >
            <div
              className="w-3.5 h-3.5 rounded-sm rotate-45"
              style={{ backgroundColor: colors.nodeFill, boxShadow: `0 0 8px ${colors.nodeGlow}` }}
            />
          </div>
          <div className="text-left">
            <div
              className="text-[9px] uppercase font-rajdhani tracking-widest font-bold"
              style={{ color: colors.textSecondary }}
            >
              ACTIVE SKIN
            </div>
            <div
              className="text-xs font-orbitron font-bold tracking-wide"
              style={{ color: colors.textPrimary }}
            >
              {currentSkin.name}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons Row ("SETUP", "GUIDE") in Frosted Container */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl border backdrop-blur-md shadow-sm"
          style={{
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.85)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          }}
        >
          <button
            id="btn-open-settings"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl active:scale-95 transition-all cursor-pointer font-rajdhani font-bold text-xs uppercase tracking-wider"
            style={{
              color: colors.textSecondary,
            }}
            aria-label="Setup and Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">SETUP</span>
          </button>

          <div
            className="w-[1px] h-4"
            style={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
          />

          <button
            id="btn-open-how-to-play"
            onClick={(e) => {
              e.stopPropagation();
              onOpenHowToPlay();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl active:scale-95 transition-all cursor-pointer font-rajdhani font-bold text-xs uppercase tracking-wider"
            style={{
              color: colors.textSecondary,
            }}
            aria-label="How to Play Guide"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">GUIDE</span>
          </button>

          {onOpenLeaderboard && (
            <>
              <div
                className="w-[1px] h-4"
                style={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              />
              <button
                id="btn-open-leaderboard"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLeaderboard();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl active:scale-95 transition-all cursor-pointer font-rajdhani font-bold text-xs uppercase tracking-wider"
                style={{
                  color: colors.textSecondary,
                }}
                aria-label="Game Center Leaderboard"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">RANKS</span>
              </button>
            </>
          )}

          {onOpenPrivacyPolicy && (
            <>
              <div
                className="w-[1px] h-4"
                style={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
              />
              <button
                id="btn-open-privacy-footer"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPrivacyPolicy();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl active:scale-95 transition-all cursor-pointer font-rajdhani font-bold text-xs uppercase tracking-wider"
                style={{
                  color: colors.textSecondary,
                }}
                aria-label="Privacy Policy"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">PRIVACY</span>
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};
