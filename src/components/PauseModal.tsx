import React from 'react';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';
import { ThemeColors } from '../types/game';

interface PauseModalProps {
  score: number;
  level: number;
  theme: ThemeColors;
  isDarkMode: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onGoHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  level,
  theme,
  isDarkMode,
  onResume,
  onRestart,
  onOpenSettings,
  onGoHome,
}) => {
  const colors = isDarkMode ? theme.dark : theme.light;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-sm rounded-3xl border-2 shadow-2xl p-6 text-center space-y-5"
        style={{
          backgroundColor: isDarkMode ? '#0A0A0F' : '#FFFFFF',
          borderColor: isDarkMode ? `${colors.nodeFill}66` : `${colors.nodeFill}50`,
          boxShadow: isDarkMode
            ? `0 0 25px ${colors.nodeGlow}33, 0 12px 40px rgba(0, 0, 0, 0.6)`
            : `0 0 20px ${colors.nodeGlow}22, 0 10px 30px rgba(0, 0, 0, 0.1)`,
          color: colors.textPrimary,
        }}
      >
        <div>
          <div
            className="text-xs uppercase font-mono tracking-[0.2em] font-semibold opacity-75"
            style={{ color: colors.nodeFill }}
          >
            GAME PAUSED
          </div>
          <div
            className="font-mono-num font-black text-5xl mt-1 tracking-tighter"
            style={{ color: colors.textPrimary }}
          >
            {score.toLocaleString()}
          </div>
          <div className="text-xs font-mono font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Level {level} in Progress
          </div>
        </div>

        <div className="space-y-2.5 font-mono">
          {/* Resume */}
          <button
            id="btn-pause-resume"
            onClick={onResume}
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-wider uppercase shadow-lg transition-all active:scale-98 border"
            style={{
              backgroundColor: colors.nodeFill,
              borderColor: colors.nodeFill,
              color: '#0A0A0F',
              boxShadow: `0 0 15px ${colors.nodeGlow}`,
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME</span>
          </button>

          {/* Restart */}
          <button
            id="btn-pause-restart"
            onClick={onRestart}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 border font-bold text-xs tracking-wider uppercase transition-all active:scale-98"
            style={{
              backgroundColor: isDarkMode ? 'rgba(30, 30, 46, 0.4)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESTART RUN</span>
          </button>

          {/* Settings */}
          <button
            id="btn-pause-settings"
            onClick={onOpenSettings}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 border font-bold text-xs tracking-wider uppercase transition-all active:scale-98"
            style={{
              backgroundColor: isDarkMode ? 'rgba(30, 30, 46, 0.4)' : 'rgba(0, 0, 0, 0.04)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
            }}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>SETTINGS</span>
          </button>

          {/* Main Menu */}
          <button
            id="btn-pause-home"
            onClick={onGoHome}
            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all uppercase tracking-wider"
          >
            <Home className="w-3.5 h-3.5" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
