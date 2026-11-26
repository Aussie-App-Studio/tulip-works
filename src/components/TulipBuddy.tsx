import { useEffect, useRef, useState } from 'react';
import {
  BabyBuddyView,
  CarriedTulipSvg,
  FlyingSeedItem,
  GIANT_LEAF_OFFSET_X,
  GIANT_LEAF_OFFSET_Y,
  GiantTulipLandmark,
  HatchingSproutItem,
  PlantedTulipItem,
  TulipWindmillLandmark,
  getVariantSailColor,
  pickTulipVariant,
  type BuddyExpression,
  type FlyingSeed,
  type GiantTulipState,
  type HatchingSprout,
  type PlantedTulip,
  type TulipVariant,
  type WindmillState,
} from './TulipGardenArt';

type BuddyMode =
  | 'perched'
  | 'jumping'
  | 'in-game'
  | 'tossing'
  | 'planting'
  | 'ee-baby'
  | 'ee-giant'
  | 'ee-windmill';

interface Spark {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

interface ActiveSeedTrajectory {
  id: number;
  el: HTMLElement;
  relX: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  t: number;
  duration: number;
  arcHeight: number;
  variant: TulipVariant;
  scale: number;
  isGolden?: boolean;
}

interface BabyState {
  active: boolean;
  mode: 'perched' | 'jumping' | 'in-game';
  currentEl: HTMLElement | null;
  pendingEl: HTMLElement | null;
  landingIntoGame: boolean;
  x: number;
  y: number;
  facing: 1 | -1;
  walkTargetX: number;
  walkPause: number;
  stride: number;
  jumpStartX: number;
  jumpStartY: number;
  jumpEndX: number;
  jumpEndY: number;
  jumpT: number;
  jumpDuration: number;
  jumpArcHeight: number;
  squashTimer: number;
  followDelay: number;
  plantTimer: number;
}

const BUDDY_W = 42;
const BUDDY_H = 54;
const BABY_W = 26;
const BABY_H = 34;

const MAX_TULIPS_GLOBAL = 120;
const WINDMILL_TOTAL_TULIPS = 7;

function getPerCardTulipCap(cardWidth: number): number {
  return Math.max(7, Math.min(28, Math.floor((cardWidth - 36) / 24)));
}

/**
 * Friendly little Tulip Works buddy that lives on top of cards across the page!
 * - Strolls unpredictably along the top edge of whichever card he's perched on
 * - Drops/leaps from card to card as you scroll down (or up!)
 * - Periodically (and occasionally when clicked) tosses or hand-plants tiny tulip seeds
 *   that sprout and stay anchored to their cards for the session
 * - Rewards curious visitors with 3 progressive organic easter eggs:
 *   1) A glowing sprout awakens into a miniature Baby Tulip Buddy
 *   2) A golden bulb shoots up into a towering Giant Tulip he climbs onto
 *   3) He gathers petals to build a spinning Dutch Tulip Works Windmill
 */
export function TulipBuddy() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [facing, setFacing] = useState<1 | -1>(1);
  const [mode, setMode] = useState<BuddyMode>('perched');
  const [walking, setWalking] = useState(false);
  const [stepPhase, setStepPhase] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const [expression, setExpression] = useState<BuddyExpression>('normal');
  const [leafTilt, setLeafTilt] = useState(0);
  const [carryingTulip, setCarryingTulip] = useState<TulipVariant | null>(null);
  const [squash, setSquash] = useState({ sx: 1, sy: 1, rot: 0 });
  const [visible, setVisible] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [speech, setSpeech] = useState<string | null>(null);

  // Garden & Easter Egg visual state
  const [tulips, setTulips] = useState<PlantedTulip[]>([]);
  const [flyingSeeds, setFlyingSeeds] = useState<FlyingSeed[]>([]);
  const [hatchingSprout, setHatchingSprout] = useState<HatchingSprout | null>(null);
  const [giantTulip, setGiantTulip] = useState<GiantTulipState | null>(null);
  const [windmill, setWindmill] = useState<WindmillState | null>(null);

  // Baby Buddy visual state
  const [babyVisible, setBabyVisible] = useState(false);
  const [babyPos, setBabyPos] = useState({ x: -200, y: -200 });
  const [babyFacing, setBabyFacing] = useState<1 | -1>(1);
  const [babyWalking, setBabyWalking] = useState(false);
  const [babyJumping, setBabyJumping] = useState(false);
  const [babyInGame, setBabyInGame] = useState(false);
  const [babyStepPhase, setBabyStepPhase] = useState(0);
  const [babySquash, setBabySquash] = useState({ sx: 1, sy: 1, rot: 0 });
  const [babySpeech, setBabySpeech] = useState<string | null>(null);

  const timersRef = useRef<number[]>([]);

  const stateRef = useRef({
    mode: 'perched' as BuddyMode,
    currentEl: null as HTMLElement | null,
    x: 0,
    y: 0,
    facing: 1 as 1 | -1,
    // Walking along current card top
    walkTargetX: 0,
    walkPause: 0.9,
    stride: 0,
    // Parabolic jump / drop arc
    jumpStartX: 0,
    jumpStartY: 0,
    jumpEndX: 0,
    jumpEndY: 0,
    jumpT: 0,
    jumpDuration: 0.65,
    jumpArcHeight: 65,
    pendingEl: null as HTMLElement | null,
    landingIntoGame: false,
    // Landing squash decay
    squashTimer: 0,
    initialized: false,
    sparkSeq: 1,
    // Planting & interaction tracking
    speechTimer: 0,
    babySpeechTimer: 0,
    actionTimer: 0,
    actionDuration: 0,
    actionPhase: 0,
    actionWithSpeech: false,
    tossSeedCount: 1,
    plantSpotRelX: 0,
    plantStartX: 0,
    plantBackX: 0,
    // Easter egg state
    pokeCount: 0,
    pokesSinceLastPlant: 0,
    unlocked: {
      baby: false,
      giant: false,
      windmill: false,
    },
    eeSpotRelX: 0,
    eeSpotX: 0,
    eeSpotY: 0,
    eeBackX: 0,
    windmillBuild: {
      phase: 'idea' as
        | 'idea'
        | 'seed-prep'
        | 'to-tulip'
        | 'jump-to-tulip'
        | 'pluck'
        | 'to-site'
        | 'jump-to-site'
        | 'place'
        | 'to-admire'
        | 'celebrate',
      windmillEl: null as HTMLElement | null,
      timer: 0,
      stagesBuilt: 0,
      targetTulipId: null as number | null,
      targetEl: null as HTMLElement | null,
      jumpStartX: 0,
      jumpStartY: 0,
      jumpEndX: 0,
      jumpEndY: 0,
      jumpDuration: 0.45,
      harvestedVariants: [] as TulipVariant[],
      needsSeeds: 0,
      seedsTossed: false,
      plucked: false,
      placed: false,
      celebrated: false,
    },
    // Garden refs
    tulipSeq: 1,
    seedSeq: 1,
    tulips: [] as PlantedTulip[],
    seeds: [] as ActiveSeedTrajectory[],
    giantTulip: null as GiantTulipState | null,
    windmill: null as WindmillState | null,
    // Baby Buddy ref state
    baby: {
      active: false,
      mode: 'perched',
      currentEl: null,
      pendingEl: null,
      landingIntoGame: false,
      x: 0,
      y: 0,
      facing: 1,
      walkTargetX: 0,
      walkPause: 0.8,
      stride: 0,
      jumpStartX: 0,
      jumpStartY: 0,
      jumpEndX: 0,
      jumpEndY: 0,
      jumpT: 0,
      jumpDuration: 0.55,
      jumpArcHeight: 58,
      squashTimer: 0,
      followDelay: 0,
      plantTimer: 16,
    } as BabyState,
    // Callbacks wired inside main effect
    syncGardenLayout: () => {},
    recheckViewport: () => {},
  });

  const scheduleTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  const showSpeech = (text: string, durationMs = 1000) => {
    const s = stateRef.current;
    if (s.speechTimer) {
      window.clearTimeout(s.speechTimer);
    }
    setSpeech(text);
    s.speechTimer = window.setTimeout(() => {
      setSpeech(null);
      s.speechTimer = 0;
    }, durationMs);
  };

  const showBabySpeech = (text: string, durationMs = 950) => {
    const s = stateRef.current;
    if (s.babySpeechTimer) {
      window.clearTimeout(s.babySpeechTimer);
    }
    setBabySpeech(text);
    s.babySpeechTimer = window.setTimeout(() => {
      setBabySpeech(null);
      s.babySpeechTimer = 0;
    }, durationMs);
  };

