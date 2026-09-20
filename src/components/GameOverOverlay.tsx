import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Sparkles, HeartPulse, Trophy, Flame, AlertCircle } from 'lucide-react';
import { MissDetails, PlayerProfile, ThemeColors } from '../types/game';
import { adService } from '../services/AdService';

interface GameOverOverlayProps {
  score: number;
  maxCombo: number;
  missDetails: MissDetails | null;
  orbsEarned: number;
  profile: PlayerProfile;
  theme: ThemeColors;
  isDarkMode: boolean;
  reviveUsed: boolean;
  levelNumber: number;
  onRetry: () => void;
  onRevive: () => void;
  onGoHome: () => void;
  onDoubleOrbsGranted: (bonus: number) => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  maxCombo,
  missDetails,
  orbsEarned,
  profile,
  theme,
  isDarkMode,
  reviveUsed,
  levelNumber,
  onRetry,
  onRevive,
  onGoHome,
  onDoubleOrbsGranted,
}) => {
  const colors = isDarkMode ? theme.dark : theme.light;
  const isNewHighScore = score > profile.highScore && score > 0;
  const [doubleOrbsClaimed, setDoubleOrbsClaimed] = useState(false);
  const [reviveCountdown, setReviveCountdown] = useState(5);

  useEffect(() => {
    if (isNewHighScore) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [isNewHighScore]);

  // 5-second countdown for the Second Chance Revive prompt
  useEffect(() => {
    if (reviveUsed) return;
    const timer = setInterval(() => {
      setReviveCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [reviveUsed]);

  const handleReviveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    adService.requestReviveAd(
      () => {
        onRevive();
      },
      () => {
        // Failed or canceled
      }
    );
  };

  const handleDoubleOrbsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (doubleOrbsClaimed || orbsEarned <= 0) return;

    adService.requestDoubleOrbsAd(orbsEarned, (extraOrbs) => {
      setDoubleOrbsClaimed(true);
      onDoubleOrbsGranted(extraOrbs);
    });
  };

  return (
    <div
      onClick={onRetry}
      className="absolute inset-0 z-30 flex items-center justify-center p-2 sm:p-6 landscape:p-3 cursor-pointer select-none bg-black/65 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden safe-pt safe-pb"
    >
      {/* Popping Modal Card - Responsive and theme synchronized */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs sm:max-w-md landscape:max-w-2xl rounded-3xl border-2 p-4 sm:p-6 landscape:p-4 flex flex-col landscape:grid landscape:grid-cols-2 landscape:gap-4 items-center landscape:items-center text-center shadow-2xl animate-in zoom-in-95 duration-200 my-auto max-h-[96vh]"
        style={{
          backgroundColor: isDarkMode ? '#0E0E18' : '#FFFFFF',
          borderColor: isNewHighScore ? colors.accent : isDarkMode ? `${colors.nodeFill}66` : `${colors.nodeFill}50`,
          boxShadow: isNewHighScore
            ? `0 0 35px ${colors.feverAura}`
            : isDarkMode
            ? `0 0 25px ${colors.nodeGlow}33, 0 20px 50px rgba(0, 0, 0, 0.7)`
            : `0 0 20px ${colors.nodeGlow}22, 0 15px 35px rgba(0, 0, 0, 0.1)`,
        }}
      >
        {/* Left Column in Landscape / Top Section in Portrait */}
        <div className="w-full flex flex-col items-center justify-center">
          {/* Status Pill Header */}
          {isNewHighScore ? (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full border text-[10px] sm:text-xs font-orbitron font-black tracking-widest uppercase mb-1.5 sm:mb-2.5"
              style={{
                borderColor: colors.accent,
                backgroundColor: isDarkMode ? `${colors.accent}20` : `${colors.accent}15`,
                color: colors.accent,
                textShadow: isDarkMode ? `0 0 10px ${colors.feverAura}` : undefined,
              }}
            >
              <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>NEW HIGH SCORE</span>
            </div>
          ) : (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full border text-[10px] sm:text-xs font-orbitron font-bold tracking-widest uppercase mb-1.5 sm:mb-2.5"
              style={{
                borderColor: 'rgba(244, 63, 94, 0.3)',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                color: '#FB7185',
              }}
            >
              <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>LEVEL {levelNumber} FAILED{missDetails?.type === 'MISS_EARLY' ? ' — TOO EARLY' : missDetails?.type === 'MISS_LATE' ? ' — TOO LATE' : ''}</span>
            </div>
          )}

          {/* Score Display */}
          <div
            className="text-[9px] sm:text-[11px] font-rajdhani font-bold tracking-[0.2em] uppercase mb-0.5"
            style={{ color: colors.textSecondary }}
          >
            FINAL SCORE
          </div>
          <div
            className="font-orbitron font-black text-3xl sm:text-5xl landscape:text-3xl sm:landscape:text-4xl tracking-tight mb-1 sm:mb-2 transition-colors"
            style={{
              color: colors.textPrimary,
              textShadow: isDarkMode ? '0 0 20px rgba(255, 255, 255, 0.3)' : undefined,
            }}
          >
            {score.toLocaleString()}
          </div>

          {/* Timing Offset Badge */}
          {missDetails && (
            <div
              className="px-2 py-0.5 rounded-lg border text-[10px] sm:text-xs font-orbitron font-bold mb-2 sm:mb-3"
              style={{
                backgroundColor: `${colors.nodeFill}15`,
                borderColor: `${colors.nodeFill}40`,
                color: colors.nodeFill,
              }}
            >
              OFFSET: {missDetails.timeDiffSec.toFixed(3)}s
            </div>
          )}

          {/* Rewards & Summary Stats Grid */}
          <div
            className="w-full grid grid-cols-2 gap-2 p-2 sm:p-3 rounded-2xl border mb-2.5 sm:mb-3 landscape:mb-0"
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            }}
          >
            <div className="flex flex-col items-center justify-center p-1 rounded-xl">
              <div
                className="flex items-center gap-1 text-[9px] sm:text-[11px] font-rajdhani font-bold tracking-wider uppercase mb-0.5"
                style={{ color: colors.textSecondary }}
              >
                <Flame className="w-3 h-3 fill-current text-amber-400" />
                <span>STREAK</span>
              </div>
              <div
                className="font-orbitron font-black text-sm sm:text-base"
                style={{ color: colors.textPrimary }}
              >
                {maxCombo}x
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-1 rounded-xl">
              <div
                className="flex items-center gap-1 text-[9px] sm:text-[11px] font-rajdhani font-bold tracking-wider uppercase mb-0.5"
                style={{ color: colors.textSecondary }}
              >
                <Sparkles className="w-3 h-3" style={{ color: colors.nodeFill }} />
                <span>ORBS</span>
              </div>
              <div
                className="font-orbitron font-black text-sm sm:text-base"
                style={{ color: colors.nodeFill }}
              >
                +{doubleOrbsClaimed ? orbsEarned * 2 : orbsEarned}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column in Landscape / Bottom Section in Portrait */}
        <div className="w-full flex flex-col justify-center space-y-2 landscape:space-y-2">
          {/* Second Chance Revive Button */}
          {!reviveUsed && reviveCountdown > 0 && (
            <button
              id="btn-ad-revive"
              onClick={handleReviveClick}
              className="w-full py-2 sm:py-2.5 px-3 rounded-xl flex items-center justify-between font-orbitron font-bold text-[11px] sm:text-xs shadow-md hover:brightness-110 active:scale-98 transition-all border cursor-pointer"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                color: '#34D399',
              }}
            >
              <div className="flex items-center gap-2">
                <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
                <span className="uppercase tracking-wider">Revive Chance</span>
              </div>
              <span className="bg-black/40 px-1.5 py-0.5 rounded-md font-extrabold text-white text-[11px]">
                {reviveCountdown}s
              </span>
            </button>
          )}

          {/* Double Orbs Ad Button */}
          {orbsEarned > 0 && !doubleOrbsClaimed && (
            <button
              id="btn-double-orbs"
              onClick={handleDoubleOrbsClick}
              className="w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 border font-orbitron text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-all hover:scale-102 active:scale-98 cursor-pointer"
              style={{
                backgroundColor: `${colors.nodeFill}15`,
                borderColor: `${colors.nodeFill}40`,
                color: colors.nodeFill,
              }}
            >
              <Sparkles className="w-3 h-3" />
              <span>Double Orbs (+{orbsEarned * 2})</span>
            </button>
          )}

          {/* Primary Action Buttons */}
          <button
            id="btn-instant-retry"
            onClick={onRetry}
            className="w-full py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 font-orbitron font-black text-xs sm:text-sm tracking-widest uppercase shadow-lg transition-all active:scale-98 border cursor-pointer"
            style={{
              backgroundColor: colors.nodeFill,
              borderColor: colors.nodeFill,
              color: isDarkMode ? '#000000' : '#FFFFFF',
              boxShadow: `0 0 16px ${colors.nodeGlow}`,
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>RETRY LEVEL</span>
          </button>

          <button
            id="btn-back-home"
            onClick={onGoHome}
            className="w-full py-2 rounded-xl flex items-center justify-center gap-2 border font-rajdhani text-xs font-bold tracking-wider uppercase transition-all hover:opacity-100 opacity-80 cursor-pointer"
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              color: colors.textPrimary,
            }}
          >
            <Home className="w-3.5 h-3.5" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};

