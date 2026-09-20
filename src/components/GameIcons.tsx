import React from 'react';
import { AppIconId } from '../types/game';

interface GameIconProps {
  id?: AppIconId;
  size?: number;
  className?: string;
}

/**
 * 1. DARK MODE GAME ICON
 * Deep obsidian canvas, luminous cyan laser orbit, precision radar crosshairs,
 * and high-voltage glowing revolving orb.
 */
export const DarkGameIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 128,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-[22.5%] shadow-2xl ${className}`}
      style={{ overflow: 'hidden' }}
    >
      <defs>
        {/* Background Gradients */}
        <linearGradient id="darkBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B0F19" />
          <stop offset="50%" stopColor="#06080E" />
          <stop offset="100%" stopColor="#020305" />
        </linearGradient>

        <radialGradient id="darkGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#0077FF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="cyanNeon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#80FFFF" />
          <stop offset="50%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#0072FF" />
        </linearGradient>

        <linearGradient id="borderShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0072FF" stopOpacity="0.4" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="neonFilter" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur1" />
          <feGaussianBlur stdDeviation="14" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Squircle Base Background */}
      <rect width="512" height="512" rx="115" fill="url(#darkBg)" />
      <rect width="512" height="512" rx="115" fill="url(#darkGlow)" />

      {/* Cyber Grid Texture */}
      <g opacity="0.07" stroke="#00F0FF" strokeWidth="1">
        <line x1="128" y1="0" x2="128" y2="512" />
        <line x1="256" y1="0" x2="256" y2="512" />
        <line x1="384" y1="0" x2="384" y2="512" />
        <line x1="0" y1="128" x2="512" y2="128" />
        <line x1="0" y1="256" x2="512" y2="256" />
        <line x1="0" y1="384" x2="512" y2="384" />
      </g>

      {/* Radar Coordinate Crosshair Marks */}
      <g stroke="#00F0FF" strokeOpacity="0.2" strokeWidth="2">
        <line x1="256" y1="50" x2="256" y2="462" strokeDasharray="4 6" />
        <line x1="50" y1="256" x2="462" y2="256" strokeDasharray="4 6" />
      </g>

      {/* Concentric Guide Rings */}
      <circle cx="256" cy="256" r="210" stroke="#00F0FF" strokeOpacity="0.08" strokeWidth="1.5" />
      <circle cx="256" cy="256" r="105" stroke="#00F0FF" strokeOpacity="0.12" strokeWidth="1.5" />

      {/* Main Orbit Ring Track */}
      <circle
        cx="256"
        cy="256"
        r="165"
        stroke="#00F0FF"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <circle
        cx="256"
        cy="256"
        r="165"
        stroke="#00F0FF"
        strokeOpacity="0.4"
        strokeWidth="8"
        strokeDasharray="4 14"
        filter="url(#neonFilter)"
      />

      {/* Active High-Energy Orbit Arc */}
      <path
        d="M 256 91 A 165 165 0 0 1 421 256"
        stroke="url(#cyanNeon)"
        strokeWidth="7"
        strokeLinecap="round"
        filter="url(#neonFilter)"
      />

      {/* Center Core Pulse */}
      <circle cx="256" cy="256" r="42" fill="#00F0FF" fillOpacity="0.06" stroke="#00F0FF" strokeOpacity="0.25" strokeWidth="2" />
      <circle cx="256" cy="256" r="18" fill="#00F0FF" filter="url(#nodeGlow)" />
      <circle cx="256" cy="256" r="7" fill="#FFFFFF" />

      {/* Revolving Orbit Node & Trailing Energy */}
      <path
        d="M 390 170 A 165 165 0 0 1 421 256"
        stroke="url(#cyanNeon)"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.75"
        filter="url(#neonFilter)"
      />

      {/* Orbiting Satellite Node at (421, 256) */}
      <g filter="url(#nodeGlow)">
        <circle cx="421" cy="256" r="32" fill="#00F0FF" />
        <circle cx="421" cy="256" r="18" fill="#FFFFFF" />
        <circle cx="421" cy="256" r="34" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.9" />
      </g>

      {/* Dynamic Star Sparkle */}
      <path
        d="M 421 228 L 424 253 L 449 256 L 424 259 L 421 284 L 418 259 L 393 256 L 418 253 Z"
        fill="#FFFFFF"
        opacity="0.9"
      />

      {/* Outer Border Bevel & Specular Highlight */}
      <rect
        x="2"
        y="2"
        width="508"
        height="508"
        rx="113"
        stroke="url(#borderShine)"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
};

/**
 * 2. LIGHT MODE GAME ICON
 * Crisp ceramic platinum canvas, deep electric sapphire orbital track,
 * luminous cyan-blue node, and studio grade vector aesthetic.
 */
export const LightGameIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 128,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-[22.5%] shadow-2xl ${className}`}
      style={{ overflow: 'hidden' }}
    >
      <defs>
        {/* Light Mode Gradients */}
        <linearGradient id="lightBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F5F7FB" />
          <stop offset="100%" stopColor="#E5EAF4" />
        </linearGradient>

        <radialGradient id="lightGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.12" />
          <stop offset="70%" stopColor="#06B6D4" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="sapphireRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        <linearGradient id="lightBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.6" />
        </linearGradient>

        <filter id="lightShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0F172A" floodOpacity="0.18" />
        </filter>

        <filter id="lightNodeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#2563EB" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Squircle Base Background */}
      <rect width="512" height="512" rx="115" fill="url(#lightBg)" />
      <rect width="512" height="512" rx="115" fill="url(#lightGlow)" />

      {/* Subtle Studio Grid */}
      <g opacity="0.08" stroke="#0F172A" strokeWidth="1">
        <line x1="128" y1="0" x2="128" y2="512" />
        <line x1="256" y1="0" x2="256" y2="512" />
        <line x1="384" y1="0" x2="384" y2="512" />
        <line x1="0" y1="128" x2="512" y2="128" />
        <line x1="0" y1="256" x2="512" y2="256" />
        <line x1="0" y1="384" x2="512" y2="384" />
      </g>

      {/* Concentric Measurement Guides */}
      <circle cx="256" cy="256" r="210" stroke="#64748B" strokeOpacity="0.12" strokeWidth="1.5" />
      <circle cx="256" cy="256" r="105" stroke="#64748B" strokeOpacity="0.15" strokeWidth="1.5" />

      {/* Crosshair Indicators */}
      <g stroke="#3B82F6" strokeOpacity="0.25" strokeWidth="2">
        <line x1="256" y1="60" x2="256" y2="452" strokeDasharray="6 6" />
        <line x1="60" y1="256" x2="452" y2="256" strokeDasharray="6 6" />
      </g>

      {/* Outer Shadowed Orbit Ring */}
      <g filter="url(#lightShadow)">
        <circle
          cx="256"
          cy="256"
          r="165"
          stroke="#0F172A"
          strokeOpacity="0.08"
          strokeWidth="12"
        />
        <circle
          cx="256"
          cy="256"
          r="165"
          stroke="#0284C7"
          strokeOpacity="0.25"
          strokeWidth="4"
        />
        <circle
          cx="256"
          cy="256"
          r="165"
          stroke="url(#sapphireRing)"
          strokeWidth="7"
          strokeDasharray="4 14"
        />
      </g>

      {/* Highlight Active Segment */}
      <path
        d="M 256 91 A 165 165 0 0 1 421 256"
        stroke="url(#sapphireRing)"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Center Core Reactor */}
      <circle cx="256" cy="256" r="40" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" filter="url(#lightShadow)" />
      <circle cx="256" cy="256" r="20" fill="url(#sapphireRing)" />
      <circle cx="256" cy="256" r="8" fill="#FFFFFF" />

      {/* Orbiting Satellite Node at (421, 256) */}
      <g filter="url(#lightNodeGlow)">
        <circle cx="421" cy="256" r="30" fill="url(#sapphireRing)" />
        <circle cx="421" cy="256" r="16" fill="#FFFFFF" />
        <circle cx="421" cy="256" r="32" stroke="#FFFFFF" strokeWidth="3" fill="none" />
      </g>

      {/* Sparkle Ticks */}
      <circle cx="421" cy="256" r="6" fill="#0284C7" />
      <circle cx="256" cy="91" r="5" fill="#3B82F6" opacity="0.6" />
      <circle cx="91" cy="256" r="5" fill="#3B82F6" opacity="0.6" />
      <circle cx="256" cy="421" r="5" fill="#3B82F6" opacity="0.6" />

      {/* Outer Border Bevel */}
      <rect
        x="2"
        y="2"
        width="508"
        height="508"
        rx="113"
        stroke="url(#lightBorder)"
        strokeWidth="3.5"
        fill="none"
      />
    </svg>
  );
};

