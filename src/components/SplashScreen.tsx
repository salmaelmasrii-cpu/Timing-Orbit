import React, { useState, useEffect, useRef } from 'react';
import { ThemeColors, NodeSkinId, TrailId } from '../types/game';
import { soundSynth } from '../audio/SoundSynth';

interface SplashScreenProps {
  theme: ThemeColors;
  isDarkMode: boolean;
  skinId?: NodeSkinId;
  trailId?: TrailId;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  theme,
  isDarkMode,
  onFinish,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const colors = isDarkMode ? theme.dark : theme.light;

  // Play sound on mount
  useEffect(() => {
    soundSynth.playSplashIntro();
  }, []);

  // Automatic Progress Animation -> auto transition on completion
  useEffect(() => {
    const duration = 2000; // 2.0s sleek auto boot
    const interval = 20;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          // Auto-proceed smoothly once loading reaches 100%
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              onFinish();
            }, 300);
          }, 150);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onFinish]);

  // Clean Orbit Engine Rendering matching the homepage idle rotation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      const now = (Date.now() - startTimeRef.current) / 1000;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const orbitRadius = Math.min(width, height) * 0.38;

      // 1. Radar background guide grid & crosshairs
      ctx.save();
      ctx.strokeStyle = colors.gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, orbitRadius * 0.45, 0, Math.PI * 2);
      ctx.arc(cx, cy, orbitRadius * 1.15, 0, Math.PI * 2);
      ctx.arc(cx, cy, orbitRadius * 1.45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - orbitRadius * 1.5, cy);
      ctx.lineTo(cx + orbitRadius * 1.5, cy);
      ctx.moveTo(cx, cy - orbitRadius * 1.5);
      ctx.lineTo(cx, cy + orbitRadius * 1.5);
      ctx.stroke();
      ctx.restore();

      // 2. Exact Orbit Track Lines (Clean, no green target arc)
      ctx.save();
      // Outer guide ring
      ctx.strokeStyle = colors.ringTrack;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, orbitRadius * 1.14, 0, Math.PI * 2);
      ctx.stroke();

      // Main dashed precision track
      ctx.strokeStyle = colors.ringTrack;
      ctx.lineWidth = 3.5;
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Solid base track
      ctx.setLineDash([]);
      ctx.strokeStyle = colors.ringTrack;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Orbit Node Dynamics - exact homepage rotation speed (0.85 rad/s)
      const nodeSpeed = 0.85;
      const nodeAngle = now * nodeSpeed;
      const nodeX = cx + Math.cos(nodeAngle) * orbitRadius;
      const nodeY = cy + Math.sin(nodeAngle) * orbitRadius;

      // Render Node (matching in-game node geometry and glow)
      const nodeSize = 12.0;
      ctx.save();
      ctx.translate(nodeX, nodeY);
      const tangent = nodeAngle + Math.PI / 2;
      ctx.rotate(tangent);

      ctx.shadowColor = colors.nodeGlow;
      ctx.shadowBlur = 20;

      // Node Outer Body
      ctx.fillStyle = colors.nodeFill;
      ctx.beginPath();
      ctx.arc(0, 0, nodeSize, 0, Math.PI * 2);
      ctx.fill();

      // Core Highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, nodeSize * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Outer razor rim
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 4. Center Pulse Core (matching homepage visual center)
      ctx.save();
      const pulse = Math.sin(now * 2.5) * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 18 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = isDarkMode ? `${colors.nodeFill}15` : `${colors.nodeFill}10`;
      ctx.fill();
      ctx.strokeStyle = `${colors.nodeFill}44`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.nodeFill;
      ctx.shadowColor = colors.nodeGlow;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [colors, isDarkMode]);

  return (
    <div
      id="splash-screen-overlay"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 select-none transition-all duration-300 pointer-events-none ${
        isFadingOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: colors.bg,
        color: colors.textPrimary,
      }}
    >
      {/* Background Ambience & Radial Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: colors.nodeFill }}
        />

        {/* Ambient Grid Lines matching game */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(${colors.nodeFill} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Spacer top */}
      <div className="w-full safe-pt" />

      {/* Center 1:1 In-Game Visual Orbit Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-xs sm:max-w-sm">
        {/* Orbit Canvas with identical homepage track, radar rings, and revolving node */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Brand Title */}
        <div className="text-center mt-3">
          <h1
            className="font-orbitron font-black text-3xl sm:text-4xl tracking-tight uppercase"
            style={{
              color: colors.textPrimary,
              textShadow: isDarkMode ? `0 0 20px ${colors.nodeGlow}55` : undefined,
            }}
          >
            TIMING <span style={{ color: colors.nodeFill }}>ORBIT</span>
          </h1>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-2 safe-pb pb-8">
        {/* Glowing Progress Bar */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden border p-[1px]"
          style={{
            borderColor: `${colors.nodeFill}33`,
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)',
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${progress}%`,
              backgroundColor: colors.nodeFill,
              boxShadow: `0 0 10px ${colors.nodeGlow}`,
            }}
          />
        </div>

        {/* Minimal percentage indicator */}
        <div
          className="text-[11px] font-mono-num font-bold tracking-wider"
          style={{ color: `${colors.nodeFill}aa` }}
        >
          {Math.min(100, Math.floor(progress))}%
        </div>
      </div>
    </div>
  );
};