  const emitSparks = (x: number, y: number, count = 6, customColors?: string[]) => {
    const colors = customColors || ['#EA7824', '#2857A4', '#FBBF24', '#6AA2FF'];
    const batch: Spark[] = [];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * (0.12 + Math.random() * 0.76);
      const dist = 16 + Math.random() * 26;
      batch.push({
        id: stateRef.current.sparkSeq++,
        x,
        y,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 8,
        color: colors[i % colors.length],
      });
    }
    setSparks((prev) => [...prev.slice(-16), ...batch]);
    scheduleTimer(() => {
      const ids = new Set(batch.map((b) => b.id));
      setSparks((prev) => prev.filter((p) => !ids.has(p.id)));
    }, 520);
  };

  const getDocRect = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return {
      left: r.left + window.scrollX,
      right: r.right + window.scrollX,
      top: r.top + window.scrollY,
      bottom: r.bottom + window.scrollY,
      width: r.width,
      height: r.height,
      viewTop: r.top,
      viewBottom: r.bottom,
    };
  };

  const pickOpenRelX = (el: HTMLElement, preferredRelX?: number, minGap = 18): number => {
    const s = stateRef.current;
    const r = getDocRect(el);
    const pad = 24;
    const minRel = pad;
    const maxRel = Math.max(minRel, r.width - pad);

    const occupied: Array<{ relX: number; gap: number }> = [];
    for (const t of s.tulips) {
      if (t.el === el && !t.fading) {
        occupied.push({ relX: t.relX, gap: minGap });
      }
    }
    if (s.giantTulip && s.giantTulip.el === el) {
      occupied.push({ relX: s.giantTulip.relX, gap: 36 });
    }
    if (s.windmill && s.windmill.el === el) {
      occupied.push({ relX: s.windmill.relX, gap: 32 });
    }

    const candidates: number[] = [];
    if (preferredRelX !== undefined) {
      candidates.push(Math.min(maxRel, Math.max(minRel, preferredRelX)));
    }
    for (let i = 0; i < 10; i++) {
      candidates.push(minRel + Math.random() * (maxRel - minRel));
    }

    let bestRel = candidates[0];
    let bestClearance = -1;
    for (const cand of candidates) {
      let minDist = Infinity;
      for (const occ of occupied) {
        const d = Math.abs(cand - occ.relX) - occ.gap;
        if (d < minDist) minDist = d;
      }
      if (minDist >= 0) {
        return cand;
      }
      if (minDist > bestClearance) {
        bestClearance = minDist;
        bestRel = cand;
      }
    }
    return bestRel;
  };

  const fadeOutTulips = (idsToFade: Set<number>) => {
    const s = stateRef.current;
    if (idsToFade.size === 0) return;
    s.tulips = s.tulips.map((t) => (idsToFade.has(t.id) ? { ...t, fading: true } : t));
    setTulips([...s.tulips]);
    scheduleTimer(() => {
      stateRef.current.tulips = stateRef.current.tulips.filter((t) => !idsToFade.has(t.id));
      setTulips([...stateRef.current.tulips]);
    }, 750);
  };

  const spawnPlantedTulip = (
    el: HTMLElement,
    relX: number,
    variant: TulipVariant,
    scale?: number
  ) => {
    if (!document.body.contains(el)) return;
    const s = stateRef.current;
    const r = getDocRect(el);
    const clampedRel = Math.min(Math.max(18, relX), Math.max(18, r.width - 18));
    const tulipScale = scale ?? 0.78 + Math.random() * 0.28;

    const newTulip: PlantedTulip = {
      id: s.tulipSeq++,
      el,
      relX: clampedRel,
      x: r.left + clampedRel,
      y: r.top + 3,
      variant,
      scale: tulipScale,
      tilt: (Math.random() - 0.5) * 9,
      swayDelay: -(Math.random() * 3.5),
      visible: r.width > 90 && r.height > 40,
    };

    s.tulips = [...s.tulips, newTulip];

    // Enforce gentle width-aware per-card and global session caps (temporarily relaxed during windmill harvest prep)
    const baseCardCap = getPerCardTulipCap(r.width);
    const perCardCap = s.mode === 'ee-windmill' ? Math.max(baseCardCap, 10) : baseCardCap;
    const globalCap = s.mode === 'ee-windmill' ? MAX_TULIPS_GLOBAL + 8 : MAX_TULIPS_GLOBAL;

    const fadeIds = new Set<number>();
    const onThisCard = s.tulips.filter((t) => t.el === el && !t.fading);
    if (onThisCard.length > perCardCap) {
      const overflow = onThisCard.length - perCardCap;
      for (let i = 0; i < overflow; i++) {
        fadeIds.add(onThisCard[i].id);
      }
    }
    const activeGlobal = s.tulips.filter((t) => !t.fading && !fadeIds.has(t.id));
    if (activeGlobal.length > globalCap) {
      const overflow = activeGlobal.length - globalCap;
      for (let i = 0; i < overflow; i++) {
        fadeIds.add(activeGlobal[i].id);
      }
    }

    setTulips([...s.tulips]);
    if (fadeIds.size > 0) {
      fadeOutTulips(fadeIds);
    }
  };

  const launchSeeds = (
    el: HTMLElement,
    count: number,
    originX: number,
    originY: number,
    facingDir: 1 | -1,
    preferAccent = false
  ) => {
    const s = stateRef.current;
    const r = getDocRect(el);
    const buddyRelX = originX - r.left;

    for (let i = 0; i < count; i++) {
      const spread = (18 + i * 24 + Math.random() * 24) * facingDir;
      const targetRelX = pickOpenRelX(el, buddyRelX + spread, 18);
      const endX = r.left + targetRelX;
      const endY = r.top + 3;

      s.seeds.push({
        id: s.seedSeq++,
        el,
        relX: targetRelX,
        startX: originX,
        startY: originY,
        endX,
        endY,
        t: -i * 0.08, // slight stagger when tossing multiple seeds
        duration: 0.44 + Math.random() * 0.14,
        arcHeight: 28 + Math.random() * 22,
        variant: pickTulipVariant(preferAccent),
        scale: 0.78 + Math.random() * 0.26,
      });
    }
  };

  const startSeedToss = (el: HTMLElement, seedCount: number, withSpeech: boolean) => {
    const s = stateRef.current;
    const r = getDocRect(el);
    const relX = s.x - r.left;
    // Face inward if near either edge of the card
    if (relX < 46) {
      s.facing = 1;
      setFacing(1);
    } else if (relX > r.width - 46 - BUDDY_W) {
      s.facing = -1;
      setFacing(-1);
    }

    s.mode = 'tossing';
    s.actionTimer = 0;
    s.actionDuration = 0.68;
    s.actionPhase = 0;
    s.tossSeedCount = seedCount;
    s.actionWithSpeech = withSpeech;
    setMode('tossing');
    setWalking(false);
  };

  const startHandPlant = (el: HTMLElement, withSpeech: boolean) => {
    const s = stateRef.current;
    const r = getDocRect(el);
    const relCenter = s.x + BUDDY_W / 2 - r.left;

    if (relCenter < 52) {
      s.facing = 1;
      setFacing(1);
    } else if (relCenter > r.width - 52) {
      s.facing = -1;
      setFacing(-1);
    }

    const desiredRel = relCenter + s.facing * 20;
    s.plantSpotRelX = pickOpenRelX(el, desiredRel, 16);
    s.plantStartX = s.x;
    // Step back slightly on the opposite side of the planted spot
    s.plantBackX = Math.min(
      Math.max(r.left + 20, s.x - s.facing * 16),
      Math.max(r.left + 20, r.right - 20 - BUDDY_W)
    );

    s.mode = 'planting';
    s.actionTimer = 0;
    s.actionDuration = 1.6;
    s.actionPhase = 0;
    s.actionWithSpeech = withSpeech;
    setMode('planting');
    setWalking(false);
  };

  const startEasterEggBaby = (el: HTMLElement) => {
    const s = stateRef.current;
    const r = getDocRect(el);
    const relCenter = s.x + BUDDY_W / 2 - r.left;

    if (relCenter < 64) {
      s.facing = 1;
      setFacing(1);
    } else if (relCenter > r.width - 64) {
      s.facing = -1;
      setFacing(-1);
    }

    const spotRel = pickOpenRelX(el, relCenter + s.facing * 24, 20);
    s.eeSpotRelX = spotRel;
    s.eeSpotX = r.left + spotRel;
    s.eeSpotY = r.top + 3;
    s.plantStartX = s.x;
    s.eeBackX = Math.min(
      Math.max(r.left + 20, s.x - s.facing * 24),
      Math.max(r.left + 20, r.right - 20 - BUDDY_W)
    );

    s.unlocked.baby = true;
    s.mode = 'ee-baby';
    s.actionTimer = 0;
    s.actionDuration = 3.55;
    s.actionPhase = 0;
    setMode('ee-baby');
    setWalking(false);
    showSpeech('glowing seed! ✨', 1200);
  };

  const startEasterEggGiant = (el: HTMLElement) => {
    const s = stateRef.current;
    const r = getDocRect(el);
    const preferredRel = Math.min(Math.max(70, s.x + BUDDY_W / 2 - r.left + 26), Math.max(70, r.width - 68));
    let spotRel = preferredRel;
    if (s.windmill && s.windmill.el === el && Math.abs(spotRel - s.windmill.relX) < 76) {
      spotRel = s.windmill.relX > r.width / 2 ? Math.max(64, s.windmill.relX - 84) : Math.min(r.width - 64, s.windmill.relX + 84);
    }
    spotRel = Math.min(Math.max(58, spotRel), Math.max(58, r.width - 58));

    s.eeSpotRelX = spotRel;
    s.eeSpotX = r.left + spotRel;
    s.eeSpotY = r.top + 3;
    s.plantStartX = s.x;

    // Decide whether Buddy stands to the left or right to watch
    const standLeft = spotRel > 80;
    s.facing = standLeft ? 1 : -1;
    setFacing(s.facing);
    s.eeBackX = standLeft
      ? Math.max(r.left + 18, s.eeSpotX - BUDDY_W - 22)
      : Math.min(r.right - 18 - BUDDY_W, s.eeSpotX + 24);

    s.unlocked.giant = true;
    s.mode = 'ee-giant';
    s.actionTimer = 0;
    s.actionDuration = 7.45;
    s.actionPhase = 0;
    setMode('ee-giant');
    setWalking(false);
    showSpeech('special bulb! ✨', 1200);
  };

  const startEasterEggWindmill = (el: HTMLElement) => {
    const s = stateRef.current;
    const r = getDocRect(el);
    let spotRel = Math.min(Math.max(56, r.width * 0.56), Math.max(56, r.width - 56));
    if (s.giantTulip && s.giantTulip.el === el && Math.abs(spotRel - s.giantTulip.relX) < 78) {
      spotRel =
        s.giantTulip.relX > r.width / 2
          ? Math.max(54, s.giantTulip.relX - 88)
          : Math.min(r.width - 54, s.giantTulip.relX + 88);
    }
    spotRel = Math.min(Math.max(52, spotRel), Math.max(52, r.width - 52));

    s.eeSpotRelX = spotRel;
    s.eeSpotX = r.left + spotRel;
    s.eeSpotY = r.top + 3;
    s.eeBackX =
      spotRel > 88
        ? Math.max(r.left + 20, s.eeSpotX - BUDDY_W - 28)
        : Math.min(r.right - 20 - BUDDY_W, s.eeSpotX + 28);

    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    const visibleHarvestCount = s.tulips.filter((t) => {
      if (t.fading || !document.body.contains(t.el) || t.el.dataset.tulipPerch === 'game') {
        return false;
      }
      if (t.el === el) return true;
      const tr = t.el.getBoundingClientRect();
      return tr.width > 90 && tr.top > 60 && tr.top < vh - 30;
    }).length;

    s.windmillBuild = {
      phase: 'idea',
      windmillEl: el,
      timer: 0,
      stagesBuilt: 0,
      targetTulipId: null,
      targetEl: null,
      jumpStartX: s.x,
      jumpStartY: s.y,
      jumpEndX: s.x,
      jumpEndY: s.y,
      jumpDuration: 0.45,
      harvestedVariants: [],
      needsSeeds: Math.max(0, WINDMILL_TOTAL_TULIPS - visibleHarvestCount),
      seedsTossed: false,
      plucked: false,
      placed: false,
      celebrated: false,
    };

    s.unlocked.windmill = true;
    s.mode = 'ee-windmill';
    s.actionTimer = 0;
    s.actionDuration = 0;
    s.actionPhase = 0;
    setMode('ee-windmill');
    setWalking(false);
    setCarryingTulip(null);
    showSpeech('💡 windmill!', 950);
  };

  // Occasional cute eye blink
  useEffect(() => {
    let timer = 0;
    const scheduleBlink = () => {
      timer = window.setTimeout(() => {
        setBlinking(true);
        window.setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 140);
      }, 2400 + Math.random() * 3200);
    };
    scheduleBlink();
    return () => window.clearTimeout(timer);
  }, []);

  // Cleanup active speech/fade timers on unmount
  useEffect(() => {
    return () => {
      for (const id of timersRef.current) {
        window.clearTimeout(id);
      }
      if (stateRef.current.speechTimer) {
        window.clearTimeout(stateRef.current.speechTimer);
      }
      if (stateRef.current.babySpeechTimer) {
        window.clearTimeout(stateRef.current.babySpeechTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const getPerches = (): HTMLElement[] =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-tulip-perch]')).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 90 && r.height > 40;
      });

    const pickTargetXOnCard = (rect: ReturnType<typeof getDocRect>, width = BUDDY_W) => {
      const pad = 28;
      const minX = rect.left + pad;
      const maxX = Math.max(minX, rect.right - pad - width);
      return minX + Math.random() * (maxX - minX);
    };

    const launchJumpTo = (targetEl: HTMLElement, intoGame: boolean) => {
      const s = stateRef.current;
      const r = getDocRect(targetEl);
      const endX = intoGame
        ? r.left + Math.min(110, r.width * 0.2)
        : pickTargetXOnCard(r, BUDDY_W);
      const endY = intoGame ? r.top + r.height * 0.72 - BUDDY_H : r.top - BUDDY_H + 5;

      s.jumpStartX = s.x;
      s.jumpStartY = s.y;
      s.jumpEndX = endX;
      s.jumpEndY = endY;
      s.jumpT = 0;

      const dist = Math.hypot(endX - s.x, endY - s.y);
      s.jumpDuration = Math.min(0.85, Math.max(0.45, dist / 620));
      s.jumpArcHeight = Math.min(115, Math.max(46, Math.abs(endX - s.x) * 0.16 + 48));
      s.pendingEl = targetEl;
      s.landingIntoGame = intoGame;
      s.mode = 'jumping';
      s.facing = endX >= s.x ? 1 : -1;

      setFacing(s.facing);
      setMode('jumping');
      setWalking(false);
      setExpression('normal');
      setLeafTilt(0);
      emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 4, 5);
    };

    const launchBabyJumpTo = (targetEl: HTMLElement, intoGame: boolean) => {
      const s = stateRef.current;
      const b = s.baby;
      const r = getDocRect(targetEl);
      let endX: number;
      if (intoGame) {
        endX = r.left + Math.min(84, r.width * 0.16);
      } else if (targetEl === s.currentEl) {
        const offset = s.x > r.left + r.width * 0.5 ? -34 : 34;
        endX = Math.min(
          Math.max(r.left + 20, s.x + offset),
          Math.max(r.left + 20, r.right - 20 - BABY_W)
        );
      } else {
        endX = pickTargetXOnCard(r, BABY_W);
      }
      const endY = intoGame ? r.top + r.height * 0.74 - BABY_H : r.top - BABY_H + 4;

      b.jumpStartX = b.x;
      b.jumpStartY = b.y;
      b.jumpEndX = endX;
      b.jumpEndY = endY;
      b.jumpT = 0;

      const dist = Math.hypot(endX - b.x, endY - b.y);
      b.jumpDuration = Math.min(0.75, Math.max(0.4, dist / 650));
      b.jumpArcHeight = Math.min(105, Math.max(42, Math.abs(endX - b.x) * 0.15 + 44));
      b.pendingEl = targetEl;
      b.landingIntoGame = intoGame;
      b.mode = 'jumping';
      b.facing = endX >= b.x ? 1 : -1;

      setBabyFacing(b.facing);
      setBabyJumping(true);
      setBabyWalking(false);
      setBabyInGame(false);
      emitSparks(b.x + BABY_W / 2, b.y + BABY_H - 2, 3);
    };

    const pickBestPerchForViewport = () => {
      const s = stateRef.current;
      const perches = getPerches();
      if (perches.length === 0) return;

      const vh = window.innerHeight;
      const gameEl = perches.find((el) => el.dataset.tulipPerch === 'game') || null;

      // Check if the Tulip Run game is squarely in the sweet spot of the screen!
      if (gameEl) {
        const gr = gameEl.getBoundingClientRect();
        const gameMid = (gr.top + gr.bottom) / 2;
        const gameInSweetSpot = gameMid > vh * 0.24 && gameMid < vh * 0.76;

        if (gameInSweetSpot) {
          if (s.mode !== 'in-game' && s.mode !== 'jumping') {
            launchJumpTo(gameEl, true);
          }
          return;
        }
      }

      // Filter candidate non-game cards whose top edge is nicely inside the viewport
      const candidates = perches.filter((el) => {
        if (el.dataset.tulipPerch === 'game') return false;
        const r = el.getBoundingClientRect();
        return r.top > 92 && r.top < vh * 0.84;
      });

      if (candidates.length === 0) return;

      // If currently perched on a card that is still comfortably visible, keep him there most of the time
      if (s.mode === 'perched' && s.currentEl && candidates.includes(s.currentEl)) {
        const cr = s.currentEl.getBoundingClientRect();
        if (cr.top > 125 && cr.top < vh * 0.74) {
          return;
        }
      }

      // If popping OUT of the game, start from inside the game canvas!
      if (s.mode === 'in-game' && gameEl) {
        const gr = getDocRect(gameEl);
        s.x = gr.left + Math.min(115, gr.width * 0.22);
        s.y = gr.top + gr.height * 0.65 - BUDDY_H;
      }

      // Prefer cards near the upper-middle of the viewport, with random unpredictable lateral choice!
      const scored = candidates
        .filter((el) => el !== s.currentEl)
        .map((el) => {
          const r = el.getBoundingClientRect();
          const distFromSweet = Math.abs(r.top - vh * 0.38);
          return { el, score: distFromSweet + Math.random() * 160 };
        })
        .sort((a, b) => a.score - b.score);

      const chosen = (scored[0] || { el: candidates[0] }).el;
      if (chosen && chosen !== s.currentEl) {
        launchJumpTo(chosen, false);
      }
    };

    const recheckViewportIfNeeded = () => {
      const s = stateRef.current;
      if (!s.currentEl || !document.body.contains(s.currentEl)) {
        pickBestPerchForViewport();
        return;
      }
      const cr = s.currentEl.getBoundingClientRect();
      const vh = window.innerHeight;
      if (cr.top < 75 || cr.top > vh * 0.88) {
        pickBestPerchForViewport();
      }
    };

    const syncGardenLayout = () => {
      const s = stateRef.current;
      const rectCache = new Map<HTMLElement, ReturnType<typeof getDocRect> | null>();
      const getCachedRect = (el: HTMLElement) => {
        if (!rectCache.has(el)) {
          if (!document.body.contains(el)) {
            rectCache.set(el, null);
          } else {
            const r = getDocRect(el);
            rectCache.set(el, r);
          }
        }
        return rectCache.get(el) ?? null;
      };

      let tulipsChanged = false;
      const nextTulips: PlantedTulip[] = [];
      for (const t of s.tulips) {
        const r = getCachedRect(t.el);
        if (!r) {
          tulipsChanged = true;
          continue;
        }
        const isVis = r.width > 90 && r.height > 40;
        const clampedRel = Math.min(Math.max(18, t.relX), Math.max(18, r.width - 18));
        const nx = r.left + clampedRel;
        const ny = r.top + 3;
        if (
          Math.abs(nx - t.x) > 0.5 ||
          Math.abs(ny - t.y) > 0.5 ||
          isVis !== t.visible
        ) {
          tulipsChanged = true;
          nextTulips.push({ ...t, x: nx, y: ny, visible: isVis });
        } else {
          nextTulips.push(t);
        }
      }
      if (tulipsChanged) {
        s.tulips = nextTulips;
        setTulips(nextTulips);
      }

      if (s.giantTulip) {
        const r = getCachedRect(s.giantTulip.el);
        if (!r) {
          s.giantTulip = null;
          setGiantTulip(null);
        } else {
          const isVis = r.width > 90 && r.height > 40;
          const clampedRel = Math.min(
            Math.max(52, s.giantTulip.relX),
            Math.max(52, r.width - 52)
          );
          const nx = r.left + clampedRel;
          const ny = r.top + 3;
          if (
            Math.abs(nx - s.giantTulip.x) > 0.5 ||
            Math.abs(ny - s.giantTulip.y) > 0.5 ||
            isVis !== s.giantTulip.visible
          ) {
            s.giantTulip = { ...s.giantTulip, x: nx, y: ny, visible: isVis };
            setGiantTulip(s.giantTulip);
          }
        }
      }

      if (s.windmill) {
        const r = getCachedRect(s.windmill.el);
        if (!r) {
          s.windmill = null;
          setWindmill(null);
        } else {
          const isVis = r.width > 90 && r.height > 40;
          const clampedRel = Math.min(
            Math.max(48, s.windmill.relX),
            Math.max(48, r.width - 48)
          );
          const nx = r.left + clampedRel;
          const ny = r.top + 3;
          if (
            Math.abs(nx - s.windmill.x) > 0.5 ||
            Math.abs(ny - s.windmill.y) > 0.5 ||
            isVis !== s.windmill.visible
          ) {
            s.windmill = { ...s.windmill, x: nx, y: ny, visible: isVis };
            setWindmill(s.windmill);
          }
        }
      }
    };

    stateRef.current.syncGardenLayout = syncGardenLayout;
    stateRef.current.recheckViewport = recheckViewportIfNeeded;

    // Initial spawn on Hero HQ card after layout settles
    const initTimer = window.setTimeout(() => {
      const heroEl =
        document.querySelector<HTMLElement>('[data-tulip-perch="hero"]') || getPerches()[0];
      if (!heroEl) return;
      const r = getDocRect(heroEl);
      const s = stateRef.current;
      s.currentEl = heroEl;
      s.x = r.left + r.width * 0.24;
      s.y = r.top - BUDDY_H + 5;
      s.walkTargetX = pickTargetXOnCard(r, BUDDY_W);
      s.walkPause = 0.7;
      s.mode = 'perched';
      s.initialized = true;
      setPos({ x: s.x, y: s.y });
      setVisible(true);
    }, 350);

    let scrollCheckTimer = 0;
    const onScroll = () => {
      if (!stateRef.current.initialized) return;
      window.clearTimeout(scrollCheckTimer);
      scrollCheckTimer = window.setTimeout(() => {
        const m = stateRef.current.mode;
        if (m === 'perched' || m === 'in-game') {
          pickBestPerchForViewport();
        }
        syncGardenLayout();
      }, 95);
    };

    const onResize = () => {
      const s = stateRef.current;
      if (s.mode === 'perched' && s.currentEl) {
        const r = getDocRect(s.currentEl);
        s.y = r.top - BUDDY_H + 5;
        s.x = Math.min(Math.max(s.x, r.left + 20), Math.max(r.left + 20, r.right - 20 - BUDDY_W));
      }
      if (s.baby.active && s.baby.mode === 'perched' && s.baby.currentEl) {
        const br = getDocRect(s.baby.currentEl);
        s.baby.y = br.top - BABY_H + 4;
        s.baby.x = Math.min(
          Math.max(s.baby.x, br.left + 16),
          Math.max(br.left + 16, br.right - 16 - BABY_W)
        );
      }
      syncGardenLayout();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    let rafId = 0;
    let last = performance.now();
    let randomHopTimer = 4.2 + Math.random() * 4.5;
    let autoPlantTimer = 9 + Math.random() * 6;
    let layoutSyncCooldown = 0.15;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;

      if (s.initialized) {
        // 1) Update flying seed projectiles
        if (s.seeds.length > 0) {
          const remaining: ActiveSeedTrajectory[] = [];
          const visualSeeds: FlyingSeed[] = [];

          for (const seed of s.seeds) {
            seed.t += dt / seed.duration;
            if (seed.t < 0) {
              remaining.push(seed);
              continue;
            }
            if (seed.t >= 1) {
              if (document.body.contains(seed.el)) {
                const sr = getDocRect(seed.el);
                const landX = sr.left + seed.relX;
                const landY = sr.top + 3;
                emitSparks(landX, landY, 4, ['#22C55E', '#EA7824', '#FBBF24']);
                spawnPlantedTulip(seed.el, seed.relX, seed.variant, seed.scale);
              }
              continue;
            }
            const t = seed.t;
            const curX = seed.startX + (seed.endX - seed.startX) * t;
            const baseY = seed.startY + (seed.endY - seed.startY) * t;
            const arc = 4 * t * (1 - t) * seed.arcHeight;
            const curY = baseY - arc;

            remaining.push(seed);
            visualSeeds.push({
              id: seed.id,
              x: curX,
              y: curY,
              rot: t * 320,
              isGolden: seed.isGolden,
            });
          }

          s.seeds = remaining;
          setFlyingSeeds(visualSeeds);
        }

        // 2) Periodic layout sync (so filter tabs/resizes keep card-anchored tulips crisp)
        layoutSyncCooldown -= dt;
        if (layoutSyncCooldown <= 0) {
          layoutSyncCooldown = 0.12;
          syncGardenLayout();
        }

        // 3) Main Buddy state machine
        if (s.mode === 'jumping') {
          s.jumpT = Math.min(1, s.jumpT + dt / s.jumpDuration);
          const t = s.jumpT;
          const easeX = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const curX = s.jumpStartX + (s.jumpEndX - s.jumpStartX) * easeX;
          const baseY = s.jumpStartY + (s.jumpEndY - s.jumpStartY) * t;
          const arc = 4 * t * (1 - t) * s.jumpArcHeight;
          const curY = baseY - arc;

          s.x = curX;
          s.y = curY;

          const rot = s.facing * (t < 0.5 ? -10 : 8) * Math.sin(t * Math.PI);
          setSquash({ sx: 0.92, sy: 1.1, rot });
          setPos({ x: curX, y: curY });

          if (t >= 1) {
            if (s.landingIntoGame) {
              s.mode = 'in-game';
              s.currentEl = s.pendingEl;
              s.pendingEl = null;
              setMode('in-game');
              emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 6, 8);
            } else {
              s.mode = 'perched';
              s.currentEl = s.pendingEl;
              s.pendingEl = null;
              s.squashTimer = 0.22;
              s.walkPause = 0.65 + Math.random() * 1.1;
              if (s.currentEl) {
                const r = getDocRect(s.currentEl);
                s.y = r.top - BUDDY_H + 5;
                s.walkTargetX = pickTargetXOnCard(r, BUDDY_W);
              }
              setMode('perched');
              emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 4, 6);
            }
          }
        } else if (
          ((s.mode === 'tossing' ||
            s.mode === 'planting' ||
            s.mode === 'ee-baby' ||
            s.mode === 'ee-giant') &&
            (!s.currentEl || !document.body.contains(s.currentEl))) ||
          (s.mode === 'ee-windmill' &&
            (!s.windmillBuild.windmillEl || !document.body.contains(s.windmillBuild.windmillEl)))
        ) {
          s.mode = 'perched';
          setMode('perched');
          setWalking(false);
          setExpression('normal');
          setLeafTilt(0);
          setCarryingTulip(null);
          setSquash({ sx: 1, sy: 1, rot: 0 });
          setHatchingSprout(null);
          pickBestPerchForViewport();
        } else if (s.mode === 'tossing' && s.currentEl) {
          const r = getDocRect(s.currentEl);
          s.y = r.top - BUDDY_H + 5;
          s.actionTimer += dt;
          const t = s.actionTimer;

          if (t < 0.28) {
            const p = t / 0.28;
            setSquash({ sx: 1 + 0.06 * p, sy: 1 - 0.08 * p, rot: -13 * p * s.facing });
            setLeafTilt(-24 * p);
          } else {
            if (s.actionPhase === 0) {
              s.actionPhase = 1;
              const originX = s.x + BUDDY_W / 2 + s.facing * 10;
              const originY = s.y + BUDDY_H * 0.52;
              launchSeeds(s.currentEl, s.tossSeedCount, originX, originY, s.facing, false);
              if (s.actionWithSpeech) {
                const lines = ['seeds! 🌱', 'grow!', 'sprout! ✨', 'bloom! 🌷'];
                showSpeech(lines[Math.floor(Math.random() * lines.length)], 1000);
              }
            }
            const p = Math.min(1, (t - 0.28) / 0.4);
            const decay = 1 - p;
            setSquash({ sx: 1 - 0.05 * decay, sy: 1 + 0.08 * decay, rot: 11 * decay * s.facing });
            setLeafTilt(18 * decay);
          }

          setPos({ x: s.x, y: s.y });

          if (t >= s.actionDuration) {
            s.mode = 'perched';
            s.walkPause = 0.9 + Math.random() * 1.1;
            setMode('perched');
            setLeafTilt(0);
            setSquash({ sx: 1, sy: 1, rot: 0 });
            recheckViewportIfNeeded();
          }
        } else if (s.mode === 'planting' && s.currentEl) {
          const r = getDocRect(s.currentEl);
          s.y = r.top - BUDDY_H + 5;
          s.actionTimer += dt;
          const t = s.actionTimer;
          const spotX = r.left + s.plantSpotRelX;
          const spotY = r.top + 3;

          if (t < 0.35) {
            const p = t / 0.35;
            setSquash({
              sx: 1 + 0.16 * p,
              sy: 1 - 0.22 * p,
              rot: 10 * p * s.facing,
            });
            setLeafTilt(10 * p);
            if (t >= 0.25 && s.actionPhase === 0) {
              s.actionPhase = 1;
              emitSparks(spotX, spotY, 4, ['#B45309', '#EA7824']);
            }
          } else if (t < 1.05) {
            const patT = (t - 0.35) / 0.7;
            const wave = Math.sin(patT * Math.PI * 6);
            setSquash({
              sx: 1.14 + wave * 0.04,
              sy: 0.78 - wave * 0.04,
              rot: (9 + wave * 4) * s.facing,
            });
            setLeafTilt(16 + wave * 18);

            if (s.actionPhase === 1 && patT > 0.2) {
              s.actionPhase = 2;
              emitSparks(spotX, spotY, 4, ['#FBBF24', '#EA7824']);
              if (s.actionWithSpeech) {
                const lines = ['pat pat 🌱', 'careful...', 'tuck! ✨'];
                showSpeech(lines[Math.floor(Math.random() * lines.length)], 1050);
              }
            } else if (s.actionPhase === 2 && patT > 0.7) {
              s.actionPhase = 3;
              emitSparks(spotX, spotY, 5, ['#22C55E', '#FBBF24']);
            }
          } else {
            const p = Math.min(1, (t - 1.05) / 0.55);
            const ease = 1 - Math.pow(1 - p, 2);
            s.x = s.plantStartX + (s.plantBackX - s.plantStartX) * ease;
            const hop = 4 * p * (1 - p) * 14;
            setPos({ x: s.x, y: s.y - hop });
            setSquash({ sx: 1, sy: 1 + Math.sin(p * Math.PI) * 0.08, rot: 0 });
            setLeafTilt(0);

            if (s.actionPhase < 4) {
              s.actionPhase = 4;
              setExpression('happy');
              spawnPlantedTulip(s.currentEl, s.plantSpotRelX, pickTulipVariant(true));
              emitSparks(spotX, spotY, 6, ['#22C55E', '#EA7824', '#FBBF24']);
            }
          }

          if (t < 1.05) {
            setPos({ x: s.x, y: s.y });
          }

          if (t >= s.actionDuration) {
            s.mode = 'perched';
            s.walkPause = 1.0 + Math.random() * 1.1;
            setMode('perched');
            setExpression('normal');
            setLeafTilt(0);
            setSquash({ sx: 1, sy: 1, rot: 0 });
            recheckViewportIfNeeded();
          }
        } else if (s.mode === 'ee-baby' && s.currentEl) {
          const r = getDocRect(s.currentEl);
          s.y = r.top - BUDDY_H + 5;
          s.eeSpotX = r.left + s.eeSpotRelX;
          s.eeSpotY = r.top + 3;
          s.actionTimer += dt;
          const t = s.actionTimer;

          if (t < 1.25) {
            // Careful crouch + patting glowing seed
            const p = Math.min(1, t / 0.3);
            const wave = t > 0.3 ? Math.sin(((t - 0.3) / 0.95) * Math.PI * 6) : 0;
            setSquash({
              sx: 1 + 0.15 * p + wave * 0.04,
              sy: 1 - 0.2 * p - wave * 0.04,
              rot: (10 * p + wave * 4) * s.facing,
            });
            setLeafTilt(14 + wave * 18);
            setPos({ x: s.x, y: s.y });
            if (s.actionPhase === 0 && t > 0.45) {
              s.actionPhase = 1;
              emitSparks(s.eeSpotX, s.eeSpotY, 7, ['#FBBF24', '#FEF08A', '#EA7824']);
            }
          } else if (t < 1.65) {
            // Step back and sprout appears
            if (s.actionPhase < 2) {
              s.actionPhase = 2;
              setHatchingSprout({ x: s.eeSpotX, y: s.eeSpotY, wobbling: false });
              emitSparks(s.eeSpotX, s.eeSpotY, 6, ['#FBBF24', '#22C55E']);
            }
            const p = (t - 1.25) / 0.4;
            const ease = 1 - Math.pow(1 - p, 2);
            s.x = s.plantStartX + (s.eeBackX - s.plantStartX) * ease;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 1, sy: 1, rot: 0 });
            setLeafTilt(0);
          } else if (t < 2.5) {
            // Sprout wobbles excitedly!
            if (s.actionPhase < 3) {
              s.actionPhase = 3;
              setHatchingSprout({ x: s.eeSpotX, y: s.eeSpotY, wobbling: true });
              setExpression('surprised');
              showSpeech('wait...?!', 950);
            }
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 0.97, sy: 1.05, rot: Math.sin(t * 20) * 3 });
          } else {
            // Baby Buddy pops out!!
            if (s.actionPhase < 4) {
              s.actionPhase = 4;
              setHatchingSprout(null);
              emitSparks(s.eeSpotX, s.eeSpotY - 12, 12, ['#EA7824', '#2857A4', '#FBBF24', '#6AA2FF']);
              setExpression('happy');
              showSpeech('a friend!! 🌷', 1500);

              const b = s.baby;
              b.active = true;
              b.currentEl = s.currentEl;
              b.x = s.eeSpotX - BABY_W / 2;
              b.y = r.top - BABY_H + 4;
              b.facing = s.x < b.x ? -1 : 1;
              b.jumpStartX = b.x;
              b.jumpStartY = b.y;
              b.jumpEndX = b.x;
              b.jumpEndY = b.y;
              b.jumpT = 0;
              b.jumpDuration = 0.48;
              b.jumpArcHeight = 42;
              b.pendingEl = s.currentEl;
              b.landingIntoGame = false;
              b.mode = 'jumping';
              b.plantTimer = 14 + Math.random() * 8;
              setBabyVisible(true);
              setBabyPos({ x: b.x, y: b.y });
              setBabyFacing(b.facing);
              setBabyJumping(true);
              showBabySpeech('hi!! 🌱', 1400);
            }
            const p = Math.min(1, (t - 2.5) / 0.5);
            const hop = 4 * p * (1 - p) * 18;
            setPos({ x: s.x, y: s.y - hop });
            setSquash({ sx: 1, sy: 1, rot: 0 });
          }

          if (t >= s.actionDuration) {
            s.mode = 'perched';
            s.walkPause = 1.0;
            setMode('perched');
            setExpression('normal');
            setLeafTilt(0);
            setSquash({ sx: 1, sy: 1, rot: 0 });
            recheckViewportIfNeeded();
          }
        } else if (s.mode === 'ee-giant' && s.currentEl) {
          const r = getDocRect(s.currentEl);
          const baseY = r.top - BUDDY_H + 5;
          s.eeSpotX = r.left + s.eeSpotRelX;
          s.eeSpotY = r.top + 3;
          s.actionTimer += dt;
          const t = s.actionTimer;

          if (t < 1.25) {
            s.y = baseY;
            const p = Math.min(1, t / 0.3);
            const wave = t > 0.3 ? Math.sin(((t - 0.3) / 0.95) * Math.PI * 6) : 0;
            setSquash({
              sx: 1 + 0.16 * p + wave * 0.04,
              sy: 1 - 0.22 * p - wave * 0.04,
              rot: (10 * p + wave * 4) * s.facing,
            });
            setLeafTilt(14 + wave * 18);
            setPos({ x: s.x, y: s.y });
            if (s.actionPhase === 0 && t > 0.5) {
              s.actionPhase = 1;
              emitSparks(s.eeSpotX, s.eeSpotY, 7, ['#FBBF24', '#EA7824']);
            }
          } else if (t < 1.7) {
            s.y = baseY;
            const p = (t - 1.25) / 0.45;
            const ease = 1 - Math.pow(1 - p, 2);
            s.x = s.plantStartX + (s.eeBackX - s.plantStartX) * ease;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 1, sy: 1, rot: 0 });
            setLeafTilt(0);
          } else if (t < 3.6) {
            // Giant Tulip grows in 3 stages!
            s.y = baseY;
            setPos({ x: s.x, y: s.y });
            if (s.actionPhase < 2 && t >= 1.7) {
              s.actionPhase = 2;
              s.giantTulip = {
                el: s.currentEl,
                relX: s.eeSpotRelX,
                x: s.eeSpotX,
                y: s.eeSpotY,
                stage: 1,
                visible: true,
              };
              setGiantTulip(s.giantTulip);
              emitSparks(s.eeSpotX, s.eeSpotY - 10, 8, ['#22C55E', '#FBBF24']);
            } else if (s.actionPhase < 3 && t >= 2.3) {
              s.actionPhase = 3;
              if (s.giantTulip) {
                s.giantTulip = { ...s.giantTulip, stage: 2 };
                setGiantTulip(s.giantTulip);
              }
              setExpression('surprised');
              showSpeech('woah!! 😮', 1200);
              emitSparks(s.eeSpotX, s.eeSpotY - 45, 9, ['#EA7824', '#FBBF24']);
            } else if (s.actionPhase < 4 && t >= 2.95) {
              s.actionPhase = 4;
              if (s.giantTulip) {
                s.giantTulip = { ...s.giantTulip, stage: 3 };
                setGiantTulip(s.giantTulip);
              }
              emitSparks(s.eeSpotX, s.eeSpotY - 96, 14, ['#FBBF24', '#EA7824', '#4E89E8']);
            }
            setSquash({ sx: 1, sy: 1, rot: -4 * s.facing });
          } else if (t < 4.25) {
            // Jump onto the giant tulip's right leaf!
            if (s.actionPhase < 5) {
              s.actionPhase = 5;
              s.facing = s.eeSpotX + GIANT_LEAF_OFFSET_X - BUDDY_W / 2 >= s.x ? 1 : -1;
              setFacing(s.facing);
              setExpression('normal');
              emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 4, 6);
            }
            const p = (t - 3.6) / 0.65;
            const leafX = s.eeSpotX + GIANT_LEAF_OFFSET_X - BUDDY_W / 2;
            const leafY = s.eeSpotY + GIANT_LEAF_OFFSET_Y - BUDDY_H + 6;
            const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            s.x = s.eeBackX + (leafX - s.eeBackX) * easeX;
            s.y = baseY + (leafY - baseY) * p - 4 * p * (1 - p) * 76;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 0.92, sy: 1.09, rot: s.facing * -8 * Math.sin(p * Math.PI) });
          } else if (t < 6.65) {
            // Perch proudly on the giant leaf!
            if (s.actionPhase < 6) {
              s.actionPhase = 6;
              setExpression('happy');
              showSpeech('what a view! ✨', 1700);
              emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 4, 5);
            }
            s.x = s.eeSpotX + GIANT_LEAF_OFFSET_X - BUDDY_W / 2;
            s.y = s.eeSpotY + GIANT_LEAF_OFFSET_Y - BUDDY_H + 6;
            const sway = Math.sin((t - 4.25) * 3.2) * 2.5;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 1, sy: 1, rot: sway });
          } else {
            // Leap off the giant leaf back down to the card!
            if (s.actionPhase < 7) {
              s.actionPhase = 7;
              setExpression('normal');
              showSpeech('wheee!', 900);
            }
            const p = Math.min(1, (t - 6.65) / 0.7);
            const leafX = s.eeSpotX + GIANT_LEAF_OFFSET_X - BUDDY_W / 2;
            const leafY = s.eeSpotY + GIANT_LEAF_OFFSET_Y - BUDDY_H + 6;
            const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            s.x = leafX + (s.eeBackX - leafX) * easeX;
            s.y = leafY + (baseY - leafY) * p - 4 * p * (1 - p) * 58;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 0.93, sy: 1.08, rot: s.facing * 8 * Math.sin(p * Math.PI) });
          }

          if (t >= s.actionDuration) {
            s.mode = 'perched';
            s.squashTimer = 0.22;
            s.walkPause = 0.9 + Math.random() * 1.0;
            s.y = baseY;
            setMode('perched');
            setExpression('normal');
            setLeafTilt(0);
            emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 4, 6);
            recheckViewportIfNeeded();
          }
        } else if (s.mode === 'ee-windmill' && s.windmillBuild.windmillEl) {
          const siteEl = s.windmillBuild.windmillEl;
          const r = getDocRect(siteEl);
          const baseY = r.top - BUDDY_H + 5;
          s.eeSpotX = r.left + s.eeSpotRelX;
          s.eeSpotY = r.top + 3;
          const wb = s.windmillBuild;
          wb.timer += dt;

          const curEl = s.currentEl && document.body.contains(s.currentEl) ? s.currentEl : siteEl;
          const curR = getDocRect(curEl);
          const curBaseY = curR.top - BUDDY_H + 5;

          const pickHarvestTarget = (): PlantedTulip | null => {
            const onSite = s.tulips.filter((t) => t.el === siteEl && !t.fading);
            if (onSite.length > 0) {
              return onSite.reduce((best, cur) =>
                Math.abs(cur.relX - s.eeSpotRelX) > Math.abs(best.relX - s.eeSpotRelX) ? cur : best
              );
            }
            const vh = window.innerHeight;
            const onNeighbors = s.tulips.filter((t) => {
              if (t.el === siteEl || t.fading || !document.body.contains(t.el)) return false;
              if (t.el.dataset.tulipPerch === 'game') return false;
              const tr = t.el.getBoundingClientRect();
              return tr.width > 90 && tr.top > 60 && tr.top < vh - 30;
            });
            if (onNeighbors.length === 0) return null;
            return onNeighbors.reduce((best, cur) =>
              Math.hypot(cur.x - s.x, cur.y - s.y) < Math.hypot(best.x - s.x, best.y - s.y)
                ? cur
                : best
            );
          };

          const startJumpBackToSite = (carrying: boolean) => {
            const siteBuddyX = Math.min(
              Math.max(r.left + 16, s.eeSpotX - BUDDY_W / 2),
              Math.max(r.left + 16, r.right - 16 - BUDDY_W)
            );
            wb.jumpStartX = s.x;
            wb.jumpStartY = s.y;
            wb.jumpEndX = siteBuddyX;
            wb.jumpEndY = baseY;
            wb.jumpDuration = 0.46;
            wb.targetEl = siteEl;
            wb.plucked = carrying;
            wb.phase = 'jump-to-site';
            wb.timer = 0;
            const dir: 1 | -1 = siteBuddyX >= s.x ? 1 : -1;
            if (dir !== s.facing) {
              s.facing = dir;
              setFacing(dir);
            }
            setWalking(false);
            emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 4, 5);
          };

          if (wb.phase === 'idea') {
            const p = Math.min(1, wb.timer / 0.6);
            const hop = 4 * p * (1 - p) * 32;
            s.y = baseY - hop;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 0.95, sy: 1.06, rot: 0 });
            if (s.actionPhase === 0 && wb.timer > 0.08) {
              s.actionPhase = 1;
              emitSparks(s.x + BUDDY_W / 2, baseY + BUDDY_H - 6, 6, ['#FBBF24', '#EA7824']);
            }
            if (wb.timer >= 0.6) {
              wb.timer = 0;
              if (wb.needsSeeds > 0) {
                wb.phase = 'seed-prep';
                wb.seedsTossed = false;
                showSpeech('need tulips! 🌱', 1100);
              } else {
                wb.phase = 'to-tulip';
              }
            }
          } else if (wb.phase === 'seed-prep') {
            s.y = baseY;
            setPos({ x: s.x, y: s.y });
            if (!wb.seedsTossed && wb.timer >= 0.15) {
              wb.seedsTossed = true;
              const batch = Math.min(wb.needsSeeds, 5);
              const originX = s.x + BUDDY_W / 2;
              const originY = s.y + BUDDY_H * 0.5;
              // Scatter seeds in both directions across the card rim
              for (let i = 0; i < batch; i++) {
                const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
                launchSeeds(siteEl, 1, originX + dir * 8, originY, dir, true);
              }
              setLeafTilt(18);
            } else if (wb.timer >= 0.35) {
              setLeafTilt(0);
            }
            if (wb.seedsTossed && (s.seeds.length === 0 || wb.timer >= 1.15)) {
              wb.seedsTossed = false;
              wb.phase = 'to-tulip';
              wb.timer = 0;
            }
          } else if (wb.phase === 'to-tulip') {
            let target =
              wb.targetTulipId !== null
                ? s.tulips.find(
                    (t) => t.id === wb.targetTulipId && !t.fading && document.body.contains(t.el)
                  ) ?? null
                : null;

            if (!target) {
              target = pickHarvestTarget();
              if (target) {
                wb.targetTulipId = target.id;
              }
            }

            if (!target) {
              if (curEl !== siteEl) {
                startJumpBackToSite(false);
              } else {
                wb.needsSeeds = Math.max(1, WINDMILL_TOTAL_TULIPS - wb.stagesBuilt);
                wb.seedsTossed = false;
                wb.phase = 'seed-prep';
                wb.timer = 0;
                showSpeech('need more! 🌱', 1000);
              }
            } else if (target.el !== curEl) {
              const tr = getDocRect(target.el);
              const targetBuddyX = Math.min(
                Math.max(tr.left + 16, target.x - BUDDY_W / 2),
                Math.max(tr.left + 16, tr.right - 16 - BUDDY_W)
              );
              const targetBuddyY = tr.top - BUDDY_H + 5;
              wb.jumpStartX = s.x;
              wb.jumpStartY = s.y;
              wb.jumpEndX = targetBuddyX;
              wb.jumpEndY = targetBuddyY;
              wb.jumpDuration = 0.44;
              wb.targetEl = target.el;
              wb.phase = 'jump-to-tulip';
              wb.timer = 0;
              const dir: 1 | -1 = targetBuddyX >= s.x ? 1 : -1;
              if (dir !== s.facing) {
                s.facing = dir;
                setFacing(dir);
              }
              setWalking(false);
              emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 4, 5);
            } else {
              const targetBuddyX = Math.min(
                Math.max(curR.left + 16, target.x - BUDDY_W / 2),
                Math.max(curR.left + 16, curR.right - 16 - BUDDY_W)
              );
              const dx = targetBuddyX - s.x;
              if (Math.abs(dx) <= 5) {
                s.x = targetBuddyX;
                s.y = curBaseY;
                setWalking(false);
                setPos({ x: s.x, y: s.y });
                wb.phase = 'pluck';
                wb.timer = 0;
                wb.plucked = false;
              } else {
                const dir: 1 | -1 = dx > 0 ? 1 : -1;
                if (dir !== s.facing) {
                  s.facing = dir;
                  setFacing(dir);
                }
                s.x += dir * Math.min(Math.abs(dx), 175 * dt);
                s.stride += dt * 26;
                setWalking(true);
                setStepPhase(Math.sin(s.stride));
                s.y = curBaseY;
                setPos({ x: s.x, y: s.y + Math.abs(Math.sin(s.stride)) * -3.5 });
                setSquash({ sx: 1, sy: 1, rot: Math.sin(s.stride) * 5.5 });
              }
            }
          } else if (wb.phase === 'jump-to-tulip') {
            if (!wb.targetEl || !document.body.contains(wb.targetEl)) {
              s.currentEl = siteEl;
              s.x = Math.min(Math.max(r.left + 20, s.x), Math.max(r.left + 20, r.right - 20 - BUDDY_W));
              s.y = baseY;
              wb.targetTulipId = null;
              wb.phase = 'to-tulip';
              wb.timer = 0;
            } else {
              const p = Math.min(1, wb.timer / wb.jumpDuration);
              const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
              s.x = wb.jumpStartX + (wb.jumpEndX - wb.jumpStartX) * easeX;
              s.y = wb.jumpStartY + (wb.jumpEndY - wb.jumpStartY) * p - 4 * p * (1 - p) * 64;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 0.92, sy: 1.09, rot: s.facing * -8 * Math.sin(p * Math.PI) });

              if (p >= 1) {
                s.currentEl = wb.targetEl;
                s.x = wb.jumpEndX;
                s.y = wb.jumpEndY;
                setPos({ x: s.x, y: s.y });
                setSquash({ sx: 1, sy: 1, rot: 0 });
                emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 4, 4);
                wb.phase = 'pluck';
                wb.timer = 0;
                wb.plucked = false;
              }
            }
          } else if (wb.phase === 'pluck') {
            s.y = curBaseY;
            setPos({ x: s.x, y: s.y });
            const p = Math.min(1, wb.timer / 0.38);
            const tug = Math.sin(p * Math.PI * 3);
            setSquash({
              sx: 1 + 0.16 * Math.sin(p * Math.PI),
              sy: 1 - 0.24 * Math.sin(p * Math.PI),
              rot: (9 * Math.sin(p * Math.PI) + tug * 4) * s.facing,
            });
            setLeafTilt(24 * Math.sin(p * Math.PI));

            if (!wb.plucked && wb.timer >= 0.18) {
              wb.plucked = true;
              const plucked = s.tulips.find((t) => t.id === wb.targetTulipId);
              const variant: TulipVariant = plucked ? plucked.variant : 'brand';
              if (plucked) {
                emitSparks(plucked.x, plucked.y - 10, 8, ['#22C55E', '#EA7824', '#FBBF24']);
                s.tulips = s.tulips.filter((t) => t.id !== plucked.id);
                setTulips([...s.tulips]);
              }
              wb.harvestedVariants.push(variant);
              setCarryingTulip(variant);
              if (wb.stagesBuilt === 0) {
                showSpeech('yoink! 🌷', 850);
              } else if (wb.stagesBuilt === 3) {
                showSpeech('grab! 🌷', 850);
              }
            }

            if (wb.timer >= 0.38) {
              setSquash({ sx: 1, sy: 1, rot: 0 });
              setLeafTilt(-12);
              if (curEl !== siteEl) {
                startJumpBackToSite(true);
              } else {
                wb.phase = 'to-site';
                wb.timer = 0;
              }
            }
          } else if (wb.phase === 'jump-to-site') {
            const p = Math.min(1, wb.timer / wb.jumpDuration);
            const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            s.x = wb.jumpStartX + (wb.jumpEndX - wb.jumpStartX) * easeX;
            s.y = wb.jumpStartY + (baseY - wb.jumpStartY) * p - 4 * p * (1 - p) * 68;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 0.92, sy: 1.09, rot: s.facing * -8 * Math.sin(p * Math.PI) });

            if (p >= 1) {
              s.currentEl = siteEl;
              s.x = wb.jumpEndX;
              s.y = baseY;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 1, sy: 1, rot: 0 });
              emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 4, 4);
              wb.timer = 0;
              if (wb.plucked) {
                wb.phase = 'place';
                wb.placed = false;
              } else {
                wb.phase = 'to-tulip';
              }
            }
          } else if (wb.phase === 'to-site') {
            const siteBuddyX = Math.min(
              Math.max(r.left + 16, s.eeSpotX - BUDDY_W / 2),
              Math.max(r.left + 16, r.right - 16 - BUDDY_W)
            );
            const dx = siteBuddyX - s.x;
            if (Math.abs(dx) <= 8) {
              setWalking(false);
              s.y = baseY;
              setPos({ x: s.x, y: s.y });
              wb.phase = 'place';
              wb.timer = 0;
              wb.placed = false;
            } else {
              const dir: 1 | -1 = dx > 0 ? 1 : -1;
              if (dir !== s.facing) {
                s.facing = dir;
                setFacing(dir);
              }
              s.x += dir * Math.min(Math.abs(dx), 175 * dt);
              s.stride += dt * 26;
              setWalking(true);
              setStepPhase(Math.sin(s.stride));
              s.y = baseY;
              setPos({ x: s.x, y: s.y + Math.abs(Math.sin(s.stride)) * -3.5 });
              setSquash({ sx: 1, sy: 1, rot: Math.sin(s.stride) * 5.5 });
              setLeafTilt(-12);
            }
          } else if (wb.phase === 'place') {
            s.y = baseY;
            setPos({ x: s.x, y: s.y });
            const p = Math.min(1, wb.timer / 0.32);
            setLeafTilt(-28 * (1 - p));
            setSquash({ sx: 0.96, sy: 1 + 0.08 * Math.sin(p * Math.PI), rot: -6 * (1 - p) * s.facing });

            if (!wb.placed && wb.timer >= 0.11) {
              wb.placed = true;
              setCarryingTulip(null);
              wb.stagesBuilt += 1;
              const sailVariants = wb.harvestedVariants.slice(3);
              const sailColors = [0, 1, 2, 3].map((idx) => {
                const v = sailVariants[idx];
                return v ? getVariantSailColor(v, idx) : idx % 2 === 0 ? '#EA7824' : '#2857A4';
              });
              const stage = Math.min(7, wb.stagesBuilt) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
              s.windmill = {
                el: siteEl,
                relX: s.eeSpotRelX,
                x: s.eeSpotX,
                y: s.eeSpotY,
                stage,
                visible: true,
                sailColors,
              };
              setWindmill(s.windmill);
              if (stage < 7) {
                showSpeech(`${stage}/7 🌷`, 750);
                emitSparks(s.eeSpotX, s.eeSpotY - Math.min(44, stage * 7), 7, ['#EA7824', '#2857A4']);
              } else {
                showSpeech('7/7 🌬️', 850);
                emitSparks(s.eeSpotX, s.eeSpotY - 44, 14, ['#EA7824', '#2857A4', '#FBBF24']);
              }
            }

            if (wb.timer >= 0.32) {
              setLeafTilt(0);
              setSquash({ sx: 1, sy: 1, rot: 0 });
              wb.timer = 0;
              if (wb.stagesBuilt < WINDMILL_TOTAL_TULIPS) {
                wb.targetTulipId = null;
                wb.plucked = false;
                wb.phase = 'to-tulip';
              } else {
                wb.phase = 'to-admire';
              }
            }
          } else if (wb.phase === 'to-admire') {
            const dx = s.eeBackX - s.x;
            if (Math.abs(dx) > 3) {
              const dir: 1 | -1 = dx > 0 ? 1 : -1;
              if (dir !== s.facing) {
                s.facing = dir;
                setFacing(dir);
              }
              s.x += dir * Math.min(Math.abs(dx), 120 * dt);
              s.stride += dt * 18;
              setWalking(true);
              setStepPhase(Math.sin(s.stride));
              setPos({ x: s.x, y: baseY + Math.abs(Math.sin(s.stride)) * -2.5 });
              setSquash({ sx: 1, sy: 1, rot: Math.sin(s.stride) * 4 });
            } else {
              setWalking(false);
              const faceWindmill: 1 | -1 = s.eeSpotX >= s.x ? 1 : -1;
              if (faceWindmill !== s.facing) {
                s.facing = faceWindmill;
                setFacing(faceWindmill);
              }
              s.y = baseY;
              setPos({ x: s.x, y: s.y });
              wb.phase = 'celebrate';
              wb.timer = 0;
              wb.celebrated = false;
            }
          } else {
            // Proud celebratory hop beside the spinning windmill!
            if (!wb.celebrated) {
              wb.celebrated = true;
              setWalking(false);
              setExpression('happy');
              showSpeech('ta-da!! 🌬️🌷', 1600);
              emitSparks(s.x + BUDDY_W / 2, baseY + BUDDY_H - 6, 8);
            }
            const p = Math.min(1, wb.timer / 0.65);
            const hop = 4 * p * (1 - p) * 28;
            s.y = baseY - hop;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 1, sy: 1 + Math.sin(p * Math.PI) * 0.08, rot: 0 });

            if (wb.timer >= 1.15) {
              s.mode = 'perched';
              s.currentEl = siteEl;
              s.y = baseY;
              s.walkPause = 1.1;
              setMode('perched');
              setWalking(false);
              setExpression('normal');
              setLeafTilt(0);
              setCarryingTulip(null);
              setSquash({ sx: 1, sy: 1, rot: 0 });
              recheckViewportIfNeeded();
            }
          }
        } else if (s.mode === 'perched' && s.currentEl) {
          // Keep glued to card top in case layout shifts
          if (!document.body.contains(s.currentEl)) {
            pickBestPerchForViewport();
          } else {
            const r = getDocRect(s.currentEl);
            const targetTop = r.top - BUDDY_H + 5;
            s.y += (targetTop - s.y) * Math.min(1, dt * 18);

            let isStrolling = false;
            if (s.squashTimer > 0) {
              s.squashTimer = Math.max(0, s.squashTimer - dt);
              const k = s.squashTimer / 0.22;
              setSquash({ sx: 1 + 0.2 * k, sy: 1 - 0.18 * k, rot: 0 });
            } else {
              if (s.walkPause > 0) {
                s.walkPause -= dt;
                setWalking(false);
                setSquash({ sx: 1, sy: 1, rot: Math.sin(now * 0.003) * 1.8 });
              } else {
                const dx = s.walkTargetX - s.x;
                if (Math.abs(dx) < 3) {
                  s.walkPause = 1.1 + Math.random() * 2.2;
                  s.walkTargetX = pickTargetXOnCard(r, BUDDY_W);
                  setWalking(false);
                } else {
                  isStrolling = true;
                  const dir: 1 | -1 = dx > 0 ? 1 : -1;
                  if (dir !== s.facing) {
                    s.facing = dir;
                    setFacing(dir);
                  }
                  const step = dir * Math.min(Math.abs(dx), 52 * dt);
                  s.x += step;
                  s.stride += dt * 15;
                  setWalking(true);
                  setStepPhase(Math.sin(s.stride));
                  const bobY = Math.abs(Math.sin(s.stride)) * -3;
                  setSquash({
                    sx: 1,
                    sy: 1,
                    rot: Math.sin(s.stride) * 4.5,
                  });
                  setPos({ x: s.x, y: s.y + bobY });
                }
              }

              // Periodic autonomous planting when Buddy is visible on screen
              autoPlantTimer -= dt;
              if (autoPlantTimer <= 0) {
                autoPlantTimer = 13 + Math.random() * 10;
                const vh = window.innerHeight;
                if (
                  r.viewTop > 80 &&
                  r.viewTop < vh * 0.85 &&
                  s.currentEl.dataset.tulipPerch !== 'game'
                ) {
                  if (Math.random() < 0.75) {
                    startSeedToss(s.currentEl, Math.random() < 0.55 ? 1 : 2, false);
                  } else {
                    startHandPlant(s.currentEl, false);
                  }
                }
              }

              // Occasionally hop unpredictably to a neighboring visible card
              if (s.mode === 'perched') {
                randomHopTimer -= dt;
                if (randomHopTimer <= 0) {
                  randomHopTimer = 5.5 + Math.random() * 6.5;
                  const vh = window.innerHeight;
                  const peers = getPerches().filter((el) => {
                    if (el === s.currentEl || el.dataset.tulipPerch === 'game') return false;
                    const pr = el.getBoundingClientRect();
                    return pr.top > 110 && pr.top < vh * 0.78;
                  });
                  if (peers.length > 0 && Math.random() < 0.72) {
                    const randomPeer = peers[Math.floor(Math.random() * peers.length)];
                    launchJumpTo(randomPeer, false);
                  }
                }
              }
            }

            if (!isStrolling && s.mode === 'perched') {
              setPos({ x: s.x, y: s.y });
            }
          }
        }

        // 4) Baby Tulip Buddy simulation (once awakened)
        if (s.baby.active) {
          const b = s.baby;
          if (b.mode === 'jumping') {
            b.jumpT = Math.min(1, b.jumpT + dt / b.jumpDuration);
            const t = b.jumpT;
            const easeX = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const curX = b.jumpStartX + (b.jumpEndX - b.jumpStartX) * easeX;
            const baseY = b.jumpStartY + (b.jumpEndY - b.jumpStartY) * t;
            const arc = 4 * t * (1 - t) * b.jumpArcHeight;
            const curY = baseY - arc;

            b.x = curX;
            b.y = curY;

            setBabySquash({
              sx: 0.9,
              sy: 1.12,
              rot: b.facing * (t < 0.5 ? -11 : 9) * Math.sin(t * Math.PI),
            });
            setBabyPos({ x: curX, y: curY });

            if (t >= 1) {
              if (b.landingIntoGame) {
                b.mode = 'in-game';
                b.currentEl = b.pendingEl;
                b.pendingEl = null;
                setBabyJumping(false);
                setBabyInGame(true);
                emitSparks(b.x + BABY_W / 2, b.y + BABY_H - 4, 5);
              } else {
                b.mode = 'perched';
                b.currentEl = b.pendingEl;
                b.pendingEl = null;
                b.squashTimer = 0.2;
                b.walkPause = 0.5 + Math.random() * 0.9;
                if (b.currentEl && document.body.contains(b.currentEl)) {
                  const br = getDocRect(b.currentEl);
                  b.y = br.top - BABY_H + 4;
                  b.walkTargetX = pickTargetXOnCard(br, BABY_W);
                }
                setBabyJumping(false);
                setBabyInGame(false);
                emitSparks(b.x + BABY_W / 2, b.y + BABY_H - 2, 4);
              }
            }
          } else if (b.mode === 'in-game') {
            if (s.mode === 'perched' && s.currentEl) {
              if (b.currentEl && document.body.contains(b.currentEl)) {
                const gr = getDocRect(b.currentEl);
                b.x = gr.left + Math.min(86, gr.width * 0.16);
                b.y = gr.top + gr.height * 0.68 - BABY_H;
              }
              launchBabyJumpTo(s.currentEl, false);
            }
          } else if (b.mode === 'perched') {
            // Follow parent into game or onto new cards after a short trailing delay
            if (s.mode === 'in-game' && s.currentEl) {
              b.followDelay += dt;
              if (b.followDelay > 0.25) {
                b.followDelay = 0;
                launchBabyJumpTo(s.currentEl, true);
              }
            } else if (s.mode === 'perched' && s.currentEl && b.currentEl !== s.currentEl) {
              b.followDelay += dt;
              if (b.followDelay > 0.32) {
                b.followDelay = 0;
                launchBabyJumpTo(s.currentEl, false);
              }
            } else if (b.currentEl && document.body.contains(b.currentEl)) {
              b.followDelay = 0;
              const br = getDocRect(b.currentEl);
              const targetTop = br.top - BABY_H + 4;
              b.y += (targetTop - b.y) * Math.min(1, dt * 18);

              let babyIsStrolling = false;
              if (b.squashTimer > 0) {
                b.squashTimer = Math.max(0, b.squashTimer - dt);
                const k = b.squashTimer / 0.2;
                setBabySquash({ sx: 1 + 0.18 * k, sy: 1 - 0.16 * k, rot: 0 });
              } else {
                if (b.walkPause > 0) {
                  b.walkPause -= dt;
                  setBabyWalking(false);
                  setBabySquash({ sx: 1, sy: 1, rot: Math.sin(now * 0.004 + 1) * 2.4 });
                } else {
                  const dx = b.walkTargetX - b.x;
                  if (Math.abs(dx) < 3) {
                    b.walkPause = 0.8 + Math.random() * 1.4;
                    if (s.currentEl === b.currentEl) {
                      const offset = (Math.random() < 0.5 ? -1 : 1) * (24 + Math.random() * 28);
                      b.walkTargetX = Math.min(
                        Math.max(br.left + 18, s.x + offset),
                        Math.max(br.left + 18, br.right - 18 - BABY_W)
                      );
                    } else {
                      b.walkTargetX = pickTargetXOnCard(br, BABY_W);
                    }
                    setBabyWalking(false);
                  } else {
                    babyIsStrolling = true;
                    const dir: 1 | -1 = dx > 0 ? 1 : -1;
                    if (dir !== b.facing) {
                      b.facing = dir;
                      setBabyFacing(dir);
                    }
                    const step = dir * Math.min(Math.abs(dx), 58 * dt);
                    b.x += step;
                    b.stride += dt * 19;
                    setBabyWalking(true);
                    setBabyStepPhase(Math.sin(b.stride));
                    const bobY = Math.abs(Math.sin(b.stride)) * -3;
                    setBabySquash({ sx: 1, sy: 1, rot: Math.sin(b.stride) * 5 });
                    setBabyPos({ x: b.x, y: b.y + bobY });
                  }
                }

                // Baby occasionally sprouts a microscopic tulip of its own!
                b.plantTimer -= dt;
                if (b.plantTimer <= 0) {
                  b.plantTimer = 18 + Math.random() * 9;
                  const vh = window.innerHeight;
                  if (
                    br.viewTop > 80 &&
                    br.viewTop < vh * 0.86 &&
                    b.currentEl.dataset.tulipPerch !== 'game'
                  ) {
                    const spotRel = pickOpenRelX(b.currentEl, b.x + BABY_W / 2 - br.left, 14);
                    spawnPlantedTulip(
                      b.currentEl,
                      spotRel,
                      pickTulipVariant(true),
                      0.55 + Math.random() * 0.12
                    );
                    emitSparks(br.left + spotRel, br.top + 3, 4, ['#22C55E', '#FBBF24']);
                    b.squashTimer = 0.16;
                  }
                }
              }

              if (!babyIsStrolling) {
                setBabyPos({ x: b.x, y: b.y });
              }
            }
          }
        }
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      window.clearTimeout(initTimer);
      window.clearTimeout(scrollCheckTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const performNormalJump = (customSpeech?: string) => {
    const s = stateRef.current;
    if (!customSpeech) {
      const greetings = ['hi! 🌷', 'boing!', 'no ads!', 'wheee!', '✨'];
      showSpeech(greetings[Math.floor(Math.random() * greetings.length)], 950);
    } else {
      showSpeech(customSpeech, 950);
    }

    const vh = window.innerHeight;
    const peers = Array.from(document.querySelectorAll<HTMLElement>('[data-tulip-perch]')).filter(
      (el) => {
        if (el === s.currentEl || el.dataset.tulipPerch === 'game') return false;
        const r = el.getBoundingClientRect();
        return r.width > 90 && r.top > 100 && r.top < vh * 0.8;
      }
    );

    if (peers.length > 0) {
      const next = peers[Math.floor(Math.random() * peers.length)];
      const nr = next.getBoundingClientRect();
      const endX =
        nr.left + window.scrollX + 28 + Math.random() * Math.max(10, nr.width - 56 - BUDDY_W);
      const endY = nr.top + window.scrollY - BUDDY_H + 5;
      s.jumpStartX = s.x;
      s.jumpStartY = s.y;
      s.jumpEndX = endX;
      s.jumpEndY = endY;
      s.jumpT = 0;
      s.jumpDuration = 0.55;
      s.jumpArcHeight = 78;
      s.pendingEl = next;
      s.landingIntoGame = false;
      s.mode = 'jumping';
      s.facing = endX >= s.x ? 1 : -1;
      setFacing(s.facing);
      setMode('jumping');
      emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 6, 8);
    } else {
      s.jumpStartX = s.x;
      s.jumpStartY = s.y;
      s.jumpEndX = s.x;
      s.jumpEndY = s.y;
      s.jumpT = 0;
      s.jumpDuration = 0.42;
      s.jumpArcHeight = 52;
      s.pendingEl = s.currentEl;
      s.landingIntoGame = false;
      s.mode = 'jumping';
      setMode('jumping');
      emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 6, 7);
    }
  };

  const handlePoke = () => {
    const s = stateRef.current;
    if (s.mode !== 'perched' || !s.currentEl) return;

    s.pokeCount += 1;

    // Progressive 3-stage Easter Egg sequence!
    if (s.pokeCount >= 8 && !s.unlocked.baby) {
      startEasterEggBaby(s.currentEl);
      return;
    }
    if (s.pokeCount >= 15 && !s.unlocked.giant) {
      startEasterEggGiant(s.currentEl);
      return;
    }
    if (s.pokeCount >= 22 && !s.unlocked.windmill) {
      startEasterEggWindmill(s.currentEl);
      return;
    }

    let teaser: string | undefined;
    if (s.pokeCount === 7 && !s.unlocked.baby) teaser = 'hmm? 🌱';
    else if (s.pokeCount === 14 && !s.unlocked.giant) teaser = 'ooh! ✨';
    else if (s.pokeCount === 21 && !s.unlocked.windmill) teaser = 'idea... 💡';

    // Fun surprise (~22% chance, or guaranteed after 5 jumps without planting)
    const shouldPlant = Math.random() < 0.22 || s.pokesSinceLastPlant >= 5;
    if (shouldPlant && s.currentEl.dataset.tulipPerch !== 'game') {
      s.pokesSinceLastPlant = 0;
      if (Math.random() < 0.68) {
        startSeedToss(s.currentEl, Math.random() < 0.45 ? 3 : 2, true);
      } else {
        startHandPlant(s.currentEl, true);
      }
      if (teaser) showSpeech(teaser, 950);
      return;
    }

    s.pokesSinceLastPlant += 1;
    performNormalJump(teaser);
  };

  const handleBabyPoke = () => {
    const s = stateRef.current;
    const b = s.baby;
    if (!b.active || b.mode !== 'perched') return;

    s.pokeCount += 1;
    const lines = ['squeak!', 'hi! 🌱', '🌷', 'boop!'];
    showBabySpeech(lines[Math.floor(Math.random() * lines.length)], 900);

    b.jumpStartX = b.x;
    b.jumpStartY = b.y;
    b.jumpEndX = b.x;
    b.jumpEndY = b.y;
    b.jumpT = 0;
    b.jumpDuration = 0.36;
    b.jumpArcHeight = 40;
    b.pendingEl = b.currentEl;
    b.landingIntoGame = false;
    b.mode = 'jumping';
    setBabyJumping(true);
    emitSparks(b.x + BABY_W / 2, b.y + BABY_H - 4, 5);
  };

  if (!visible) return null;

  const isJumpingAnim = mode === 'jumping';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 overflow-x-clip"
    >
      {/* Persistent session tulip garden anchored to cards */}
      {tulips.map((t) => (
        <PlantedTulipItem key={t.id} tulip={t} />
      ))}

      {/* Easter egg landmarks */}
      {giantTulip && <GiantTulipLandmark giant={giantTulip} />}
      {windmill && <TulipWindmillLandmark windmill={windmill} />}
      {hatchingSprout && <HatchingSproutItem sprout={hatchingSprout} />}

      {/* Mid-air tossed seeds */}
      {flyingSeeds.map((seed) => (
        <FlyingSeedItem key={seed.id} seed={seed} />
      ))}

      {/* Sparkle dust puffs */}
      {sparks.map((sp) => (
        <span
          key={sp.id}
          style={{
            left: sp.x,
            top: sp.y,
            backgroundColor: sp.color,
            transform: `translate(${sp.dx}px, ${sp.dy}px) scale(0.4)`,
          }}
          className="absolute w-2 h-2 rounded-full opacity-80 transition-all duration-500 ease-out"
        />
      ))}

      {/* Baby Tulip Buddy (unlocked at Easter Egg 1) */}
      {babyVisible && (
        <BabyBuddyView
          x={babyPos.x}
          y={babyPos.y}
          width={BABY_W}
          height={BABY_H}
          facing={babyFacing}
          squash={babySquash}
          walking={babyWalking}
          jumping={babyJumping}
          stepPhase={babyStepPhase}
          blinking={blinking}
          inGame={babyInGame}
          speech={babySpeech}
          onPoke={handleBabyPoke}
        />
      )}

      {/* The wandering Tulip Buddy */}
      <div
        onClick={handlePoke}
        title="Psst — click me!"
        style={{
          left: pos.x,
          top: pos.y,
          width: BUDDY_W,
          height: BUDDY_H,
          opacity: mode === 'in-game' ? 0 : 1,
          transform: `scaleX(${facing * squash.sx}) scaleY(${squash.sy}) rotate(${squash.rot}deg)`,
          transformOrigin: '50% 90%',
        }}
        className={`absolute transition-opacity duration-200 ${
          mode === 'in-game' ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
        }`}
      >
        {/* Optional tiny speech bubble */}
        {speech && (
          <div
            style={{ transform: `scaleX(${facing})` }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#EA7824] text-white font-display font-bold text-[10px] shadow-md animate-bounce"
          >
            {speech}
          </div>
        )}

        <svg
          viewBox="-24 -58 48 62"
          className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.22)]"
          fill="none"
        >
          {/* Running legs */}
          <g className="stroke-[#2857A4] dark:stroke-[#4E89E8]" strokeWidth="3.6" strokeLinecap="round">
            <line
              x1="-3"
              y1="-11"
              x2={isJumpingAnim ? '-9' : walking ? String(-3 + stepPhase * 6) : '-4'}
              y2={isJumpingAnim ? '-2' : walking ? String(-1 - Math.max(0, stepPhase) * 2.5) : '0'}
            />
            <line
              x1="3"
              y1="-11"
              x2={isJumpingAnim ? '9' : walking ? String(3 - stepPhase * 6) : '4'}
              y2={isJumpingAnim ? '-4' : walking ? String(-1 - Math.max(0, -stepPhase) * 2.5) : '0'}
            />
            {/* Stem */}
            <line x1="0" y1="-10" x2="0" y2="-24" />
          </g>

          {/* Animated Leaf (pivots around base (0, -11) for tossing & hand-planting!) */}
          <g transform={`rotate(${leafTilt} 0 -11)`}>
            {carryingTulip && <CarriedTulipSvg variant={carryingTulip} />}
            <path
              d="M0 -11 Q16 -11 18 -25 Q6 -24 0 -11 Z"
              className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <line
              x1="2"
              y1="-12"
              x2="13"
              y2="-21"
              stroke="#EA7824"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Tulip Cup Fill */}
          <path
            d="M-14 -48 L-14 -35 C-14 -26 -7 -22 0 -22 C7 -22 14 -26 14 -35 L14 -48 Q0 -44 -14 -48 Z"
            className="fill-white dark:fill-[#242B35]"
          />

          {/* Top orange center petal tip */}
          <path
            d="M-6 -45 Q0 -55 6 -45"
            stroke="#EA7824"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Blue cup outline & left inner curve */}
          <path
            d="M-14 -48 L-14 -35 C-14 -26 -7 -22 0 -22 C7 -22 14 -26 14 -35 L14 -48"
            className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M-14 -48 Q-5 -46 0 -40"
            className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="3.4"
            strokeLinecap="round"
          />

          {/* Signature swooping orange inner petal */}
          <path
            d="M14 -48 Q-6 -43 -6 -31 Q-6 -25 0 -22"
            stroke="#EA7824"
            strokeWidth="3.4"
            strokeLinecap="round"
          />

          {/* Cute expressive eyes */}
          {expression === 'happy' ? (
            <g className="stroke-slate-900 dark:stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.2 -34.5 Q3.5 -37.8 5.8 -34.5" />
              <path d="M7.2 -34.5 Q9.5 -37.8 11.8 -34.5" />
            </g>
          ) : expression === 'surprised' ? (
            <g>
              <circle cx="3.5" cy="-35.5" r="2.7" className="fill-slate-900 dark:fill-white" />
              <circle cx="9.5" cy="-35.5" r="2.7" className="fill-slate-900 dark:fill-white" />
              <circle cx="4.3" cy="-36.4" r="1" fill="#FFFFFF" />
              <circle cx="10.3" cy="-36.4" r="1" fill="#FFFFFF" />
            </g>
          ) : blinking ? (
            <g className="stroke-slate-900 dark:stroke-white" strokeWidth="2" strokeLinecap="round">
              <line x1="1.5" y1="-35.5" x2="5.5" y2="-35.5" />
              <line x1="7.5" y1="-35.5" x2="11.5" y2="-35.5" />
            </g>
          ) : (
            <g>
              <circle cx="3.5" cy="-35.5" r="2.1" className="fill-slate-900 dark:fill-white" />
              <circle cx="9.5" cy="-35.5" r="2.1" className="fill-slate-900 dark:fill-white" />
              <circle cx="4.2" cy="-36.2" r="0.7" fill="#FFFFFF" />
              <circle cx="10.2" cy="-36.2" r="0.7" fill="#FFFFFF" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
