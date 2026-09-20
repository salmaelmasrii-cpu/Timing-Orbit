import React, { useState } from 'react';
import { ThemeColors, AppIconId } from '../types/game';
import { soundSynth } from '../audio/SoundSynth';
import {
  GameAppIcon,
  APP_ICONS_LIST,
  AppIconDefinition,
  DarkGameIcon,
  LightGameIcon,
  BubbleGameIcon,
} from './GameIcons';
import {
  Sparkles,
  Check,
  X,
  Smartphone,
  Download,
  Eye,
  Layers,
} from 'lucide-react';

interface AppIconModalProps {
  theme: ThemeColors;
  isDarkMode: boolean;
  selectedIcon: AppIconId;
  onSelectIcon: (iconId: AppIconId) => void;
  onClose: () => void;
}

export const AppIconModal: React.FC<AppIconModalProps> = ({
  theme,
  isDarkMode,
  selectedIcon,
  onSelectIcon,
  onClose,
}) => {
  const [activePreview, setActivePreview] = useState<AppIconId>(selectedIcon);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const colors = isDarkMode ? theme.dark : theme.light;
  const currentDef = APP_ICONS_LIST.find((icon) => icon.id === activePreview) || APP_ICONS_LIST[0];

  const handlePickIcon = (id: AppIconId) => {
    soundSynth.playSafeHit();
    setActivePreview(id);
  };

  const handleApplyIcon = () => {
    soundSynth.playBullseyeHit(1);
    onSelectIcon(activePreview);
  };

  const handleDownloadSVG = (iconDef: AppIconDefinition) => {
    soundSynth.playSafeHit();
    // Generate standalone SVG string for export
    let svgString = '';
    if (iconDef.id === 'dark') {
      svgString = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="darkBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0B0F19"/><stop offset="50%" stopColor="#06080E"/><stop offset="100%" stopColor="#020305"/></linearGradient><radialGradient id="darkGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#00F0FF" stopOpacity="0.25"/><stop offset="60%" stopColor="#0077FF" stopOpacity="0.08"/><stop offset="100%" stopColor="#000000" stopOpacity="0"/></radialGradient><linearGradient id="cyanNeon" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#80FFFF"/><stop offset="50%" stopColor="#00F0FF"/><stop offset="100%" stopColor="#0072FF"/></linearGradient></defs><rect width="512" height="512" rx="115" fill="url(#darkBg)"/><rect width="512" height="512" rx="115" fill="url(#darkGlow)"/><circle cx="256" cy="256" r="165" stroke="#00F0FF" strokeOpacity="0.3" strokeWidth="4"/><path d="M 256 91 A 165 165 0 0 1 421 256" stroke="url(#cyanNeon)" strokeWidth="10" strokeLinecap="round"/><circle cx="256" cy="256" r="20" fill="#00F0FF"/><circle cx="421" cy="256" r="32" fill="#00F0FF"/><circle cx="421" cy="256" r="18" fill="#FFFFFF"/></svg>`;
    } else if (iconDef.id === 'light') {
      svgString = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lightBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="60%" stopColor="#F5F7FB"/><stop offset="100%" stopColor="#E5EAF4"/></linearGradient><linearGradient id="sapphireRing" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0284C7"/><stop offset="50%" stopColor="#2563EB"/><stop offset="100%" stopColor="#4F46E5"/></linearGradient></defs><rect width="512" height="512" rx="115" fill="url(#lightBg)"/><circle cx="256" cy="256" r="165" stroke="#2563EB" strokeOpacity="0.25" strokeWidth="4"/><path d="M 256 91 A 165 165 0 0 1 421 256" stroke="url(#sapphireRing)" strokeWidth="10" strokeLinecap="round"/><circle cx="256" cy="256" r="20" fill="url(#sapphireRing)"/><circle cx="421" cy="256" r="30" fill="url(#sapphireRing)"/><circle cx="421" cy="256" r="16" fill="#FFFFFF"/></svg>`;
    } else {
      svgString = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bubbleBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#120A2A"/><stop offset="45%" stopColor="#1E103E"/><stop offset="100%" stopColor="#0A1836"/></linearGradient><radialGradient id="sphereGlass" cx="35%" cy="30%" r="65%"><stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/><stop offset="25%" stopColor="#70E4FF" stopOpacity="0.8"/><stop offset="60%" stopColor="#FF66D8" stopOpacity="0.65"/><stop offset="90%" stopColor="#6E00FF" stopOpacity="0.85"/><stop offset="100%" stopColor="#00D2FF" stopOpacity="0.95"/></radialGradient></defs><rect width="512" height="512" rx="115" fill="url(#bubbleBg)"/><circle cx="256" cy="256" r="165" stroke="#FF77E9" strokeOpacity="0.4" strokeWidth="12"/><circle cx="256" cy="256" r="48" fill="url(#sphereGlass)"/><circle cx="421" cy="256" r="36" fill="url(#sphereGlass)"/><circle cx="400" cy="195" r="10" fill="url(#sphereGlass)"/></svg>`;
    }

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timing-orbit-icon-${iconDef.id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(iconDef.id);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div
      id="app-icon-showcase-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200"
      style={{
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.58)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div
        id="app-icon-modal-dialog"
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: isDarkMode ? '#0E111B' : '#FFFFFF',
          borderColor: isDarkMode ? `${colors.nodeFill}33` : `${colors.nodeFill}25`,
          color: colors.textPrimary,
          boxShadow: isDarkMode
            ? `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px ${colors.nodeGlow}22`
            : '0 20px 50px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Modal Header */}
        <div
          className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0"
          style={{
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm"
              style={{
                backgroundColor: `${colors.nodeFill}20`,
                borderColor: `${colors.nodeFill}40`,
                color: colors.nodeFill,
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold uppercase tracking-wide">
                Game App Icons
              </h2>
              <p
                className="text-xs font-rajdhani font-semibold tracking-wider uppercase"
                style={{ color: colors.textSecondary }}
              >
                Dark Mode • Light Mode • Bubble Mode
              </p>
            </div>
          </div>

          <button
            id="btn-close-app-icon-modal"
            onClick={() => {
              soundSynth.playSafeHit();
              onClose();
            }}
            className="w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              color: colors.textSecondary,
            }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Main Selected Hero Icon Preview with Mobile Frame simulation */}
          <div
            className="p-5 sm:p-6 rounded-3xl border flex flex-col sm:flex-row items-center gap-5 sm:gap-6 relative overflow-hidden"
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDarkMode ? `${currentDef.tagColor}44` : `${currentDef.tagColor}33`,
            }}
          >
            {/* Ambient Background Glow */}
            <div
              className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: currentDef.tagColor }}
            />

            {/* High-Res Icon Display */}
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="relative p-1 rounded-[28%] border shadow-2xl transition-all duration-300">
                <GameAppIcon id={activePreview} size={130} />
              </div>
              {/* Active Badge */}
              {selectedIcon === activePreview && (
                <div
                  className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold tracking-wider uppercase flex items-center gap-1 border shadow-sm"
                  style={{
                    backgroundColor: `${colors.nodeFill}20`,
                    borderColor: colors.nodeFill,
                    color: colors.nodeFill,
                  }}
                >
                  <Check className="w-3 h-3" />
                  <span>ACTIVE ICON</span>
                </div>
              )}
            </div>

            {/* Detailed Info Card */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold tracking-wider uppercase border"
                  style={{
                    backgroundColor: `${currentDef.tagColor}18`,
                    borderColor: `${currentDef.tagColor}55`,
                    color: currentDef.tagColor,
                  }}
                >
                  {currentDef.tag}
                </span>
                <span className="text-xs font-rajdhani font-semibold text-slate-400">
                  {currentDef.subtitle}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-orbitron font-extrabold uppercase tracking-tight">
                {currentDef.name}
              </h3>

              <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">
                {currentDef.description}
              </p>

              {/* Action Buttons for active hero */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {selectedIcon !== activePreview ? (
                  <button
                    id="btn-apply-selected-icon"
                    onClick={handleApplyIcon}
                    className="px-4 py-2 rounded-xl text-xs font-orbitron font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
                    style={{
                      backgroundColor: colors.nodeFill,
                      color: isDarkMode ? '#000000' : '#FFFFFF',
                      boxShadow: `0 4px 15px ${colors.nodeGlow}55`,
                    }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>SET AS GAME ICON</span>
                  </button>
                ) : (
                  <div
                    className="px-3.5 py-2 rounded-xl text-xs font-orbitron font-bold uppercase tracking-wider flex items-center gap-1.5 border"
                    style={{
                      borderColor: `${colors.nodeFill}40`,
                      backgroundColor: `${colors.nodeFill}15`,
                      color: colors.nodeFill,
                    }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>CURRENTLY ACTIVE</span>
                  </div>
                )}

                <button
                  id="btn-download-icon-svg"
                  onClick={() => handleDownloadSVG(currentDef)}
                  className="px-3.5 py-2 rounded-xl text-xs font-rajdhani font-bold uppercase tracking-wider flex items-center gap-1.5 border cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  style={{
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    color: colors.textPrimary,
                  }}
                  title="Download vector SVG"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadSuccess === currentDef.id ? 'DOWNLOADED!' : 'EXPORT SVG'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Icon Selector Grid (All 3 Icons Side by Side) */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" style={{ color: colors.nodeFill }} />
                <span className="text-xs font-orbitron font-bold uppercase tracking-wider">
                  Available Built-In Icons
                </span>
              </div>
              <span className="text-[11px] font-rajdhani font-bold text-slate-400">
                Tap to inspect
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {APP_ICONS_LIST.map((icon) => {
                const isSelected = activePreview === icon.id;
                const isCurrentActive = selectedIcon === icon.id;

                return (
                  <div
                    key={icon.id}
                    id={`icon-card-${icon.id}`}
                    onClick={() => handlePickIcon(icon.id)}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 scale-[1.02] shadow-lg'
                        : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
                    }`}
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                      borderColor: isSelected
                        ? icon.tagColor
                        : isDarkMode
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.08)',
                      ringColor: isSelected ? icon.tagColor : undefined,
                    }}
                  >
                    {/* Icon Graphic */}
                    <div className="relative">
                      <GameAppIcon id={icon.id} size={76} />
                      {isCurrentActive && (
                        <div
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border shadow-md"
                          style={{
                            backgroundColor: colors.nodeFill,
                            borderColor: '#FFFFFF',
                            color: isDarkMode ? '#000000' : '#FFFFFF',
                          }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="text-center w-full">
                      <div className="font-orbitron font-bold text-xs uppercase tracking-tight truncate">
                        {icon.name}
                      </div>
                      <div
                        className="text-[10px] font-rajdhani font-bold uppercase tracking-wider"
                        style={{ color: icon.tagColor }}
                      >
                        {icon.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 sm:p-5 border-t flex items-center justify-between shrink-0"
          style={{
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
          }}
        >
          <div className="text-xs text-slate-400 font-rajdhani font-bold flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" />
            <span>Built directly into game assets</span>
          </div>

          <button
            id="btn-done-app-icon"
            onClick={() => {
              soundSynth.playSafeHit();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
            style={{
              backgroundColor: colors.nodeFill,
              color: isDarkMode ? '#000000' : '#FFFFFF',
            }}
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
