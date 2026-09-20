import { LevelConfig } from '../types/game';

/**
 * Procedural per-level configuration.
 *
 * Design goals:
 * - Levels 1-5 (and every non-extreme level) are gentle: slow, easy-to-read speed
 *   waves, wide windows, generous target counts.
 * - Every 6th level (6, 12, 18, ...) is an EXTREME spike level: faster/wider speed
 *   waves, tighter windows, more frequent direction flips, and an added combo
 *   requirement. Extreme toughness is derived from a fixed harder baseline so
 *   easing normal levels never accidentally softens the extreme spikes.
 * - Hit-count targets and minimum durations (level "length") are unchanged
 *   regardless of the eased normal-level curve.
 */
export function getLevelConfig(levelNumber: number): LevelConfig {
  const n = Math.max(1, levelNumber);
  const isExtreme = n % 6 === 0;

  // --- Win condition: hit-count target + minimum survival duration (unchanged) ---
  let targetHits = Math.min(30, 7 + Math.floor(n * 1.1));
  if (isExtreme) targetHits += 4;

  const minDurationSec = Math.max(12, Math.round(targetHits * (isExtreme ? 2.1 : 1.8)));

  const comboGoal = isExtreme ? 7 + Math.min(6, Math.floor(n / 6)) : null;

  // --- Fixed harder baseline: EXTREME levels always scale off this, so easing
  //     the normal curve below never softens the extreme spikes. ---
  const hardBaseSpeed = clamp(2.65 + (n - 1) * 0.05, 2.65, 5.2);
  const hardWaveAmplitude = 0.28 + Math.min(0.18, (n - 1) * 0.004);
  const hardWavePeriodSec = clamp(6.5 - (n - 1) * 0.035, 4.0, 6.5);
  const hardTargetArcSpanDeg = clamp(40 - (n - 1) * 0.25, 28, 40);
  const hardBullseyeSpanDeg = clamp(6.4 - (n - 1) * 0.03, 4.5, 6.4);
  const hardFlipMinSec = clamp(5.5 - (n - 1) * 0.03, 3.5, 5.5);
  const hardFlipMaxSec = hardFlipMinSec + 3.2;

  // --- Eased normal-level curve: slower speed growth, smaller wave swings,
  //     wider/slower-shrinking windows, less frequent direction flips. ---
  const easedBaseSpeed = clamp(2.9 + (n - 1) * 0.045, 2.9, 4.8);
  const easedWaveAmplitude = 0.14 + Math.min(0.1, (n - 1) * 0.002);
  const easedWavePeriodSec = clamp(6.0 - (n - 1) * 0.025, 4.5, 6.0);
  const easedTargetArcSpanDeg = clamp(44 - (n - 1) * 0.15, 34, 44);
  const easedBullseyeSpanDeg = clamp(6.8 - (n - 1) * 0.02, 5.2, 6.8);
  const easedFlipMinSec = clamp(7.0 - (n - 1) * 0.02, 5.5, 7.0);
  const easedFlipMaxSec = easedFlipMinSec + 3.5;

  const baseSpeed = isExtreme ? hardBaseSpeed * 1.35 : easedBaseSpeed;
  const waveAmplitude = isExtreme ? clamp(hardWaveAmplitude * 1.5, 0, 0.65) : easedWaveAmplitude;
  const wavePeriodSec = isExtreme ? clamp(hardWavePeriodSec * 0.65, 2.0, 5.5) : easedWavePeriodSec;
  const targetArcSpanDeg = isExtreme ? clamp(hardTargetArcSpanDeg * 0.85, 22, 38) : easedTargetArcSpanDeg;
  const bullseyeSpanDeg = isExtreme ? clamp(hardBullseyeSpanDeg * 0.8, 3.6, 6.4) : easedBullseyeSpanDeg;
  const directionFlipMinSec = isExtreme ? clamp(hardFlipMinSec * 0.55, 1.4, 5.5) : easedFlipMinSec;
  const directionFlipMaxSec = isExtreme ? clamp(hardFlipMaxSec * 0.55, 1.8, 8.7) : easedFlipMaxSec;

  return {
    levelNumber: n,
    isExtreme,
    targetHits,
    minDurationSec,
    comboGoal,
    baseSpeed,
    waveAmplitude,
    wavePeriodSec,
    targetArcSpanDeg,
    bullseyeSpanDeg,
    directionFlipMinSec,
    directionFlipMaxSec,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
