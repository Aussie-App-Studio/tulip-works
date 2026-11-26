import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Gamepad2,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { ThemeMode } from '../hooks/useTheme';

interface TulipRunnerProps {
  theme: ThemeMode;
}

type GameStatus = 'idle' | 'playing' | 'gameover';
type ObstacleKind = 'ad' | 'cookie' | 'bug' | 'tracker';
type BonusKind = 'calvin' | 'luther' | 'spurgeon' | 'knox' | 'theses' | 'scriptura';

interface Obstacle {
  kind: ObstacleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  phase: number;
}

interface Bonus {
  kind: BonusKind;
  x: number;
  y: number;
  r: number;
  collected: boolean;
  phase: number;
}

const BONUS_META: Record<BonusKind, { popup: string; color: string }> = {
  calvin: { popup: '+50 Predestined!', color: '#EA7824' },
  luther: { popup: '+50 Here I Stand!', color: '#2857A4' },
  spurgeon: { popup: '+50 Spurgeon!', color: '#D97706' },
  knox: { popup: '+50 Knox!', color: '#0D9488' },
  theses: { popup: '+50 Nailed It!', color: '#EA7824' },
  scriptura: { popup: '+50 Sola Scriptura!', color: '#CA8A04' },
};

const BONUS_KINDS: BonusKind[] = ['calvin', 'luther', 'spurgeon', 'theses', 'knox', 'scriptura'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

interface Cloud {
  x: number;
  y: number;
  w: number;
  speed: number;
}

const LOGICAL_H = 260;
const GROUND_Y = 214;
const PLAYER_X = 96;
const PLAYER_W = 38;
const PLAYER_H = 54;
const PLAYER_DUCK_H = 34;
const BASE_SPEED = 360;
const MAX_SPEED = 540;
const HI_SCORE_KEY = 'tulip-works-runner-hi-v1';

const QUIPS: Record<ObstacleKind, string[]> = {
  ad: [
    'Ambushed by a pop-up ad!',
    'Clicked the fake "✕" button!',
    'Interrupted by an unskippable ad!',
  ],
  cookie: [
    'Trapped by a cookie banner!',
    'Forgot to click "Reject All"!',
    'Buried under 47 cookie toggles!',
  ],
  bug: [
    'Tripped over a sneaky bug!',
    'That one is definitely a feature.',
    'Wild bug spotted on the track!',
  ],
  tracker: [
    'Spotted by a flying tracker!',
    'Pro tip: hold ↓ to duck under trackers!',
    'Dodged the ads, caught by a tracker!',
  ],
};

function getRank(score: number): string {
  if (score >= 1000) return 'Tulip Grandmaster 👑';
  if (score >= 600) return 'Ad-Blocker Legend 🛡️';
  if (score >= 300) return 'Full Bloom 🌷';
  if (score >= 120) return 'Quick Sprout 🌱';
  return 'Fresh Bulb ✨';
}

function playSynth(
  ctxRef: React.MutableRefObject<AudioContext | null>,
  muted: boolean,
  type: 'jump' | 'bonus' | 'milestone' | 'bonk',
  streak = 1
) {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!ctxRef.current) ctxRef.current = new AudioCtx();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'jump') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.exponentialRampToValueAtTime(590, now + 0.11);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'bonus') {
      const mult = Math.pow(2, Math.min(Math.max(0, streak - 1), 5) / 12);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660 * mult, now);
      osc.frequency.setValueAtTime(880 * mult, now + 0.06);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'milestone') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.07);
      osc.frequency.setValueAtTime(783.99, now + 0.14);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.22);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.24);
    }
  } catch {
    // ignore audio autoplay restrictions
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draws the geometric blue-and-orange Tulip Works tulip character!
 */
function drawTulipHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  bottomY: number,
  ducking: boolean,
  jumping: boolean,
  dead: boolean,
  stridePhase: number,
  isDark: boolean
) {
  ctx.save();
  const cx = Math.round(x + PLAYER_W / 2);
  const bob = jumping || dead ? 0 : Math.abs(Math.sin(stridePhase)) * -3.5;

  // Ground shadow
  const airRatio = Math.max(0, 1 - (GROUND_Y - bottomY) / 130);
  ctx.fillStyle = isDark ? 'rgba(0,0,0,0.35)' : 'rgba(24,32,47,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx, GROUND_Y + 3, 16 * airRatio, 4 * airRatio, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(cx, Math.round(bottomY + bob));
  if (ducking && !jumping) {
    ctx.scale(1.18, 0.68);
  } else if (jumping) {
    ctx.rotate(-0.07);
  } else if (dead) {
    ctx.rotate(0.18);
  }

  const blue = isDark ? '#4E89E8' : '#2857A4';
  const orange = '#EA7824';
  const fillBg = isDark ? '#242B35' : '#FFFFFF';

  // Animated running feet
  const leftLegAngle = dead ? 0.3 : jumping ? -0.5 : Math.sin(stridePhase) * 0.7;
  const rightLegAngle = dead ? -0.3 : jumping ? 0.5 : Math.sin(stridePhase + Math.PI) * 0.7;

  ctx.strokeStyle = blue;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left leg
  ctx.beginPath();
  ctx.moveTo(-3, -12);
  ctx.lineTo(-3 + Math.sin(leftLegAngle) * 10, -1 + Math.max(0, Math.cos(leftLegAngle) * -2));
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(3, -12);
  ctx.lineTo(3 + Math.sin(rightLegAngle) * 10, -1 + Math.max(0, Math.cos(rightLegAngle) * -2));
  ctx.stroke();

  // Stem
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(0, -25);
  ctx.stroke();

  // Leaf swooping right (matching Tulip Works logo)
  ctx.fillStyle = fillBg;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.quadraticCurveTo(16, -12, 18, -26);
  ctx.quadraticCurveTo(6, -25, 0, -12);
  ctx.fill();
  ctx.stroke();

  // Orange vein inside leaf
  ctx.strokeStyle = orange;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(2, -13);
  ctx.lineTo(13, -22);
  ctx.stroke();

  // Tulip flower cup base fill
  ctx.fillStyle = fillBg;
  ctx.beginPath();
  ctx.moveTo(-14, -49);
  ctx.lineTo(-14, -36);
  ctx.bezierCurveTo(-14, -27, -7, -23, 0, -23);
  ctx.bezierCurveTo(7, -23, 14, -27, 14, -36);
  ctx.lineTo(14, -49);
  ctx.quadraticCurveTo(0, -45, -14, -49);
  ctx.closePath();
  ctx.fill();

  // Top orange center petal tip
  ctx.strokeStyle = orange;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-6, -46);
  ctx.quadraticCurveTo(0, -56, 6, -46);
  ctx.stroke();

  // Blue cup outline
  ctx.strokeStyle = blue;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-14, -49);
  ctx.lineTo(-14, -36);
  ctx.bezierCurveTo(-14, -27, -7, -23, 0, -23);
  ctx.bezierCurveTo(7, -23, 14, -27, 14, -36);
  ctx.lineTo(14, -49);
  ctx.stroke();

  // Blue left inner petal curve
  ctx.beginPath();
  ctx.moveTo(-14, -49);
  ctx.quadraticCurveTo(-5, -47, 0, -41);
  ctx.stroke();

  // Signature orange swooping inner petal
  ctx.strokeStyle = orange;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(14, -49);
  ctx.quadraticCurveTo(-6, -44, -6, -32);
  ctx.quadraticCurveTo(-6, -26, 0, -23);
  ctx.stroke();

  // Cute expressive eyes on the tulip cup
  if (dead) {
    ctx.strokeStyle = isDark ? '#F3F5FA' : '#18202F';
    ctx.lineWidth = 2;
    // Left X eye
    ctx.beginPath();
    ctx.moveTo(1, -39);
    ctx.lineTo(5, -35);
    ctx.moveTo(5, -39);
    ctx.lineTo(1, -35);
    ctx.stroke();
    // Right X eye
    ctx.beginPath();
    ctx.moveTo(7, -39);
    ctx.lineTo(11, -35);
    ctx.moveTo(11, -39);
    ctx.lineTo(7, -35);
    ctx.stroke();
  } else {
    ctx.fillStyle = isDark ? '#F3F5FA' : '#18202F';
    ctx.beginPath();
    ctx.arc(3.5, -36.5, 2, 0, Math.PI * 2);
    ctx.arc(9.5, -36.5, 2, 0, Math.PI * 2);
    ctx.fill();
    // Little confident sparkle in eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(4.2, -37.2, 0.7, 0, Math.PI * 2);
    ctx.arc(10.2, -37.2, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function createObstacle(kind: ObstacleKind, x: number): Obstacle {
  const phase = Math.random() * 6;
  if (kind === 'ad') {
    return { kind, x, y: GROUND_Y - 38, w: 40, h: 38, phase };
  }
  if (kind === 'cookie') {
    return { kind, x, y: GROUND_Y - 48, w: 48, h: 48, phase };
  }
  if (kind === 'bug') {
    return { kind, x, y: GROUND_Y - 26, w: 34, h: 26, phase };
  }
  // Flying tracker at head height (always duckable or jumpable!)
  const yPos = GROUND_Y - 62 + Math.round(Math.random() * 4);
  return { kind, x, y: yPos, w: 44, h: 26, phase };
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  ob: Obstacle,
  t: number,
  isDark: boolean
) {
  ctx.save();
  const ox = Math.round(ob.x);
  const oy = Math.round(ob.y);

  if (ob.kind === 'ad') {
    // Pop-up Ad window: bold red outline, solid top bar, crisp static AD text
    drawRoundedRect(ctx, ox, oy, ob.w, ob.h, 6);
    ctx.fillStyle = isDark ? '#3B2318' : '#FFF3CD';
    ctx.fill();
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Solid red top bar + crisp white dot
    drawRoundedRect(ctx, ox, oy, ob.w, 12, 5);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ox + ob.w - 7, oy + 6, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // High-contrast static "AD"
    ctx.fillStyle = isDark ? '#FDE047' : '#DC2626';
    ctx.font = '900 16px "Bricolage Grotesque", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AD', ox + ob.w / 2, oy + ob.h - 8);
  } else if (ob.kind === 'cookie') {
    // Bold cookie consent banner silhouette
    drawRoundedRect(ctx, ox, oy, ob.w, ob.h, 7);
    ctx.fillStyle = isDark ? '#272E3F' : '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#F59E0B' : '#D97706';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Large clear cookie silhouette + 3 bold chips
    const ccx = ox + ob.w / 2;
    const ccy = oy + 17;
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(ccx, ccy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.arc(ccx - 4.5, ccy - 3, 2.2, 0, Math.PI * 2);
    ctx.arc(ccx + 4, ccy - 1, 2.2, 0, Math.PI * 2);
    ctx.arc(ccx - 1, ccy + 4.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Solid blue pill bar at bottom (no micro text)
    drawRoundedRect(ctx, ox + 6, oy + ob.h - 14, ob.w - 12, 8, 4);
    ctx.fillStyle = '#2857A4';
    ctx.fill();
  } else if (ob.kind === 'bug') {
    // Scuttling glitch bug: bold crimson body, high-contrast outline, 2 pairs of thick legs
    const cx = ox + ob.w / 2;
    const cy = oy + ob.h / 2 + 2;
    const wiggle = Math.sin(t * 0.025 + ob.phase) * 3;

    ctx.strokeStyle = '#E11D48';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + dir * 4);
      ctx.lineTo(cx - 17, cy + dir * 6 + wiggle * dir);
      ctx.moveTo(cx + 10, cy + dir * 4);
      ctx.lineTo(cx + 17, cy + dir * 6 - wiggle * dir);
      ctx.stroke();
    }

    // Body with crisp outline
    ctx.fillStyle = '#E11D48';
    ctx.strokeStyle = isDark ? '#FDA4AF' : '#881337';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 13, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bold eye facing left
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 7, cy - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Flying Tracker Eye drone (mid-air — duck under or jump over!)
    const bob = Math.sin(t * 0.012 + ob.phase) * 4;
    const cx = ox + ob.w / 2;
    const cy = Math.round(oy + ob.h / 2 + bob);

    // Ground shadow for clear horizontal timing
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.28)' : 'rgba(24,32,47,0.10)';
    ctx.beginPath();
    ctx.ellipse(cx, GROUND_Y + 3, 15, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle horizontal wake to telegraph its height lane
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 22, cy);
    ctx.lineTo(cx + 42, cy);
    ctx.moveTo(cx + 26, cy - 5);
    ctx.lineTo(cx + 38, cy - 5);
    ctx.stroke();

    // Thick swept drone wings
    const flap = Math.sin(t * 0.035 + ob.phase) * 7;
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 8);
    ctx.lineTo(cx - 19, cy - 13 + flap);
    ctx.moveTo(cx + 8, cy - 8);
    ctx.lineTo(cx + 19, cy - 13 + flap);
    ctx.stroke();

    // Bold eye outer shape
    ctx.fillStyle = isDark ? '#3B1F5E' : '#F3E8FF';
    ctx.strokeStyle = '#9333EA';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy);
    ctx.quadraticCurveTo(cx, cy - 14, cx + 20, cy);
    ctx.quadraticCurveTo(cx, cy + 14, cx - 20, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Large iris + crisp glint
    ctx.fillStyle = '#9333EA';
    ctx.beginPath();
    ctx.arc(cx - 3, cy, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws chunky 2-3-shape Reformation collectibles (Calvin, Luther, Spurgeon, Knox,
 * 95 Theses scroll, and Open Scripture) inside a golden medallion halo.
 */
function drawReformationBonus(
  ctx: CanvasRenderingContext2D,
  b: Bonus,
  t: number,
  isDark: boolean
) {
  const bob = Math.sin(t * 0.008 + b.phase) * 3;
  const cx = Math.round(b.x);
  const cy = Math.round(b.y + bob);

  ctx.save();

  // Subtle ground shadow directly beneath the collectible
  ctx.fillStyle = isDark ? 'rgba(251,191,36,0.14)' : 'rgba(180,83,9,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx, GROUND_Y + 3, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(cx, cy);

  // Soft golden aura so players immediately recognize it as a collectible
  ctx.fillStyle = isDark ? 'rgba(251, 191, 36, 0.22)' : 'rgba(251, 191, 36, 0.3)';
  ctx.beginPath();
  ctx.arc(0, 0, b.r + 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isDark ? '#242B35' : '#FFFDF7';
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (b.kind === 'calvin') {
    // John Calvin: warm face + black Geneva Tudor cap + chunky pointed beard
    ctx.fillStyle = '#FDE2C4';
    ctx.beginPath();
    ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6B5B4F';
    ctx.beginPath();
    ctx.moveTo(-9, 1);
    ctx.quadraticCurveTo(-8, 12, 0, 16);
    ctx.quadraticCurveTo(8, 12, 9, 1);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(0, -9, 12.5, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-10.5, -9, 3.5, 10);
    ctx.fillRect(7, -9, 3.5, 10);
  } else if (b.kind === 'luther') {
    // Martin Luther: dark robe collar + round warm face + chunky tilted black beret
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(0, 12, 9, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#FCD9B6';
    ctx.beginPath();
    ctx.arc(0, 1, 9.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.ellipse(-1, -8.5, 13, 5.5, -0.15, 0, Math.PI * 2);
    ctx.fill();
  } else if (b.kind === 'spurgeon') {
    // Charles Spurgeon: warm face + dark hair dome + wide bushy full beard
    ctx.fillStyle = '#FDE0C2';
    ctx.beginPath();
    ctx.arc(0, -1, 9.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3B281E';
    ctx.beginPath();
    ctx.arc(0, -5.5, 10, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#3B281E';
    ctx.beginPath();
    ctx.moveTo(-11, -1);
    ctx.quadraticCurveTo(-13, 12, 0, 15.5);
    ctx.quadraticCurveTo(13, 12, 11, -1);
    ctx.quadraticCurveTo(0, 4, -11, -1);
    ctx.closePath();
    ctx.fill();
  } else if (b.kind === 'knox') {
    // John Knox: warm face + wide flat Scottish bonnet + long silver-white beard
    ctx.fillStyle = '#FDE2C4';
    ctx.beginPath();
    ctx.arc(0, -1, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.quadraticCurveTo(-10, 12, 0, 16.5);
    ctx.quadraticCurveTo(10, 12, 9, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.ellipse(0, -9, 13.5, 4.5, 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (b.kind === 'theses') {
    // The 95 Theses: bold cream parchment + pin dot + big bold "95"
    drawRoundedRect(ctx, -10, -12, 20, 24, 3);
    ctx.fillStyle = '#FEF3C7';
    ctx.fill();
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(0, -8.5, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9A3412';
    ctx.font = '900 13px "Bricolage Grotesque", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('95', 0, 2);
  } else {
    // Sola Scriptura: bold dark-brown book cover + crisp cream pages + thick red ribbon
    drawRoundedRect(ctx, -13, -8, 26, 16, 3);
    ctx.fillStyle = '#78350F';
    ctx.fill();

    ctx.fillStyle = '#FFFBEB';
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.quadraticCurveTo(-5.5, 4, -10.5, 5);
    ctx.lineTo(-10.5, -6.5);
    ctx.quadraticCurveTo(-5.5, -7.5, 0, -5);
    ctx.quadraticCurveTo(5.5, -7.5, 10.5, -6.5);
    ctx.lineTo(10.5, 5);
    ctx.quadraticCurveTo(5.5, 4, 0, 6);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(2.5, 12.5);
    ctx.stroke();
  }

  ctx.restore();
}

export function TulipRunner({ theme }: TulipRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const themeRef = useRef<ThemeMode>(theme);
  const mutedRef = useRef<boolean>(false);
  const canvasSizeRef = useRef({ cssW: 860, cssH: 260 });
  const pointerStartYRef = useRef<number | null>(null);
  const swipedDownRef = useRef(false);

  const [status, setStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      return Number(localStorage.getItem(HI_SCORE_KEY) || '0') || 0;
    } catch {
      return 0;
    }
  });
  const [muted, setMuted] = useState(false);
  const [quip, setQuip] = useState('');

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateSize = (w: number, h: number) => {
      canvasSizeRef.current = {
        cssW: Math.max(320, Math.round(w)),
        cssH: Math.max(180, Math.round(h)),
      };
    };
    const rect = canvas.getBoundingClientRect();
    updateSize(rect.width, rect.height);

    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateSize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Mutable simulation state stored in ref for silky 60fps loop
  const gameRef = useRef({
    status: 'idle' as GameStatus,
    playerY: GROUND_Y,
    vy: 0,
    ducking: false,
    jumpHeld: false,
    jumpBuffer: 0,
    coyoteTimer: 0,
    stridePhase: 0,
    speed: BASE_SPEED,
    distance: 0,
    bonusPoints: 0,
    bonusStreak: 0,
    lastMilestone: 0,
    spawnTimer: 1.1,
    bonusTimer: 3.5,
    groundOffset: 0,
    obstacles: [] as Obstacle[],
    bonuses: [] as Bonus[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    clouds: [
      { x: 140, y: 42, w: 68, speed: 18 },
      { x: 430, y: 66, w: 52, speed: 14 },
      { x: 710, y: 36, w: 80, speed: 22 },
      { x: 1020, y: 50, w: 64, speed: 16 },
    ] as Cloud[],
    highScore: 0,
    shakeTime: 0,
    gameOverLock: 0,
  });

  useEffect(() => {
    gameRef.current.highScore = highScore;
  }, [highScore]);

  const spawnDust = (x: number, y: number, count: number, colors: string[]) => {
    const g = gameRef.current;
    for (let i = 0; i < count; i++) {
      g.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y - Math.random() * 6,
        vx: (Math.random() - 0.5) * 140 - 30,
        vy: -Math.random() * 140 - 30,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7,
        color: colors[i % colors.length],
        size: 3 + Math.random() * 3.5,
      });
    }
  };

  const resetAndStart = useCallback(() => {
    const g = gameRef.current;
    g.status = 'playing';
    g.playerY = GROUND_Y;
    g.vy = -560; // joyful opening hop!
    g.ducking = false;
    g.jumpHeld = true;
    g.jumpBuffer = 0;
    g.coyoteTimer = 0;
    g.stridePhase = 0;
    g.speed = BASE_SPEED;
    g.distance = 0;
    g.bonusPoints = 0;
    g.bonusStreak = 0;
    g.lastMilestone = 0;
    g.spawnTimer = 1.0;
    g.bonusTimer = 2.8;
    g.obstacles = [];
    g.bonuses = [];
    g.particles = [];
    g.floatingTexts = [];
    g.shakeTime = 0;
    g.gameOverLock = 0;
    spawnDust(PLAYER_X + PLAYER_W / 2, GROUND_Y, 8, ['#EA7824', '#2857A4', '#FBBF24']);
    playSynth(audioCtxRef, mutedRef.current, 'jump');
    setScore(0);
    setQuip('');
    setStatus('playing');
  }, []);

  const triggerJumpPress = useCallback(() => {
    const g = gameRef.current;
    if (g.status === 'idle') {
      resetAndStart();
      return;
    }
    if (g.status === 'gameover') {
      if (g.gameOverLock > 0) return;
      resetAndStart();
      return;
    }
    g.jumpHeld = true;
    g.jumpBuffer = 0.13; // 130ms jump buffer
  }, [resetAndStart]);

  const triggerJumpRelease = useCallback(() => {
    const g = gameRef.current;
    g.jumpHeld = false;
    // Variable jump height: gently cap upward speed on early release
    if (g.vy < -260) {
      g.vy = -260;
    }
  }, []);

  const setDucking = useCallback((duck: boolean) => {
    gameRef.current.ducking = duck;
  }, []);

  // Keyboard controls: capture Space / Arrow keys whenever playing, focused, or game canvas is cleanly in view
  useEffect(() => {
    const isCanvasInView = () => {
      const el = canvasRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top >= -40 && rect.bottom <= window.innerHeight + 60;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      const isPlaying = gameRef.current.status === 'playing';
      const canvasFocused = document.activeElement === canvasRef.current;
      const inView = isCanvasInView();

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (isPlaying || canvasFocused || (inView && (e.code === 'Space' || e.code === 'ArrowUp'))) {
          e.preventDefault();
          e.stopPropagation();
          if (!e.repeat) triggerJumpPress();
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        if (isPlaying || canvasFocused) {
          e.preventDefault();
          e.stopPropagation();
          setDucking(true);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (gameRef.current.status === 'playing' || document.activeElement === canvasRef.current) {
          e.preventDefault();
        }
        triggerJumpRelease();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        setDucking(false);
      }
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('keyup', onKeyUp, { capture: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('keyup', onKeyUp, { capture: true });
    };
  }, [triggerJumpPress, triggerJumpRelease, setDucking]);

  // Main 60fps Canvas Loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let scoreSyncAccum = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const canvas = canvasRef.current;
      if (!canvas) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const { cssW, cssH } = canvasSizeRef.current;
      const logicalW = (cssW / cssH) * LOGICAL_H;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(cssW * dpr);
      const targetH = Math.round(cssH * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const g = gameRef.current;
      const isDark = themeRef.current === 'dark';

      // --- UPDATE ---
      if (g.shakeTime > 0) g.shakeTime = Math.max(0, g.shakeTime - dt);
      if (g.gameOverLock > 0) g.gameOverLock = Math.max(0, g.gameOverLock - dt);

      // Gentle ambient clouds even when idle
      for (const c of g.clouds) {
        c.x -= (g.status === 'playing' ? c.speed + g.speed * 0.08 : c.speed * 0.5) * dt;
        if (c.x + c.w < -20) {
          c.x = logicalW + 30 + Math.random() * 120;
          c.y = 28 + Math.random() * 62;
        }
      }

      if (g.status === 'idle') {
        g.stridePhase += dt * 7;
      } else if (g.status === 'playing') {
        // Asymptotic speed curve capped at MAX_SPEED (540) to prevent motion blur
        g.speed += (MAX_SPEED - g.speed) * Math.min(1, dt * 0.045);
        g.distance += g.speed * dt * 0.048;
        g.groundOffset = (g.groundOffset + g.speed * dt) % 48;
        g.stridePhase += dt * (g.speed * 0.036);

        const totalScore = Math.floor(g.distance) + g.bonusPoints;
        scoreSyncAccum += dt;
        if (scoreSyncAccum >= 0.06) {
          scoreSyncAccum = 0;
          setScore(totalScore);
        }

        // Milestone celebration every 100 points
        const milestone = Math.floor(totalScore / 100);
        if (milestone > g.lastMilestone && totalScore >= 100) {
          g.lastMilestone = milestone;
          playSynth(audioCtxRef, mutedRef.current, 'milestone');
          g.floatingTexts.push({
            x: PLAYER_X + 20,
            y: Math.max(46, g.playerY - 68),
            text: `${milestone * 100} pts!`,
            life: 1.0,
            color: '#EA7824',
          });
          spawnDust(PLAYER_X + 20, g.playerY - 30, 12, ['#EA7824', '#2857A4', '#10B981', '#FBBF24']);
        }

        // Jump physics + coyote time + jump buffer
        const onGround = g.playerY >= GROUND_Y - 0.5;
        if (onGround) {
          g.coyoteTimer = 0.085;
        } else {
          g.coyoteTimer = Math.max(0, g.coyoteTimer - dt);
        }
        if (g.jumpBuffer > 0) g.jumpBuffer = Math.max(0, g.jumpBuffer - dt);

        if (g.jumpBuffer > 0 && g.coyoteTimer > 0) {
          g.vy = -590;
          g.jumpBuffer = 0;
          g.coyoteTimer = 0;
          spawnDust(PLAYER_X + PLAYER_W / 2, GROUND_Y, 6, ['#EA7824', '#2857A4']);
          playSynth(audioCtxRef, mutedRef.current, 'jump');
        }

        const gravity = g.ducking && !onGround ? 3200 : 1780;
        g.vy += gravity * dt;
        g.playerY += g.vy * dt;

        if (g.playerY >= GROUND_Y) {
          if (!onGround && g.vy > 220) {
            spawnDust(PLAYER_X + PLAYER_W / 2, GROUND_Y, 5, isDark ? ['#475569', '#EA7824'] : ['#CBD5E1', '#EA7824']);
          }
          g.playerY = GROUND_Y;
          g.vy = 0;
        }

        // Spawn obstacles (patterns scale difficulty without excessive speed)
        const playerCenterX = PLAYER_X + PLAYER_W / 2;
        const guardBonusConflict = (kind: ObstacleKind, spawnX: number): ObstacleKind => {
          const tOb = (spawnX + 20 - playerCenterX) / g.speed;
          let resolved = kind;
          for (const b of g.bonuses) {
            if (b.collected) continue;
            const tBonus = (b.x - playerCenterX) / (g.speed * 0.75);
            if (Math.abs(tOb - tBonus) < 0.42) {
              if (resolved === 'tracker') resolved = 'bug';
              b.y = Math.min(b.y, GROUND_Y - 116);
            }
          }
          return resolved;
        };

        g.spawnTimer -= dt;
        if (g.spawnTimer <= 0) {
          const speedRatio = Math.max(0, Math.min(1, (g.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED)));
          const minGap = Math.max(0.72, 1.32 - speedRatio * 0.52);
          const comboChance = totalScore >= 140 ? Math.min(0.42, (totalScore - 140) / 700) : 0;

          if (Math.random() < comboChance) {
            if (Math.random() < 0.5) {
              // Jump -> Duck combo
              const firstKind = guardBonusConflict(Math.random() < 0.5 ? 'bug' : 'ad', logicalW + 24);
              const secondX = logicalW + 24 + g.speed * 0.78;
              const secondKind = guardBonusConflict('tracker', secondX);
              g.obstacles.push(createObstacle(firstKind, logicalW + 24));
              g.obstacles.push(createObstacle(secondKind, secondX));
            } else {
              // Double Hop combo
              const firstKind = guardBonusConflict('bug', logicalW + 24);
              const secondX = logicalW + 24 + g.speed * 0.72;
              const secondKind = guardBonusConflict(Math.random() < 0.5 ? 'bug' : 'ad', secondX);
              g.obstacles.push(createObstacle(firstKind, logicalW + 24));
              g.obstacles.push(createObstacle(secondKind, secondX));
            }
            g.spawnTimer = minGap + 0.78 + Math.random() * (0.55 - speedRatio * 0.18);
          } else {
            const canFly = totalScore >= 90;
            const roll = Math.random();
            let kind: ObstacleKind = 'ad';
            if (canFly && roll < 0.24) kind = 'tracker';
            else if (roll < 0.5) kind = 'ad';
            else if (roll < 0.76) kind = 'cookie';
            else kind = 'bug';

            const resolvedKind = guardBonusConflict(kind, logicalW + 24);
            g.obstacles.push(createObstacle(resolvedKind, logicalW + 24));
            g.spawnTimer = minGap + Math.random() * (0.6 - speedRatio * 0.2);
          }
        }

        // Spawn Reformation cartoon bonus collectibles (chunky silhouettes, slightly slower drift)
        g.bonusTimer -= dt;
        if (g.bonusTimer <= 0) {
          const spawnX = logicalW + 40;
          const tBonus = (spawnX - playerCenterX) / (g.speed * 0.75);
          const hasConflict = g.obstacles.some(
            (ob) => Math.abs((ob.x + ob.w / 2 - playerCenterX) / g.speed - tBonus) < 0.45
          );
          if (hasConflict) {
            g.bonusTimer = 0.55;
          } else {
            const kind = BONUS_KINDS[Math.floor(Math.random() * BONUS_KINDS.length)];
            g.bonuses.push({
              kind,
              x: spawnX,
              y: GROUND_Y - 84 - Math.random() * 34,
              r: 19,
              collected: false,
              phase: Math.random() * 6,
            });
            g.bonusTimer = 3.2 + Math.random() * 2.8;
          }
        }

        // Update obstacles & forgiving hitbox collision
        const curH = g.ducking && g.playerY >= GROUND_Y - 1 ? PLAYER_DUCK_H : PLAYER_H;
        const pLeft = PLAYER_X + 8;
        const pRight = PLAYER_X + PLAYER_W - 8;
        const pTop = g.playerY - curH + 8;
        const pBottom = g.playerY - 4;

        for (const ob of g.obstacles) {
          ob.x -= g.speed * dt;
          const oLeft = ob.x + 5;
          const oRight = ob.x + ob.w - 5;
          const oTop = ob.y + 5;
          const oBottom = ob.y + ob.h - 4;

          if (pRight > oLeft && pLeft < oRight && pBottom > oTop && pTop < oBottom) {
            g.status = 'gameover';
            g.shakeTime = 0.28;
            g.gameOverLock = 0.45;
            playSynth(audioCtxRef, mutedRef.current, 'bonk');
            spawnDust(PLAYER_X + PLAYER_W / 2, g.playerY - 24, 16, ['#EF4444', '#EA7824', '#2857A4']);

            const finalScore = Math.floor(g.distance) + g.bonusPoints;
            setScore(finalScore);
            if (finalScore > g.highScore) {
              g.highScore = finalScore;
              setHighScore(finalScore);
              try {
                localStorage.setItem(HI_SCORE_KEY, String(finalScore));
              } catch {
                // ignore storage errors
              }
            }
            const pool = QUIPS[ob.kind];
            setQuip(pool[Math.floor(Math.random() * pool.length)]);
            setStatus('gameover');
            break;
          }
        }
        g.obstacles = g.obstacles.filter((o) => o.x + o.w > -40);

        // Update bonuses (drift at 0.75 * speed so players can read and line them up)
        for (const b of g.bonuses) {
          b.x -= g.speed * 0.75 * dt;
          if (!b.collected) {
            const dx = PLAYER_X + PLAYER_W / 2 - b.x;
            const dy = g.playerY - curH / 2 - b.y;
            if (dx * dx + dy * dy < (b.r + 22) * (b.r + 22)) {
              b.collected = true;
              g.bonusStreak += 1;
              const pts = 50 + Math.min(g.bonusStreak - 1, 4) * 10;
              g.bonusPoints += pts;
              const meta = BONUS_META[b.kind];
              const label =
                meta.popup.replace('+50', `+${pts}`) +
                (g.bonusStreak >= 2 ? ` ${g.bonusStreak}x!` : '');
              playSynth(audioCtxRef, mutedRef.current, 'bonus', g.bonusStreak);
              spawnDust(b.x, b.y, 12, ['#FBBF24', '#EA7824', '#2857A4']);
              g.floatingTexts.push({
                x: Math.max(95, Math.min(logicalW - 95, b.x)),
                y: b.y - 12,
                text: label,
                life: 1.05,
                color: meta.color,
              });
            }
          }
        }
        if (g.bonuses.some((b) => !b.collected && b.x <= -30)) {
          g.bonusStreak = 0;
        }
        g.bonuses = g.bonuses.filter((b) => !b.collected && b.x > -30);
      }

      // Particles & floating texts update even after gameover for juicy finish
      for (const p of g.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 450 * dt;
        p.life -= dt;
      }
      g.particles = g.particles.filter((p) => p.life > 0);

      for (const ft of g.floatingTexts) {
        ft.y -= 36 * dt;
        ft.life -= dt;
      }
      g.floatingTexts = g.floatingTexts.filter((ft) => ft.life > 0);

      // --- DRAW ---
      ctx.save();
      const scale = (cssH / LOGICAL_H) * dpr;
      ctx.scale(scale, scale);

      if (g.shakeTime > 0) {
        const mag = g.shakeTime * 18;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
      if (isDark) {
        sky.addColorStop(0, '#171E2C');
        sky.addColorStop(1, '#222A3A');
      } else {
        sky.addColorStop(0, '#EFF6FF');
        sky.addColorStop(1, '#FAF9F6');
      }
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, logicalW, LOGICAL_H);

      // Subtle stars in dark mode or warm sun in light mode
      if (isDark) {
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        const stars = [
          [0.08, 34], [0.22, 52], [0.36, 26], [0.55, 44], [0.72, 28], [0.86, 56], [0.94, 30],
        ];
        for (const [fx, sy] of stars) {
          ctx.beginPath();
          ctx.arc(fx * logicalW, sy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const sunX = logicalW - 75;
        ctx.fillStyle = 'rgba(234, 120, 36, 0.16)';
        ctx.beginPath();
        ctx.arc(sunX, 48, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(234, 120, 36, 0.35)';
        ctx.beginPath();
        ctx.arc(sunX, 48, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft clouds
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)';
      for (const c of g.clouds) {
        drawRoundedRect(ctx, c.x, c.y, c.w, 16, 8);
        ctx.fill();
        drawRoundedRect(ctx, c.x + 12, c.y - 8, c.w * 0.55, 14, 7);
        ctx.fill();
      }

      // Distant subtle hills spanning logicalW
      ctx.fillStyle = isDark ? 'rgba(40, 87, 164, 0.14)' : 'rgba(40, 87, 164, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.quadraticCurveTo(logicalW * 0.21, GROUND_Y - 38, logicalW * 0.42, GROUND_Y);
      ctx.quadraticCurveTo(logicalW * 0.65, GROUND_Y - 48, logicalW * 0.88, GROUND_Y);
      ctx.quadraticCurveTo(logicalW * 0.96, GROUND_Y - 22, logicalW, GROUND_Y);
      ctx.lineTo(logicalW, GROUND_Y);
      ctx.closePath();
      ctx.fill();

      // Track ground fill & horizon line
      ctx.fillStyle = isDark ? '#1B2230' : '#EFECE4';
      ctx.fillRect(0, GROUND_Y, logicalW, LOGICAL_H - GROUND_Y);

      ctx.strokeStyle = isDark ? '#3B4861' : '#CBD5E1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(logicalW, GROUND_Y);
      ctx.stroke();

      // Scrolling track dashes / pebbles
      ctx.fillStyle = isDark ? '#334155' : '#CBD5E1';
      for (let x = Math.round(-g.groundOffset); x < logicalW + 48; x += 48) {
        ctx.fillRect(x, GROUND_Y + 12, 16, 3);
        ctx.fillRect(x + 26, GROUND_Y + 24, 8, 2.5);
      }

      // Draw Reformation cartoon collectibles
      for (const b of g.bonuses) {
        drawReformationBonus(ctx, b, now, isDark);
      }

      // Draw obstacles
      for (const ob of g.obstacles) {
        drawObstacle(ctx, ob, now, isDark);
      }

      // Draw Tulip hero
      drawTulipHero(
        ctx,
        PLAYER_X,
        g.playerY,
        g.ducking,
        g.playerY < GROUND_Y - 1,
        g.status === 'gameover',
        g.stridePhase,
        isDark
      );

      // Draw particles
      for (const p of g.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Floating texts
      for (const ft of g.floatingTexts) {
        ctx.globalAlpha = Math.min(1, ft.life * 1.4);
        ctx.fillStyle = ft.color;
        ctx.font = '800 15px "Bricolage Grotesque", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.globalAlpha = 1;

      ctx.restore();
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const paddedScore = String(score).padStart(5, '0');
  const paddedHi = String(highScore).padStart(5, '0');

  return (
    <section
      id="tulip-run"
      className="py-10 sm:py-14 scroll-mt-20 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-[#19202D]/70"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-white dark:bg-[#242B35] border-2 border-slate-200/90 dark:border-slate-700/80 shadow-xl shadow-slate-900/5 dark:shadow-black/30 overflow-hidden">
          {/* Arcade Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700/70">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-500/15 text-[#EA7824]">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                  <span>Tulip Run</span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 text-[#2857A4] dark:text-sky-300">
                    Dodge the Bloatware
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Leap over pop-up ads, cookie banners &amp; bugs. Grab Calvin, Luther, Spurgeon
                  &amp; the 95 Theses for +50!
                </p>
              </div>
            </div>

            {/* Scoreboard + Mute */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161B26] font-mono text-xs sm:text-sm font-bold">
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  HI {paddedHi}
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-[#EA7824]">{paddedScore}</span>
              </div>

              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? 'Unmute game sounds' : 'Mute game sounds'}
                title={muted ? 'Unmute sounds' : 'Mute sounds'}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B212E] text-slate-600 dark:text-slate-300 hover:border-[#EA7824] transition-colors cursor-pointer"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Interactive Canvas Container */}
          <div data-tulip-perch="game" className="relative select-none touch-none">
            <canvas
              ref={canvasRef}
              tabIndex={0}
              onPointerDown={(e) => {
                pointerStartYRef.current = e.clientY;
                swipedDownRef.current = false;
                e.currentTarget.focus();
                triggerJumpPress();
              }}
              onPointerMove={(e) => {
                if (
                  pointerStartYRef.current !== null &&
                  !swipedDownRef.current &&
                  e.clientY - pointerStartYRef.current > 24
                ) {
                  swipedDownRef.current = true;
                  triggerJumpRelease();
                  setDucking(true);
                }
              }}
              onPointerUp={() => {
                pointerStartYRef.current = null;
                if (swipedDownRef.current) {
                  swipedDownRef.current = false;
                  setDucking(false);
                } else {
                  triggerJumpRelease();
                }
              }}
              onPointerCancel={() => {
                pointerStartYRef.current = null;
                if (swipedDownRef.current) {
                  swipedDownRef.current = false;
                  setDucking(false);
                } else {
                  triggerJumpRelease();
                }
              }}
              aria-label="Tulip Run mini-game canvas. Click or press Space to jump."
              className="block w-full h-[210px] sm:h-[250px] md:h-[260px] cursor-pointer focus:outline-none"
            />

            {/* Idle Overlay */}
            {status === 'idle' && (
              <div
                onClick={() => {
                  canvasRef.current?.focus();
                  resetAndStart();
                }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/10 dark:bg-slate-950/25 backdrop-blur-[1px] cursor-pointer px-4 text-center"
              >
                <div className="px-6 py-4 rounded-2xl bg-white/95 dark:bg-[#1B212E]/95 border-2 border-[#EA7824]/60 shadow-xl space-y-2 max-w-sm">
                  <div className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                    🌷 Tap or Press Space to Run!
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Jump over <strong>ADs</strong>, <strong>Cookie Banners</strong> &amp;{' '}
                    <strong>Bugs</strong> — duck under flying <strong>Trackers</strong>!
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#EA7824] text-white shadow-sm">
                    Play Now
                  </span>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {status === 'gameover' && (
              <div
                onClick={() => {
                  if (gameRef.current.gameOverLock > 0) return;
                  canvasRef.current?.focus();
                  resetAndStart();
                }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/35 backdrop-blur-[2px] cursor-pointer px-4 text-center"
              >
                <div className="px-6 py-4 rounded-2xl bg-white/95 dark:bg-[#1B212E]/95 border-2 border-slate-200 dark:border-slate-700 shadow-2xl space-y-2 max-w-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#EA7824]">
                    {getRank(score)}
                  </div>
                  <div className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                    {quip || 'Bonked!'}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Score: <strong className="font-mono text-slate-900 dark:text-white">{score}</strong>{' '}
                    · Best: <strong className="font-mono text-[#EA7824]">{highScore}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (gameRef.current.gameOverLock > 0) return;
                      canvasRef.current?.focus();
                      resetAndStart();
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold bg-[#EA7824] hover:bg-[#D46515] text-white shadow-md cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Run Again (Space / Tap)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Hint + Mobile Jump/Duck Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3 bg-slate-50/90 dark:bg-[#1B212E] border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="hidden sm:flex items-center gap-4 font-medium">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                  Space
                </kbd>{' '}
                or{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                  ↑
                </kbd>{' '}
                Jump
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                  ↓
                </kbd>{' '}
                Duck / Fast-fall
              </span>
            </div>

            {/* Tactile buttons great for phones & mouse users */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                onPointerDown={triggerJumpPress}
                onPointerUp={triggerJumpRelease}
                onPointerCancel={triggerJumpRelease}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-[#2857A4] hover:bg-[#1E4483] text-white active:scale-95 transition-transform cursor-pointer select-none touch-none"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Jump</span>
              </button>
              <button
                type="button"
                onPointerDown={() => setDucking(true)}
                onPointerUp={() => setDucking(false)}
                onPointerLeave={() => setDucking(false)}
                onPointerCancel={() => setDucking(false)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 active:scale-95 transition-transform cursor-pointer select-none touch-none"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Duck</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
