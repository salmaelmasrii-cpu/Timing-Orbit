import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Radio,
  Vibrate,
  Moon,
  Sun,
  Palette,
  RotateCcw,
  Check,
  AlertTriangle,
  Sliders,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { GameSettings, ThemeId, ThemeColors } from '../types/game';
import { THEMES } from '../themes/gameThemes';

interface SettingsModalProps {
  settings: GameSettings;
  theme: ThemeColors;
  isDarkMode: boolean;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onOpenUnlocks?: () => void;
  onReplaySplash?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  theme,
  isDarkMode,
  onUpdateSettings,
  onResetProgress,
  onOpenUnlocks,
  onReplaySplash,
  onOpenPrivacyPolicy,
  onClose,
}) => {
  const colors = isDarkMode ? theme.dark : theme.light;
  const [activeTab, setActiveTab] = useState<'audio' | 'visuals' | 'data'>('audio');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm sm:max-w-md rounded-3xl border-2 shadow-2xl p-3.5 sm:p-6 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] transition-all"
        style={
          {
            backgroundColor: isDarkMode ? '#0D1117' : '#FFFFFF',
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
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }}>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5" style={{ color: colors.nodeFill }} />
            <h2 className="font-extrabold text-base sm:text-lg uppercase tracking-wider">Settings</h2>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-500/20 active:scale-95 transition-all cursor-pointer"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div
          className="flex items-center gap-1 p-1 rounded-2xl border my-3"
          style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.04)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <button
            id="tab-audio"
            onClick={() => setActiveTab('audio')}
            className="flex-1 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === 'audio' ? colors.nodeFill : 'transparent',
              color: activeTab === 'audio' ? (isDarkMode ? '#000000' : '#FFFFFF') : colors.textSecondary,
              boxShadow: activeTab === 'audio' ? `0 2px 8px ${colors.nodeGlow}` : undefined,
            }}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio</span>
          </button>

          <button
            id="tab-visuals"
            onClick={() => setActiveTab('visuals')}
            className="flex-1 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === 'visuals' ? colors.nodeFill : 'transparent',
              color: activeTab === 'visuals' ? (isDarkMode ? '#000000' : '#FFFFFF') : colors.textSecondary,
              boxShadow: activeTab === 'visuals' ? `0 2px 8px ${colors.nodeGlow}` : undefined,
            }}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Visuals</span>
          </button>

          <button
            id="tab-data"
            onClick={() => setActiveTab('data')}
            className="flex-1 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === 'data' ? colors.nodeFill : 'transparent',
              color: activeTab === 'data' ? (isDarkMode ? '#000000' : '#FFFFFF') : colors.textSecondary,
              boxShadow: activeTab === 'data' ? `0 2px 8px ${colors.nodeGlow}` : undefined,
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Data</span>
          </button>
        </div>

        {/* Tab Content Panel - Fully responsive and scrollable in landscape/rotated mode */}
        <div className="flex-1 min-h-0 overflow-y-auto py-2 pr-1 space-y-3 scroll-smooth">
          {/* TAB 1: AUDIO */}
          {activeTab === 'audio' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              {/* Sound FX */}
              <div
                className="flex items-center justify-between p-2.5 rounded-2xl border"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  {settings.soundFX ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  <div>
                    <div className="font-bold text-xs">Sound Effects</div>
                    <div className="text-[10px] text-slate-400">Hits & fever audio chimes</div>
                  </div>
                </div>
                <button
                  id="btn-toggle-sound-fx"
                  onClick={() => onUpdateSettings({ soundFX: !settings.soundFX })}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                    settings.soundFX ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Melodic Synth */}
              <div
                className="flex items-center justify-between p-2.5 rounded-2xl border"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-bold text-xs">Melodic Combos</div>
                    <div className="text-[10px] text-slate-400">Escalating scale on Bullseyes</div>
                  </div>
                </div>
                <button
                  id="btn-toggle-melody"
                  onClick={() => onUpdateSettings({ melodicSynth: !settings.melodicSynth })}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                    settings.melodicSynth ? 'bg-purple-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Ambient Low Drone */}
              <div
                className="flex items-center justify-between p-2.5 rounded-2xl border"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold text-xs">Ambient Synthesizer</div>
                    <div className="text-[10px] text-slate-400">Dynamic reactive background tone</div>
                  </div>
                </div>
                <button
                  id="btn-toggle-drone"
                  onClick={() => onUpdateSettings({ ambientDrone: !settings.ambientDrone })}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                    settings.ambientDrone ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Haptics */}
              <div
                className="flex items-center justify-between p-2.5 rounded-2xl border"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Vibrate className="w-4 h-4 text-orange-400" />
                  <div>
                    <div className="font-bold text-xs">Haptic Vibration</div>
                    <div className="text-[10px] text-slate-400">Tactile impulses on hits</div>
                  </div>
                </div>
                <button
                  id="btn-toggle-haptics"
                  onClick={() => onUpdateSettings({ haptics: !settings.haptics })}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                    settings.haptics ? 'bg-orange-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VISUALS */}
          {activeTab === 'visuals' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Cosmetics & Unlocks Shop Link */}
              {onOpenUnlocks && (
                <div
                  className="flex items-center justify-between p-3 rounded-2xl border"
                  style={{
                    backgroundColor: isDarkMode ? `${colors.nodeFill}15` : `${colors.nodeFill}10`,
                    borderColor: `${colors.nodeFill}44`,
                    boxShadow: isDarkMode ? `0 0 16px ${colors.nodeGlow}20` : undefined,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center border"
                      style={{
                        backgroundColor: colors.nodeFill,
                        borderColor: '#ffffff',
                        boxShadow: `0 0 10px ${colors.nodeGlow}`,
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-xs" style={{ color: colors.textPrimary }}>
                        Skins & Trails Shop
                      </div>
                      <div className="text-[10px] text-slate-400">Unlock & customize visual FX</div>
                    </div>
                  </div>

                  <button
                    id="btn-settings-open-shop"
                    onClick={() => {
                      onClose();
                      onOpenUnlocks();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wide cursor-pointer active:scale-95 transition-all shadow-sm"
                    style={{
                      backgroundColor: colors.nodeFill,
                      color: isDarkMode ? '#000000' : '#FFFFFF',
                      boxShadow: `0 2px 8px ${colors.nodeGlow}`,
                    }}
                  >
                    <span>OPEN</span>
                  </button>
                </div>
              )}

              {/* Dark / Light Mode Switch */}
              <div
                className="flex items-center justify-between p-2.5 rounded-2xl border"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="flex items-center gap-2">
                  {settings.isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span className="font-bold text-xs">Color Mode</span>
                </div>

                <button
                  id="btn-toggle-dark-mode"
                  onClick={() => onUpdateSettings({ isDarkMode: !settings.isDarkMode })}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border cursor-pointer active:scale-95 transition-all"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                    color: colors.textPrimary,
                  }}
                >
                  {settings.isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>

              {/* Theme Grid */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Color Themes
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                    const tObj = THEMES[tId];
                    const isSelected = settings.themeId === tId;
                    const previewColors = settings.isDarkMode ? tObj.dark : tObj.light;

                    return (
                      <button
                        key={tId}
                        id={`btn-theme-${tId}`}
                        onClick={() => onUpdateSettings({ themeId: tId })}
                        className="p-2 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer active:scale-98"
                        style={{
                          backgroundColor: isDarkMode
                            ? isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)'
                            : isSelected ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.02)',
                          borderColor: isSelected ? previewColors.nodeFill : isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                          boxShadow: isSelected ? `0 0 10px ${previewColors.nodeGlow}` : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="font-extrabold text-[11px] truncate pr-1"
                            style={{ color: isSelected ? previewColors.nodeFill : colors.textPrimary }}
                          >
                            {tObj.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: previewColors.nodeFill }} />}
                        </div>
                        {/* Color Swatches */}
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: previewColors.nodeFill }} />
                          <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: previewColors.safeZone }} />
                          <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: previewColors.bullseye }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* View Splash Screen Button */}
              {onReplaySplash && (
                <button
                  id="btn-replay-splash"
                  onClick={onReplaySplash}
                  className="w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    color: colors.textPrimary,
                  }}
                >
                  <Sliders className="w-3.5 h-3.5" style={{ color: colors.nodeFill }} />
                  <span>Replay Splash Intro Animation</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 3: DATA & RESET */}
          {activeTab === 'data' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              <div
                className="p-3 rounded-2xl border text-left space-y-1.5"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                }}
              >
                <div className="font-bold text-xs">Local Save Data</div>
                <div className="text-[11px] text-slate-400">
                  Your High Score, Orbs, and unlocked Node Skins are stored safely on your device.
                </div>
              </div>

              {/* Privacy Policy & Terms */}
              {onOpenPrivacyPolicy && (
                <button
                  id="btn-settings-privacy-policy"
                  onClick={onOpenPrivacyPolicy}
                  className="w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    color: colors.textPrimary,
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: colors.nodeFill }} />
                  <span>Privacy Policy & Local Data Terms</span>
                </button>
              )}

              {/* Reset Section */}
              <div>
                {!showResetConfirm ? (
                  <button
                    id="btn-initiate-reset"
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-2.5 px-3 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Game Progress</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Are you sure? This cannot be undone.</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        id="btn-confirm-reset"
                        onClick={() => {
                          onResetProgress();
                          setShowResetConfirm(false);
                        }}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Confirm Reset
                      </button>
                      <button
                        id="btn-cancel-reset"
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

