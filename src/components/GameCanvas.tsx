import React, { useEffect, useRef } from 'react';
import { GameEngine, GameEngineCallbacks } from '../engine/GameEngine';
import { GameSettings, PlayerProfile } from '../types/game';
import { THEMES } from '../themes/gameThemes';

interface GameCanvasProps {
  settings: GameSettings;
  profile: PlayerProfile;
  onEngineReady: (engine: GameEngine) => void;
  callbacks: GameEngineCallbacks;
  onCanvasTap: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  settings,
  profile,
  onEngineReady,
  callbacks,
  onCanvasTap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Initialize Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, callbacks);
    engineRef.current = engine;

    // Apply current settings and cosmetics
    const currentTheme = THEMES[settings.themeId] || THEMES['monochrome-precision'];
    engine.setTheme(currentTheme, settings.isDarkMode);
    engine.setSkinAndTrail(
      profile.previewSkin || profile.selectedSkin,
      profile.selectedTrail
    );

    engine.startLoop();
    onEngineReady(engine);

    // Responsive Resize Listener & ResizeObserver
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      engine.resize();
    });
    if (canvasRef.current && canvasRef.current.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      engine.stopLoop();
    };
  }, []);

  // Update theme and cosmetics when settings/profile update
  useEffect(() => {
    if (engineRef.current) {
      const currentTheme = THEMES[settings.themeId] || THEMES['monochrome-precision'];
      engineRef.current.setTheme(currentTheme, settings.isDarkMode);
      engineRef.current.setSkinAndTrail(
        profile.previewSkin || profile.selectedSkin,
        profile.selectedTrail
      );
    }
  }, [settings.themeId, settings.isDarkMode, profile.selectedSkin, profile.previewSkin, profile.selectedTrail]);

  // Keyboard spacebar listener for desktop play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onCanvasTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCanvasTap]);

  return (
    <div
      id="game-viewport-container"
      className="relative w-full h-full overflow-hidden select-none touch-none"
      onPointerDown={(e) => {
        // Prevent default gesture / double-tap
        if (e.button === 0) {
          onCanvasTap();
        }
      }}
    >
      <canvas
        ref={canvasRef}
        id="timing-orbit-canvas"
        className="block w-full h-full cursor-pointer touch-none select-none"
      />
    </div>
  );
};