/**
 * 3. BUBBLE MODE GAME ICON
 * Playful, iridescent translucent liquid glass bubble aesthetic.
 * Glossy pastel aura, chromatic reflections, and floating spherical bubble orbs.
 */
export const BubbleGameIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 128,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-[22.5%] shadow-2xl ${className}`}
      style={{ overflow: 'hidden' }}
    >
      <defs>
        {/* Bubble Gradients */}
        <linearGradient id="bubbleBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#120A2A" />
          <stop offset="45%" stopColor="#1E103E" />
          <stop offset="100%" stopColor="#0A1836" />
        </linearGradient>

        <radialGradient id="bubbleAmbient" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FF60C8" stopOpacity="0.4" />
          <stop offset="40%" stopColor="#00F0FF" stopOpacity="0.25" />
          <stop offset="75%" stopColor="#8A2BE2" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="bubbleRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF77E9" />
          <stop offset="35%" stopColor="#70D6FF" />
          <stop offset="70%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#06D6A0" />
        </linearGradient>

        <radialGradient id="sphereGlass" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="25%" stopColor="#70E4FF" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#FF66D8" stopOpacity="0.65" />
          <stop offset="90%" stopColor="#6E00FF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#00D2FF" stopOpacity="0.95" />
        </radialGradient>

        <linearGradient id="bubbleBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9EE2" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#70D6FF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#B388FF" stopOpacity="0.7" />
        </linearGradient>

        <filter id="bubbleGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Squircle Base Background */}
      <rect width="512" height="512" rx="115" fill="url(#bubbleBg)" />
      <rect width="512" height="512" rx="115" fill="url(#bubbleAmbient)" />

      {/* Floating Micro-Bubbles Background FX */}
      <g opacity="0.6">
        <circle cx="110" cy="130" r="14" fill="#FF77E9" opacity="0.3" filter="url(#bubbleGlow)" />
        <circle cx="108" cy="128" r="4" fill="#FFFFFF" opacity="0.7" />

        <circle cx="390" cy="110" r="22" fill="#70D6FF" opacity="0.35" filter="url(#bubbleGlow)" />
        <circle cx="386" cy="106" r="6" fill="#FFFFFF" opacity="0.8" />

        <circle cx="120" cy="380" r="18" fill="#FFD166" opacity="0.3" filter="url(#bubbleGlow)" />
        <circle cx="118" cy="378" r="5" fill="#FFFFFF" opacity="0.8" />

        <circle cx="370" cy="400" r="16" fill="#06D6A0" opacity="0.35" filter="url(#bubbleGlow)" />
        <circle cx="368" cy="398" r="4" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* Soft Bubble Orbit Guides */}
      <circle cx="256" cy="256" r="215" stroke="#FF77E9" strokeOpacity="0.1" strokeWidth="2" strokeDasharray="8 8" />
      <circle cx="256" cy="256" r="110" stroke="#70D6FF" strokeOpacity="0.15" strokeWidth="2" />

      {/* Main Iridescent Bubble Ring Track */}
      <circle
        cx="256"
        cy="256"
        r="165"
        stroke="url(#bubbleRingGrad)"
        strokeOpacity="0.3"
        strokeWidth="16"
        filter="url(#bubbleGlow)"
      />
      <circle
        cx="256"
        cy="256"
        r="165"
        stroke="#FFFFFF"
        strokeOpacity="0.4"
        strokeWidth="3"
      />
      <circle
        cx="256"
        cy="256"
        r="165"
        stroke="url(#bubbleRingGrad)"
        strokeWidth="8"
        strokeDasharray="16 18"
        strokeLinecap="round"
      />

      {/* Center Iridescent Mother Bubble */}
      <g filter="url(#bubbleGlow)">
        <circle cx="256" cy="256" r="48" fill="url(#sphereGlass)" />
        {/* Specular Highlight Crescent on Bubble */}
        <ellipse cx="242" cy="238" rx="14" ry="8" fill="#FFFFFF" opacity="0.85" transform="rotate(-30 242 238)" />
        <circle cx="270" cy="274" r="5" fill="#FFFFFF" opacity="0.5" />
      </g>

      {/* Revolving Giant Bubble Node at (421, 256) */}
      <g filter="url(#bubbleGlow)">
        {/* Soft Liquid Outer Halo */}
        <circle cx="421" cy="256" r="44" fill="#FF77E9" opacity="0.35" />
        {/* Glass Orb Body */}
        <circle cx="421" cy="256" r="36" fill="url(#sphereGlass)" />
        {/* Primary Specular Light Reflection */}
        <ellipse cx="408" cy="242" rx="12" ry="7" fill="#FFFFFF" opacity="0.9" transform="rotate(-35 408 242)" />
        {/* Secondary Rim Reflection */}
        <path
          d="M 405 282 C 420 292, 442 278, 448 260"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
      </g>

      {/* Mini Companion Satellite Bubbles */}
      <circle cx="400" cy="195" r="10" fill="url(#sphereGlass)" />
      <circle cx="398" cy="193" r="3" fill="#FFFFFF" opacity="0.9" />

      <circle cx="450" cy="305" r="12" fill="url(#sphereGlass)" />
      <circle cx="448" cy="303" r="3.5" fill="#FFFFFF" opacity="0.9" />

      {/* Glossy Top App Icon Sheen */}
      <path
        d="M 0 115 C 0 50, 50 0, 115 0 L 397 0 C 462 0, 512 50, 512 115 C 512 240, 320 280, 0 190 Z"
        fill="#FFFFFF"
        opacity="0.07"
      />

      {/* Outer Iridescent Border */}
      <rect
        x="2"
        y="2"
        width="508"
        height="508"
        rx="113"
        stroke="url(#bubbleBorder)"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
};

/**
 * Universal Game App Icon Dispatcher
 */
export const GameAppIcon: React.FC<GameIconProps> = ({
  id = 'dark',
  size = 128,
  className = '',
}) => {
  switch (id) {
    case 'light':
      return <LightGameIcon size={size} className={className} />;
    case 'bubble':
      return <BubbleGameIcon size={size} className={className} />;
    case 'dark':
    default:
      return <DarkGameIcon size={size} className={className} />;
  }
};

export interface AppIconDefinition {
  id: AppIconId;
  name: string;
  subtitle: string;
  description: string;
  tag: string;
  tagColor: string;
}

export const APP_ICONS_LIST: AppIconDefinition[] = [
  {
    id: 'dark',
    name: 'Obsidian Neon',
    subtitle: 'Dark Mode Icon',
    description: 'Deep carbon background with high-voltage cyan radar arcs and luminous laser orbital track.',
    tag: 'Classic Dark',
    tagColor: '#00F0FF',
  },
  {
    id: 'light',
    name: 'Platinum Sapphire',
    subtitle: 'Light Mode Icon',
    description: 'Crisp studio ceramic canvas with precision electric sapphire track and solar blue node.',
    tag: 'Clean Light',
    tagColor: '#2563EB',
  },
  {
    id: 'bubble',
    name: 'Iridescent Bubble',
    subtitle: 'Bubble Mode Icon',
    description: 'Translucent 3D liquid glass bubble sphere with chromatic pastel glow and floating rainbow micro-bubbles.',
    tag: 'Special Bubble',
    tagColor: '#FF60C8',
  },
];
