import { ThemeColors, ThemeId, NodeSkin, TrailEffect } from '../types/game';

export const THEMES: Record<ThemeId, ThemeColors> = {
  'geometric-balance': {
    id: 'geometric-balance',
    name: 'Geometric Balance',
    dark: {
      bg: '#0A0E17',
      bgGradient: 'radial-gradient(circle at center, #131F33 0%, #070B12 100%)',
      ringTrack: '#1E293B',
      ringGlow: '#1E6BFF',
      safeZone: '#10B981', // crisp architectural emerald
      safeZoneGlow: 'rgba(16, 185, 129, 0.75)',
      bullseye: '#F59E0B', // precision geometric amber gold
      bullseyeGlow: 'rgba(245, 158, 11, 0.95)',
      nodeFill: '#1E6BFF', // intense vibrant cobalt blue
      nodeGlow: 'rgba(30, 107, 255, 0.95)',
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8',
      accent: '#1E6BFF',
      feverAura: '#10B981',
      particleColors: ['#1E6BFF', '#10B981', '#F59E0B', '#FFFFFF', '#60A5FA'],
      gridColor: 'rgba(30, 107, 255, 0.09)',
    },
    light: {
      bg: '#F8FAFC',
      bgGradient: 'radial-gradient(circle at center, #E2E8F0 0%, #F8FAFC 100%)',
      ringTrack: '#CBD5E1',
      ringGlow: '#0052FF',
      safeZone: '#059669', // precision drafting emerald
      safeZoneGlow: 'rgba(5, 150, 105, 0.45)',
      bullseye: '#D97706', // architectural amber
      bullseyeGlow: 'rgba(217, 119, 6, 0.85)',
      nodeFill: '#0052FF', // vivid electric royal cobalt
      nodeGlow: 'rgba(0, 82, 255, 0.75)',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      accent: '#0052FF',
      feverAura: '#059669',
      particleColors: ['#0052FF', '#059669', '#D97706', '#0F172A'],
      gridColor: 'rgba(0, 82, 255, 0.06)',
    },
  },
  'cyber-neon': {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    dark: {
      bg: '#060814',
      bgGradient: 'radial-gradient(circle at center, #120E2E 0%, #060814 100%)',
      ringTrack: '#2E1E5E',
      ringGlow: '#A855F7',
      safeZone: '#38BDF8', // glowing cyan
      safeZoneGlow: 'rgba(56, 189, 248, 0.65)',
      bullseye: '#F97316', // hot orange
      bullseyeGlow: 'rgba(249, 115, 22, 0.95)',
      nodeFill: '#00F0FF',
      nodeGlow: 'rgba(0, 240, 255, 0.9)',
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8',
      accent: '#C084FC',
      feverAura: '#F43F5E',
      particleColors: ['#00F0FF', '#F97316', '#A855F7', '#38BDF8'],
      gridColor: 'rgba(168, 85, 247, 0.08)',
    },
    light: {
      bg: '#F5F3FF',
      bgGradient: 'radial-gradient(circle at center, #EDE9FE 0%, #F5F3FF 100%)',
      ringTrack: '#C4B5FD',
      ringGlow: '#7C3AED',
      safeZone: '#0284C7',
      safeZoneGlow: 'rgba(2, 132, 199, 0.45)',
      bullseye: '#EA580C',
      bullseyeGlow: 'rgba(234, 88, 12, 0.85)',
      nodeFill: '#6D28D9',
      nodeGlow: 'rgba(109, 40, 217, 0.65)',
      textPrimary: '#1E1B4B',
      textSecondary: '#6B21A8',
      accent: '#7C3AED',
      feverAura: '#E11D48',
      particleColors: ['#6D28D9', '#EA580C', '#7C3AED', '#0284C7'],
      gridColor: 'rgba(124, 58, 237, 0.06)',
    },
  },
  'solar-eclipse': {
    id: 'solar-eclipse',
    name: 'Solar Eclipse',
    dark: {
      bg: '#0C0A07',
      bgGradient: 'radial-gradient(circle at center, #261605 0%, #070604 100%)',
      ringTrack: '#4A2B0E',
      ringGlow: '#F59E0B',
      safeZone: '#F59E0B', // golden corona
      safeZoneGlow: 'rgba(245, 158, 11, 0.75)',
      bullseye: '#EF4444', // solar flare core
      bullseyeGlow: 'rgba(239, 68, 68, 0.95)',
      nodeFill: '#F59E0B', // brilliant electric solar gold
      nodeGlow: 'rgba(245, 158, 11, 0.9)',
      textPrimary: '#FFFBEB',
      textSecondary: '#D97706',
      accent: '#F97316',
      feverAura: '#EF4444',
      particleColors: ['#F59E0B', '#EF4444', '#FBBF24', '#F97316'],
      gridColor: 'rgba(245, 158, 11, 0.08)',
    },
    light: {
      bg: '#FFFBF5',
      bgGradient: 'radial-gradient(circle at center, #FEF3C7 0%, #FFFBF5 100%)',
      ringTrack: '#E2D2B8',
      ringGlow: '#D97706',
      safeZone: '#EA580C', // vibrant fiery corona
      safeZoneGlow: 'rgba(234, 88, 12, 0.45)',
      bullseye: '#DC2626',
      bullseyeGlow: 'rgba(220, 38, 38, 0.85)',
      nodeFill: '#D97706', // rich deep warm golden amber
      nodeGlow: 'rgba(217, 119, 6, 0.7)',
      textPrimary: '#270D03',
      textSecondary: '#92400E',
      accent: '#EA580C',
      feverAura: '#DC2626',
      particleColors: ['#D97706', '#EA580C', '#DC2626', '#F59E0B'],
      gridColor: 'rgba(217, 119, 6, 0.06)',
    },
  },
  'monochrome-precision': {
    id: 'monochrome-precision',
    name: 'Monochrome Precision',
    dark: {
      bg: '#050505',
      bgGradient: 'radial-gradient(circle at center, #18181B 0%, #000000 100%)',
      ringTrack: '#3F3F46',
      ringGlow: '#FFFFFF',
      safeZone: '#E4E4E7',
      safeZoneGlow: 'rgba(255, 255, 255, 0.65)',
      bullseye: '#FF2A55', // sharp crimson laser needle
      bullseyeGlow: 'rgba(255, 42, 85, 0.95)',
      nodeFill: '#FFFFFF', // bright pure white
      nodeGlow: 'rgba(255, 255, 255, 0.95)',
      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
      accent: '#FF2A55',
      feverAura: '#FF2A55',
      particleColors: ['#FFFFFF', '#FF2A55', '#A1A1AA', '#E4E4E7'],
      gridColor: 'rgba(255, 255, 255, 0.06)',
    },
    light: {
      bg: '#F8F9FA',
      bgGradient: 'radial-gradient(circle at center, #EDF0F2 0%, #F8F9FA 100%)',
      ringTrack: '#64748B', // distinct precision slate track
      ringGlow: '#0F172A',
      safeZone: '#0F172A', // bold obsidian precision arc
      safeZoneGlow: 'rgba(15, 23, 42, 0.35)',
      bullseye: '#E11D48', // striking laser ruby
      bullseyeGlow: 'rgba(225, 29, 72, 0.85)',
      nodeFill: '#09090B', // pure pitch black
      nodeGlow: 'rgba(9, 9, 11, 0.5)',
      textPrimary: '#09090B',
      textSecondary: '#475569',
      accent: '#E11D48',
      feverAura: '#BE123C',
      particleColors: ['#09090B', '#E11D48', '#475569', '#0F172A'],
      gridColor: 'rgba(0, 0, 0, 0.06)',
    },
  },
  'emerald-glitch': {
    id: 'emerald-glitch',
    name: 'Emerald Glitch',
    dark: {
      bg: '#030D07',
      bgGradient: 'radial-gradient(circle at center, #072414 0%, #020804 100%)',
      ringTrack: '#0E3D22',
      ringGlow: '#10B981',
      safeZone: '#10B981',
      safeZoneGlow: 'rgba(16, 185, 129, 0.8)',
      bullseye: '#84CC16', // bright lime matrix spark
      bullseyeGlow: 'rgba(132, 204, 22, 0.95)',
      nodeFill: '#00FF9D', // hyper-vivid matrix neon mint/green
      nodeGlow: 'rgba(0, 255, 157, 0.95)',
      textPrimary: '#F0FDF4',
      textSecondary: '#34D399',
      accent: '#00FF9D',
      feverAura: '#10B981',
      particleColors: ['#00FF9D', '#84CC16', '#10B981', '#6EE7B7'],
      gridColor: 'rgba(0, 255, 157, 0.08)',
    },
    light: {
      bg: '#F0FDF4',
      bgGradient: 'radial-gradient(circle at center, #DCFCE7 0%, #F0FDF4 100%)',
      ringTrack: '#86EFAC',
      ringGlow: '#059669',
      safeZone: '#059669',
      safeZoneGlow: 'rgba(5, 150, 105, 0.45)',
      bullseye: '#65A30D',
      bullseyeGlow: 'rgba(101, 163, 13, 0.8)',
      nodeFill: '#047857', // rich vivid cyber emerald
      nodeGlow: 'rgba(4, 120, 87, 0.6)',
      textPrimary: '#022C22',
      textSecondary: '#047857',
      accent: '#059669',
      feverAura: '#16A34A',
      particleColors: ['#047857', '#65A30D', '#059669', '#10B981'],
      gridColor: 'rgba(4, 120, 87, 0.06)',
    },
  },
};

