import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Trophy, Sparkles, Flame, Zap } from 'lucide-react';
import { LevelCompleteStats, ThemeColors } from '../types/game';

interface LevelCompleteOverlayProps {
  stats: LevelCompleteStats;
  theme: ThemeColors;
  isDarkMode: boolean;
  onContinue: () => void;
}

export const LevelCompleteOverlay: React.FC<LevelCompleteOverlayProps> = ({
  stats,
  theme,
  isDarkMode,
  onContinue,
}) => {
  const colors = isDarkMode ? theme.dark : theme.light;

  useEffect(() => {
    confetti({
      particleCount: stats.isExtreme ? 140 : 80,
      spread: stats.isExtreme ? 90 : 60,
      origin: { y: 0.6 },
      colors: stats.isExtreme ? ['#f59e0b', '#f43f5e', '#ffffff'] : [colors.nodeFill, colors.accent, '#ffffff'],
    });
  }, [stats.isExtreme, colors.nodeFill, colors.accent]);

  return (
    <div
      onClick={onContinue}
      className="absolute inset-0 z-30 flex items-center justify-center p-2 sm:p-6 cursor-pointer select-none bg-black/65 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden safe-pt safe-pb"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs sm:max-w-md rounded-3xl border-2 p-4 sm:p-6 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-200 my-auto max-h-[96vh]"
        style={{
          backgroundColor: isDarkMode ? '#0E0E18' : '#FFFFFF',
          borderColor: stats.isExtreme ? '#f59e0b' : colors.accent,
          boxShadow: stats.isExtreme
            ? '0 0 40px rgba(245, 158, 11, 0.55)'
            : `0 0 30px ${colors.feverAura}55`,
        }}
      >
        {/* Status Pill */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full border text-[10px] sm:text-xs font-orbitron font-black tracking-widest uppercase mb-2 sm:mb-3"
          style={{
            borderColor: stats.isExtreme ? '#f59e0b' : colors.accent,
            backgroundColor: stats.isExtreme ? 'rgba(245, 158, 11, 0.15)' : `${colors.accent}20`,
            color: stats.isExtreme ? '#FBBF24' : colors.accent,
          }}
        >
          {stats.isExtreme ? <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          <span>{stats.isExtreme ? 'EXTREME LEVEL CLEARED' : 'LEVEL CLEARED'}</span>
        </div>

        {/* Level Number */}
        <div
          className="text-[9px] sm:text-[11px] font-rajdhani font-bold tracking-[0.2em] uppercase mb-0.5"
          style={{ color: colors.textSecondary }}
        >
          MILESTONE REACHED
        </div>
        <div
          className="font-orbitron font-black text-3xl sm:text-5xl tracking-tight mb-2 sm:mb-3"
          style={{
            color: colors.textPrimary,
            textShadow: isDarkMode ? '0 0 20px rgba(255, 255, 255, 0.3)' : undefined,
          }}
        >
          LEVEL {stats.levelNumber}
        </div>

        {/* Stats Grid */}
        <div
          className="w-full grid grid-cols-3 gap-2 p-2 sm:p-3 rounded-2xl border mb-3 sm:mb-4"
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
              <Trophy className="w-3 h-3" style={{ color: colors.textSecondary }} />
              <span>SCORE</span>
            </div>
            <div className="font-orbitron font-black text-sm sm:text-base" style={{ color: colors.textPrimary }}>
              {stats.runScore.toLocaleString()}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-1 rounded-xl">
            <div
              className="flex items-center gap-1 text-[9px] sm:text-[11px] font-rajdhani font-bold tracking-wider uppercase mb-0.5"
              style={{ color: colors.textSecondary }}
            >
              <Flame className="w-3 h-3 fill-current text-amber-400" />
              <span>COMBO</span>
            </div>
            <div className="font-orbitron font-black text-sm sm:text-base" style={{ color: colors.textPrimary }}>
              {stats.maxCombo}x
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
            <div className="font-orbitron font-black text-sm sm:text-base" style={{ color: colors.nodeFill }}>
              +{stats.orbsEarned}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          id="btn-next-level"
          onClick={onContinue}
          className="w-full py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 font-orbitron font-black text-xs sm:text-sm tracking-widest uppercase shadow-lg transition-all active:scale-98 border cursor-pointer"
          style={{
            backgroundColor: stats.isExtreme ? '#f59e0b' : colors.nodeFill,
            borderColor: stats.isExtreme ? '#f59e0b' : colors.nodeFill,
            color: isDarkMode ? '#000000' : '#FFFFFF',
            boxShadow: `0 0 16px ${colors.nodeGlow}`,
          }}
        >
          <span>NEXT LEVEL</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
