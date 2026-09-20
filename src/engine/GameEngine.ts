import {
  GameState,
  HitType,
  HitResult,
  MissDetails,
  Particle,
  FloatingText,
  Shockwave,
  ThemeColors,
  NodeSkinId,
  TrailId,
  LevelConfig,
  LevelProgress,
  LevelCompleteStats,
} from '../types/game';
import { THEMES } from '../themes/gameThemes';
import { soundSynth } from '../audio/SoundSynth';
import { getLevelConfig } from '../config/levels';

function clamp01(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface GameEngineCallbacks {
  onScoreChange: (score: number, pointsAdded: number) => void;
  onComboChange: (combo: number) => void;
  onLevelChange: (level: number) => void;
  onLevelProgress: (progress: LevelProgress) => void;
  onLevelComplete: (stats: LevelCompleteStats) => void;
  onFeverChange: (feverMeter: number, isFever: boolean) => void;
  onHit: (result: HitResult) => void;
  onGameOver: (score: number, maxCombo: number, missDetails: MissDetails) => void;
  onOrbsEarned: (amount: number) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  // Viewport & Scale
  public width = 0;
  public height = 0;
  public centerX = 0;
  public centerY = 0;
  public orbitRadius = 0;
  public dpr = 1;

  // Game Physics State
  public state: GameState = GameState.MAIN_MENU;
  public angle = 0; // Current node angle in radians [0, 2pi)
  public direction = 1; // 1 = clockwise, -1 = counter-clockwise
  public baseSpeed = 2.7; // Radians per second
  public angularVelocity = 2.7;
  public microStutterTimer = 0;

  // Target Arc State — supports 1 or 2 simultaneous targets on the ring
  public targets: { centerAngle: number; arcSpan: number; bullseyeSpan: number }[] = [
    { centerAngle: Math.PI * 0.5, arcSpan: (38 * Math.PI) / 180, bullseyeSpan: (6.5 * Math.PI) / 180 },
  ];

  // Gameplay Run Stats
  public score = 0;
  public combo = 0;
  public maxComboThisRun = 0;
  public level = 1;
  public levelConfig: LevelConfig = getLevelConfig(1);
  public hitsThisLevel = 0;
  public elapsedThisLevel = 0;
  public bestComboThisLevel = 0;
  private nextDirectionFlipAt = 0;
  private isFlippingDirection = false;
  private flipElapsed = 0;
  private flipFromDir = 1;
  private flipToDir = -1;
  private readonly flipDurationSec = 1.1;
  public orbsEarnedThisRun = 0;
  public reviveUsedThisRun = false;

  // Fever Mode
  public feverMeter = 0; // 0 to 100
  public isFever = false;
  public feverDuration = 6.0; // seconds
  public feverTimer = 0;

  // VFX
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private shockwaves: Shockwave[] = [];
  private trailHistory: { x: number; y: number; angle: number; time: number }[] = [];
  private screenShake = 0;
  private ambientAngle = 0;
  private reverseIndicatorAlpha = 0;

  // Theme & Cosmetic
  public theme: ThemeColors = THEMES['monochrome-precision'] || THEMES['cyber-neon'];
  public isDarkMode = true;
  public skinId: NodeSkinId = 'dot';
  public trailId: TrailId = 'plasma';

  // Animation Frame Loop
  private lastTime = 0;
  private animFrameId: number | null = null;
  private isRunning = false;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.callbacks = callbacks;
    this.resize();
    this.spawnNewTarget(true);
  }

  public resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const w = parent ? parent.clientWidth : window.innerWidth;
    const h = parent ? parent.clientHeight : window.innerHeight;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.width = w;
    this.height = h;

    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.centerX = w / 2;
    this.centerY = h / 2;

    // Strict Central Hub & Orbit Separation:
    // Outer Orbit Radius: R_orbit = min(canvasWidth, canvasHeight) * 0.30
    const minDim = Math.min(w, h);
    this.orbitRadius = Math.max(85, Math.min(minDim * 0.30, 220));
  }

  public getHubRadius(): number {
    return this.orbitRadius * 0.60;
  }

  public setTheme(theme: ThemeColors, isDarkMode: boolean) {
    this.theme = theme;
    this.isDarkMode = isDarkMode;
  }

  public setSkinAndTrail(skinId: NodeSkinId, trailId: TrailId) {
    this.skinId = skinId;
    this.trailId = trailId;
  }

  public startRun(startLevel = 1) {
    this.state = GameState.PLAYING;
    this.score = 0;
    this.combo = 0;
    this.maxComboThisRun = 0;
    this.level = Math.max(1, startLevel);
    this.orbsEarnedThisRun = 0;
    this.reviveUsedThisRun = false;
    this.feverMeter = 0;
    this.isFever = false;
    this.feverTimer = 0;
    this.angle = 0;
    this.trailHistory = [];
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.screenShake = 0;

    this.beginLevel(this.level);

    this.callbacks.onScoreChange(0, 0);
    this.callbacks.onFeverChange(0, false);

    soundSynth.startAmbientDrone();
  }

  /**
   * Loads a level's config and resets all per-level progress trackers.
   * Called on a fresh run, a level retry (after a miss), and after clearing a level.
   */
  private beginLevel(levelNumber: number) {
    this.levelConfig = getLevelConfig(levelNumber);
    this.hitsThisLevel = 0;
    this.elapsedThisLevel = 0;
    this.bestComboThisLevel = 0;
    this.combo = 0;
    this.direction = 1;
    this.nextDirectionFlipAt = this.randomBetween(
      this.levelConfig.directionFlipMinSec,
      this.levelConfig.directionFlipMaxSec
    );
    this.spawnNewTarget(true);

    this.callbacks.onLevelChange(this.level);
    this.callbacks.onComboChange(0);
    this.callbacks.onLevelProgress(this.getLevelProgress());
  }

  /**
   * Resets the current level attempt after a miss. Score and orbs already
   * earned (from this level or earlier cleared levels) are kept.
   */
  public retryLevel() {
    this.state = GameState.PLAYING;
    this.feverMeter = 0;
    this.isFever = false;
    this.feverTimer = 0;
    this.angle = 0;
    this.trailHistory = [];
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.screenShake = 0;

    this.beginLevel(this.level);
    this.callbacks.onFeverChange(0, false);

    soundSynth.startAmbientDrone();
  }

  /**
   * Advances to the next level after a LEVEL_COMPLETE screen. Score and orbs carry over.
   */
  public advanceToNextLevel() {
    this.state = GameState.PLAYING;
    this.level += 1;
    this.feverMeter = 0;
    this.isFever = false;
    this.feverTimer = 0;
    this.angle = 0;
    this.trailHistory = [];
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.screenShake = 0;

    this.beginLevel(this.level);
    this.callbacks.onFeverChange(0, false);

    soundSynth.startAmbientDrone();
  }

  private getLevelProgress(): LevelProgress {
    return {
      hits: this.hitsThisLevel,
      targetHits: this.levelConfig.targetHits,
      elapsedSec: this.elapsedThisLevel,
      minDurationSec: this.levelConfig.minDurationSec,
      comboGoal: this.levelConfig.comboGoal,
      bestComboThisLevel: this.bestComboThisLevel,
      isExtreme: this.levelConfig.isExtreme,
    };
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  /**
   * Deterministic pseudo-random value in [0, 1) for a given seed — stable within a
   * frame (no re-rolling every render tick) but effectively random across seeds.
   */
  private pseudoRandom(seed: number): number {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  /**
   * Speed wave: each cycle (wrapping every levelConfig.wavePeriodSec) mixes fast and
   * slow sections in a different order and intensity, so the rhythm doesn't repeat
   * identically. Most cycles stay calm — a gentle, smooth wobble around base speed —
   * and roughly 3 in 10 cycles roll a real fast burst instead, so speed is mostly
   * slow and smooth but sometimes genuinely fast. Keyframes are always
   * smoothstep-interpolated so the transitions stay smooth, never jerky.
   */
  private getSpeedWaveMultiplier(cfg: LevelConfig): number {
    const period = Math.max(0.1, cfg.wavePeriodSec);
    const cycleIndex = Math.floor(this.elapsedThisLevel / period);
    const t = ((this.elapsedThisLevel % period) / period + 1) % 1;
    const amp = cfg.waveAmplitude;

    // Roll this cycle's pattern & intensity from a seed derived from the level + cycle,
    // so it stays fixed for the whole cycle instead of flickering frame to frame.
    const seedBase = this.level * 977 + cycleIndex * 131;
    const patternRoll = this.pseudoRandom(seedBase);
    const fastRoll = this.pseudoRandom(seedBase + 1);
    const veryFastRoll = this.pseudoRandom(seedBase + 2);
    const slowRoll = this.pseudoRandom(seedBase + 3);
    const burstRoll = this.pseudoRandom(seedBase + 4);

    // Even a "calm" cycle keeps real, visible motion; about half the cycles roll a
    // genuine fast burst on top of that.
    const isOpeningCycle = cycleIndex === 0;
    const isBurstCycle = isOpeningCycle ? false : burstRoll < 0.5;
    // The very first cycle of a level is always calm, and dampened further on top of
    // that, so every level genuinely opens at an easy, readable pace before ramping up.
    const openingDampen = isOpeningCycle ? 0.55 : 1.0;
    const fastScale = (isBurstCycle ? 1.0 : 0.55) * openingDampen;
    const veryFastScale = (isBurstCycle ? 1.0 : 0.5) * openingDampen;
    const slowScale = isBurstCycle ? 1.0 : 0.65;

    const fastMag = amp * (1.0 + fastRoll * 0.6) * fastScale; // ~1.0x-1.6x amp on a burst cycle
    const veryFastMag = amp * (1.6 + veryFastRoll * 0.9) * veryFastScale; // ~1.6x-2.5x amp on a burst cycle
    const slowMag = amp * (0.55 + slowRoll * 0.35) * slowScale; // ~0.55x-0.9x amp on a burst cycle

    let keyframes: [number, number][];
    if (patternRoll < 0.34) {
      // base -> fast -> slow -> very fast -> base
      keyframes = [
        [0.0, 1.0],
        [0.25, 1 + fastMag],
        [0.5, 1 - slowMag],
        [0.8, 1 + veryFastMag],
        [1.0, 1.0],
      ];
    } else if (patternRoll < 0.67) {
      // base -> slow -> fast -> very fast -> base
      keyframes = [
        [0.0, 1.0],
        [0.3, 1 - slowMag],
        [0.55, 1 + fastMag],
        [0.85, 1 + veryFastMag],
        [1.0, 1.0],
      ];
    } else {
      // base -> very fast -> slow -> fast -> base
      keyframes = [
        [0.0, 1.0],
        [0.25, 1 + veryFastMag],
        [0.55, 1 - slowMag],
        [0.85, 1 + fastMag],
        [1.0, 1.0],
      ];
    }

    for (let i = 0; i < keyframes.length - 1; i++) {
      const [t0, v0] = keyframes[i];
      const [t1, v1] = keyframes[i + 1];
      if (t >= t0 && t <= t1) {
        const localT = (t - t0) / (t1 - t0);
        const eased = localT * localT * (3 - 2 * localT); // smoothstep
        return Math.max(0.3, v0 + (v1 - v0) * eased);
      }
    }
    return 1.0;
  }

  /**
   * Eases speed down as the node approaches whichever active target is currently
   * closest (full speed far away, down to a slow, readable crawl right at the
   * target), then back up to full speed again once it has moved past — a
   * repeating slow-near-target / fast-in-open-space rhythm, tied to actual
   * target position rather than an arbitrary time-based wave.
   */
  private getTargetProximitySlowdown(): number {
    if (this.targets.length === 0) return 1.0;
    let bestFactor = 1.0;
    const minFactor = 0.42; // slowest point, right at a target's center
    for (const target of this.targets) {
      const deltaRad = Math.abs(this.getAngularDelta(this.angle, target.centerAngle));
      const deltaDeg = (deltaRad * 180) / Math.PI;
      const arcSpanDeg = (target.arcSpan * 180) / Math.PI;
      // Anticipation window sized relative to this target's own width (a standard
      // rhythm-game pattern) so the ease-in always reads the same proportionally,
      // whether the window is wide and forgiving or tight and precise.
      const approachDeg = clamp01(arcSpanDeg * 2.3, 28, 65);
      if (deltaDeg >= approachDeg) continue;
      const t = deltaDeg / approachDeg; // 0 at the target, 1 at the window edge
      const eased = t * t * (3 - 2 * t); // smoothstep
      const factor = minFactor + (1.0 - minFactor) * eased;
      if (factor < bestFactor) bestFactor = factor;
    }
    return bestFactor;
  }

  private checkLevelClear(): boolean {
    const cfg = this.levelConfig;
    if (this.hitsThisLevel < cfg.targetHits) return false;
    if (this.elapsedThisLevel < cfg.minDurationSec) return false;
    if (cfg.comboGoal !== null && this.bestComboThisLevel < cfg.comboGoal) return false;
    return true;
  }

  private completeLevel() {
    this.state = GameState.LEVEL_COMPLETE;
    soundSynth.stopAmbientDrone();
    soundSynth.playLevelUpChime();

    // Flat "quest completion" bonus on top of per-hit orbs, scaled gently by level
    // and boosted on Extreme clears, so the free cosmetic track doesn't depend
    // entirely on grinding hits (or watching ads) to feel like it's moving.
    const levelClearBonus = Math.round(6 + this.level * 0.6) * (this.levelConfig.isExtreme ? 2 : 1);
    this.orbsEarnedThisRun += levelClearBonus;
    this.callbacks.onOrbsEarned(levelClearBonus);

    const stats: LevelCompleteStats = {
      levelNumber: this.level,
      isExtreme: this.levelConfig.isExtreme,
      runScore: this.score,
      maxCombo: this.maxComboThisRun,
      orbsEarned: this.orbsEarnedThisRun,
      timeSec: this.elapsedThisLevel,
    };

    this.addFloatingText(
      this.levelConfig.isExtreme ? `EXTREME LEVEL ${this.level} CLEARED!` : `LEVEL ${this.level} CLEARED!`,
      this.centerX,
      this.centerY - this.orbitRadius - 35,
      '#38bdf8',
      1.3
    );
    this.addShockwave(this.centerX, this.centerY, this.orbitRadius * 1.5, '#38bdf8');

    this.callbacks.onLevelComplete(stats);
  }

  public reviveRun() {
    this.state = GameState.PLAYING;
    this.reviveUsedThisRun = true;
    this.direction = 1;
    this.nextDirectionFlipAt =
      this.elapsedThisLevel +
      this.randomBetween(this.levelConfig.directionFlipMinSec, this.levelConfig.directionFlipMaxSec);
    this.spawnNewTarget(true);
    this.screenShake = 0;
    this.feverMeter = Math.max(25, this.feverMeter);
    this.callbacks.onFeverChange(this.feverMeter, this.isFever);

    this.addFloatingText('REVIVED! KEEP GOING', this.centerX, this.centerY - this.orbitRadius - 30, '#10b981', 1.3);
    soundSynth.startAmbientDrone();
  }

  private spawnNewTarget(initial = false) {
    // Base arc width comes from this level's config (extreme levels = tighter windows)
    const baseArcSpan = (this.levelConfig.targetArcSpanDeg * Math.PI) / 180;
    const bullseyeDegrees = this.isFever ? this.levelConfig.bullseyeSpanDeg * 1.4 : this.levelConfig.bullseyeSpanDeg;
    const bullseyeSpan = (bullseyeDegrees * Math.PI) / 180;

    // Mix target widths per spawn: usually the same or wider (easier), sometimes
    // noticeably narrower, so width isn't perfectly uniform every time.
    const rollArcSpan = (): number => {
      const r = Math.random();
      if (r < 0.2) return baseArcSpan * 0.75; // sometimes narrower
      if (r < 0.5) return baseArcSpan * 1.0; // sometimes standard
      return baseArcSpan * 1.2; // usually wider / easier
    };

    // First target: reasonably ahead of the node (in its current direction) so the
    // player has time to react. Uses the clean sign of direction (not the fractional
    // in-between value during a gradual direction-flip transition).
    const dirSign = this.direction >= 0 ? 1 : -1;
    const minDistance = initial ? Math.PI * 0.75 : Math.PI * 0.65;
    const offset1 = minDistance + Math.random() * (Math.PI * 0.9);
    const firstAngle = this.normalizeAngle(this.angle + dirSign * offset1);
    const firstArcSpan = rollArcSpan();

    const newTargets = [{ centerAngle: firstAngle, arcSpan: firstArcSpan, bullseyeSpan }];

    // Sometimes spawn a second target further along the ring for extra challenge —
    // never on the very first target of a run/level. Both must be hit (in either
    // order) before the next round spawns. It sits further ahead than the first
    // (same direction) with a clear gap, so both stay fairly reachable.
    // Both the two- and three-target odds keep climbing with level number (not just
    // a fixed constant) so spawn-pattern density stays a live difficulty axis for
    // high-level players even once speed/window sizing has topped out.
    const lvl = this.levelConfig.levelNumber;
    const twoTargetBase = this.levelConfig.isExtreme ? 0.55 : 0.4;
    const twoTargetCap = this.levelConfig.isExtreme ? 0.85 : 0.75;
    const twoTargetChance = clamp01(twoTargetBase + (lvl - 1) * 0.006, twoTargetBase, twoTargetCap);

    let offset2 = offset1;
    let lastArcSpan = firstArcSpan;
    if (!initial && Math.random() < twoTargetChance) {
      const secondArcSpan = rollArcSpan();
      const minSeparation = Math.max(firstArcSpan, secondArcSpan) + (Math.PI * 25) / 180; // widest arc plus a 25° buffer
      offset2 = offset1 + minSeparation + Math.random() * (Math.PI * 0.6);
      const secondAngle = this.normalizeAngle(this.angle + dirSign * offset2);
      newTargets.push({ centerAngle: secondAngle, arcSpan: secondArcSpan, bullseyeSpan });
      lastArcSpan = secondArcSpan;

      // From level 15 on, a third target can join too — introduced gradually so it
      // reads as a new pattern to learn rather than a wall, never without a second.
      const threeTargetCap = this.levelConfig.isExtreme ? 0.5 : 0.35;
      const threeTargetChance = lvl < 15 ? 0 : clamp01((lvl - 14) * 0.012, 0, threeTargetCap);
      if (Math.random() < threeTargetChance) {
        const thirdArcSpan = rollArcSpan();
        const minSeparation3 = Math.max(lastArcSpan, thirdArcSpan) + (Math.PI * 25) / 180;
        const offset3 = offset2 + minSeparation3 + Math.random() * (Math.PI * 0.6);
        const thirdAngle = this.normalizeAngle(this.angle + dirSign * offset3);
        newTargets.push({ centerAngle: thirdAngle, arcSpan: thirdArcSpan, bullseyeSpan });
      }
    }

    this.targets = newTargets;
  }

  private normalizeAngle(ang: number): number {
    const twoPi = Math.PI * 2;
    let a = ang % twoPi;
    if (a < 0) a += twoPi;
    return a;
  }

  /**
   * Calculate shortest angular distance from a1 to a2 [-pi, pi]
   */
  private getAngularDelta(fromAngle: number, toAngle: number): number {
    let diff = toAngle - fromAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
  }

  /**
   * Primary Tap Handler
   */
  public handleTap(): HitResult | null {
    if (this.state !== GameState.PLAYING) return null;

    // With 1 or 2 active targets on the ring, resolve against whichever is currently closest
    let nearestIndex = 0;
    let nearest = this.targets[0];
    let deltaToCenter = this.getAngularDelta(this.angle, nearest.centerAngle);
    let absDelta = Math.abs(deltaToCenter);
    for (let i = 1; i < this.targets.length; i++) {
      const candidate = this.targets[i];
      const d = this.getAngularDelta(this.angle, candidate.centerAngle);
      const ad = Math.abs(d);
      if (ad < absDelta) {
        nearestIndex = i;
        nearest = candidate;
        deltaToCenter = d;
        absDelta = ad;
      }
    }

    const halfTargetSpan = nearest.arcSpan / 2;
    const halfBullseyeSpan = nearest.bullseyeSpan / 2;

    const diffDegrees = (absDelta * 180) / Math.PI;
    const diffSeconds = absDelta / Math.max(0.1, this.angularVelocity);

    const hitX = this.centerX + Math.cos(this.angle) * this.orbitRadius;
    const hitY = this.centerY + Math.sin(this.angle) * this.orbitRadius;

    // Check Bullseye (inner sweet spot)
    if (absDelta <= halfBullseyeSpan) {
      return this.processBullseyeHit(hitX, hitY, diffDegrees, diffSeconds, nearestIndex);
    }

    // Check Safe Zone (outer arc)
    if (absDelta <= halfTargetSpan) {
      return this.processSafeHit(hitX, hitY, diffDegrees, diffSeconds, nearestIndex);
    }

    // Otherwise: MISS!
    this.processMiss(deltaToCenter, halfTargetSpan, diffDegrees, diffSeconds);
    return null;
  }

  private processBullseyeHit(x: number, y: number, diffDeg: number, diffSec: number, targetIndex: number): HitResult {
    this.combo++;
    if (this.combo > this.maxComboThisRun) {
      this.maxComboThisRun = this.combo;
    }

    // Multiplier calculation: 2x, 3x, 5x, 8x
    let multiplier = 1;
    if (this.combo >= 15) multiplier = 8;
    else if (this.combo >= 10) multiplier = 5;
    else if (this.combo >= 5) multiplier = 3;
    else if (this.combo >= 2) multiplier = 2;

    if (this.isFever) multiplier *= 2;

    const points = 3 * multiplier;
    this.score += points;

    // Orbs reward
    const orbs = multiplier;
    this.orbsEarnedThisRun += orbs;
    this.callbacks.onOrbsEarned(orbs);

    // Build Fever Meter
    if (!this.isFever) {
      this.feverMeter = Math.min(100, this.feverMeter + 22);
      if (this.feverMeter >= 100) {
        this.activateFever();
      } else {
        this.callbacks.onFeverChange(this.feverMeter, false);
      }
    }

    // Level progress tracking (direction flips are now scheduled in update(), not combo-gated)
    this.hitsThisLevel++;
    this.bestComboThisLevel = Math.max(this.bestComboThisLevel, this.combo);
    this.callbacks.onLevelProgress(this.getLevelProgress());

    // High combo trap: micro-stutter texture only
    const reversed = false;
    if (this.combo >= 5 && Math.random() < 0.35) {
      this.microStutterTimer = 0.08;
    }

    // Audio & Haptics
    soundSynth.playBullseyeHit(this.combo, this.isFever);
    soundSynth.updateAmbientDrone(this.combo, this.isFever);

    // Shockwave & Particles
    const colors = this.isDarkMode ? this.theme.dark : this.theme.light;
    this.addShockwave(x, y, 65, colors.bullseye);
    this.emitExplosion(x, y, 24, colors.particleColors, 1.4);
    this.screenShake = Math.min(12, 4 + this.combo * 0.8);

    // Floating Text Feedback
    const comboText = multiplier > 1 ? ` (${multiplier}x)` : '';
    this.addFloatingText(`PERFECT! +${points}${comboText}`, x, y - 25, colors.bullseye, 1.25);

    const hitResult: HitResult = {
      type: HitType.BULLSEYE,
      points,
      combo: this.combo,
      diffAngleDeg: diffDeg,
      diffTimeSec: diffSec,
      timestamp: Date.now(),
      isDirectionReversed: reversed,
    };

    this.callbacks.onScoreChange(this.score, points);
    this.callbacks.onComboChange(this.combo);
    this.callbacks.onHit(hitResult);

    // Double targets must both be cleared before advancing — drop the one just hit;
    // only check level-clear / spawn the next round once none remain.
    this.targets.splice(targetIndex, 1);
    if (this.targets.length > 0) {
      const remainingText = this.targets.length > 1 ? 'HIT THE OTHER TARGETS!' : 'HIT THE OTHER TARGET!';
      this.addFloatingText(remainingText, this.centerX, this.centerY - this.orbitRadius - 30, colors.bullseye, 1.0);
    } else if (this.checkLevelClear()) {
      this.completeLevel();
    } else {
      this.spawnNewTarget();
    }
    return hitResult;
  }

  private processSafeHit(x: number, y: number, diffDeg: number, diffSec: number, targetIndex: number): HitResult {
    // Safe zone hit awards +1, keeps standard rotation, resets combo multiplier to 1
    const prevCombo = this.combo;
    this.combo = 1;
    const points = this.isFever ? 2 : 1;
    this.score += points;
    this.orbsEarnedThisRun += 1;
    this.callbacks.onOrbsEarned(1);

    if (prevCombo > 3) {
      // Gentle combo reset notice
      this.addFloatingText('STREAK RESET', this.centerX, this.centerY + 45, '#94a3b8', 0.9);
    }

    // Fever meter slight increment
    if (!this.isFever) {
      this.feverMeter = Math.min(100, this.feverMeter + 6);
      this.callbacks.onFeverChange(this.feverMeter, false);
    }

    this.hitsThisLevel++;
    this.callbacks.onLevelProgress(this.getLevelProgress());

    soundSynth.playSafeHit();
    soundSynth.updateAmbientDrone(1, this.isFever);

    const colors = this.isDarkMode ? this.theme.dark : this.theme.light;
    this.addShockwave(x, y, 40, colors.safeZone);
    this.emitExplosion(x, y, 12, [colors.safeZone, colors.nodeFill], 0.9);

    this.addFloatingText(`SAFE +${points}`, x, y - 20, colors.safeZone, 1.0);

    const hitResult: HitResult = {
      type: HitType.SAFE,
      points,
      combo: 1,
      diffAngleDeg: diffDeg,
      diffTimeSec: diffSec,
      timestamp: Date.now(),
    };

    this.callbacks.onScoreChange(this.score, points);
    this.callbacks.onComboChange(1);
    this.callbacks.onHit(hitResult);

    // Double targets must both be cleared before advancing — drop the one just hit;
    // only check level-clear / spawn the next round once none remain.
    this.targets.splice(targetIndex, 1);
    if (this.targets.length > 0) {
      const remainingText = this.targets.length > 1 ? 'HIT THE OTHER TARGETS!' : 'HIT THE OTHER TARGET!';
      this.addFloatingText(remainingText, this.centerX, this.centerY - this.orbitRadius - 30, colors.safeZone, 1.0);
    } else if (this.checkLevelClear()) {
      this.completeLevel();
    } else {
      this.spawnNewTarget();
    }
    return hitResult;
  }

  private processMiss(deltaToCenter: number, halfTargetSpan: number, diffDeg: number, diffSec: number) {
    this.state = GameState.GAME_OVER;
    soundSynth.playMissSound();
    soundSynth.stopAmbientDrone();
    this.screenShake = 16;

    // Calculate exact error margin
    const errorAngle = Math.abs(deltaToCenter) - halfTargetSpan;
    const errorDeg = Math.max(0.1, (errorAngle * 180) / Math.PI);
    const errorSec = errorAngle / Math.max(0.1, this.angularVelocity);

    // Determine if early or late based on orbital travel direction
    let isEarly = false;
    if (this.direction > 0) {
      // moving clockwise: if deltaToCenter > 0, target is ahead => player tapped early
      isEarly = deltaToCenter > 0;
    } else {
      // moving counter-clockwise: if deltaToCenter < 0, target is ahead => player tapped early
      isEarly = deltaToCenter < 0;
    }

    const type = isEarly ? HitType.MISS_EARLY : HitType.MISS_LATE;
    const missDetails: MissDetails = {
      type,
      angularDiffDeg: Number(errorDeg.toFixed(1)),
      timeDiffSec: Number(errorSec.toFixed(3)),
      description: isEarly
        ? `TOO EARLY (${errorSec.toFixed(3)}s)`
        : `TOO LATE (${errorSec.toFixed(3)}s)`,
    };

    const nodeX = this.centerX + Math.cos(this.angle) * this.orbitRadius;
    const nodeY = this.centerY + Math.sin(this.angle) * this.orbitRadius;

    // Shockwave at failure point
    this.addShockwave(nodeX, nodeY, 80, '#ef4444');
    this.emitExplosion(nodeX, nodeY, 35, ['#ef4444', '#f87171', '#7f1d1d'], 1.6);

    this.addFloatingText(missDetails.description, this.centerX, this.centerY - 50, '#ef4444', 1.2);

    this.callbacks.onGameOver(this.score, this.maxComboThisRun, missDetails);
  }

  private activateFever() {
    this.isFever = true;
    this.feverTimer = this.feverDuration;
    this.feverMeter = 100;
    soundSynth.playFeverActivation();
    this.callbacks.onFeverChange(100, true);

    this.addFloatingText('🔥 FEVER MODE! 2X SPEED & PTS 🔥', this.centerX, this.centerY - 50, '#f59e0b', 1.4);
    this.screenShake = 12;
  }

  // Visual FX Helpers
  private emitExplosion(x: number, y: number, count: number, colors: string[], speedMult = 1.0) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 4 + 1.5) * speedMult * 60;
      const col = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        radius: Math.random() * 3.5 + 1.5,
        color: col,
        alpha: 1.0,
        decay: Math.random() * 1.8 + 1.2,
        shape: Math.random() > 0.4 ? 'circle' : 'spark',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8,
      });
    }
  }

  private addShockwave(x: number, y: number, maxRadius: number, color: string) {
    this.shockwaves.push({
      x,
      y,
      radius: 6,
      maxRadius,
      color,
      alpha: 0.9,
      lineWidth: 3.5,
    });
  }

  private addFloatingText(text: string, x: number, y: number, color: string, scale = 1.0) {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      x,
      y,
      color,
      alpha: 1.0,
      scale,
      vy: -45,
      decay: 1.1,
    });
  }

  /**
   * Main Render & Physics Loop
   */
  public startLoop() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap delta time to 50ms
      this.lastTime = timestamp;

      this.update(dt);
      this.render();

      if (this.isRunning) {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private update(dt: number) {
    this.ambientAngle += dt * 0.25;

    // Handle micro stutter
    if (this.microStutterTimer > 0) {
      this.microStutterTimer -= dt;
      dt *= 0.15; // momentary slow-mo twitch
    }

    if (this.state === GameState.PLAYING) {
      this.elapsedThisLevel += dt;

      // Speed wave: start at base speed, ramp up to a fast peak, ease back down to a
      // slow trough, then ramp up further to an even faster peak, before easing back
      // to base speed to loop. Smoothstep-interpolated between keyframes for a fluid feel.
      const cfg = this.levelConfig;
      const feverMultiplier = this.isFever ? 1.25 : 1.0;
      this.angularVelocity =
        cfg.baseSpeed * this.getSpeedWaveMultiplier(cfg) * this.getTargetProximitySlowdown() * feverMultiplier;

      // Scheduled direction flips — independent of combo, keeps the whole level dynamic.
      // The reversal itself eases gradually (decelerate, pass through a pause, accelerate
      // the other way) instead of snapping direction instantly.
      if (!this.isFlippingDirection && this.elapsedThisLevel >= this.nextDirectionFlipAt) {
        this.isFlippingDirection = true;
        this.flipElapsed = 0;
        this.flipFromDir = this.direction;
        this.flipToDir = -this.direction;
        this.reverseIndicatorAlpha = 1.0;
        soundSynth.playDirectionReversalAlert();
        this.addFloatingText('DIRECTION REVERSED!', this.centerX, this.centerY + 45, '#f43f5e', 1.1);
        this.nextDirectionFlipAt =
          this.elapsedThisLevel +
          this.flipDurationSec +
          this.randomBetween(cfg.directionFlipMinSec, cfg.directionFlipMaxSec);
      }

      if (this.isFlippingDirection) {
        this.flipElapsed += dt;
        const flipT = Math.min(1, this.flipElapsed / this.flipDurationSec);
        const eased = flipT * flipT * (3 - 2 * flipT); // smoothstep
        this.direction = this.flipFromDir + (this.flipToDir - this.flipFromDir) * eased;
        if (flipT >= 1) {
          this.direction = this.flipToDir;
          this.isFlippingDirection = false;
        }
      }

      // Update Node Angle
      this.angle += this.direction * this.angularVelocity * dt;
      this.angle = this.normalizeAngle(this.angle);

      // Trail history - extended for richer persistent visual stream
      const nodeX = this.centerX + Math.cos(this.angle) * this.orbitRadius;
      const nodeY = this.centerY + Math.sin(this.angle) * this.orbitRadius;
      this.trailHistory.unshift({ x: nodeX, y: nodeY, angle: this.angle, time: performance.now() });
      if (this.trailHistory.length > 36) this.trailHistory.pop();

      // Dynamic trail VFX particle emission
      const activeColors = this.isDarkMode ? this.theme.dark : this.theme.light;
      const tangentX = -Math.sin(this.angle) * this.direction;
      const tangentY = Math.cos(this.angle) * this.direction;

      switch (this.trailId) {
        case 'flare': {
          // Solar embers spitting fiery sparks behind the velocity vector
          if (Math.random() < 0.85) {
            this.particles.push({
              x: nodeX + (Math.random() - 0.5) * 6,
              y: nodeY + (Math.random() - 0.5) * 6,
              vx: -tangentX * (Math.random() * 45 + 15) + (Math.random() - 0.5) * 20,
              vy: -tangentY * (Math.random() * 45 + 15) + (Math.random() - 0.5) * 20,
              radius: Math.random() * 3.5 + 1.5,
              color: Math.random() < 0.5 ? '#f59e0b' : '#ef4444',
              alpha: 0.95,
              decay: Math.random() * 2.5 + 2.0,
            });
          }
          break;
        }
        case 'sparkles': {
          // Shimmering micro-crystals in orbit
          if (Math.random() < 0.75) {
            this.particles.push({
              x: nodeX + (Math.random() - 0.5) * 8,
              y: nodeY + (Math.random() - 0.5) * 8,
              vx: -tangentX * 10 + (Math.random() - 0.5) * 25,
              vy: -tangentY * 10 + (Math.random() - 0.5) * 25,
              radius: Math.random() * 3.0 + 1.0,
              color: '#ffffff',
              alpha: 1.0,
              decay: 1.8,
              shape: 'diamond',
              rotation: Math.random() * Math.PI,
              vRot: (Math.random() - 0.5) * 8,
            });
          }
          break;
        }
        case 'glitch': {
          // Quantum noise glitch fragments
          if (Math.random() < 0.6) {
            this.particles.push({
              x: nodeX + (Math.random() - 0.5) * 14,
              y: nodeY + (Math.random() - 0.5) * 14,
              vx: (Math.random() - 0.5) * 40,
              vy: (Math.random() - 0.5) * 40,
              radius: Math.random() * 3.5 + 1.5,
              color: Math.random() < 0.5 ? activeColors.accent || '#a855f7' : '#00f0ff',
              alpha: 0.9,
              decay: 3.5,
              shape: 'square',
            });
          }
          break;
        }
        case 'scanline': {
          // Digital telemetry bursts
          if (Math.random() < 0.4) {
            this.particles.push({
              x: nodeX,
              y: nodeY,
              vx: -tangentX * 15,
              vy: -tangentY * 15,
              radius: 2,
              color: activeColors.nodeFill,
              alpha: 0.7,
              decay: 3.0,
            });
          }
          break;
        }
        default: {
          // Plasma / Ribbon ambient aura dust
          if (this.isFever && Math.random() < 0.8) {
            this.particles.push({
              x: nodeX + (Math.random() - 0.5) * 6,
              y: nodeY + (Math.random() - 0.5) * 6,
              vx: -tangentX * 25 + (Math.random() - 0.5) * 15,
              vy: -tangentY * 25 + (Math.random() - 0.5) * 15,
              radius: Math.random() * 3.0 + 1.5,
              color: activeColors.feverAura,
              alpha: 0.85,
              decay: 2.2,
            });
          }
          break;
        }
      }

      // Fever Timer Countdown
      if (this.isFever) {
        this.feverTimer -= dt;
        this.feverMeter = (this.feverTimer / this.feverDuration) * 100;
        this.callbacks.onFeverChange(this.feverMeter, true);

        if (this.feverTimer <= 0) {
          this.isFever = false;
          this.feverMeter = 0;
          this.callbacks.onFeverChange(0, false);
          soundSynth.updateAmbientDrone(this.combo, false);
        }
      }
    } else if (this.state === GameState.MAIN_MENU) {
      // Idle ambient orbital spin - clear trail history so no trail appears on home page
      this.trailHistory = [];
      this.angle += 0.85 * dt;
      this.angle = this.normalizeAngle(this.angle);
    }

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Reversal warning alpha decay
    if (this.reverseIndicatorAlpha > 0) {
      this.reverseIndicatorAlpha = Math.max(0, this.reverseIndicatorAlpha - dt * 1.5);
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;
      if (p.vRot && p.rotation !== undefined) {
        p.rotation += p.vRot * dt;
      }
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.radius += (s.maxRadius - s.radius) * dt * 12;
      s.alpha -= dt * 2.0;
      if (s.alpha <= 0 || s.radius >= s.maxRadius * 0.98) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy * dt;
      t.alpha -= t.decay * dt;
      if (t.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private render() {
    const ctx = this.ctx;
    const colors = this.isDarkMode ? this.theme.dark : this.theme.light;

    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // Apply Screen Shake
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // 1. Draw Background
    this.renderBackground(ctx, colors);

    // 2. Draw Main Circular Orbit Track
    this.renderOrbitTrack(ctx, colors);

    // 3. Draw Target Arc & Bullseye Center
    if (this.state === GameState.PLAYING || this.state === GameState.PAUSED) {
      this.renderTargetArc(ctx, colors);
    }

    // 4. Draw Trails & Node (No trail on home page revolving state)
    if (this.state !== GameState.MAIN_MENU) {
      this.renderTrail(ctx, colors);
    }
    this.renderNode(ctx, colors);

    // 5. Draw Shockwaves & Particles
    this.renderShockwaves(ctx);
    this.renderParticles(ctx);

    // 6. Draw Direction Reversal Flash
    if (this.reverseIndicatorAlpha > 0) {
      ctx.save();
      ctx.strokeStyle = `rgba(244, 63, 94, ${this.reverseIndicatorAlpha * 0.6})`;
      ctx.lineWidth = 6;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, this.orbitRadius + 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 7. Draw Floating Combat/Feedback Texts
    this.renderFloatingTexts(ctx);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D, colors: ThemeColors['dark']) {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle ambient radial glow behind orbit
    const bgRad = ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      10,
      this.centerX,
      this.centerY,
      this.orbitRadius * 1.8
    );
    bgRad.addColorStop(0, colors.ringGlow.replace('rgb', 'rgba').replace(')', ', 0.1)'));
    bgRad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgRad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle geometric radar rings
    ctx.save();
    ctx.strokeStyle = colors.gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.orbitRadius * 0.45, 0, Math.PI * 2);
    ctx.arc(this.centerX, this.centerY, this.orbitRadius * 1.15, 0, Math.PI * 2);
    ctx.arc(this.centerX, this.centerY, this.orbitRadius * 1.45, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(this.centerX - this.orbitRadius * 1.6, this.centerY);
    ctx.lineTo(this.centerX + this.orbitRadius * 1.6, this.centerY);
    ctx.moveTo(this.centerX, this.centerY - this.orbitRadius * 1.6);
    ctx.lineTo(this.centerX, this.centerY + this.orbitRadius * 1.6);
    ctx.stroke();
    ctx.restore();
  }

  private renderOrbitTrack(ctx: CanvasRenderingContext2D, colors: ThemeColors['dark']) {
    ctx.save();

    // Outer concentric thin geometric guide ring
    ctx.strokeStyle = colors.ringTrack;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.orbitRadius * 1.14, 0, Math.PI * 2);
    ctx.stroke();

    // Outer glow when in Fever mode
    if (this.isFever) {
      ctx.shadowColor = colors.feverAura;
      ctx.shadowBlur = 24;
      ctx.strokeStyle = colors.feverAura;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, this.orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Main Orbit Track Line (Segmented / Dashed Geometric Precision)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = colors.ringTrack;
    ctx.lineWidth = 3.5;
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.orbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary subtle base ring
    ctx.setLineDash([]);
    ctx.strokeStyle = colors.ringTrack;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.orbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  private renderTargetArc(ctx: CanvasRenderingContext2D, colors: ThemeColors['dark']) {
    ctx.save();

    for (const target of this.targets) {
      const halfSpan = target.arcSpan / 2;
      const halfBullseye = target.bullseyeSpan / 2;
      const startAngle = target.centerAngle - halfSpan;
      const endAngle = target.centerAngle + halfSpan;
      const bStart = target.centerAngle - halfBullseye;
      const bEnd = target.centerAngle + halfBullseye;

      // 1. Safe Zone Arc (Outer)
      ctx.shadowColor = colors.safeZoneGlow;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = colors.safeZone;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, this.orbitRadius, startAngle, endAngle);
      ctx.stroke();

      // 2. Bullseye Center Sweet Spot
      ctx.shadowColor = colors.bullseyeGlow;
      ctx.shadowBlur = 16;
      ctx.strokeStyle = colors.bullseye;
      ctx.lineWidth = 13;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, this.orbitRadius, bStart, bEnd);
      ctx.stroke();

      // Bullseye center needle/tick mark
      const tickLen = 14;
      const tx1 = this.centerX + Math.cos(target.centerAngle) * (this.orbitRadius - tickLen / 2);
      const ty1 = this.centerY + Math.sin(target.centerAngle) * (this.orbitRadius - tickLen / 2);
      const tx2 = this.centerX + Math.cos(target.centerAngle) * (this.orbitRadius + tickLen / 2);
      const ty2 = this.centerY + Math.sin(target.centerAngle) * (this.orbitRadius + tickLen / 2);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderTrail(ctx: CanvasRenderingContext2D, colors: ThemeColors['dark']) {
    if (this.state === GameState.MAIN_MENU || this.trailHistory.length < 2) return;

    ctx.save();
    const trailCol = this.isFever ? colors.feverAura : colors.nodeGlow;
    const len = this.trailHistory.length;

    switch (this.trailId) {
      case 'scanline': {
        // Digital cyber telemetry trail with segmented laser hashes and neon markers
        ctx.shadowColor = trailCol;
        ctx.shadowBlur = 12;
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = colors.nodeFill;
        ctx.beginPath();
        for (let i = 0; i < len; i++) {
          const pt = this.trailHistory[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Digital node ticks along history
        ctx.setLineDash([]);
        for (let i = 2; i < len; i += 4) {
          const pt = this.trailHistory[i];
          const alpha = 1 - i / len;
          ctx.fillStyle = colors.nodeFill;
          ctx.globalAlpha = alpha;
          ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
        }
        break;
      }

      case 'ribbon': {
        // Intertwined optical dual helix ribbons with undulating sinusoidal waves
        const now = performance.now() * 0.006;
        for (let i = 0; i < len - 1; i++) {
          const p1 = this.trailHistory[i];
          const p2 = this.trailHistory[i + 1];
          const progress = i / len;
          const alpha = Math.pow(1 - progress, 1.2);
          const wave1 = Math.sin(now + i * 0.45) * (7 * (1 - progress));
          const wave2 = -wave1;

          // Ribbon Strand A (Primary)
          ctx.strokeStyle = colors.nodeFill;
          ctx.globalAlpha = alpha * 0.9;
          ctx.lineWidth = (1 - progress) * 6 + 1.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p1.x + wave1, p1.y + wave1);
          ctx.lineTo(p2.x + wave1, p2.y + wave1);
          ctx.stroke();

          // Ribbon Strand B (Secondary Accent)
          ctx.strokeStyle = colors.accent || '#a855f7';
          ctx.globalAlpha = alpha * 0.8;
          ctx.lineWidth = (1 - progress) * 4.5 + 1;
          ctx.beginPath();
          ctx.moveTo(p1.x + wave2, p1.y + wave2);
          ctx.lineTo(p2.x + wave2, p2.y + wave2);
          ctx.stroke();
        }
        break;
      }

      case 'flare': {
        // Solar flare fiery plasma trail with bright hot core
        for (let i = 0; i < len - 1; i++) {
          const p1 = this.trailHistory[i];
          const p2 = this.trailHistory[i + 1];
          const progress = i / len;
          const alpha = 1 - progress;

          // Outer fiery corona
          ctx.strokeStyle = '#ea580c';
          ctx.globalAlpha = alpha * 0.75;
          ctx.lineWidth = (1 - progress) * 11 + 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Inner white-hot laser core
          ctx.strokeStyle = '#fef08a';
          ctx.globalAlpha = alpha * 0.95;
          ctx.lineWidth = (1 - progress) * 4 + 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        break;
      }

      case 'sparkles': {
        // Stardust stream with crystalline connecting filaments and glowing nodes
        for (let i = 0; i < len - 1; i++) {
          const p1 = this.trailHistory[i];
          const p2 = this.trailHistory[i + 1];
          const progress = i / len;
          const alpha = 1 - progress;

          ctx.strokeStyle = '#ffffff';
          ctx.globalAlpha = alpha * 0.8;
          ctx.lineWidth = (1 - progress) * 3 + 1;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          if (i % 3 === 0) {
            ctx.fillStyle = colors.nodeFill;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, (1 - progress) * 3.5 + 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'glitch': {
        // Quantum noise broken vector fragments with spatial displacements
        for (let i = 0; i < len - 1; i += 2) {
          const p1 = this.trailHistory[i];
          const p2 = this.trailHistory[Math.min(i + 1, len - 1)];
          const progress = i / len;
          const alpha = 1 - progress;
          const jitterX = (Math.random() - 0.5) * 6;
          const jitterY = (Math.random() - 0.5) * 6;

          ctx.strokeStyle = Math.random() < 0.5 ? colors.nodeFill : (colors.accent || '#00f0ff');
          ctx.globalAlpha = alpha * 0.9;
          ctx.lineWidth = (1 - progress) * 7 + 1.5;
          ctx.beginPath();
          ctx.moveTo(p1.x + jitterX, p1.y + jitterY);
          ctx.lineTo(p2.x + jitterX, p2.y + jitterY);
          ctx.stroke();
        }
        break;
      }

      case 'plasma':
      default: {
        // Ultra-smooth luminous plasma flow with multi-tier glow layer
        for (let i = 0; i < len - 1; i++) {
          const p1 = this.trailHistory[i];
          const p2 = this.trailHistory[i + 1];
          const progress = i / len;
          const alpha = 1 - progress;

          // Outer aura glow
          ctx.strokeStyle = colors.nodeFill;
          ctx.globalAlpha = alpha * 0.55;
          ctx.lineWidth = (1 - progress) * 12 + 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // High luminosity white spine
          ctx.strokeStyle = '#ffffff';
          ctx.globalAlpha = alpha * 0.85;
          ctx.lineWidth = (1 - progress) * 3.5 + 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        break;
      }
    }

    ctx.restore();
  }

  private renderNode(ctx: CanvasRenderingContext2D, colors: ThemeColors['dark']) {
    const x = this.centerX + Math.cos(this.angle) * this.orbitRadius;
    const y = this.centerY + Math.sin(this.angle) * this.orbitRadius;
    // Enhanced node base scale for striking visibility and clear silhouette recognition
    const nodeSize = 12.0;
    const now = performance.now();

    ctx.save();
    ctx.translate(x, y);

    // Dynamic rotation alignment along orbit tangent
    const tangent = this.angle + (this.direction > 0 ? Math.PI / 2 : -Math.PI / 2);
    ctx.rotate(tangent);

    // Dynamic double-layer aura glow for high visibility
    ctx.shadowColor = this.isFever ? colors.feverAura : colors.nodeGlow;
    ctx.shadowBlur = this.isFever ? 28 : 20;

    // Render customized high-contrast skin geometry
    switch (this.skinId) {
      case 'halo': {
        // Halo: a stable core with two small satellites continuously orbiting it.
        // Self-rotating (driven by elapsed time, not travel direction), so it always
        // reads the same regardless of which way the node is moving.
        const coreR = nodeSize * 0.85;
        const orbitR = nodeSize * 1.9;
        const satR = nodeSize * 0.4;
        const spin = now * 0.0035;

        // Faint guide ring
        ctx.strokeStyle = colors.nodeFill;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, orbitR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Two orbiting satellites, opposite each other on the ring
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

        // Core with a crisp white rim
        ctx.fillStyle = colors.nodeFill;
        ctx.beginPath();
        ctx.arc(0, 0, coreR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(0, 0, coreR, 0, Math.PI * 2);
        ctx.stroke();

        // White specular highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-coreR * 0.3, -coreR * 0.3, coreR * 0.38, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'quantum': {
        // Rotating dual energetic gyro rings with luminous pulsating nucleus
        const rot1 = now * 0.004;
        const rot2 = -now * 0.004;

        // Ring 1
        ctx.save();
        ctx.rotate(rot1);
        ctx.strokeStyle = colors.nodeFill;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, nodeSize * 1.8, nodeSize * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Ring 2
        ctx.save();
        ctx.rotate(rot2 + Math.PI / 2);
        ctx.strokeStyle = colors.accent || colors.nodeFill;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, nodeSize * 1.8, nodeSize * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Core nucleus with glowing shell
        ctx.fillStyle = colors.nodeFill;
        ctx.beginPath();
        ctx.arc(0, 0, nodeSize * 0.85, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, nodeSize * 0.45, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'shuriken': {
        // 4-point aerodynamic energized ninja blade with high-contrast bevels
        const s = nodeSize * 1.7;
        const inner = nodeSize * 0.45;
        ctx.rotate(now * 0.009);

        // Blade silhouette
        ctx.fillStyle = colors.nodeFill;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(inner, -inner, s, 0);
        ctx.quadraticCurveTo(inner, inner, 0, s);
        ctx.quadraticCurveTo(-inner, inner, -s, 0);
        ctx.quadraticCurveTo(-inner, -inner, 0, -s);
        ctx.fill();

        // High contrast razor edge outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Center hub bearing
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, inner * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(0, 0, inner * 0.45, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'diamond': {
        // Multi-faceted geometric crystal with holographic refractions
        const s = nodeSize * 1.6;
        const w = nodeSize * 1.2;

        // Outer crystal boundary
        ctx.fillStyle = colors.nodeFill;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(w, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-w, 0);
        ctx.closePath();
        ctx.fill();

        // Inner crystalline facets
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(0, s);
        ctx.moveTo(-w, 0);
        ctx.lineTo(w, 0);
        ctx.stroke();

        // Bright diamond border
        ctx.stroke();

        // Core jewel highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.5);
        ctx.lineTo(w * 0.5, 0);
        ctx.lineTo(0, s * 0.5);
        ctx.lineTo(-w * 0.5, 0);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'star': {
        // 5-point radiant stellar supernova with luminous rotating core
        ctx.rotate(now * 0.005);
        const spikes = 5;
        const outerRadius = nodeSize * 1.8;
        const innerRadius = nodeSize * 0.8;
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

        // Crisp white star perimeter
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // Radiant star core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, nodeSize * 0.55, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'fireball': {
        // Solar flare flame with heat-distortion aura & tri-layer flame core
        const pulse = 1 + Math.sin(now * 0.015) * 0.15;
        
        // Outer flame corona
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(0, 0, nodeSize * 1.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Mid-temperature amber flame
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, nodeSize * 1.05, 0, Math.PI * 2);
        ctx.fill();

        // White-hot solar nucleus
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, nodeSize * 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        break;
      }

      case 'pulse': {
        // Sonar echo beacon: two rings expand and fade smoothly (alpha + radius
        // together), instead of just thinning out and popping back at full strength.
        const cycleMs = 1200;
        const ripple1 = (now % cycleMs) / cycleMs;
        const ripple2 = ((now + cycleMs / 2) % cycleMs) / cycleMs;

        const drawRipple = (progress: number, color: string) => {
          ctx.save();
          ctx.globalAlpha = Math.max(0, (1 - progress) * 0.85);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, nodeSize + progress * 24, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        };
        drawRipple(ripple1, colors.nodeFill);
        drawRipple(ripple2, colors.accent || colors.nodeFill);

        // Central beacon emitter
        ctx.fillStyle = colors.nodeFill;
        ctx.beginPath();
        ctx.arc(0, 0, nodeSize * 1.05, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, nodeSize * 1.05, 0, Math.PI * 2);
        ctx.stroke();

        // Bright emitter lens
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, nodeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'dot':
      default: {
        // High resonance sleek orb with bold contrast halo & white specular lens
        ctx.fillStyle = colors.nodeFill;
        ctx.beginPath();
        ctx.arc(0, 0, nodeSize * 1.1, 0, Math.PI * 2);
        ctx.fill();

        // Outer contrast rim
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, nodeSize * 1.1, 0, Math.PI * 2);
        ctx.stroke();

        // Pure white gloss highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-nodeSize * 0.35, -nodeSize * 0.35, nodeSize * 0.45, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      if (p.rotation !== undefined) ctx.rotate(p.rotation);

      if (p.shape === 'spark') {
        ctx.fillRect(-p.radius * 1.5, -p.radius * 0.5, p.radius * 3, p.radius);
      } else if (p.shape === 'square') {
        ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
      } else if (p.shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(0, -p.radius * 1.3);
        ctx.lineTo(p.radius, 0);
        ctx.lineTo(0, p.radius * 1.3);
        ctx.lineTo(-p.radius, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  private renderShockwaves(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const s of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.lineWidth;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const t of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.font = `800 ${Math.floor(16 * t.scale)}px 'Outfit', sans-serif`;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
    ctx.restore();
  }
}
