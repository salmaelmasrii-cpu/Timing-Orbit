import React, { useState } from 'react';
import { ThemeColors } from '../types/game';
import { soundSynth } from '../audio/SoundSynth';
import {
  ShieldCheck,
  Lock,
  Database,
  Volume2,
  Tv,
  Trash2,
  Check,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';

interface PrivacyPolicyModalProps {
  theme: ThemeColors;
  isDarkMode: boolean;
  isConsentMode?: boolean; // When true, mandatory acceptance required on initial launch
  onAccept: () => void;
  onClose?: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  theme,
  isDarkMode,
  isConsentMode = false,
  onAccept,
  onClose,
}) => {
  const [agreedCheckbox, setAgreedCheckbox] = useState(true);
  const colors = isDarkMode ? theme.dark : theme.light;

  const handleAccept = () => {
    soundSynth.playSafeHit();
    onAccept();
  };

  const handleClose = () => {
    soundSynth.playSafeHit();
    if (onClose) {
      onClose();
    } else {
      onAccept();
    }
  };

  return (
    <div
      id="privacy-policy-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200"
      style={{
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.82)' : 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        id="privacy-policy-dialog"
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: isDarkMode ? '#0F111A' : '#FFFFFF',
          borderColor: isDarkMode ? `${colors.nodeFill}33` : `${colors.nodeFill}25`,
          color: colors.textPrimary,
          boxShadow: isDarkMode
            ? `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${colors.nodeGlow}22`
            : '0 20px 50px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Header */}
        <div
          className="p-5 sm:p-6 border-b flex items-center justify-between shrink-0"
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold uppercase tracking-wide">
                Privacy Policy & Terms
              </h2>
              <p
                className="text-xs font-rajdhani font-semibold tracking-wider uppercase"
                style={{ color: colors.textSecondary }}
              >
                Timing Orbit • Safe & Offline First
              </p>
            </div>
          </div>

          {!isConsentMode && onClose && (
            <button
              id="btn-close-privacy-top"
              onClick={handleClose}
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
          )}
        </div>

        {/* Policy Content Body with Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-[13px] leading-relaxed">
          {/* Summary Box */}
          <div
            className="p-4 rounded-2xl border flex items-start gap-3"
            style={{
              backgroundColor: isDarkMode ? `${colors.nodeFill}10` : `${colors.nodeFill}08`,
              borderColor: `${colors.nodeFill}30`,
            }}
          >
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: colors.nodeFill }} />
            <div className="text-xs">
              <span className="font-bold font-orbitron uppercase text-[11px] block mb-0.5" style={{ color: colors.nodeFill }}>
                Your Privacy is Guaranteed
              </span>
              Timing Orbit does not collect your personal name, email, contact list, or location. All game scores and unlocks remain strictly on your local device.
            </div>
          </div>

          {/* Section 1: Offline Local Storage */}
          <div
            className="p-3.5 rounded-2xl border text-left space-y-1.5"
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            }}
          >
            <div className="flex items-center gap-2 font-bold font-orbitron text-xs">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>1. Data Storage & Local Persistence</span>
            </div>
            <p className="text-slate-400 leading-normal">
              All gameplay information—including high scores, orb balances, unlocked skins, combo records, and audio preferences—is stored locally in your browser's <code className="px-1 py-0.5 rounded bg-black/20 text-slate-300 font-mono text-[11px]">localStorage</code>. No external user database or login profile is required.
            </p>
          </div>

          {/* Section 2: Audio & Device Haptics */}
          <div
            className="p-3.5 rounded-2xl border text-left space-y-1.5"
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            }}
          >
            <div className="flex items-center gap-2 font-bold font-orbitron text-xs">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>2. Audio Synthesis & Vibration Haptics</span>
            </div>
            <p className="text-slate-400 leading-normal">
              Sound effects are generated algorithmically in real-time via the browser's Web Audio API. Vibration feedback uses the HTML5 Vibration API on supported mobile devices. We do not access microphones, cameras, or biometric sensors.
            </p>
          </div>

          {/* Section 3: Advertising */}
          <div
            className="p-3.5 rounded-2xl border text-left space-y-1.5"
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            }}
          >
            <div className="flex items-center gap-2 font-bold font-orbitron text-xs">
              <Tv className="w-4 h-4 text-amber-400" />
              <span>3. Advertising Partners</span>
            </div>
            <p className="text-slate-400 leading-normal">
              Timing Orbit is ad-supported. To show ads (including rewarded ads for bonuses like extra lives, trial skins, or double orbs) and keep the game free, we use third-party ad SDKs such as Unity Ads / LevelPlay, and may add Google AdMob, Meta Audience Network, InMobi, or ironSource. These partners may use device and advertising identifiers (such as Apple's IDFA, only with your App Tracking Transparency permission) to serve and measure ads. Declining tracking still shows ads, just not personalized ones.
            </p>
          </div>

          {/* Section 4: Data Erasure & Control */}
          <div
            className="p-3.5 rounded-2xl border text-left space-y-1.5"
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            }}
          >
            <div className="flex items-center gap-2 font-bold font-orbitron text-xs">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>4. Complete User Data Control</span>
            </div>
            <p className="text-slate-400 leading-normal">
              You maintain total ownership of your game records. You can permanently wipe all stored scores, unlocked skins, and preferences at any time by selecting <strong>Settings &gt; Data &gt; Reset All Game Progress</strong>.
            </p>
          </div>
        </div>

        {/* Footer with Consent Checkbox & Action Button */}
        <div
          className="p-4 sm:p-6 border-t flex flex-col gap-3 shrink-0"
          style={{
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
          }}
        >
          {/* Agreement Checkbox */}
          {isConsentMode && (
            <div
              onClick={() => setAgreedCheckbox(!agreedCheckbox)}
              className="flex items-center gap-3 cursor-pointer select-none px-1"
            >
              <div
                className="w-5 h-5 rounded-lg border flex items-center justify-center transition-all"
                style={{
                  backgroundColor: agreedCheckbox ? colors.nodeFill : 'transparent',
                  borderColor: agreedCheckbox ? colors.nodeFill : colors.textSecondary,
                  boxShadow: agreedCheckbox ? `0 0 10px ${colors.nodeGlow}` : undefined,
                }}
              >
                {agreedCheckbox && (
                  <Check
                    className="w-3.5 h-3.5"
                    style={{ color: isDarkMode ? '#000000' : '#FFFFFF' }}
                  />
                )}
              </div>
              <span className="text-xs font-rajdhani font-bold text-slate-300">
                I understand and agree to the Privacy Policy & Local Storage Terms
              </span>
            </div>
          )}

          {/* Primary Action Button */}
          {isConsentMode ? (
            <button
              id="btn-accept-privacy-policy"
              disabled={!agreedCheckbox}
              onClick={handleAccept}
              className={`w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 font-orbitron font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-lg active:scale-98 ${
                agreedCheckbox ? 'opacity-100 hover:scale-[1.01]' : 'opacity-40 cursor-not-allowed'
              }`}
              style={{
                backgroundColor: colors.nodeFill,
                color: isDarkMode ? '#000000' : '#FFFFFF',
                boxShadow: agreedCheckbox ? `0 4px 20px ${colors.nodeGlow}66` : undefined,
              }}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>ACCEPT & CONTINUE</span>
            </button>
          ) : (
            <button
              id="btn-dismiss-privacy-policy"
              onClick={handleClose}
              className="w-full py-3 px-6 rounded-2xl flex items-center justify-center gap-2 font-orbitron font-bold text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer active:scale-98"
              style={{
                backgroundColor: colors.nodeFill,
                color: isDarkMode ? '#000000' : '#FFFFFF',
                boxShadow: `0 4px 16px ${colors.nodeGlow}44`,
              }}
            >
              <span>UNDERSTOOD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
