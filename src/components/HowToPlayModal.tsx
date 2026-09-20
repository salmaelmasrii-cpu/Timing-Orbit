import React from 'react';
import { X, Target, Zap, ShieldAlert, Sparkles, Flame } from 'lucide-react';
import { ThemeColors } from '../types/game';

interface HowToPlayModalProps {
  theme: ThemeColors;
  isDarkMode: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ theme, isDarkMode, onClose }) => {
  const colors = isDarkMode ? theme.dark : theme.light;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-md rounded-3xl border-2 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]"
        style={
          {
            backgroundColor: isDarkMode ? '#0A0A0F' : '#FFFFFF',
            borderColor: isDarkMode ? `${colors.nodeFill}66` : `${colors.nodeFill}50`,
            boxShadow: isDarkMode
              ? `0 0 25px ${colors.nodeGlow}33, 0 12px 40px rgba(0, 0, 0, 0.6)`
              : `0 0 20px ${colors.nodeGlow}22, 0 10px 30px rgba(0, 0, 0, 0.1)`,
            color: colors.textPrimary,
            '--scroll-thumb': `${colors.nodeFill}66`,
            '--scroll-thumb-hover': colors.nodeFill,
          } as React.CSSProperties
        }
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-3 border-b"
          style={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center gap-2 font-mono">
            <Target className="w-4 h-4" style={{ color: colors.nodeFill }} />
            <h2 className="font-bold text-sm tracking-widest uppercase">Precision Guide</h2>
          </div>
          <button
            id="btn-close-guide"
            onClick={onClose}
            className="w-7 h-7 rounded-lg border flex items-center justify-center hover:opacity-80 active:scale-95 transition-all"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.15)',
              backgroundColor: isDarkMode ? 'rgba(30, 30, 46, 0.5)' : 'rgba(0, 0, 0, 0.05)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-3 pr-1 font-mono text-xs">
          {/* Rule 1: Single Tap Mechanic */}
          <div
            className="p-3.5 rounded-xl border flex items-start gap-3"
            style={{
              backgroundColor: isDarkMode ? 'rgba(30, 30, 46, 0.4)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: 'rgba(0, 255, 255, 0.25)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                borderColor: 'rgba(0, 255, 255, 0.3)',
                color: colors.nodeFill,
              }}
            >
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs mb-0.5 tracking-wider uppercase" style={{ color: colors.nodeFill }}>
                1. Single Tap Mechanic
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed opacity-90 font-sans">
                A node continuously orbits the central ring. Tap anywhere on screen when the node enters the Target Zone arc.
              </div>
            </div>
          </div>

          {/* Rule 2: Dual Hitboxes */}
          <div
            className="p-3.5 rounded-xl border flex items-start gap-3"
            style={{
              backgroundColor: isDarkMode ? 'rgba(30, 30, 46, 0.4)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: 'rgba(255, 0, 255, 0.25)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: 'rgba(255, 0, 255, 0.1)',
                borderColor: 'rgba(255, 0, 255, 0.3)',
                color: colors.accent,
              }}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs mb-0.5 tracking-wider uppercase" style={{ color: colors.accent }}>
                2. Dual Precision Zones
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed opacity-90 font-sans">
                <span className="font-bold text-cyan-300">• Safe Arc (38°):</span> +1 pt, maintains rhythm & relocates target.
                <br />
                <span className="font-bold text-pink-300">• Sweet Spot (6° Center):</span> +3 pts, accelerates combo multiplier & fills Fever Meter.
              </div>
            </div>
          </div>

          {/* Rule 3: Combo Traps & Reversals */}
          <div
            className="p-3.5 rounded-xl border flex items-start gap-3"
            style={{
              backgroundColor: isDarkMode ? 'rgba(30, 30, 46, 0.4)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: 'rgba(244, 63, 94, 0.25)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                borderColor: 'rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
              }}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs mb-0.5 tracking-wider uppercase text-rose-400">
                3. High Combo Traps
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed opacity-90 font-sans">
                At 5x+ combo streaks, beware! Hits trigger instantaneous <span className="text-rose-300 font-bold">Direction Reversals</span> and speed micro-stutters.
              </div>
            </div>
          </div>

          {/* Rule 4: Fever Mode */}
          <div
            className="p-3.5 rounded-xl border flex items-start gap-3"
            style={{
              backgroundColor: isDarkMode ? 'rgba(30, 30, 46, 0.4)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: 'rgba(168, 85, 247, 0.25)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderColor: 'rgba(168, 85, 247, 0.3)',
                color: '#c084fc',
              }}
            >
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs mb-0.5 tracking-wider uppercase text-purple-400">
                4. Hyper-Fever State
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed opacity-90 font-sans">
                Fill the Fever Meter with bullseye strikes to activate 6s of 2x score multipliers and expanded sweet spots!
              </div>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div
          className="pt-3 border-t"
          style={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }}
        >
          <button
            id="btn-got-it"
            onClick={onClose}
            className="w-full py-3 rounded-xl font-mono font-bold text-xs tracking-widest uppercase transition-all active:scale-98 border"
            style={{
              backgroundColor: colors.nodeFill,
              borderColor: colors.nodeFill,
              color: '#0A0A0F',
              boxShadow: `0 0 15px ${colors.nodeGlow}`,
            }}
          >
            Acknowledge & Begin
          </button>
        </div>
      </div>
    </div>
  );
};
