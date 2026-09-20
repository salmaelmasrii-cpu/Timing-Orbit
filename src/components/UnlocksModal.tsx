import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Lock, Check, PlaySquare, Shield, Layers, Award } from 'lucide-react';
import { PlayerProfile, NodeSkinId, TrailId, ThemeColors } from '../types/game';
import { NODE_SKINS, TRAIL_EFFECTS } from '../themes/gameThemes';
import { adService } from '../services/AdService';

const SkinLivePreview: React.FC<{ skinId: NodeSkinId; colors: ThemeColors['dark']; isDarkMode: boolean }> = ({
  skinId,
  colors,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const now = performance.now();
      const nodeSize = 10;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Subtle ambient glow disk behind preview
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
      grad.addColorStop(0, `${colors.nodeFill}33`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(cx, cy);

      ctx.shadowColor = colors.nodeGlow;
      ctx.shadowBlur = 14;

      switch (skinId) {
        case 'halo': {
          const coreR = nodeSize * 0.85;
          const orbitR = nodeSize * 1.9;
          const satR = nodeSize * 0.4;
          const spin = now * 0.0035;

          ctx.strokeStyle = colors.nodeFill;
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(0, 0, orbitR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;

          for (let i = 0; i < 2; i++) {
            const a = spin + i * Math.PI;
            const sx = Math.cos(a) * orbitR;
            const sy = Math.sin(a) * orbitR;
            ctx.fillStyle = i === 0 ? colors.nodeFill : colors.accent || colors.nodeFill;
            ctx.beginPath();
            ctx.arc(sx, sy, satR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          ctx.fillStyle = colors.nodeFill;
          ctx.beginPath();
          ctx.arc(0, 0, coreR, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(0, 0, coreR, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-coreR * 0.3, -coreR * 0.3, coreR * 0.38, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'quantum': {
          const rot1 = now * 0.003;
          const rot2 = -now * 0.003;

          ctx.save();
          ctx.rotate(rot1);
          ctx.strokeStyle = colors.nodeFill;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.ellipse(0, 0, nodeSize * 1.6, nodeSize * 0.6, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          ctx.save();
          ctx.rotate(rot2 + Math.PI / 2);
          ctx.strokeStyle = colors.accent || colors.nodeFill;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.ellipse(0, 0, nodeSize * 1.6, nodeSize * 0.6, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = colors.nodeFill;
          ctx.beginPath();
          ctx.arc(0, 0, nodeSize * 0.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, nodeSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'shuriken': {
          const s = nodeSize * 1.5;
          const inner = nodeSize * 0.4;
          ctx.rotate(now * 0.007);

          ctx.fillStyle = colors.nodeFill;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(inner, -inner, s, 0);
          ctx.quadraticCurveTo(inner, inner, 0, s);
          ctx.quadraticCurveTo(-inner, inner, -s, 0);
          ctx.quadraticCurveTo(-inner, -inner, 0, -s);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, inner * 0.8, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'diamond': {
          const s = nodeSize * 1.4;
          const dw = nodeSize * 1.1;

          ctx.fillStyle = colors.nodeFill;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(dw, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-dw, 0);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(0, s);
          ctx.moveTo(-dw, 0);
          ctx.lineTo(dw, 0);
          ctx.stroke();
          break;
        }
        case 'star': {
          ctx.rotate(now * 0.004);
          const spikes = 5;
          const outerRadius = nodeSize * 1.6;
          const innerRadius = nodeSize * 0.7;
          let rot = (Math.PI / 2) * 3;
          const step = Math.PI / spikes;

          ctx.fillStyle = colors.nodeFill;
          ctx.beginPath();
          ctx.moveTo(0, -outerRadius);
          for (let i = 0; i < spikes; i++) {
            ctx.lineTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
            rot += step;
          }
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.stroke();
          break;
        }
        case 'fireball': {
          const pulse = 1 + Math.sin(now * 0.015) * 0.15;
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(0, 0, nodeSize * 1.4 * pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, nodeSize * 0.95, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, nodeSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'pulse': {
          const ripple = (now % 800) / 800;
          ctx.strokeStyle = colors.nodeFill;
          ctx.lineWidth = 2 * (1 - ripple);
          ctx.beginPath();
          ctx.arc(0, 0, nodeSize + ripple * 16, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = colors.nodeFill;
          ctx.beginPath();
          ctx.arc(0, 0, nodeSize * 1.05, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, nodeSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'dot':
        default: {
          ctx.fillStyle = colors.nodeFill;
          ctx.beginPath();
          ctx.arc(0, 0, nodeSize * 1.05, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, 0, nodeSize * 1.05, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-nodeSize * 0.3, -nodeSize * 0.3, nodeSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [skinId, colors]);

  return (
    <canvas
      ref={canvasRef}
      width={48}
      height={48}
      className="w-12 h-12 rounded-xl bg-black/30 border border-white/10 flex-shrink-0"
    />
  );
};

const TrailLivePreview: React.FC<{ trailId: TrailId; colors: ThemeColors['dark']; isDarkMode: boolean }> = ({
  trailId,
  colors,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const now = performance.now();
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Subtle ambient glow
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 24);
      grad.addColorStop(0, `${colors.nodeFill}33`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      const points: { x: number; y: number }[] = [];
      const count = 18;
      const sweepAngle = (now * 0.003) % (Math.PI * 2);
      const radius = 14;

      for (let i = 0; i < count; i++) {
        const a = sweepAngle - i * 0.12;
        points.push({
          x: cx + Math.cos(a) * radius,
          y: cy + Math.sin(a) * radius,
        });
      }

      ctx.shadowColor = colors.nodeGlow;
      ctx.shadowBlur = 10;

      switch (trailId) {
        case 'scanline': {
          ctx.setLineDash([4, 3]);
          ctx.lineWidth = 3;
          ctx.strokeStyle = colors.nodeFill;
          ctx.beginPath();
          for (let i = 0; i < points.length; i++) {
            if (i === 0) ctx.moveTo(points[i].x, points[i].y);
            else ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
          break;
        }
        case 'ribbon': {
          const t = now * 0.008;
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const progress = i / points.length;
            const wave = Math.sin(t + i * 0.6) * (3 * (1 - progress));

            ctx.strokeStyle = colors.nodeFill;
            ctx.globalAlpha = 1 - progress;
            ctx.lineWidth = (1 - progress) * 4 + 1;
            ctx.beginPath();
            ctx.moveTo(p1.x + wave, p1.y + wave);
            ctx.lineTo(p2.x + wave, p2.y + wave);
            ctx.stroke();

            ctx.strokeStyle = colors.accent || '#a855f7';
            ctx.beginPath();
            ctx.moveTo(p1.x - wave, p1.y - wave);
            ctx.lineTo(p2.x - wave, p2.y - wave);
            ctx.stroke();
          }
          break;
        }
        case 'flare': {
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const progress = i / points.length;

            ctx.strokeStyle = '#ea580c';
            ctx.globalAlpha = (1 - progress) * 0.8;
            ctx.lineWidth = (1 - progress) * 6 + 1.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            ctx.strokeStyle = '#fef08a';
            ctx.globalAlpha = 1 - progress;
            ctx.lineWidth = (1 - progress) * 2.5 + 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
          break;
        }
        case 'sparkles': {
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const progress = i / points.length;

            ctx.strokeStyle = '#ffffff';
            ctx.globalAlpha = 1 - progress;
            ctx.lineWidth = (1 - progress) * 2 + 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            if (i % 2 === 0) {
              ctx.fillStyle = colors.nodeFill;
              ctx.beginPath();
              ctx.arc(p1.x, p1.y, (1 - progress) * 2.5 + 1, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }
        case 'glitch': {
          for (let i = 0; i < points.length - 1; i += 2) {
            const p1 = points[i];
            const p2 = points[Math.min(i + 1, points.length - 1)];
            const progress = i / points.length;
            const jx = (Math.random() - 0.5) * 4;
            const jy = (Math.random() - 0.5) * 4;

            ctx.strokeStyle = Math.random() < 0.5 ? colors.nodeFill : (colors.accent || '#00f0ff');
            ctx.globalAlpha = (1 - progress) * 0.9;
            ctx.lineWidth = (1 - progress) * 4.5 + 1;
            ctx.beginPath();
            ctx.moveTo(p1.x + jx, p1.y + jy);
            ctx.lineTo(p2.x + jx, p2.y + jy);
            ctx.stroke();
          }
          break;
        }
        case 'plasma':
        default: {
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const progress = i / points.length;

            ctx.strokeStyle = colors.nodeFill;
            ctx.globalAlpha = (1 - progress) * 0.6;
            ctx.lineWidth = (1 - progress) * 7 + 2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.globalAlpha = 1 - progress;
            ctx.lineWidth = (1 - progress) * 2.5 + 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
          break;
        }
      }

      // Leading head orb
      if (points[0]) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [trailId, colors]);

  return (
    <canvas
      ref={canvasRef}
      width={48}
      height={48}
      className="w-12 h-12 rounded-xl bg-black/30 border border-white/10 flex-shrink-0"
    />
  );
};

interface UnlocksModalProps {
  profile: PlayerProfile;
  theme: ThemeColors;
  isDarkMode: boolean;
  onEquipSkin: (skinId: NodeSkinId) => void;
  onEquipTrail: (trailId: TrailId) => void;
  onUnlockSkinWithOrbs: (skinId: NodeSkinId, cost: number) => void;
  onUnlockTrailWithOrbs: (trailId: TrailId, cost: number) => void;
  onPreviewSkinGranted: (skinId: NodeSkinId) => void;
  onClose: () => void;
}

export const UnlocksModal: React.FC<UnlocksModalProps> = ({
  profile,
  theme,
  isDarkMode,
  onEquipSkin,
  onEquipTrail,
  onUnlockSkinWithOrbs,
  onUnlockTrailWithOrbs,
  onPreviewSkinGranted,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'skins' | 'trails' | 'milestones'>('skins');
  const colors = isDarkMode ? theme.dark : theme.light;

  const handlePreviewAd = (skinId: NodeSkinId, skinName: string) => {
    adService.requestSkinRentalAd(skinId, skinName, () => {
      onPreviewSkinGranted(skinId);
    });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-lg rounded-3xl border-2 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]"
        style={
          {
            backgroundColor: isDarkMode ? '#0d1117' : '#ffffff',
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
        {/* Header with Orbs Counter */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: colors.nodeFill }} />
            <h2 className="font-extrabold text-lg uppercase tracking-wider" style={{ color: colors.textPrimary }}>Unlocks & Cosmetics</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono-num font-extrabold"
              style={{
                backgroundColor: isDarkMode ? `${colors.nodeFill}15` : `${colors.nodeFill}10`,
                borderColor: `${colors.nodeFill}40`,
                color: colors.nodeFill,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{profile.orbs} Orbs</span>
            </div>

            <button
              id="btn-close-unlocks"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-500/20 active:scale-95 transition-all"
              style={{ color: colors.textSecondary }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div
          className="flex items-center gap-1.5 p-1 rounded-2xl border my-3"
          style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          }}
        >
          <button
            id="tab-node-skins"
            onClick={() => setActiveTab('skins')}
            className="flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
            style={{
              backgroundColor: activeTab === 'skins' ? colors.nodeFill : 'transparent',
              color: activeTab === 'skins' ? (isDarkMode ? '#000000' : '#FFFFFF') : colors.textSecondary,
              boxShadow: activeTab === 'skins' ? `0 2px 8px ${colors.nodeGlow}` : undefined,
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Node Skins</span>
          </button>

          <button
            id="tab-trails"
            onClick={() => setActiveTab('trails')}
            className="flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
            style={{
              backgroundColor: activeTab === 'trails' ? colors.nodeFill : 'transparent',
              color: activeTab === 'trails' ? (isDarkMode ? '#000000' : '#FFFFFF') : colors.textSecondary,
              boxShadow: activeTab === 'trails' ? `0 2px 8px ${colors.nodeGlow}` : undefined,
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Trail VFX</span>
          </button>

          <button
            id="tab-milestones"
            onClick={() => setActiveTab('milestones')}
            className="flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
            style={{
              backgroundColor: activeTab === 'milestones' ? colors.nodeFill : 'transparent',
              color: activeTab === 'milestones' ? (isDarkMode ? '#000000' : '#FFFFFF') : colors.textSecondary,
              boxShadow: activeTab === 'milestones' ? `0 2px 8px ${colors.nodeGlow}` : undefined,
            }}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Milestones</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto py-2 space-y-3 pr-1">
          {activeTab === 'skins' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NODE_SKINS.map((skin) => {
                const isUnlocked = profile.unlockedSkins.includes(skin.id);
                const isEquipped = (profile.previewSkin || profile.selectedSkin) === skin.id;
                const isPreview = profile.previewSkin === skin.id;
                const canAfford = profile.orbs >= skin.priceOrbs;

                return (
                  <div
                    key={skin.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                      isEquipped ? 'ring-2 ring-cyan-400' : ''
                    }`}
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                      borderColor: isEquipped ? '#38bdf8' : isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <SkinLivePreview skinId={skin.id} colors={colors} isDarkMode={isDarkMode} />
                        <div>
                          <div className="font-extrabold text-xs flex items-center gap-1.5">
                            <span>{skin.name}</span>
                            {isPreview && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
                                {profile.previewSkinRunsLeft} runs
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{skin.description}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-2 pt-2 border-t flex items-center justify-between" style={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }}>
                      <span className="text-[10px] text-slate-400">
                        {isUnlocked ? 'Unlocked' : `Req: Lvl ${skin.unlockLevel} or ${skin.priceOrbs} Orbs`}
                      </span>

                      {isEquipped ? (
                        <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10">
                          <Check className="w-3.5 h-3.5" />
                          <span>Equipped</span>
                        </div>
                      ) : isUnlocked ? (
                        <button
                          id={`btn-equip-${skin.id}`}
                          onClick={() => onEquipSkin(skin.id)}
                          className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                        >
                          Equip
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {skin.priceOrbs > 0 && (
                            <button
                              id={`btn-buy-${skin.id}`}
                              disabled={!canAfford}
                              onClick={() => onUnlockSkinWithOrbs(skin.id, skin.priceOrbs)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                canAfford
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              Buy ({skin.priceOrbs})
                            </button>
                          )}
                          <button
                            id={`btn-trial-${skin.id}`}
                            onClick={() => handlePreviewAd(skin.id, skin.name)}
                            className="px-2 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 rounded-lg text-[11px] font-bold flex items-center gap-1 active:scale-95"
                            title="Watch short ad to try for 3 runs"
                          >
                            <PlaySquare className="w-3 h-3" />
                            <span>Try</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'trails' && (
            <div className="space-y-2.5">
              {TRAIL_EFFECTS.map((trail) => {
                const isUnlocked = profile.unlockedTrails.includes(trail.id);
                const isEquipped = profile.selectedTrail === trail.id;
                const canAfford = profile.orbs >= trail.priceOrbs;

                return (
                  <div
                    key={trail.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      isEquipped ? 'ring-2 ring-cyan-400' : ''
                    }`}
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                      borderColor: isEquipped ? '#38bdf8' : isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <TrailLivePreview trailId={trail.id} colors={colors} isDarkMode={isDarkMode} />
                      <div>
                        <div className="font-extrabold text-xs flex items-center gap-2">
                          <span>{trail.name}</span>
                          {isEquipped && <span className="text-[10px] text-cyan-400 font-bold">(Active)</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{trail.description}</div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {isUnlocked ? 'Unlocked' : `Unlocked at Level ${trail.unlockLevel} or ${trail.priceOrbs} Orbs`}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isEquipped ? (
                        <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold px-3 py-1 rounded-lg bg-cyan-500/10">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </div>
                      ) : isUnlocked ? (
                        <button
                          id={`btn-equip-trail-${trail.id}`}
                          onClick={() => onEquipTrail(trail.id)}
                          className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                        >
                          Equip
                        </button>
                      ) : (
                        <button
                          id={`btn-buy-trail-${trail.id}`}
                          disabled={!canAfford}
                          onClick={() => onUnlockTrailWithOrbs(trail.id, trail.priceOrbs)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>{trail.priceOrbs} Orbs</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs">
                <div className="font-extrabold text-cyan-400 mb-1">How Level Progression Works</div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  Every 10 successful hits in a run increments your game level. Every 5 levels unlocks a permanent cosmetic node skin or trail effect!
                </div>
              </div>

              {[
                { lvl: 5, title: 'Halo Ring Node & Solar Embers', desc: 'Orbiting satellite skin with particle sparks' },
                { lvl: 10, title: 'Quantum Ring & Digital Stream', desc: 'Dual-spin orbital rings with scanlines' },
                { lvl: 15, title: 'Ninja Star Blade & Stardust Trail', desc: 'Rotating quad shuriken with crystal dust' },
                { lvl: 20, title: 'Prism Diamond & Dual Helix Ribbon', desc: 'Faceted light crystal with double wave stream' },
                { lvl: 25, title: 'Supernova Star & Quantum Noise', desc: '5-point star node with glitch matrix noise' },
                { lvl: 30, title: 'Solar Flare Core', desc: 'Volatile flame core with heat wave distortion' },
                { lvl: 35, title: 'Echo Beacon Node', desc: 'Emits concentric radar ripples in flight' },
              ].map((m) => (
                <div
                  key={m.lvl}
                  className="p-3 rounded-2xl border flex items-center justify-between"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center font-mono-num">
                      <span className="text-[9px] uppercase text-slate-400 font-bold">LVL</span>
                      <span className="text-xs font-black text-amber-400 leading-none">{m.lvl}</span>
                    </div>
                    <div>
                      <div className="font-extrabold text-xs">{m.title}</div>
                      <div className="text-[10px] text-slate-400">{m.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