export const NODE_SKINS: NodeSkin[] = [
  { id: 'dot', name: 'Pulse Orb', description: 'Standard high-resonance spherical node', unlockLevel: 1, priceOrbs: 0, icon: '⚪' },
  { id: 'halo', name: 'Halo Ring', description: 'Twin light satellites orbiting a stable core', unlockLevel: 5, priceOrbs: 100, icon: '🪐' },
  { id: 'quantum', name: 'Quantum Ring', description: 'Concentric spin state particle', unlockLevel: 10, priceOrbs: 250, icon: '⚛️' },
  { id: 'shuriken', name: 'Ninja Blade', description: 'Quad-blade aerodynamic rotating star', unlockLevel: 15, priceOrbs: 500, icon: '✦' },
  { id: 'diamond', name: 'Prism Diamond', description: 'Faceted crystalline light reflector', unlockLevel: 20, priceOrbs: 800, icon: '💎' },
  { id: 'star', name: 'Supernova Star', description: 'Pulsing 5-point stellar core', unlockLevel: 25, priceOrbs: 1200, icon: '⭐' },
  { id: 'fireball', name: 'Solar Flare', description: 'Volatile flame core with heat waves', unlockLevel: 30, priceOrbs: 1800, icon: '🔥' },
  { id: 'pulse', name: 'Echo Beacon', description: 'Emits concentric radar ripples in flight', unlockLevel: 35, priceOrbs: 2500, icon: '🔘' },
];

export const TRAIL_EFFECTS: TrailEffect[] = [
  { id: 'plasma', name: 'Plasma Ribbon', description: 'Smooth fading luminous glow trail', unlockLevel: 1, priceOrbs: 0 },
  { id: 'flare', name: 'Solar Embers', description: 'Spits hot burning sparks behind velocity vector', unlockLevel: 5, priceOrbs: 150 },
  { id: 'scanline', name: 'Digital Stream', description: 'Segmented cyber dash lines', unlockLevel: 10, priceOrbs: 350 },
  { id: 'sparkles', name: 'Stardust Dust', description: 'Shimmering micro-crystals in orbit', unlockLevel: 15, priceOrbs: 600 },
  { id: 'ribbon', name: 'Dual Helix', description: 'Intertwined double-wave optical stream', unlockLevel: 20, priceOrbs: 1000 },
  { id: 'glitch', name: 'Quantum Noise', description: 'Random jittering byte fragments', unlockLevel: 25, priceOrbs: 1500 },
];
