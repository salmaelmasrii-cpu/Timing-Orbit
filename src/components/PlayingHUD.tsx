import React, { useState, useEffect } from 'react';
import { Pause, ShieldAlert, Zap, Target } from 'lucide-react';
import { ThemeColors, LevelProgress } from '../types/game';

interface PlayingHUDProps {
  score: number;
  combo: number;
  level: number;
  feverMeter: number;
  isFever: boolean;
  theme: ThemeColors;
  isDarkMode: boolean;
  levelProgress: LevelProgress | null;
  onPause: () => void;
}

export const PlayingHUD: React.FC<PlayingHUDProps> = ({
  score,
  combo,
  level,
  feverMeter,
  isFever,
  theme,
  isDarkMode,
  levelProgress,
  onPause,
}) => {
  const colors = isDarkMode ? theme.dark : theme.light;

  // Viewport tracking for inner hub bounds
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
  const orbitRadius = Math.max(85, Math.min(minDim * 0.30, 220));
  const hubRadius = orbitRadius * 0.60;
  const hubDiameter = Math.floor(hubRadius * 2);

  // Combo multiplier label
  let multiplier = 1;
  if (combo >= 15) multiplier = 8;
  else if (combo >= 10) multiplier = 5;
  else if (combo >= 5) multiplier = 3;
  else if (combo >= 2) multiplier = 2;
  if (isFever) multiplier *= 2;

  // Split fever meter into 3 geometric progress bars (0-33.3%, 33.3-66.6%, 66.6-100%)
  const segment1 = Math.min(100, Math.max(0, (feverMeter / 33.33) * 100));
  const segment2 = Math.min(100, Math.max(0, ((feverMeter - 33.33) / 33.33) * 100));
  const segment3 = Math.min(100, Math.max(0, ((feverMeter - 66.66) / 33.34) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between safe-pt safe-pb safe-pl safe-pr z-10 select-none overflow-hidden">
      {/* 1. Top Geometric Header Bar */}
      <nav className="flex justify-between items-start w-full max-w-5xl mx-auto z-20">
        {/* Left: Session Score */}
        <div className="flex flex-col gap-1 text-left">
          <span
            className="text-[11px] font-rajdhani uppercase tracking-[0.2em] font-bold"
            style={{ color: colors.textSecondary }}
          >
            SESSION SCORE
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl sm:text-4xl font-orbitron font-black tracking-tight"
              style={{
                color: colors.textPrimary,
                textShadow: isDarkMode ? '0 0 12px rgba(255, 255, 255, 0.4)' : undefined,
              }}
            >
              {score.toLocaleString()}
            </span>
            <span
              className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded-md border flex items-center gap-1"
              style={{
                borderColor: levelProgress?.isExtreme ? '#f59e0b' : isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                backgroundColor: levelProgress?.isExtreme
                  ? 'rgba(245, 158, 11, 0.15)'
                  : isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
                color: levelProgress?.isExtreme ? '#FBBF24' : colors.textSecondary,
              }}
            >
              {levelProgress?.isExtreme && <Zap className="w-2.5 h-2.5" />}
              LVL {level}
            </span>
          </div>

          {/* Level progress: hits toward target, and combo-goal indicator on extreme levels */}
          {levelProgress && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-20 h-1 rounded-full overflow-hidden bg-white/10 border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${Math.min(100, (levelProgress.hits / Math.max(1, levelProgress.targetHits)) * 100)}%`,
                    backgroundColor: levelProgress.isExtreme ? '#f59e0b' : colors.nodeFill,
                  }}
                />
              </div>
              <span className="text-[9px] font-rajdhani font-bold" style={{ color: colors.textSecondary }}>
                {levelProgress.hits}/{levelProgress.targetHits}
              </span>
              {levelProgress.comboGoal !== null && (
                <div
                  className="flex items-center gap-0.5 text-[9px] font-orbitron font-bold px-1 py-0.5 rounded border"
                  style={{
                    borderColor: levelProgress.bestComboThisLevel >= levelProgress.comboGoal ? '#34D399' : 'rgba(244, 63, 94, 0.4)',
                    color: levelProgress.bestComboThisLevel >= levelProgress.comboGoal ? '#34D399' : '#FB7185',
                  }}
                >
                  <Target className="w-2.5 h-2.5" />
                  <span>{levelProgress.bestComboThisLevel}/{levelProgress.comboGoal}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Current Streak & Pause Button */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-end gap-0.5 text-right">
            <span
              className="text-[11px] font-rajdhani uppercase tracking-[0.2em] font-bold"
              style={{ color: colors.nodeFill }}
            >
              {combo > 1 ? 'CURRENT STREAK' : 'STREAK'}
            </span>
            <div className="flex items-center gap-1.5">
              {combo >= 5 && (
                <div className="flex items-center gap-1 text-[9px] font-orbitron font-bold uppercase text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/50">
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  <span>TRAP</span>
                </div>
              )}
              <span
                className="text-2xl sm:text-3xl font-orbitron font-black tracking-tight"
                style={{
                  color: combo > 1 ? colors.accent : colors.textPrimary,
                  textShadow: combo > 1
                    ? `0 0 12px ${colors.feverAura}`
                    : isDarkMode
                    ? '0 0 12px rgba(255, 255, 255, 0.4)'
                    : undefined,
                }}
              >
                {combo > 1 ? `x${combo}` : `1x`}
              </span>
            </div>
          </div>

          {/* Pause Button */}
          <button
            id="btn-pause-game"
            onClick={(e) => {
              e.stopPropagation();
              onPause();
            }}
            className="pointer-events-auto w-10 h-10 border rounded-xl flex items-center justify-center transition-all active:scale-95 backdrop-blur-md shadow-sm cursor-pointer"
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.85)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
              color: colors.textPrimary,
            }}
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4 fill-current" />
          </button>
        </div>
      </nav>

      {/* 2. Center Orbit Inner Safe Zone Multiplier & Fever Indicator */}
      <div
        className="mx-auto my-auto pointer-events-none flex flex-col items-center justify-center text-center rounded-full"
        style={{
          width: `${hubDiameter}px`,
          height: `${hubDiameter}px`,
          maxWidth: `${hubDiameter}px`,
          maxHeight: `${hubDiameter}px`,
        }}
      >
        {multiplier > 1 && (
          <div
            className="font-orbitron font-black tracking-tighter leading-none"
            style={{
              fontSize: `${Math.max(28, Math.min(48, Math.floor(hubRadius * 0.55)))}px`,
              color: isFever ? colors.accent : colors.textPrimary,
              textShadow: isFever
                ? `0 0 25px ${colors.feverAura}`
                : isDarkMode
                ? `0 0 15px rgba(255, 255, 255, 0.35)`
                : `0 2px 8px rgba(0, 0, 0, 0.15)`,
            }}
          >
            x{multiplier}
          </div>
        )}

        {isFever && (
          <div
            className="mt-1 px-2.5 py-0.5 text-[10px] font-orbitron font-black uppercase tracking-[0.2em] rounded border shadow-lg animate-pulse"
            style={{
              backgroundColor: colors.accent,
              borderColor: colors.accent,
              color: '#0A0A0F',
              boxShadow: `0 0 15px ${colors.feverAura}`,
            }}
          >
            FEVER
          </div>
        )}
      </div>

      {/* 3. Bottom Segmented Fever Bars (Outside Orbit) */}
      <div className="w-full max-w-sm mx-auto text-center pb-2 z-20">
        <div className="flex gap-2 sm:gap-3 justify-center items-center">
          <div className="w-14 h-1.5 border border-white/20 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-150 rounded-full"
              style={{
                width: `${segment1}%`,
                backgroundColor: isFever ? colors.accent : colors.nodeFill,
                boxShadow: segment1 > 0 ? `0 0 8px ${isFever ? colors.feverAura : colors.nodeGlow}` : undefined,
              }}
            />
          </div>
          <div className="w-14 h-1.5 border border-white/20 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-150 rounded-full"
              style={{
                width: `${segment2}%`,
                backgroundColor: isFever ? colors.accent : colors.nodeFill,
                boxShadow: segment2 > 0 ? `0 0 8px ${isFever ? colors.feverAura : colors.nodeGlow}` : undefined,
              }}
            />
          </div>
          <div className="w-14 h-1.5 border border-white/20 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-150 rounded-full"
              style={{
                width: `${segment3}%`,
                backgroundColor: isFever ? colors.accent : colors.nodeFill,
                boxShadow: segment3 > 0 ? `0 0 8px ${isFever ? colors.feverAura : colors.nodeGlow}` : undefined,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
