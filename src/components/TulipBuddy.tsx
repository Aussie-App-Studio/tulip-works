import { useEffect, useRef, useState } from 'react';
import {
  BabyBuddyView,
  CarriedTulipSvg,
  FallenBuddyItem,
  FlyingSeedItem,
  GIANT_LEAF_OFFSET_X,
  GIANT_LEAF_OFFSET_Y,
  GIANT_SUNFLOWER_LEAF1_X,
  GIANT_SUNFLOWER_LEAF1_Y,
  GIANT_SUNFLOWER_LEAF2_X,
  GIANT_SUNFLOWER_LEAF2_Y,
  GiantSunflowerLandmark,
  GiantTulipLandmark,
  GlassGreenhouseLandmark,
  HatchingSproutItem,
  PlantedTulipItem,
  SunflowerBuddyView,
  TulipWindmillLandmark,
  UprootedTulipItem,
  getVariantSailColor,
  pickTulipVariant,
  type BuddyExpression,
  type BuildingLandmarkState,
  type FallenBuddyState,
  type FlowerSpecies,
  type FlyingSeed,
  type GiantLandmarkState,
  type HatchingSprout,
  type PlantedTulip,
  type TulipVariant,
  type UprootedTulip,
} from './TulipGardenArt';

type BuddyMode =
  | 'perched'
  | 'jumping'
  | 'in-game'
  | 'tossing'
  | 'planting'
  | 'ee-baby'
  | 'ee-giant'
  | 'ee-building'
  | 'replacing'
  | 'fighting';

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
  kind: FlowerSpecies;
  scale: number;
  isGolden?: boolean;
}

interface ActiveUprootedParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  life: number;
  maxLife: number;
  variant: TulipVariant;
  kind: FlowerSpecies;
}

interface BabyState {
  active: boolean;
  species: FlowerSpecies;
  morphedSpecies: FlowerSpecies | null;
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
  pokeCount: number;
  flee: {
    active: boolean;
    mood: 'nimble' | 'zip' | 'tired';
    moodTimer: number;
    chaseDuration: number;
    dodgeCooldown: number;
    speechCooldown: number;
    puffCooldown: number;
    tiredPauseTimer: number;
  };
  arc: 'none' | 'morphing' | 'approach-fight' | 'fighting' | 'victory';
  arcTimer: number;
  arcStep: number;
  fightOriginX: number;
  fightHeroStartX: number;
}

const BUDDY_W = 42;
const BUDDY_H = 54;
const BABY_W = 26;
const BABY_H = 34;
const SUNFLOWER_W = 38;
const SUNFLOWER_H = 48;

const MAX_TULIPS_GLOBAL = 120;
const BUILDING_TOTAL_HARVEST = 7;

function getHeroDims(species: FlowerSpecies) {
  return species === 'sunflower'
    ? { w: SUNFLOWER_W, h: SUNFLOWER_H }
    : { w: BUDDY_W, h: BUDDY_H };
}

function getPerCardTulipCap(cardWidth: number): number {
  return Math.max(7, Math.min(28, Math.floor((cardWidth - 36) / 24)));
}

interface TulipBuddyProps {
  onSpeciesChange?: (species: FlowerSpecies) => void;
}

/**
 * Circle-of-Life Tulip / Sunflower Buddy!
 * - Strolls along card edges, leaps between cards & into Tulip/Sunflower Run
 * - Periodically (and occasionally on click) tosses or hand-plants tiny blooms
 * - Runs away playfully from your mouse cursor (adaptive playful / turbo / breather)
 * - Unlocks 3 progressive easter eggs for whichever hero is currently active:
 *   1) Click 8: Hatches a nimble Baby Buddy of the same species
 *   2) Click 15: Grows a Giant Tulip or Giant Beanstalk Sunflower (2-leaf climb!)
 *   3) Click 22: Harvests 7 blooms to construct a Dutch Windmill or Glass Greenhouse
 * - Clicking Baby 3 times triggers a Coup: Baby morphs into the rival species,
 *   fights & KOs the current Hero, flips the runner game, and replaces the garden!
 */
export function TulipBuddy({ onSpeciesChange }: TulipBuddyProps = {}) {
  const onSpeciesChangeRef = useRef(onSpeciesChange);
  useEffect(() => {
    onSpeciesChangeRef.current = onSpeciesChange;
  }, [onSpeciesChange]);

  const [heroSpecies, setHeroSpecies] = useState<FlowerSpecies>('tulip');
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [facing, setFacing] = useState<1 | -1>(1);
  const [mode, setMode] = useState<BuddyMode>('perched');
  const [walking, setWalking] = useState(false);
  const [stepPhase, setStepPhase] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const [expression, setExpression] = useState<BuddyExpression>('normal');
  const [leafTilt, setLeafTilt] = useState(0);
  const [carryingFlower, setCarryingFlower] = useState<{
    variant: TulipVariant;
    kind: FlowerSpecies;
  } | null>(null);
  const [squash, setSquash] = useState({ sx: 1, sy: 1, rot: 0 });
  const [visible, setVisible] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [speech, setSpeech] = useState<string | null>(null);

  // Garden & landmark state
  const [tulips, setTulips] = useState<PlantedTulip[]>([]);
  const [flyingSeeds, setFlyingSeeds] = useState<FlyingSeed[]>([]);
  const [uprootedTulips, setUprootedTulips] = useState<UprootedTulip[]>([]);
  const [hatchingSprout, setHatchingSprout] = useState<HatchingSprout | null>(null);
  const [giantLandmarks, setGiantLandmarks] = useState<GiantLandmarkState[]>([]);
  const [buildingLandmarks, setBuildingLandmarks] = useState<BuildingLandmarkState[]>([]);
  const [fallenBuddies, setFallenBuddies] = useState<FallenBuddyState[]>([]);

  // Baby / Rival visual state
  const [babyVisible, setBabyVisible] = useState(false);
  const [babySpecies, setBabySpecies] = useState<FlowerSpecies>('tulip');
  const [babyMorphedSpecies, setBabyMorphedSpecies] = useState<FlowerSpecies | null>(null);
  const [babyMood, setBabyMood] = useState<'normal' | 'angry' | 'happy'>('normal');
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
    heroSpecies: 'tulip' as FlowerSpecies,
    mode: 'perched' as BuddyMode,
    currentEl: null as HTMLElement | null,
    x: 0,
    y: 0,
    facing: 1 as 1 | -1,
    walkTargetX: 0,
    walkPause: 0.9,
    stride: 0,
    jumpStartX: 0,
    jumpStartY: 0,
    jumpEndX: 0,
    jumpEndY: 0,
    jumpT: 0,
    jumpDuration: 0.65,
    jumpArcHeight: 65,
    pendingEl: null as HTMLElement | null,
    landingIntoGame: false,
    squashTimer: 0,
    initialized: false,
    sparkSeq: 1,
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
    pokeCount: 0,
    pokesSinceLastPlant: 0,
    unlocked: {
      baby: false,
      giant: false,
      building: false,
    },
    eeLandmarkId: 0,
    eeSpotRelX: 0,
    eeSpotX: 0,
    eeSpotY: 0,
    eeBackX: 0,
    buildingState: {
      phase: 'idea' as
        | 'idea'
        | 'seed-prep'
        | 'to-bloom'
        | 'jump-to-bloom'
        | 'pluck'
        | 'to-site'
        | 'jump-to-site'
        | 'place'
        | 'to-admire'
        | 'celebrate',
      siteEl: null as HTMLElement | null,
      timer: 0,
      stagesBuilt: 0,
      targetBloomId: null as number | null,
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
    replaceState: {
      phase: 'search' as 'search' | 'run-to-bloom' | 'jump-to-bloom' | 'uproot' | 'replant',
      timer: 0,
      targetId: null as number | null,
      targetEl: null as HTMLElement | null,
      spotRelX: 0,
      didAct: false,
      count: 0,
      jumpStartX: 0,
      jumpStartY: 0,
      jumpEndX: 0,
      jumpEndY: 0,
      jumpDuration: 0.48,
      jumpArcHeight: 64,
    },
    // Garden refs
    tulipSeq: 1,
    seedSeq: 1,
    uprootedSeq: 1,
    landmarkSeq: 1,
    fallenSeq: 1,
    tulips: [] as PlantedTulip[],
    seeds: [] as ActiveSeedTrajectory[],
    uprooted: [] as ActiveUprootedParticle[],
    giantLandmarks: [] as GiantLandmarkState[],
    buildingLandmarks: [] as BuildingLandmarkState[],
    fallenBuddies: [] as FallenBuddyState[],
    // Adaptive cursor evasion
    pointer: {
      x: -9999,
      y: -9999,
      lastMoveAt: 0,
      active: false,
    },
    flee: {
      active: false,
      mood: 'playful' as 'playful' | 'turbo' | 'tired',
      moodTimer: 0,
      chaseDuration: 0,
      recentCatches: 0,
      dodgeCooldown: 0,
      speechCooldown: 0,
      puffCooldown: 0,
      alertTimer: 0,
      tiredPauseTimer: 0,
    },
    // Baby sidekick state
    baby: {
      active: false,
      species: 'tulip',
      morphedSpecies: null,
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
      pokeCount: 0,
      flee: {
        active: false,
        mood: 'nimble',
        moodTimer: 0,
        chaseDuration: 0,
        dodgeCooldown: 0,
        speechCooldown: 0,
        puffCooldown: 0,
        tiredPauseTimer: 0,
      },
      arc: 'none',
      arcTimer: 0,
      arcStep: 0,
      fightOriginX: 0,
      fightHeroStartX: 0,
    } as BabyState,
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
    if (s.speechTimer) window.clearTimeout(s.speechTimer);
    setSpeech(text);
    s.speechTimer = window.setTimeout(() => {
      setSpeech(null);
      s.speechTimer = 0;
    }, durationMs);
  };

  const showBabySpeech = (text: string, durationMs = 950) => {
    const s = stateRef.current;
    if (s.babySpeechTimer) window.clearTimeout(s.babySpeechTimer);
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
      if (t.el === el && !t.fading) occupied.push({ relX: t.relX, gap: minGap });
    }
    for (const g of s.giantLandmarks) {
      if (g.el === el) occupied.push({ relX: g.relX, gap: 38 });
    }
    for (const b of s.buildingLandmarks) {
      if (b.el === el) occupied.push({ relX: b.relX, gap: 34 });
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
      if (minDist >= 0) return cand;
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
    scale?: number,
    kind: FlowerSpecies = 'tulip'
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
      kind,
      scale: tulipScale,
      tilt: (Math.random() - 0.5) * 9,
      swayDelay: -(Math.random() * 3.5),
      visible: r.width > 90 && r.height > 40,
    };

    s.tulips = [...s.tulips, newTulip];

    const baseCardCap = getPerCardTulipCap(r.width);
    const perCardCap = s.mode === 'ee-building' ? Math.max(baseCardCap, 10) : baseCardCap;
    const globalCap = s.mode === 'ee-building' ? MAX_TULIPS_GLOBAL + 8 : MAX_TULIPS_GLOBAL;

    const fadeIds = new Set<number>();
    const onThisCard = s.tulips.filter((t) => t.el === el && !t.fading);
    if (onThisCard.length > perCardCap) {
      const overflow = onThisCard.length - perCardCap;
      for (let i = 0; i < overflow; i++) fadeIds.add(onThisCard[i].id);
    }
    const activeGlobal = s.tulips.filter((t) => !t.fading && !fadeIds.has(t.id));
    if (activeGlobal.length > globalCap) {
      const overflow = activeGlobal.length - globalCap;
      for (let i = 0; i < overflow; i++) fadeIds.add(activeGlobal[i].id);
    }

    setTulips([...s.tulips]);
    if (fadeIds.size > 0) fadeOutTulips(fadeIds);
  };

  const launchSeeds = (
    el: HTMLElement,
    count: number,
    originX: number,
    originY: number,
    facingDir: 1 | -1,
    preferAccent = false,
    kind: FlowerSpecies = 'tulip'
  ) => {
    const s = stateRef.current;
    const r = getDocRect(el);
    const buddyRelX = originX - r.left;

    for (let i = 0; i < count; i++) {
      const spread = (18 + i * 24 + Math.random() * 24) * facingDir;
      const targetRelX = pickOpenRelX(el, buddyRelX + spread, 18);
      s.seeds.push({
        id: s.seedSeq++,
        el,
        relX: targetRelX,
        startX: originX,
        startY: originY,
        endX: r.left + targetRelX,
        endY: r.top + 3,
        t: -i * 0.08,
        duration: 0.44 + Math.random() * 0.14,
        arcHeight: 28 + Math.random() * 22,
        variant: kind === 'sunflower' ? 'gold' : pickTulipVariant(preferAccent),
        kind,
        scale: 0.78 + Math.random() * 0.26,
      });
    }
  };

  const startSeedToss = (el: HTMLElement, seedCount: number, withSpeech: boolean) => {
    const s = stateRef.current;
    const { w } = getHeroDims(s.heroSpecies);
    const r = getDocRect(el);
    const relX = s.x - r.left;
    if (relX < 46) {
      s.facing = 1;
      setFacing(1);
    } else if (relX > r.width - 46 - w) {
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
    const { w } = getHeroDims(s.heroSpecies);
    const r = getDocRect(el);
    const relCenter = s.x + w / 2 - r.left;

    if (relCenter < 52) {
      s.facing = 1;
      setFacing(1);
    } else if (relCenter > r.width - 52) {
      s.facing = -1;
      setFacing(-1);
    }

    s.plantSpotRelX = pickOpenRelX(el, relCenter + s.facing * 20, 16);
    s.plantStartX = s.x;
    s.plantBackX = Math.min(
      Math.max(r.left + 20, s.x - s.facing * 16),
      Math.max(r.left + 20, r.right - 20 - w)
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
    const { w } = getHeroDims(s.heroSpecies);
    const r = getDocRect(el);
    const relCenter = s.x + w / 2 - r.left;

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
      Math.max(r.left + 20, r.right - 20 - w)
    );

    s.unlocked.baby = true;
    s.mode = 'ee-baby';
    s.actionTimer = 0;
    s.actionDuration = 3.55;
    s.actionPhase = 0;
    setMode('ee-baby');
    setWalking(false);
    showSpeech(s.heroSpecies === 'sunflower' ? 'sunny seed! ☀️' : 'glowing seed! ✨', 1200);
  };

  const startEasterEggGiant = (el: HTMLElement) => {
    const s = stateRef.current;
    const { w } = getHeroDims(s.heroSpecies);
    const r = getDocRect(el);
    let spotRel = Math.min(Math.max(70, s.x + w / 2 - r.left + 26), Math.max(70, r.width - 68));
    for (const b of s.buildingLandmarks) {
      if (b.el === el && Math.abs(spotRel - b.relX) < 76) {
        spotRel = b.relX > r.width / 2 ? Math.max(64, b.relX - 84) : Math.min(r.width - 64, b.relX + 84);
      }
    }
    spotRel = Math.min(Math.max(58, spotRel), Math.max(58, r.width - 58));

    s.eeLandmarkId = s.landmarkSeq++;
    s.eeSpotRelX = spotRel;
    s.eeSpotX = r.left + spotRel;
    s.eeSpotY = r.top + 3;
    s.plantStartX = s.x;

    const standLeft = spotRel > 80;
    s.facing = standLeft ? 1 : -1;
    setFacing(s.facing);
    s.eeBackX = standLeft
      ? Math.max(r.left + 18, s.eeSpotX - w - 22)
      : Math.min(r.right - 18 - w, s.eeSpotX + 24);

    s.unlocked.giant = true;
    s.mode = 'ee-giant';
    s.actionTimer = 0;
    s.actionDuration = s.heroSpecies === 'sunflower' ? 7.85 : 7.45;
    s.actionPhase = 0;
    setMode('ee-giant');
    setWalking(false);
    showSpeech(s.heroSpecies === 'sunflower' ? 'beanstalk seed! 🌱' : 'special bulb! ✨', 1200);
  };

  const startEasterEggBuilding = (el: HTMLElement) => {
    const s = stateRef.current;
    const { w } = getHeroDims(s.heroSpecies);
    const r = getDocRect(el);
    let spotRel = Math.min(Math.max(56, r.width * 0.56), Math.max(56, r.width - 56));
    for (const g of s.giantLandmarks) {
      if (g.el === el && Math.abs(spotRel - g.relX) < 78) {
        spotRel = g.relX > r.width / 2 ? Math.max(54, g.relX - 88) : Math.min(r.width - 54, g.relX + 88);
      }
    }
    spotRel = Math.min(Math.max(52, spotRel), Math.max(52, r.width - 52));

    s.eeLandmarkId = s.landmarkSeq++;
    s.eeSpotRelX = spotRel;
    s.eeSpotX = r.left + spotRel;
    s.eeSpotY = r.top + 3;
    s.eeBackX =
      spotRel > 88
        ? Math.max(r.left + 20, s.eeSpotX - w - 34)
        : Math.min(r.right - 20 - w, s.eeSpotX + 34);

    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    const visibleHarvestCount = s.tulips.filter((t) => {
      if (t.fading || !document.body.contains(t.el) || t.el.dataset.tulipPerch === 'game') return false;
      if ((t.kind ?? 'tulip') !== s.heroSpecies) return false;
      if (t.el === el) return true;
      const tr = t.el.getBoundingClientRect();
      return tr.width > 90 && tr.top > 60 && tr.top < vh - 30;
    }).length;

    s.buildingState = {
      phase: 'idea',
      siteEl: el,
      timer: 0,
      stagesBuilt: 0,
      targetBloomId: null,
      targetEl: null,
      jumpStartX: s.x,
      jumpStartY: s.y,
      jumpEndX: s.x,
      jumpEndY: s.y,
      jumpDuration: 0.45,
      harvestedVariants: [],
      needsSeeds: Math.max(0, BUILDING_TOTAL_HARVEST - visibleHarvestCount),
      seedsTossed: false,
      plucked: false,
      placed: false,
      celebrated: false,
    };

    s.unlocked.building = true;
    s.mode = 'ee-building';
    s.actionTimer = 0;
    s.actionDuration = 0;
    s.actionPhase = 0;
    setMode('ee-building');
    setWalking(false);
    setCarryingFlower(null);
    showSpeech(s.heroSpecies === 'sunflower' ? '💡 greenhouse!' : '💡 windmill!', 950);
  };

  // Blinking
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

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      if (stateRef.current.speechTimer) window.clearTimeout(stateRef.current.speechTimer);
      if (stateRef.current.babySpeechTimer) window.clearTimeout(stateRef.current.babySpeechTimer);
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

    const pickTargetXOnCard = (rect: ReturnType<typeof getDocRect>, width: number) => {
      const pad = 28;
      const minX = rect.left + pad;
      const maxX = Math.max(minX, rect.right - pad - width);
      return minX + Math.random() * (maxX - minX);
    };

    const launchJumpTo = (targetEl: HTMLElement, intoGame: boolean, customEndX?: number) => {
      const s = stateRef.current;
      const { w, h } = getHeroDims(s.heroSpecies);
      const r = getDocRect(targetEl);
      const endX =
        customEndX !== undefined
          ? Math.min(Math.max(r.left + 16, customEndX), Math.max(r.left + 16, r.right - 16 - w))
          : intoGame
            ? r.left + Math.min(110, r.width * 0.2)
            : pickTargetXOnCard(r, w);
      const endY = intoGame ? r.top + r.height * 0.72 - h : r.top - h + 5;

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
      emitSparks(s.x + w / 2, s.y + h - 4, 5);
    };

    const launchBabyJumpTo = (targetEl: HTMLElement, intoGame: boolean, customEndX?: number) => {
      const s = stateRef.current;
      const b = s.baby;
      const effSpecies = b.morphedSpecies ?? b.species;
      const bw = b.morphedSpecies ? getHeroDims(effSpecies).w : BABY_W;
      const bh = b.morphedSpecies ? getHeroDims(effSpecies).h : BABY_H;
      const r = getDocRect(targetEl);
      let endX: number;
      if (customEndX !== undefined) {
        endX = Math.min(Math.max(r.left + 16, customEndX), Math.max(r.left + 16, r.right - 16 - bw));
      } else if (intoGame) {
        endX = r.left + Math.min(84, r.width * 0.16);
      } else if (targetEl === s.currentEl) {
        const offset = s.x > r.left + r.width * 0.5 ? -34 : 34;
        endX = Math.min(Math.max(r.left + 20, s.x + offset), Math.max(r.left + 20, r.right - 20 - bw));
      } else {
        endX = pickTargetXOnCard(r, bw);
      }
      const endY = intoGame ? r.top + r.height * 0.74 - bh : r.top - bh + 4;

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
      emitSparks(b.x + bw / 2, b.y + bh - 2, 3);
    };

    const pickBestPerchForViewport = () => {
      const s = stateRef.current;
      const { h } = getHeroDims(s.heroSpecies);
      const perches = getPerches();
      if (perches.length === 0) return;

      const vh = window.innerHeight;
      const gameEl = perches.find((el) => el.dataset.tulipPerch === 'game') || null;

      if (gameEl) {
        const gr = gameEl.getBoundingClientRect();
        const gameMid = (gr.top + gr.bottom) / 2;
        if (gameMid > vh * 0.24 && gameMid < vh * 0.76) {
          if (s.mode !== 'in-game' && s.mode !== 'jumping') {
            launchJumpTo(gameEl, true);
          }
          return;
        }
      }

      const candidates = perches.filter((el) => {
        if (el.dataset.tulipPerch === 'game') return false;
        const r = el.getBoundingClientRect();
        return r.top > 92 && r.top < vh * 0.84;
      });
      if (candidates.length === 0) return;

      if (s.mode === 'perched' && s.currentEl && candidates.includes(s.currentEl)) {
        const cr = s.currentEl.getBoundingClientRect();
        if (cr.top > 125 && cr.top < vh * 0.74) return;
      }

      if (s.mode === 'in-game' && gameEl) {
        const gr = getDocRect(gameEl);
        s.x = gr.left + Math.min(115, gr.width * 0.22);
        s.y = gr.top + gr.height * 0.65 - h;
      }

      const scored = candidates
        .filter((el) => el !== s.currentEl)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { el, score: Math.abs(r.top - vh * 0.38) + Math.random() * 160 };
        })
        .sort((a, b) => a.score - b.score);

      const chosen = (scored[0] || { el: candidates[0] }).el;
      if (chosen && chosen !== s.currentEl) launchJumpTo(chosen, false);
    };

    const recheckViewportIfNeeded = () => {
      const s = stateRef.current;
      if (!s.currentEl || !document.body.contains(s.currentEl)) {
        pickBestPerchForViewport();
        return;
      }
      const cr = s.currentEl.getBoundingClientRect();
      if (cr.top < 75 || cr.top > window.innerHeight * 0.88) {
        pickBestPerchForViewport();
      }
    };

    const syncGardenLayout = () => {
      const s = stateRef.current;
      const rectCache = new Map<HTMLElement, ReturnType<typeof getDocRect> | null>();
      const getCachedRect = (el: HTMLElement) => {
        if (!rectCache.has(el)) {
          rectCache.set(el, document.body.contains(el) ? getDocRect(el) : null);
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
        if (Math.abs(nx - t.x) > 0.5 || Math.abs(ny - t.y) > 0.5 || isVis !== t.visible) {
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

      let giantsChanged = false;
      const nextGiants: GiantLandmarkState[] = [];
      for (const g of s.giantLandmarks) {
        const r = getCachedRect(g.el);
        if (!r) {
          giantsChanged = true;
          continue;
        }
        const isVis = r.width > 90 && r.height > 40;
        const clampedRel = Math.min(Math.max(52, g.relX), Math.max(52, r.width - 52));
        const nx = r.left + clampedRel;
        const ny = r.top + 3;
        if (Math.abs(nx - g.x) > 0.5 || Math.abs(ny - g.y) > 0.5 || isVis !== g.visible) {
          giantsChanged = true;
          nextGiants.push({ ...g, x: nx, y: ny, visible: isVis });
        } else {
          nextGiants.push(g);
        }
      }
      if (giantsChanged) {
        s.giantLandmarks = nextGiants;
        setGiantLandmarks(nextGiants);
      }

      let buildingsChanged = false;
      const nextBuildings: BuildingLandmarkState[] = [];
      for (const b of s.buildingLandmarks) {
        const r = getCachedRect(b.el);
        if (!r) {
          buildingsChanged = true;
          continue;
        }
        const isVis = r.width > 90 && r.height > 40;
        const clampedRel = Math.min(Math.max(48, b.relX), Math.max(48, r.width - 48));
        const nx = r.left + clampedRel;
        const ny = r.top + 3;
        if (Math.abs(nx - b.x) > 0.5 || Math.abs(ny - b.y) > 0.5 || isVis !== b.visible) {
          buildingsChanged = true;
          nextBuildings.push({ ...b, x: nx, y: ny, visible: isVis });
        } else {
          nextBuildings.push(b);
        }
      }
      if (buildingsChanged) {
        s.buildingLandmarks = nextBuildings;
        setBuildingLandmarks(nextBuildings);
      }

      let fallenChanged = false;
      const nextFallen: FallenBuddyState[] = [];
      for (const f of s.fallenBuddies) {
        const r = getCachedRect(f.el);
        if (!r) {
          fallenChanged = true;
          continue;
        }
        const { w, h } = getHeroDims(f.species);
        const isVis = r.width > 90 && r.height > 40;
        const nx = Math.min(
          Math.max(r.left + 16, r.left + f.relX - w / 2),
          Math.max(r.left + 16, r.right - 16 - w)
        );
        const ny = r.top - h + 18;
        if (Math.abs(nx - f.x) > 0.5 || Math.abs(ny - f.y) > 0.5 || isVis !== f.visible) {
          fallenChanged = true;
          nextFallen.push({ ...f, x: nx, y: ny, visible: isVis });
        } else {
          nextFallen.push(f);
        }
      }
      if (fallenChanged) {
        s.fallenBuddies = nextFallen;
        setFallenBuddies(nextFallen);
      }
    };

    stateRef.current.syncGardenLayout = syncGardenLayout;
    stateRef.current.recheckViewport = recheckViewportIfNeeded;

    const initTimer = window.setTimeout(() => {
      const heroEl = document.querySelector<HTMLElement>('[data-tulip-perch="hero"]') || getPerches()[0];
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
        const st = stateRef.current;
        if (st.mode === 'perched' || st.mode === 'in-game') {
          pickBestPerchForViewport();
        }
        syncGardenLayout();
      }, 95);
    };

    const onResize = () => {
      const s = stateRef.current;
      const { w, h } = getHeroDims(s.heroSpecies);
      if ((s.mode === 'perched' || s.mode === 'replacing') && s.currentEl) {
        const r = getDocRect(s.currentEl);
        s.y = r.top - h + 5;
        s.x = Math.min(Math.max(s.x, r.left + 20), Math.max(r.left + 20, r.right - 20 - w));
      }
      if (s.baby.active && s.baby.mode === 'perched' && s.baby.currentEl) {
        const br = getDocRect(s.baby.currentEl);
        s.baby.y = br.top - BABY_H + 4;
        s.baby.x = Math.min(Math.max(s.baby.x, br.left + 16), Math.max(br.left + 16, br.right - 16 - BABY_W));
      }
      syncGardenLayout();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const s = stateRef.current;
      s.pointer.x = e.clientX + window.scrollX;
      s.pointer.y = e.clientY + window.scrollY;
      s.pointer.lastMoveAt = performance.now();
      s.pointer.active = true;
    };

    const onPointerLeave = () => {
      stateRef.current.pointer.active = false;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);

    let rafId = 0;
    let last = performance.now();
    let randomHopTimer = 4.2 + Math.random() * 4.5;
    let autoPlantTimer = 9 + Math.random() * 6;
    let replaceCheckTimer = 2.4;
    let layoutSyncCooldown = 0.15;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;

      if (s.initialized) {
        const { w: heroW, h: heroH } = getHeroDims(s.heroSpecies);
        const isSunHero = s.heroSpecies === 'sunflower';

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
                emitSparks(sr.left + seed.relX, sr.top + 3, 4, ['#22C55E', '#EA7824', '#FBBF24']);
                spawnPlantedTulip(seed.el, seed.relX, seed.variant, seed.scale, seed.kind);
              }
              continue;
            }
            const t = seed.t;
            remaining.push(seed);
            visualSeeds.push({
              id: seed.id,
              x: seed.startX + (seed.endX - seed.startX) * t,
              y: seed.startY + (seed.endY - seed.startY) * t - 4 * t * (1 - t) * seed.arcHeight,
              rot: t * 320,
              isGolden: seed.isGolden,
            });
          }

          s.seeds = remaining;
          setFlyingSeeds(visualSeeds);
        }

        // 1b) Update uprooted tumbling bloom particles
        if (s.uprooted.length > 0) {
          const nextUp: ActiveUprootedParticle[] = [];
          const visualUp: UprootedTulip[] = [];
          for (const up of s.uprooted) {
            up.life -= dt;
            if (up.life <= 0) continue;
            up.vy += 420 * dt;
            up.x += up.vx * dt;
            up.y += up.vy * dt;
            up.rot += up.vrot * dt;
            nextUp.push(up);
            visualUp.push({
              id: up.id,
              x: up.x,
              y: up.y,
              rot: up.rot,
              opacity: Math.max(0, Math.min(1, up.life / up.maxLife)),
              variant: up.variant,
              kind: up.kind,
            });
          }
          s.uprooted = nextUp;
          setUprootedTulips(visualUp);
        }

        // 2) Periodic layout sync
        layoutSyncCooldown -= dt;
        if (layoutSyncCooldown <= 0) {
          layoutSyncCooldown = 0.12;
          syncGardenLayout();
        }

        // Helper to update a GiantLandmark in state
        const updateGiantStage = (id: number, stage: 1 | 2 | 3) => {
          s.giantLandmarks = s.giantLandmarks.map((g) => (g.id === id ? { ...g, stage } : g));
          setGiantLandmarks([...s.giantLandmarks]);
        };

        // 3) Active Hero state machine
        if (s.mode === 'jumping') {
          s.jumpT = Math.min(1, s.jumpT + dt / s.jumpDuration);
          const t = s.jumpT;
          const easeX = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          s.x = s.jumpStartX + (s.jumpEndX - s.jumpStartX) * easeX;
          s.y = s.jumpStartY + (s.jumpEndY - s.jumpStartY) * t - 4 * t * (1 - t) * s.jumpArcHeight;
          setSquash({ sx: 0.92, sy: 1.1, rot: s.facing * (t < 0.5 ? -10 : 8) * Math.sin(t * Math.PI) });
          setPos({ x: s.x, y: s.y });

          if (t >= 1) {
            if (s.landingIntoGame) {
              s.mode = 'in-game';
              s.currentEl = s.pendingEl;
              s.pendingEl = null;
              setMode('in-game');
              emitSparks(s.x + heroW / 2, s.y + heroH - 6, 8);
            } else {
              s.mode = 'perched';
              s.currentEl = s.pendingEl;
              s.pendingEl = null;
              s.squashTimer = 0.22;
              s.walkPause = 0.65 + Math.random() * 1.1;
              if (s.currentEl && document.body.contains(s.currentEl)) {
                const r = getDocRect(s.currentEl);
                s.y = r.top - heroH + 5;
                s.walkTargetX = pickTargetXOnCard(r, heroW);
              }
              setMode('perched');
              emitSparks(s.x + heroW / 2, s.y + heroH - 4, 6);
            }
          }
        } else if (
          ((s.mode === 'tossing' ||
            s.mode === 'planting' ||
            s.mode === 'ee-baby' ||
            s.mode === 'ee-giant') &&
            (!s.currentEl || !document.body.contains(s.currentEl))) ||
          (s.mode === 'ee-building' &&
            (!s.buildingState.siteEl || !document.body.contains(s.buildingState.siteEl)))
        ) {
          s.mode = 'perched';
          setMode('perched');
          setWalking(false);
          setExpression('normal');
          setLeafTilt(0);
          setCarryingFlower(null);
          setSquash({ sx: 1, sy: 1, rot: 0 });
          setHatchingSprout(null);
          pickBestPerchForViewport();
        } else if (s.mode === 'tossing' && s.currentEl) {
          const r = getDocRect(s.currentEl);
          s.y = r.top - heroH + 5;
          s.actionTimer += dt;
          const t = s.actionTimer;

          if (t < 0.28) {
            const p = t / 0.28;
            setSquash({ sx: 1 + 0.06 * p, sy: 1 - 0.08 * p, rot: -13 * p * s.facing });
            setLeafTilt(-24 * p);
          } else {
            if (s.actionPhase === 0) {
              s.actionPhase = 1;
              launchSeeds(
                s.currentEl,
                s.tossSeedCount,
                s.x + heroW / 2 + s.facing * 10,
                s.y + heroH * 0.52,
                s.facing,
                false,
                s.heroSpecies
              );
              if (s.actionWithSpeech) {
                const lines = isSunHero
                  ? ['sun seeds! 🌻', 'grow! ☀️', 'shine! ✨']
                  : ['seeds! 🌱', 'grow!', 'sprout! ✨', 'bloom! 🌷'];
                showSpeech(lines[Math.floor(Math.random() * lines.length)], 1000);
              }
            }
            const decay = 1 - Math.min(1, (t - 0.28) / 0.4);
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
          s.y = r.top - heroH + 5;
          s.actionTimer += dt;
          const t = s.actionTimer;
          const spotX = r.left + s.plantSpotRelX;
          const spotY = r.top + 3;

          if (t < 0.35) {
            const p = t / 0.35;
            setSquash({ sx: 1 + 0.16 * p, sy: 1 - 0.22 * p, rot: 10 * p * s.facing });
            setLeafTilt(10 * p);
            if (t >= 0.25 && s.actionPhase === 0) {
              s.actionPhase = 1;
              emitSparks(spotX, spotY, 4, ['#B45309', '#EA7824']);
            }
          } else if (t < 1.05) {
            const patT = (t - 0.35) / 0.7;
            const wave = Math.sin(patT * Math.PI * 6);
            setSquash({ sx: 1.14 + wave * 0.04, sy: 0.78 - wave * 0.04, rot: (9 + wave * 4) * s.facing });
            setLeafTilt(16 + wave * 18);
            if (s.actionPhase === 1 && patT > 0.2) {
              s.actionPhase = 2;
              emitSparks(spotX, spotY, 4, ['#FBBF24', '#EA7824']);
              if (s.actionWithSpeech) {
                showSpeech(isSunHero ? 'pat pat 🌻' : 'pat pat 🌱', 1050);
              }
            } else if (s.actionPhase === 2 && patT > 0.7) {
              s.actionPhase = 3;
              emitSparks(spotX, spotY, 5, ['#22C55E', '#FBBF24']);
            }
          } else {
            const p = Math.min(1, (t - 1.05) / 0.55);
            const ease = 1 - Math.pow(1 - p, 2);
            s.x = s.plantStartX + (s.plantBackX - s.plantStartX) * ease;
            setPos({ x: s.x, y: s.y - 4 * p * (1 - p) * 14 });
            setSquash({ sx: 1, sy: 1 + Math.sin(p * Math.PI) * 0.08, rot: 0 });
            setLeafTilt(0);
            if (s.actionPhase < 4) {
              s.actionPhase = 4;
              setExpression('happy');
              spawnPlantedTulip(
                s.currentEl,
                s.plantSpotRelX,
                isSunHero ? 'gold' : pickTulipVariant(true),
                undefined,
                s.heroSpecies
              );
              emitSparks(spotX, spotY, 6, ['#22C55E', '#EA7824', '#FBBF24']);
            }
          }
          if (t < 1.05) setPos({ x: s.x, y: s.y });

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
          s.y = r.top - heroH + 5;
          s.eeSpotX = r.left + s.eeSpotRelX;
          s.eeSpotY = r.top + 3;
          s.actionTimer += dt;
          const t = s.actionTimer;

          if (t < 1.25) {
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
            if (s.actionPhase < 2) {
              s.actionPhase = 2;
              setHatchingSprout({ x: s.eeSpotX, y: s.eeSpotY, wobbling: false, species: s.heroSpecies });
              emitSparks(s.eeSpotX, s.eeSpotY, 6, ['#FBBF24', '#22C55E']);
            }
            const p = (t - 1.25) / 0.4;
            const ease = 1 - Math.pow(1 - p, 2);
            s.x = s.plantStartX + (s.eeBackX - s.plantStartX) * ease;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 1, sy: 1, rot: 0 });
            setLeafTilt(0);
          } else if (t < 2.5) {
            if (s.actionPhase < 3) {
              s.actionPhase = 3;
              setHatchingSprout({ x: s.eeSpotX, y: s.eeSpotY, wobbling: true, species: s.heroSpecies });
              setExpression('surprised');
              showSpeech('wait...?!', 950);
            }
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 0.97, sy: 1.05, rot: Math.sin(t * 20) * 3 });
          } else {
            if (s.actionPhase < 4) {
              s.actionPhase = 4;
              setHatchingSprout(null);
              emitSparks(s.eeSpotX, s.eeSpotY - 12, 12, ['#EA7824', '#2857A4', '#FBBF24', '#6AA2FF']);
              setExpression('happy');
              showSpeech(isSunHero ? 'mini sun!! 🌻' : 'a friend!! 🌷', 1500);

              const b = s.baby;
              b.active = true;
              b.species = s.heroSpecies;
              b.morphedSpecies = null;
              b.pokeCount = 0;
              b.arc = 'none';
              b.flee = {
                active: false,
                mood: 'nimble',
                moodTimer: 0,
                chaseDuration: 0,
                dodgeCooldown: 0,
                speechCooldown: 0,
                puffCooldown: 0,
                tiredPauseTimer: 0,
              };
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
              setBabySpecies(s.heroSpecies);
              setBabyMorphedSpecies(null);
              setBabyMood('normal');
              setBabyVisible(true);
              setBabyPos({ x: b.x, y: b.y });
              setBabyFacing(b.facing);
              setBabyJumping(true);
              showBabySpeech(isSunHero ? 'sunny!! ☀️' : 'hi!! 🌱', 1400);
            }
            const p = Math.min(1, (t - 2.5) / 0.5);
            setPos({ x: s.x, y: s.y - 4 * p * (1 - p) * 18 });
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
          const baseY = r.top - heroH + 5;
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
          } else if (t < 3.55) {
            s.y = baseY;
            setPos({ x: s.x, y: s.y });
            if (s.actionPhase < 2 && t >= 1.7) {
              s.actionPhase = 2;
              const newGiant: GiantLandmarkState = {
                id: s.eeLandmarkId,
                species: s.heroSpecies,
                el: s.currentEl,
                relX: s.eeSpotRelX,
                x: s.eeSpotX,
                y: s.eeSpotY,
                stage: 1,
                visible: true,
              };
              s.giantLandmarks = [...s.giantLandmarks, newGiant];
              setGiantLandmarks(s.giantLandmarks);
              emitSparks(s.eeSpotX, s.eeSpotY - 10, 8, ['#22C55E', '#FBBF24']);
            } else if (s.actionPhase < 3 && t >= 2.28) {
              s.actionPhase = 3;
              updateGiantStage(s.eeLandmarkId, 2);
              setExpression('surprised');
              showSpeech('woah!! 😮', 1200);
              emitSparks(s.eeSpotX, s.eeSpotY - 48, 9, ['#EA7824', '#FBBF24']);
            } else if (s.actionPhase < 4 && t >= 2.92) {
              s.actionPhase = 4;
              updateGiantStage(s.eeLandmarkId, 3);
              emitSparks(s.eeSpotX, s.eeSpotY - 105, 14, ['#FBBF24', '#EA7824', '#4ADE80']);
            }
            setSquash({ sx: 1, sy: 1, rot: -4 * s.facing });
          } else if (isSunHero) {
            // Jack-and-the-Beanstalk 2-leaf climb for Giant Sunflower!
            const l1X = s.eeSpotX + GIANT_SUNFLOWER_LEAF1_X - heroW / 2;
            const l1Y = s.eeSpotY + GIANT_SUNFLOWER_LEAF1_Y - heroH + 6;
            const l2X = s.eeSpotX + GIANT_SUNFLOWER_LEAF2_X - heroW / 2;
            const l2Y = s.eeSpotY + GIANT_SUNFLOWER_LEAF2_Y - heroH + 6;

            if (t < 4.15) {
              if (s.actionPhase < 5) {
                s.actionPhase = 5;
                s.facing = l1X >= s.x ? 1 : -1;
                setFacing(s.facing);
                setExpression('normal');
                emitSparks(s.x + heroW / 2, baseY + heroH - 4, 6, ['#FACC15', '#22C55E']);
              }
              const p = (t - 3.55) / 0.6;
              const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
              s.x = s.eeBackX + (l1X - s.eeBackX) * easeX;
              s.y = baseY + (l1Y - baseY) * p - 4 * p * (1 - p) * 58;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 0.92, sy: 1.09, rot: s.facing * -8 * Math.sin(p * Math.PI) });
            } else if (t < 4.45) {
              if (s.actionPhase < 6) {
                s.actionPhase = 6;
                showSpeech('higher! 🌿', 700);
                emitSparks(l1X + heroW / 2, l1Y + heroH - 4, 4, ['#22C55E', '#FACC15']);
              }
              s.x = l1X;
              s.y = l1Y;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 1.08, sy: 0.92, rot: 0 });
            } else if (t < 5.1) {
              if (s.actionPhase < 7) {
                s.actionPhase = 7;
                s.facing = l2X >= s.x ? 1 : -1;
                setFacing(s.facing);
                emitSparks(s.x + heroW / 2, s.y + heroH - 4, 5, ['#FACC15', '#22C55E']);
              }
              const p = (t - 4.45) / 0.65;
              const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
              s.x = l1X + (l2X - l1X) * easeX;
              s.y = l1Y + (l2Y - l1Y) * p - 4 * p * (1 - p) * 52;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 0.92, sy: 1.1, rot: s.facing * -8 * Math.sin(p * Math.PI) });
            } else if (t < 7.1) {
              if (s.actionPhase < 8) {
                s.actionPhase = 8;
                setExpression('happy');
                showSpeech('top of the world! ☀️', 1750);
                emitSparks(l2X + heroW / 2, l2Y + heroH - 4, 7, ['#FACC15', '#FEF08A']);
              }
              s.x = l2X;
              s.y = l2Y;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 1, sy: 1, rot: Math.sin((t - 5.1) * 3.2) * 2.5 });
            } else {
              if (s.actionPhase < 9) {
                s.actionPhase = 9;
                setExpression('normal');
                showSpeech('wheee!! 🌻', 900);
              }
              const p = Math.min(1, (t - 7.1) / 0.75);
              const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
              s.x = l2X + (s.eeBackX - l2X) * easeX;
              s.y = l2Y + (baseY - l2Y) * p - 4 * p * (1 - p) * 66;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 0.93, sy: 1.08, rot: s.facing * 8 * Math.sin(p * Math.PI) });
            }
          } else {
            // Giant Tulip single-leaf perch!
            const leafX = s.eeSpotX + GIANT_LEAF_OFFSET_X - heroW / 2;
            const leafY = s.eeSpotY + GIANT_LEAF_OFFSET_Y - heroH + 6;
            if (t < 4.25) {
              if (s.actionPhase < 5) {
                s.actionPhase = 5;
                s.facing = leafX >= s.x ? 1 : -1;
                setFacing(s.facing);
                setExpression('normal');
                emitSparks(s.x + heroW / 2, s.y + heroH - 4, 6);
              }
              const p = (t - 3.55) / 0.7;
              const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
              s.x = s.eeBackX + (leafX - s.eeBackX) * easeX;
              s.y = baseY + (leafY - baseY) * p - 4 * p * (1 - p) * 76;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 0.92, sy: 1.09, rot: s.facing * -8 * Math.sin(p * Math.PI) });
            } else if (t < 6.65) {
              if (s.actionPhase < 6) {
                s.actionPhase = 6;
                setExpression('happy');
                showSpeech('what a view! ✨', 1700);
                emitSparks(s.x + heroW / 2, s.y + heroH - 4, 5);
              }
              s.x = leafX;
              s.y = leafY;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 1, sy: 1, rot: Math.sin((t - 4.25) * 3.2) * 2.5 });
            } else {
              if (s.actionPhase < 7) {
                s.actionPhase = 7;
                setExpression('normal');
                showSpeech('wheee!', 900);
              }
              const p = Math.min(1, (t - 6.65) / 0.8);
              const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
              s.x = leafX + (s.eeBackX - leafX) * easeX;
              s.y = leafY + (baseY - leafY) * p - 4 * p * (1 - p) * 58;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 0.93, sy: 1.08, rot: s.facing * 8 * Math.sin(p * Math.PI) });
            }
          }

          if (t >= s.actionDuration) {
            s.mode = 'perched';
            s.squashTimer = 0.22;
            s.walkPause = 0.9 + Math.random() * 1.0;
            s.y = baseY;
            setMode('perched');
            setExpression('normal');
            setLeafTilt(0);
            emitSparks(s.x + heroW / 2, s.y + heroH - 4, 6);
            recheckViewportIfNeeded();
          }
        } else if (s.mode === 'ee-building' && s.buildingState.siteEl) {
          const siteEl = s.buildingState.siteEl;
          const r = getDocRect(siteEl);
          const baseY = r.top - heroH + 5;
          s.eeSpotX = r.left + s.eeSpotRelX;
          s.eeSpotY = r.top + 3;
          const bs = s.buildingState;
          bs.timer += dt;

          const curEl = s.currentEl && document.body.contains(s.currentEl) ? s.currentEl : siteEl;
          const curR = getDocRect(curEl);
          const curBaseY = curR.top - heroH + 5;

          const pickHarvestTarget = (): PlantedTulip | null => {
            const onSite = s.tulips.filter(
              (t) => t.el === siteEl && !t.fading && (t.kind ?? 'tulip') === s.heroSpecies
            );
            if (onSite.length > 0) {
              return onSite.reduce((best, cur) =>
                Math.abs(cur.relX - s.eeSpotRelX) > Math.abs(best.relX - s.eeSpotRelX) ? cur : best
              );
            }
            const vh = window.innerHeight;
            const onNeighbors = s.tulips.filter((t) => {
              if (t.el === siteEl || t.fading || !document.body.contains(t.el)) return false;
              if ((t.kind ?? 'tulip') !== s.heroSpecies || t.el.dataset.tulipPerch === 'game') return false;
              const tr = t.el.getBoundingClientRect();
              return tr.width > 90 && tr.top > 60 && tr.top < vh - 30;
            });
            if (onNeighbors.length === 0) return null;
            return onNeighbors.reduce((best, cur) =>
              Math.hypot(cur.x - s.x, cur.y - s.y) < Math.hypot(best.x - s.x, best.y - s.y) ? cur : best
            );
          };

          const startJumpBackToSite = (carrying: boolean) => {
            const siteBuddyX = Math.min(
              Math.max(r.left + 16, s.eeSpotX - heroW / 2),
              Math.max(r.left + 16, r.right - 16 - heroW)
            );
            bs.jumpStartX = s.x;
            bs.jumpStartY = s.y;
            bs.jumpEndX = siteBuddyX;
            bs.jumpEndY = baseY;
            bs.jumpDuration = 0.46;
            bs.targetEl = siteEl;
            bs.plucked = carrying;
            bs.phase = 'jump-to-site';
            bs.timer = 0;
            const dir: 1 | -1 = siteBuddyX >= s.x ? 1 : -1;
            if (dir !== s.facing) {
              s.facing = dir;
              setFacing(dir);
            }
            setWalking(false);
            emitSparks(s.x + heroW / 2, s.y + heroH - 4, 5);
          };

          if (bs.phase === 'idea') {
            const p = Math.min(1, bs.timer / 0.6);
            s.y = baseY - 4 * p * (1 - p) * 32;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 0.95, sy: 1.06, rot: 0 });
            if (s.actionPhase === 0 && bs.timer > 0.08) {
              s.actionPhase = 1;
              emitSparks(s.x + heroW / 2, baseY + heroH - 6, 6, ['#FBBF24', '#EA7824']);
            }
            if (bs.timer >= 0.6) {
              bs.timer = 0;
              if (bs.needsSeeds > 0) {
                bs.phase = 'seed-prep';
                bs.seedsTossed = false;
                showSpeech(isSunHero ? 'need sunflowers! 🌻' : 'need tulips! 🌱', 1100);
              } else {
                bs.phase = 'to-bloom';
              }
            }
          } else if (bs.phase === 'seed-prep') {
            s.y = baseY;
            setPos({ x: s.x, y: s.y });
            if (!bs.seedsTossed && bs.timer >= 0.15) {
              bs.seedsTossed = true;
              const batch = Math.min(bs.needsSeeds, 5);
              for (let i = 0; i < batch; i++) {
                const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
                launchSeeds(
                  siteEl,
                  1,
                  s.x + heroW / 2 + dir * 8,
                  s.y + heroH * 0.5,
                  dir,
                  true,
                  s.heroSpecies
                );
              }
              setLeafTilt(18);
            } else if (bs.timer >= 0.35) {
              setLeafTilt(0);
            }
            if (bs.seedsTossed && (s.seeds.length === 0 || bs.timer >= 1.15)) {
              bs.seedsTossed = false;
              bs.phase = 'to-bloom';
              bs.timer = 0;
            }
          } else if (bs.phase === 'to-bloom') {
            let target =
              bs.targetBloomId !== null
                ? s.tulips.find(
                    (t) => t.id === bs.targetBloomId && !t.fading && document.body.contains(t.el)
                  ) ?? null
                : null;
            if (!target) {
              target = pickHarvestTarget();
              if (target) bs.targetBloomId = target.id;
            }

            if (!target) {
              if (curEl !== siteEl) {
                startJumpBackToSite(false);
              } else {
                bs.needsSeeds = Math.max(1, BUILDING_TOTAL_HARVEST - bs.stagesBuilt);
                bs.seedsTossed = false;
                bs.phase = 'seed-prep';
                bs.timer = 0;
                showSpeech('need more! 🌱', 1000);
              }
            } else if (target.el !== curEl) {
              const tr = getDocRect(target.el);
              const targetBuddyX = Math.min(
                Math.max(tr.left + 16, target.x - heroW / 2),
                Math.max(tr.left + 16, tr.right - 16 - heroW)
              );
              bs.jumpStartX = s.x;
              bs.jumpStartY = s.y;
              bs.jumpEndX = targetBuddyX;
              bs.jumpEndY = tr.top - heroH + 5;
              bs.jumpDuration = 0.44;
              bs.targetEl = target.el;
              bs.phase = 'jump-to-bloom';
              bs.timer = 0;
              const dir: 1 | -1 = targetBuddyX >= s.x ? 1 : -1;
              if (dir !== s.facing) {
                s.facing = dir;
                setFacing(dir);
              }
              setWalking(false);
              emitSparks(s.x + heroW / 2, s.y + heroH - 4, 5);
            } else {
              const targetBuddyX = Math.min(
                Math.max(curR.left + 16, target.x - heroW / 2),
                Math.max(curR.left + 16, curR.right - 16 - heroW)
              );
              const dx = targetBuddyX - s.x;
              if (Math.abs(dx) <= 5) {
                s.x = targetBuddyX;
                s.y = curBaseY;
                setWalking(false);
                setPos({ x: s.x, y: s.y });
                bs.phase = 'pluck';
                bs.timer = 0;
                bs.plucked = false;
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
          } else if (bs.phase === 'jump-to-bloom') {
            if (!bs.targetEl || !document.body.contains(bs.targetEl)) {
              s.currentEl = siteEl;
              s.x = Math.min(Math.max(r.left + 20, s.x), Math.max(r.left + 20, r.right - 20 - heroW));
              s.y = baseY;
              bs.targetBloomId = null;
              bs.phase = 'to-bloom';
              bs.timer = 0;
            } else {
              const p = Math.min(1, bs.timer / bs.jumpDuration);
              const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
              s.x = bs.jumpStartX + (bs.jumpEndX - bs.jumpStartX) * easeX;
              s.y = bs.jumpStartY + (bs.jumpEndY - bs.jumpStartY) * p - 4 * p * (1 - p) * 64;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 0.92, sy: 1.09, rot: s.facing * -8 * Math.sin(p * Math.PI) });
              if (p >= 1) {
                s.currentEl = bs.targetEl;
                s.x = bs.jumpEndX;
                s.y = bs.jumpEndY;
                setPos({ x: s.x, y: s.y });
                setSquash({ sx: 1, sy: 1, rot: 0 });
                emitSparks(s.x + heroW / 2, s.y + heroH - 4, 4);
                bs.phase = 'pluck';
                bs.timer = 0;
                bs.plucked = false;
              }
            }
          } else if (bs.phase === 'pluck') {
            s.y = curBaseY;
            setPos({ x: s.x, y: s.y });
            const p = Math.min(1, bs.timer / 0.38);
            const tug = Math.sin(p * Math.PI * 3);
            setSquash({
              sx: 1 + 0.16 * Math.sin(p * Math.PI),
              sy: 1 - 0.24 * Math.sin(p * Math.PI),
              rot: (9 * Math.sin(p * Math.PI) + tug * 4) * s.facing,
            });
            setLeafTilt(24 * Math.sin(p * Math.PI));

            if (!bs.plucked && bs.timer >= 0.18) {
              bs.plucked = true;
              const plucked = s.tulips.find((t) => t.id === bs.targetBloomId);
              const variant: TulipVariant = plucked ? plucked.variant : isSunHero ? 'gold' : 'brand';
              if (plucked) {
                emitSparks(plucked.x, plucked.y - 10, 8, ['#22C55E', '#EA7824', '#FBBF24']);
                s.tulips = s.tulips.filter((t) => t.id !== plucked.id);
                setTulips([...s.tulips]);
              }
              bs.harvestedVariants.push(variant);
              setCarryingFlower({ variant, kind: s.heroSpecies });
              if (bs.stagesBuilt === 0) showSpeech(isSunHero ? 'yoink! 🌻' : 'yoink! 🌷', 850);
              else if (bs.stagesBuilt === 3) showSpeech(isSunHero ? 'grab! 🌻' : 'grab! 🌷', 850);
            }

            if (bs.timer >= 0.38) {
              setSquash({ sx: 1, sy: 1, rot: 0 });
              setLeafTilt(-12);
              if (curEl !== siteEl) startJumpBackToSite(true);
              else {
                bs.phase = 'to-site';
                bs.timer = 0;
              }
            }
          } else if (bs.phase === 'jump-to-site') {
            const p = Math.min(1, bs.timer / bs.jumpDuration);
            const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            s.x = bs.jumpStartX + (bs.jumpEndX - bs.jumpStartX) * easeX;
            s.y = bs.jumpStartY + (baseY - bs.jumpStartY) * p - 4 * p * (1 - p) * 68;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 0.92, sy: 1.09, rot: s.facing * -8 * Math.sin(p * Math.PI) });
            if (p >= 1) {
              s.currentEl = siteEl;
              s.x = bs.jumpEndX;
              s.y = baseY;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 1, sy: 1, rot: 0 });
              emitSparks(s.x + heroW / 2, s.y + heroH - 4, 4);
              bs.timer = 0;
              if (bs.plucked) {
                bs.phase = 'place';
                bs.placed = false;
              } else {
                bs.phase = 'to-bloom';
              }
            }
          } else if (bs.phase === 'to-site') {
            const siteBuddyX = Math.min(
              Math.max(r.left + 16, s.eeSpotX - heroW / 2),
              Math.max(r.left + 16, r.right - 16 - heroW)
            );
            const dx = siteBuddyX - s.x;
            if (Math.abs(dx) <= 8) {
              setWalking(false);
              s.y = baseY;
              setPos({ x: s.x, y: s.y });
              bs.phase = 'place';
              bs.timer = 0;
              bs.placed = false;
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
          } else if (bs.phase === 'place') {
            s.y = baseY;
            setPos({ x: s.x, y: s.y });
            const p = Math.min(1, bs.timer / 0.32);
            setLeafTilt(-28 * (1 - p));
            setSquash({ sx: 0.96, sy: 1 + 0.08 * Math.sin(p * Math.PI), rot: -6 * (1 - p) * s.facing });

            if (!bs.placed && bs.timer >= 0.11) {
              bs.placed = true;
              setCarryingFlower(null);
              bs.stagesBuilt += 1;
              const sailVariants = bs.harvestedVariants.slice(3);
              const sailColors = [0, 1, 2, 3].map((idx) => {
                const v = sailVariants[idx];
                return v ? getVariantSailColor(v, idx) : idx % 2 === 0 ? '#EA7824' : '#2857A4';
              });
              const stage = Math.min(7, bs.stagesBuilt) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
              const updated: BuildingLandmarkState = {
                id: s.eeLandmarkId,
                species: s.heroSpecies,
                el: siteEl,
                relX: s.eeSpotRelX,
                x: s.eeSpotX,
                y: s.eeSpotY,
                stage,
                visible: true,
                sailColors,
              };
              const exists = s.buildingLandmarks.some((b) => b.id === s.eeLandmarkId);
              s.buildingLandmarks = exists
                ? s.buildingLandmarks.map((b) => (b.id === s.eeLandmarkId ? updated : b))
                : [...s.buildingLandmarks, updated];
              setBuildingLandmarks(s.buildingLandmarks);

              const emoji = isSunHero ? '🌻' : '🌷';
              if (stage < 7) {
                showSpeech(`${stage}/7 ${emoji}`, 750);
                emitSparks(s.eeSpotX, s.eeSpotY - Math.min(44, stage * 7), 7, ['#FACC15', '#22C55E', '#EA7824']);
              } else {
                showSpeech(isSunHero ? '7/7 🏡' : '7/7 🌬️', 850);
                emitSparks(s.eeSpotX, s.eeSpotY - 48, 14, ['#FACC15', '#22C55E', '#EA7824']);
              }
            }

            if (bs.timer >= 0.32) {
              setLeafTilt(0);
              setSquash({ sx: 1, sy: 1, rot: 0 });
              bs.timer = 0;
              if (bs.stagesBuilt < BUILDING_TOTAL_HARVEST) {
                bs.targetBloomId = null;
                bs.plucked = false;
                bs.phase = 'to-bloom';
              } else {
                bs.phase = 'to-admire';
              }
            }
          } else if (bs.phase === 'to-admire') {
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
              const faceSite: 1 | -1 = s.eeSpotX >= s.x ? 1 : -1;
              if (faceSite !== s.facing) {
                s.facing = faceSite;
                setFacing(faceSite);
              }
              s.y = baseY;
              setPos({ x: s.x, y: s.y });
              bs.phase = 'celebrate';
              bs.timer = 0;
              bs.celebrated = false;
            }
          } else {
            if (!bs.celebrated) {
              bs.celebrated = true;
              setWalking(false);
              setExpression('happy');
              showSpeech(isSunHero ? 'ta-da!! 🏡☀️' : 'ta-da!! 🌬️🌷', 1600);
              emitSparks(s.x + heroW / 2, baseY + heroH - 6, 8);
            }
            const p = Math.min(1, bs.timer / 0.65);
            s.y = baseY - 4 * p * (1 - p) * 28;
            setPos({ x: s.x, y: s.y });
            setSquash({ sx: 1, sy: 1 + Math.sin(p * Math.PI) * 0.08, rot: 0 });
            if (bs.timer >= 1.15) {
              s.mode = 'perched';
              s.currentEl = siteEl;
              s.y = baseY;
              s.walkPause = 1.1;
              setMode('perched');
              setWalking(false);
              setExpression('normal');
              setLeafTilt(0);
              setCarryingFlower(null);
              setSquash({ sx: 1, sy: 1, rot: 0 });
              recheckViewportIfNeeded();
            }
          }
        } else if (s.mode === 'replacing') {
          // Post-coup Hero systematically uproots opposite-species blooms across visible cards!
          const opposite: FlowerSpecies = isSunHero ? 'tulip' : 'sunflower';
          const rs = s.replaceState;

          const findOppositeTarget = (): PlantedTulip | null => {
            const onCur = s.tulips.filter(
              (t) =>
                t.el === s.currentEl &&
                (t.kind ?? 'tulip') === opposite &&
                !t.fading &&
                document.body.contains(t.el)
            );
            if (onCur.length > 0) {
              return onCur.reduce((best, cur) =>
                Math.abs(cur.x - (s.x + heroW / 2)) < Math.abs(best.x - (s.x + heroW / 2)) ? cur : best
              );
            }
            const vh = window.innerHeight;
            const onVisible = s.tulips.filter((t) => {
              if ((t.kind ?? 'tulip') !== opposite || t.fading || !document.body.contains(t.el)) return false;
              if (t.el.dataset.tulipPerch === 'game') return false;
              const tr = t.el.getBoundingClientRect();
              return tr.width > 90 && tr.top > 70 && tr.top < vh - 30;
            });
            if (onVisible.length === 0) return null;
            return onVisible.reduce((best, cur) =>
              Math.hypot(cur.x - s.x, cur.y - s.y) < Math.hypot(best.x - s.x, best.y - s.y) ? cur : best
            );
          };

          if (rs.phase === 'search') {
            const target = findOppositeTarget();
            if (!target) {
              s.mode = 'perched';
              s.walkPause = 0.8;
              setMode('perched');
              setWalking(false);
              setExpression('normal');
              setLeafTilt(0);
              setSquash({ sx: 1, sy: 1, rot: 0 });
            } else {
              rs.targetId = target.id;
              rs.targetEl = target.el;
              rs.spotRelX = target.relX;
              rs.didAct = false;
              rs.timer = 0;
              if (target.el === s.currentEl) {
                rs.phase = 'run-to-bloom';
              } else {
                const tr = getDocRect(target.el);
                const endX = Math.min(
                  Math.max(tr.left + 16, target.x - heroW / 2),
                  Math.max(tr.left + 16, tr.right - 16 - heroW)
                );
                const endY = tr.top - heroH + 5;
                rs.jumpStartX = s.x;
                rs.jumpStartY = s.y;
                rs.jumpEndX = endX;
                rs.jumpEndY = endY;
                rs.jumpDuration = Math.min(0.65, Math.max(0.38, Math.hypot(endX - s.x, endY - s.y) / 680));
                rs.jumpArcHeight = Math.min(100, Math.max(44, Math.abs(endX - s.x) * 0.15 + 46));
                s.facing = endX >= s.x ? 1 : -1;
                setFacing(s.facing);
                setWalking(false);
                rs.phase = 'jump-to-bloom';
                emitSparks(s.x + heroW / 2, s.y + heroH - 4, 4);
              }
            }
          } else if (rs.phase === 'jump-to-bloom') {
            if (!rs.targetEl || !document.body.contains(rs.targetEl)) {
              rs.phase = 'search';
            } else {
              rs.timer += dt;
              const p = Math.min(1, rs.timer / rs.jumpDuration);
              const easeX = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
              s.x = rs.jumpStartX + (rs.jumpEndX - rs.jumpStartX) * easeX;
              s.y = rs.jumpStartY + (rs.jumpEndY - rs.jumpStartY) * p - 4 * p * (1 - p) * rs.jumpArcHeight;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 0.92, sy: 1.1, rot: s.facing * -8 * Math.sin(p * Math.PI) });
              if (p >= 1) {
                s.currentEl = rs.targetEl;
                s.x = rs.jumpEndX;
                s.y = rs.jumpEndY;
                setPos({ x: s.x, y: s.y });
                setSquash({ sx: 1, sy: 1, rot: 0 });
                rs.phase = 'uproot';
                rs.timer = 0;
                rs.didAct = false;
                emitSparks(s.x + heroW / 2, s.y + heroH - 4, 4);
              }
            }
          } else if (rs.phase === 'run-to-bloom') {
            const target = s.tulips.find(
              (t) => t.id === rs.targetId && !t.fading && document.body.contains(t.el)
            );
            if (!target || !s.currentEl || !document.body.contains(s.currentEl)) {
              rs.phase = 'search';
            } else {
              const r = getDocRect(s.currentEl);
              const baseY = r.top - heroH + 5;
              const spotBuddyX = Math.min(
                Math.max(r.left + 14, target.x - heroW / 2),
                Math.max(r.left + 14, r.right - 14 - heroW)
              );
              const dx = spotBuddyX - s.x;
              if (Math.abs(dx) <= 5) {
                s.x = spotBuddyX;
                s.y = baseY;
                setWalking(false);
                setPos({ x: s.x, y: s.y });
                rs.phase = 'uproot';
                rs.timer = 0;
                rs.didAct = false;
              } else {
                const dir: 1 | -1 = dx > 0 ? 1 : -1;
                if (dir !== s.facing) {
                  s.facing = dir;
                  setFacing(dir);
                }
                s.x += dir * Math.min(Math.abs(dx), 145 * dt);
                s.stride += dt * 22;
                s.y = baseY;
                setWalking(true);
                setStepPhase(Math.sin(s.stride));
                setSquash({ sx: 1, sy: 1, rot: Math.sin(s.stride) * 5 });
                setPos({ x: s.x, y: s.y + Math.abs(Math.sin(s.stride)) * -3 });
              }
            }
          } else if (rs.phase === 'uproot') {
            if (!s.currentEl || !document.body.contains(s.currentEl)) {
              rs.phase = 'search';
            } else {
              const r = getDocRect(s.currentEl);
              s.y = r.top - heroH + 5;
              rs.timer += dt;
              const p = Math.min(1, rs.timer / 0.5);
              const tug = Math.sin(p * Math.PI * 3);
              setSquash({
                sx: 1 + 0.15 * Math.sin(p * Math.PI),
                sy: 1 - 0.22 * Math.sin(p * Math.PI),
                rot: (8 * Math.sin(p * Math.PI) + tug * 4) * s.facing,
              });
              setLeafTilt(22 * Math.sin(p * Math.PI));
              setPos({ x: s.x, y: s.y });

              if (!rs.didAct && rs.timer >= 0.24) {
                rs.didAct = true;
                const plucked = s.tulips.find((t) => t.id === rs.targetId);
                if (plucked) {
                  s.tulips = s.tulips.filter((t) => t.id !== plucked.id);
                  setTulips([...s.tulips]);
                  s.uprooted.push({
                    id: s.uprootedSeq++,
                    x: plucked.x,
                    y: plucked.y - 10,
                    vx: -s.facing * (45 + Math.random() * 45),
                    vy: -150 - Math.random() * 55,
                    rot: 0,
                    vrot: -s.facing * (340 + Math.random() * 180),
                    life: 0.72,
                    maxLife: 0.72,
                    variant: plucked.variant,
                    kind: plucked.kind ?? 'tulip',
                  });
                  emitSparks(plucked.x, plucked.y - 4, 6, ['#B45309', '#22C55E', '#EA7824']);
                  if (rs.count % 3 === 0) {
                    const lines = isSunHero ? ['out! 🌷', 'nope! 🌻', 'yoink!'] : ['out! 🌻', 'tulips back! 🌷', 'yoink!'];
                    showSpeech(lines[rs.count % lines.length], 750);
                  }
                }
              }

              if (rs.timer >= 0.5) {
                rs.phase = 'replant';
                rs.timer = 0;
                rs.didAct = false;
              }
            }
          } else if (rs.phase === 'replant') {
            if (!s.currentEl || !document.body.contains(s.currentEl)) {
              rs.phase = 'search';
            } else {
              const r = getDocRect(s.currentEl);
              s.y = r.top - heroH + 5;
              rs.timer += dt;
              const t = rs.timer;
              if (t < 0.52) {
                const wave = Math.sin((t / 0.52) * Math.PI * 5);
                setSquash({ sx: 1.12, sy: 0.82, rot: (8 + wave * 4) * s.facing });
                setLeafTilt(14 + wave * 16);
                setPos({ x: s.x, y: s.y });
              } else {
                if (!rs.didAct) {
                  rs.didAct = true;
                  spawnPlantedTulip(
                    s.currentEl,
                    rs.spotRelX,
                    isSunHero ? 'gold' : pickTulipVariant(true),
                    0.85 + Math.random() * 0.2,
                    s.heroSpecies
                  );
                  emitSparks(
                    r.left + rs.spotRelX,
                    r.top + 3,
                    7,
                    isSunHero ? ['#FACC15', '#22C55E'] : ['#EA7824', '#2857A4', '#22C55E']
                  );
                  setExpression('happy');
                  rs.count += 1;
                  if (rs.count % 3 === 1) {
                    showSpeech(
                      isSunHero
                        ? Math.random() < 0.5
                          ? 'pat pat 🌻'
                          : 'much better! ☀️'
                        : Math.random() < 0.5
                          ? 'pat pat 🌷'
                          : 'restored! ✨',
                      850
                    );
                  }
                }
                const p = Math.min(1, (t - 0.52) / 0.28);
                setLeafTilt(0);
                setSquash({ sx: 1, sy: 1 + Math.sin(p * Math.PI) * 0.08, rot: 0 });
                setPos({ x: s.x, y: s.y - 4 * p * (1 - p) * 10 });
              }
              if (t >= 0.8) {
                setExpression('normal');
                setLeafTilt(0);
                setSquash({ sx: 1, sy: 1, rot: 0 });
                rs.phase = 'search';
                rs.timer = 0;
                rs.targetId = null;
                rs.targetEl = null;
              }
            }
          }
        } else if (s.mode === 'fighting') {
          if (s.currentEl && document.body.contains(s.currentEl) && s.baby.arc === 'approach-fight') {
            const fr = getDocRect(s.currentEl);
            s.y = fr.top - heroH + 5;
            setPos({ x: s.x, y: s.y });
          }
        } else if (s.mode === 'perched' && s.currentEl) {
          if (!document.body.contains(s.currentEl)) {
            pickBestPerchForViewport();
          } else {
            const r = getDocRect(s.currentEl);
            const targetTop = r.top - heroH + 5;
            s.y += (targetTop - s.y) * Math.min(1, dt * 18);

            let isStrolling = false;
            if (s.squashTimer > 0) {
              s.squashTimer = Math.max(0, s.squashTimer - dt);
              const k = s.squashTimer / 0.22;
              setSquash({ sx: 1 + 0.2 * k, sy: 1 - 0.18 * k, rot: 0 });
            } else {
              // Adaptive cursor evasion (works identically for Tulip Buddy & Sunflower Guy!)
              const f = s.flee;
              f.dodgeCooldown = Math.max(0, f.dodgeCooldown - dt);
              f.speechCooldown = Math.max(0, f.speechCooldown - dt);
              f.puffCooldown = Math.max(0, f.puffCooldown - dt);
              f.alertTimer = Math.max(0, f.alertTimer - dt);

              const cursorActive = s.pointer.active && now - s.pointer.lastMoveAt < 1400;
              const dxCursor = s.pointer.x - (s.x + heroW / 2);
              const dyCursor = s.pointer.y - (s.y + heroH / 2);
              const distCursor = Math.hypot(dxCursor, dyCursor);
              const shouldFlee =
                cursorActive &&
                s.currentEl.dataset.tulipPerch !== 'game' &&
                Math.abs(dyCursor) < 92 &&
                distCursor < (f.active ? 155 : 118);

              if (shouldFlee) {
                if (!f.active) {
                  f.active = true;
                  f.alertTimer = 0.24;
                  setExpression('surprised');

                  if (f.moodTimer <= 0) {
                    const turboChance = Math.min(0.68, 0.22 + f.recentCatches * 0.16);
                    const roll = Math.random();
                    if (roll < turboChance) {
                      f.mood = 'turbo';
                      f.moodTimer = 2.6 + Math.random() * 1.4;
                    } else if (roll < turboChance + 0.14) {
                      f.mood = 'tired';
                      f.moodTimer = 2.2 + Math.random() * 0.9;
                      f.tiredPauseTimer = 0.35;
                    } else {
                      f.mood = 'playful';
                      f.moodTimer = 3.0 + Math.random() * 1.8;
                    }
                  }

                  if (f.speechCooldown <= 0) {
                    const moodLines =
                      f.mood === 'turbo'
                        ? ['nyoom! 💨', 'too slow!', 'turbo!! ⚡']
                        : f.mood === 'tired'
                          ? ['phew...']
                          : ['eek!', 'nope!', 'catch me!', 'hehe!'];
                    showSpeech(moodLines[Math.floor(Math.random() * moodLines.length)], 900);
                    f.speechCooldown = 2.3;
                  }
                }

                f.chaseDuration += dt;
                f.moodTimer -= dt;
                if (f.alertTimer <= 0) setExpression('normal');

                if (
                  (f.chaseDuration > 3.1 && f.mood !== 'tired') ||
                  (f.mood === 'turbo' && f.moodTimer <= 0)
                ) {
                  f.mood = 'tired';
                  f.moodTimer = 2.3;
                  f.tiredPauseTimer = 0.55;
                  f.recentCatches = 0;
                } else if (f.mood === 'tired' && f.moodTimer <= 0) {
                  f.mood = 'playful';
                  f.moodTimer = 2.6;
                  f.chaseDuration = 0;
                }

                const fleeDir: 1 | -1 = dxCursor >= 0 ? -1 : 1;
                const minX = r.left + 16;
                const maxX = Math.max(minX, r.right - 16 - heroW);
                const cornered =
                  (fleeDir === -1 && s.x <= minX + 12) || (fleeDir === 1 && s.x >= maxX - 12);

                if (f.mood === 'tired') {
                  if (f.tiredPauseTimer > 0) {
                    f.tiredPauseTimer = Math.max(0, f.tiredPauseTimer - dt);
                    setWalking(false);
                    const pant = Math.sin(now * 0.018) * 0.08;
                    setSquash({ sx: 1 + pant, sy: 1 - pant, rot: 0 });
                    setPos({ x: s.x, y: s.y });
                    if (f.speechCooldown <= 0) {
                      showSpeech('phew...', 850);
                      f.speechCooldown = 2.4;
                    }
                  } else {
                    isStrolling = true;
                    if (fleeDir !== s.facing) {
                      s.facing = fleeDir;
                      setFacing(fleeDir);
                    }
                    s.x = Math.min(maxX, Math.max(minX, s.x + fleeDir * 85 * dt));
                    s.stride += dt * 16;
                    setWalking(true);
                    setStepPhase(Math.sin(s.stride));
                    setSquash({ sx: 1, sy: 1, rot: 4 * fleeDir + Math.sin(s.stride) * 3 });
                    setPos({ x: s.x, y: s.y + Math.abs(Math.sin(s.stride)) * -2 });
                  }
                } else if (f.mood === 'playful') {
                  if (cornered && distCursor < 82 && f.dodgeCooldown <= 0) {
                    const vaultX =
                      fleeDir === -1
                        ? Math.min(maxX, r.left + r.width * 0.72)
                        : Math.max(minX, r.left + r.width * 0.22);
                    launchJumpTo(s.currentEl, false, vaultX);
                    s.jumpDuration = 0.44;
                    s.jumpArcHeight = 58;
                    f.dodgeCooldown = 1.6;
                  } else {
                    isStrolling = true;
                    if (fleeDir !== s.facing) {
                      s.facing = fleeDir;
                      setFacing(fleeDir);
                    }
                    s.x = Math.min(maxX, Math.max(minX, s.x + fleeDir * 185 * dt));
                    s.stride += dt * 28;
                    setWalking(true);
                    setStepPhase(Math.sin(s.stride));
                    setSquash({ sx: 1, sy: 1, rot: 10 * fleeDir + Math.sin(s.stride) * 4 });
                    setPos({ x: s.x, y: s.y + Math.abs(Math.sin(s.stride)) * -3.5 });
                    if (f.puffCooldown <= 0) {
                      f.puffCooldown = 0.22;
                      emitSparks(s.x + heroW / 2 - fleeDir * 10, s.y + heroH - 4, 2, ['#94A3B8', '#CBD5E1']);
                    }
                  }
                } else {
                  if ((distCursor < 68 || (cornered && distCursor < 115)) && f.dodgeCooldown <= 0) {
                    f.dodgeCooldown = 1.15;
                    const vh = window.innerHeight;
                    const peers = getPerches().filter((el) => {
                      if (el === s.currentEl || el.dataset.tulipPerch === 'game') return false;
                      const pr = el.getBoundingClientRect();
                      return pr.top > 110 && pr.top < vh * 0.78;
                    });
                    if (peers.length > 0 && Math.random() < 0.65) {
                      launchJumpTo(peers[Math.floor(Math.random() * peers.length)], false);
                      s.jumpDuration = Math.min(s.jumpDuration, 0.46);
                    } else {
                      const vaultX =
                        s.x < r.left + r.width * 0.5
                          ? Math.min(maxX, r.right - 26 - heroW)
                          : Math.max(minX, r.left + 26);
                      launchJumpTo(s.currentEl, false, vaultX);
                      s.jumpDuration = 0.38;
                      s.jumpArcHeight = 64;
                    }
                    if (f.speechCooldown <= 0) {
                      showSpeech(Math.random() < 0.5 ? 'nyoom! 💨' : 'too slow!', 850);
                      f.speechCooldown = 2.0;
                    }
                  } else {
                    isStrolling = true;
                    if (fleeDir !== s.facing) {
                      s.facing = fleeDir;
                      setFacing(fleeDir);
                    }
                    s.x = Math.min(maxX, Math.max(minX, s.x + fleeDir * 360 * dt));
                    s.stride += dt * 42;
                    setWalking(true);
                    setStepPhase(Math.sin(s.stride));
                    setSquash({ sx: 1, sy: 1, rot: 17 * fleeDir + Math.sin(s.stride) * 5 });
                    setPos({ x: s.x, y: s.y + Math.abs(Math.sin(s.stride)) * -4.5 });
                    if (f.puffCooldown <= 0) {
                      f.puffCooldown = 0.11;
                      emitSparks(
                        s.x + heroW / 2 - fleeDir * 12,
                        s.y + heroH - 6,
                        3,
                        isSunHero ? ['#FACC15', '#22C55E'] : ['#EA7824', '#FBBF24']
                      );
                    }
                  }
                }
              } else {
                if (f.active) {
                  f.active = false;
                  setExpression('normal');
                  s.walkPause = 0.55;
                }
                f.chaseDuration = Math.max(0, f.chaseDuration - dt * 1.5);
                f.moodTimer = Math.max(0, f.moodTimer - dt * 0.4);

                if (s.walkPause > 0) {
                  s.walkPause -= dt;
                  setWalking(false);
                  setSquash({ sx: 1, sy: 1, rot: Math.sin(now * 0.003) * 1.8 });
                } else {
                  const dx = s.walkTargetX - s.x;
                  if (Math.abs(dx) < 3) {
                    s.walkPause = 1.1 + Math.random() * 2.2;
                    s.walkTargetX = pickTargetXOnCard(r, heroW);
                    setWalking(false);
                  } else {
                    isStrolling = true;
                    const dir: 1 | -1 = dx > 0 ? 1 : -1;
                    if (dir !== s.facing) {
                      s.facing = dir;
                      setFacing(dir);
                    }
                    s.x += dir * Math.min(Math.abs(dx), 52 * dt);
                    s.stride += dt * 15;
                    setWalking(true);
                    setStepPhase(Math.sin(s.stride));
                    setSquash({ sx: 1, sy: 1, rot: Math.sin(s.stride) * 4.5 });
                    setPos({ x: s.x, y: s.y + Math.abs(Math.sin(s.stride)) * -3 });
                  }
                }

                // Periodically spot opposite-species blooms on newly scrolled cards!
                replaceCheckTimer -= dt;
                if (replaceCheckTimer <= 0) {
                  replaceCheckTimer = 2.5;
                  const opposite: FlowerSpecies = isSunHero ? 'tulip' : 'sunflower';
                  const vh = window.innerHeight;
                  const hasVisibleOpp = s.tulips.some((t) => {
                    if ((t.kind ?? 'tulip') !== opposite || t.fading || !document.body.contains(t.el)) {
                      return false;
                    }
                    if (t.el.dataset.tulipPerch === 'game') return false;
                    const tr = t.el.getBoundingClientRect();
                    return tr.width > 90 && tr.top > 70 && tr.top < vh - 30;
                  });
                  if (hasVisibleOpp) {
                    s.mode = 'replacing';
                    s.replaceState.phase = 'search';
                    setMode('replacing');
                    setWalking(false);
                  }
                }

                if (s.mode === 'perched') {
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
                }

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
                      launchJumpTo(peers[Math.floor(Math.random() * peers.length)], false);
                    }
                  }
                }
              }
            }

            if (!isStrolling && s.mode === 'perched') setPos({ x: s.x, y: s.y });
          }
        }

        // Decay any fallen buddy wiggle
        if (s.fallenBuddies.some((fb) => fb.wiggle !== 0)) {
          s.fallenBuddies = s.fallenBuddies.map((fb) =>
            fb.wiggle !== 0 ? { ...fb, wiggle: Math.abs(fb.wiggle) < 0.4 ? 0 : fb.wiggle * -0.78 } : fb
          );
          setFallenBuddies([...s.fallenBuddies]);
        }

        // 4) Baby Sidekick / Symmetric Coup simulation
        if (s.baby.active) {
          const b = s.baby;
          const effSpecies = b.morphedSpecies ?? b.species;
          const curW = b.morphedSpecies ? getHeroDims(effSpecies).w : BABY_W;
          const curH = b.morphedSpecies ? getHeroDims(effSpecies).h : BABY_H;
          const rivalSpecies: FlowerSpecies = b.species === 'tulip' ? 'sunflower' : 'tulip';

          if (b.arc === 'morphing') {
            b.arcTimer += dt;
            const curEl =
              b.currentEl && document.body.contains(b.currentEl)
                ? b.currentEl
                : getPerches().find((el) => el.dataset.tulipPerch !== 'game') ?? null;
            if (curEl) {
              b.currentEl = curEl;
              const br = getDocRect(curEl);
              b.y = br.top - curH + 4;
            }
            if (b.arcTimer < 1.1) {
              const wob = Math.sin(b.arcTimer * 30) * (8 + b.arcTimer * 8);
              const pulse = 1 + Math.sin(b.arcTimer * 24) * 0.14;
              setBabySquash({ sx: pulse, sy: 2 - pulse, rot: wob });
              setBabyPos({ x: b.x, y: b.y });
              if (b.arcStep === 0 && b.arcTimer > 0.25) {
                b.arcStep = 1;
                emitSparks(
                  b.x + curW / 2,
                  b.y + curH / 2,
                  8,
                  rivalSpecies === 'sunflower' ? ['#FACC15', '#F59E0B'] : ['#EA7824', '#2857A4']
                );
              }
            } else {
              if (b.arcStep < 2) {
                b.arcStep = 2;
                b.morphedSpecies = rivalSpecies;
                setBabyMorphedSpecies(rivalSpecies);
                setBabyMood('angry');
                const rivalDims = getHeroDims(rivalSpecies);
                b.x = b.x - (rivalDims.w - BABY_W) / 2;
                if (curEl) {
                  const br = getDocRect(curEl);
                  b.y = br.top - rivalDims.h + 4;
                  b.x = Math.min(
                    Math.max(br.left + 16, b.x),
                    Math.max(br.left + 16, br.right - 16 - rivalDims.w)
                  );
                }
                emitSparks(
                  b.x + rivalDims.w / 2,
                  b.y + rivalDims.h / 2,
                  14,
                  rivalSpecies === 'sunflower'
                    ? ['#FACC15', '#EA7824', '#22C55E']
                    : ['#EA7824', '#2857A4', '#FBBF24']
                );
                showBabySpeech(
                  rivalSpecies === 'sunflower' ? 'SUNFLOWER TIME! 🌻😈' : 'TULIP REVENGE! 🌷😈',
                  1300
                );
                if (s.mode === 'perched' || s.mode === 'tossing' || s.mode === 'planting' || s.mode === 'replacing') {
                  setExpression('surprised');
                  showSpeech('wait what?! 😮', 1100);
                }
              }
              const p = Math.min(1, (b.arcTimer - 1.1) / 0.45);
              setBabyPos({ x: b.x, y: b.y - 4 * p * (1 - p) * 26 });
              setBabySquash({ sx: 1, sy: 1 + Math.sin(p * Math.PI) * 0.12, rot: 0 });
            }

            if (b.arcTimer >= 2.0) {
              b.arc = 'approach-fight';
              b.arcTimer = 0;
              b.arcStep = 0;
              b.mode = 'perched';
            }
          } else if (b.arc === 'approach-fight') {
            b.arcTimer += dt;
            if (
              !s.currentEl ||
              !document.body.contains(s.currentEl) ||
              s.currentEl.dataset.tulipPerch === 'game' ||
              s.mode === 'in-game'
            ) {
              const fallbackEl =
                (b.currentEl && document.body.contains(b.currentEl) && b.currentEl.dataset.tulipPerch !== 'game'
                  ? b.currentEl
                  : null) || getPerches().find((el) => el.dataset.tulipPerch !== 'game') || null;
              if (fallbackEl) {
                const fr = getDocRect(fallbackEl);
                s.currentEl = fallbackEl;
                s.x = fr.left + fr.width * 0.62;
                s.y = fr.top - heroH + 5;
              }
            }

            if (!s.currentEl) {
              // Promote straight to replacing if no card available
              b.arc = 'victory';
              b.arcTimer = 1.15;
            } else {
              const tr = getDocRect(s.currentEl);
              if (s.mode !== 'fighting') {
                s.mode = 'fighting';
                setMode('fighting');
                setWalking(false);
                setLeafTilt(0);
                setCarryingFlower(null);
                setExpression('surprised');
                setSquash({ sx: 1, sy: 1, rot: 0 });
                s.y = tr.top - heroH + 5;
                s.facing = b.x >= s.x ? 1 : -1;
                setFacing(s.facing);
                setPos({ x: s.x, y: s.y });
                showSpeech('uh oh!! 😰', 1100);
              }

              const standLeft = s.x > tr.left + tr.width * 0.45;
              const targetX = Math.min(
                Math.max(tr.left + 16, s.x + (standLeft ? -42 : 42)),
                Math.max(tr.left + 16, tr.right - 16 - curW)
              );

              if (b.currentEl !== s.currentEl) {
                if (b.mode !== 'jumping') {
                  launchBabyJumpTo(s.currentEl, false, targetX);
                  b.jumpDuration = 0.5;
                } else {
                  b.jumpT = Math.min(1, b.jumpT + dt / b.jumpDuration);
                  const t = b.jumpT;
                  const easeX = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                  b.x = b.jumpStartX + (b.jumpEndX - b.jumpStartX) * easeX;
                  b.y = b.jumpStartY + (b.jumpEndY - b.jumpStartY) * t - 4 * t * (1 - t) * b.jumpArcHeight;
                  setBabyPos({ x: b.x, y: b.y });
                  setBabySquash({ sx: 0.92, sy: 1.1, rot: b.facing * -8 * Math.sin(t * Math.PI) });
                  if (t >= 1) {
                    b.mode = 'perched';
                    b.currentEl = s.currentEl;
                    setBabyJumping(false);
                    b.arc = 'fighting';
                    b.arcTimer = 0;
                    b.arcStep = 0;
                    b.fightOriginX = b.x;
                    b.fightHeroStartX = s.x;
                  }
                }
              } else {
                const dx = targetX - b.x;
                b.y = tr.top - curH + 4;
                if (Math.abs(dx) <= 6) {
                  b.x = targetX;
                  setBabyWalking(false);
                  setBabyPos({ x: b.x, y: b.y });
                  b.arc = 'fighting';
                  b.arcTimer = 0;
                  b.arcStep = 0;
                  b.fightOriginX = b.x;
                  b.fightHeroStartX = s.x;
                } else {
                  const dir: 1 | -1 = dx > 0 ? 1 : -1;
                  if (dir !== b.facing) {
                    b.facing = dir;
                    setBabyFacing(dir);
                  }
                  b.x += dir * Math.min(Math.abs(dx), 185 * dt);
                  b.stride += dt * 26;
                  setBabyWalking(true);
                  setBabyStepPhase(Math.sin(b.stride));
                  setBabyPos({ x: b.x, y: b.y + Math.abs(Math.sin(b.stride)) * -3 });
                  setBabySquash({ sx: 1, sy: 1, rot: Math.sin(b.stride) * 5 });
                }
              }
            }
          } else if (b.arc === 'fighting' && s.currentEl && document.body.contains(s.currentEl)) {
            const tr = getDocRect(s.currentEl);
            const heroBaseY = tr.top - heroH + 5;
            const rivalBaseY = tr.top - curH + 4;
            b.arcTimer += dt;
            const t = b.arcTimer;

            const rvDir: 1 | -1 = b.fightHeroStartX >= b.fightOriginX ? 1 : -1;
            const heroDir: 1 | -1 = rvDir === 1 ? -1 : 1;
            if (b.facing !== rvDir) {
              b.facing = rvDir;
              setBabyFacing(rvDir);
            }
            if (s.facing !== heroDir && t < 2.05) {
              s.facing = heroDir;
              setFacing(heroDir);
            }

            if (t < 0.85) {
              const p = t / 0.85;
              const lunge = Math.sin(p * Math.PI);
              b.x = b.fightOriginX + rvDir * lunge * 22;
              b.y = rivalBaseY - lunge * 10;
              s.x = b.fightHeroStartX + rvDir * Math.max(0, lunge - 0.3) * 14;
              s.y = heroBaseY;
              setBabyPos({ x: b.x, y: b.y });
              setBabySquash({ sx: 1.08, sy: 0.94, rot: rvDir * 14 * lunge });
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 1 - 0.1 * lunge, sy: 1 + 0.08 * lunge, rot: rvDir * 12 * lunge });
              if (b.arcStep === 0 && t > 0.25) {
                b.arcStep = 1;
                showBabySpeech('BONK! 💥', 750);
                emitSparks((b.x + s.x) / 2 + 20, heroBaseY + 24, 9, ['#FACC15', '#EA7824', '#FFFFFF']);
              }
            } else if (t < 1.65) {
              const p = (t - 0.85) / 0.8;
              const clash = Math.sin(p * Math.PI);
              b.x = b.fightOriginX + rvDir * clash * 18;
              b.y = rivalBaseY - clash * 24;
              s.x = b.fightHeroStartX - rvDir * clash * 12;
              s.y = heroBaseY - clash * 22;
              setBabyPos({ x: b.x, y: b.y });
              setBabySquash({ sx: 1, sy: 1.08, rot: rvDir * -10 * clash });
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 1, sy: 1.08, rot: heroDir * -10 * clash });
              if (b.arcStep < 2 && t > 1.05) {
                b.arcStep = 2;
                showSpeech('hey!!', 700);
                emitSparks((b.x + s.x) / 2 + 20, heroBaseY + 14, 10, ['#FACC15', '#2857A4', '#EA7824']);
              }
            } else if (t < 2.05) {
              const p = (t - 1.65) / 0.4;
              b.x = b.fightOriginX + rvDir * p * 26;
              b.y = rivalBaseY - 4 * p * (1 - p) * 56;
              setBabyPos({ x: b.x, y: b.y });
              setBabySquash({ sx: 0.9, sy: 1.14, rot: rvDir * 16 * Math.sin(p * Math.PI) });
              s.y = heroBaseY;
              setPos({ x: s.x, y: s.y });
              if (b.arcStep < 3) {
                b.arcStep = 3;
                showBabySpeech(
                  rivalSpecies === 'sunflower' ? 'SOLAR SLAM!! ☀️💥' : 'TULIP TORNADO!! 🌷💥',
                  950
                );
              }
            } else {
              if (b.arcStep < 4) {
                b.arcStep = 4;
                emitSparks(s.x + heroW / 2, heroBaseY + heroH * 0.45, 16, [
                  '#FACC15',
                  '#EA7824',
                  '#EF4444',
                  '#FFFFFF',
                ]);
                setExpression('ko');
                showSpeech('x_x', 1300);
              }
              const p = Math.min(1, (t - 2.05) / 0.6);
              const koEndX = Math.min(
                Math.max(tr.left + 20, b.fightHeroStartX + rvDir * 24),
                Math.max(tr.left + 20, tr.right - 20 - heroW)
              );
              s.x = b.fightHeroStartX + (koEndX - b.fightHeroStartX) * p;
              s.y = heroBaseY + p * 13 - 4 * p * (1 - p) * 32;
              setPos({ x: s.x, y: s.y });
              setSquash({ sx: 1, sy: 1, rot: 88 * s.facing * p });

              b.x = b.fightOriginX + rvDir * (1 - p) * 18;
              b.y = rivalBaseY;
              setBabyPos({ x: b.x, y: b.y });
              setBabySquash({ sx: 1, sy: 1, rot: 0 });
            }

            if (t >= 2.65) {
              // Archive defeated Hero into fallenBuddies (max 4)
              const fallenEntry: FallenBuddyState = {
                id: s.fallenSeq++,
                species: s.heroSpecies,
                el: s.currentEl,
                relX: s.x + heroW / 2 - tr.left,
                x: s.x,
                y: tr.top - heroH + 18,
                facing: s.facing,
                visible: true,
                wiggle: 0,
                speech: null,
              };
              s.fallenBuddies = [...s.fallenBuddies.slice(-3), fallenEntry];
              setFallenBuddies(s.fallenBuddies);

              b.arc = 'victory';
              b.arcTimer = 0;
              b.arcStep = 0;
              setBabyMood('happy');
              showBabySpeech(rivalSpecies === 'sunflower' ? 'HEHE! 🌻👑' : 'TULIPS RULE! 🌷👑', 1200);
            }
          } else if (b.arc === 'victory') {
            b.arcTimer += dt;
            if (b.currentEl && document.body.contains(b.currentEl)) {
              const br = getDocRect(b.currentEl);
              const rBaseY = br.top - curH + 4;
              const p = (b.arcTimer % 0.55) / 0.55;
              setBabyPos({ x: b.x, y: rBaseY - 4 * p * (1 - p) * 24 });
              setBabySquash({ sx: 1, sy: 1 + Math.sin(p * Math.PI) * 0.1, rot: 0 });
              if (b.arcStep === 0 && b.arcTimer > 0.15) {
                b.arcStep = 1;
                emitSparks(b.x + curW / 2, rBaseY + curH - 6, 10, ['#FACC15', '#22C55E', '#EA7824']);
              }
            }
            if (b.arcTimer >= 1.15) {
              // Promotion handoff: rival becomes the new active Hero!
              const newSpecies = b.morphedSpecies ?? rivalSpecies;
              const newDims = getHeroDims(newSpecies);
              s.heroSpecies = newSpecies;
              setHeroSpecies(newSpecies);
              s.currentEl = b.currentEl;
              s.x = b.x;
              if (b.currentEl && document.body.contains(b.currentEl)) {
                s.y = getDocRect(b.currentEl).top - newDims.h + 5;
              } else {
                s.y = b.y;
              }
              s.facing = b.facing;
              setFacing(s.facing);
              setPos({ x: s.x, y: s.y });
              setExpression('normal');
              setSquash({ sx: 1, sy: 1, rot: 0 });
              setLeafTilt(0);
              setCarryingFlower(null);

              s.pokeCount = 0;
              s.pokesSinceLastPlant = 0;
              s.unlocked = { baby: false, giant: false, building: false };
              s.flee.active = false;
              s.flee.chaseDuration = 0;
              s.flee.moodTimer = 0;
              s.flee.recentCatches = 0;

              s.mode = 'replacing';
              s.replaceState = {
                phase: 'search',
                timer: 0,
                targetId: null,
                targetEl: null,
                spotRelX: 0,
                didAct: false,
                count: 0,
                jumpStartX: s.x,
                jumpStartY: s.y,
                jumpEndX: s.x,
                jumpEndY: s.y,
                jumpDuration: 0.48,
                jumpArcHeight: 64,
              };
              setMode('replacing');
              showSpeech(newSpecies === 'sunflower' ? 'my garden now! 🌻' : 'reclaiming! 🌷', 1300);

              // Reset Baby slot for the new Hero's own 8-click Baby easter egg!
              b.active = false;
              b.morphedSpecies = null;
              b.pokeCount = 0;
              b.arc = 'none';
              setBabyVisible(false);
              setBabyMorphedSpecies(null);
              setBabyMood('normal');
              setBabyJumping(false);
              setBabyWalking(false);

              onSpeciesChangeRef.current?.(newSpecies);
            }
          } else {
            // Normal Baby Sidekick simulation (nimble evasion + trailing parent)
            if (b.mode === 'jumping') {
              b.jumpT = Math.min(1, b.jumpT + dt / b.jumpDuration);
              const t = b.jumpT;
              const easeX = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
              b.x = b.jumpStartX + (b.jumpEndX - b.jumpStartX) * easeX;
              b.y = b.jumpStartY + (b.jumpEndY - b.jumpStartY) * t - 4 * t * (1 - t) * b.jumpArcHeight;
              setBabySquash({
                sx: 0.9,
                sy: 1.12,
                rot: b.facing * (t < 0.5 ? -11 : 9) * Math.sin(t * Math.PI),
              });
              setBabyPos({ x: b.x, y: b.y });
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
                  const bf = b.flee;
                  bf.dodgeCooldown = Math.max(0, bf.dodgeCooldown - dt);
                  bf.speechCooldown = Math.max(0, bf.speechCooldown - dt);
                  bf.puffCooldown = Math.max(0, bf.puffCooldown - dt);

                  const cursorActive = s.pointer.active && now - s.pointer.lastMoveAt < 1400;
                  const dxCursor = s.pointer.x - (b.x + BABY_W / 2);
                  const dyCursor = s.pointer.y - (b.y + BABY_H / 2);
                  const distCursor = Math.hypot(dxCursor, dyCursor);
                  const babyShouldFlee =
                    cursorActive &&
                    b.currentEl.dataset.tulipPerch !== 'game' &&
                    Math.abs(dyCursor) < 92 &&
                    distCursor < (bf.active ? 160 : 132);

                  if (babyShouldFlee) {
                    if (!bf.active) {
                      bf.active = true;
                      if (bf.moodTimer <= 0) {
                        const rRoll = Math.random();
                        if (rRoll < 0.3) {
                          bf.mood = 'zip';
                          bf.moodTimer = 2.0 + Math.random() * 1.0;
                        } else if (rRoll < 0.42) {
                          bf.mood = 'tired';
                          bf.moodTimer = 2.2;
                          bf.tiredPauseTimer = 0.4;
                        } else {
                          bf.mood = 'nimble';
                          bf.moodTimer = 2.6 + Math.random() * 1.2;
                        }
                      }
                      if (bf.speechCooldown <= 0) {
                        const lines =
                          bf.mood === 'zip'
                            ? ['too small! 💨', 'zip! ✨']
                            : bf.mood === 'tired'
                              ? ['huff...']
                              : ['heehee!', 'catch me!'];
                        showBabySpeech(lines[Math.floor(Math.random() * lines.length)], 850);
                        bf.speechCooldown = 2.1;
                      }
                    }

                    bf.chaseDuration += dt;
                    bf.moodTimer -= dt;
                    if (
                      (bf.chaseDuration > 2.6 && bf.mood !== 'tired') ||
                      (bf.mood === 'zip' && bf.moodTimer <= 0)
                    ) {
                      bf.mood = 'tired';
                      bf.moodTimer = 2.2;
                      bf.tiredPauseTimer = 0.5;
                    } else if (bf.mood === 'tired' && bf.moodTimer <= 0) {
                      bf.mood = 'nimble';
                      bf.moodTimer = 2.4;
                      bf.chaseDuration = 0;
                    }

                    const fleeDir: 1 | -1 = dxCursor >= 0 ? -1 : 1;
                    const minX = br.left + 16;
                    const maxX = Math.max(minX, br.right - 16 - BABY_W);
                    const cornered =
                      (fleeDir === -1 && b.x <= minX + 12) || (fleeDir === 1 && b.x >= maxX - 12);

                    if (bf.mood === 'tired') {
                      if (bf.tiredPauseTimer > 0) {
                        bf.tiredPauseTimer = Math.max(0, bf.tiredPauseTimer - dt);
                        setBabyWalking(false);
                        const pant = Math.sin(now * 0.02) * 0.09;
                        setBabySquash({ sx: 1 + pant, sy: 1 - pant, rot: 0 });
                        setBabyPos({ x: b.x, y: b.y });
                        if (bf.speechCooldown <= 0) {
                          showBabySpeech('huff...', 800);
                          bf.speechCooldown = 2.2;
                        }
                      } else {
                        babyIsStrolling = true;
                        if (fleeDir !== b.facing) {
                          b.facing = fleeDir;
                          setBabyFacing(fleeDir);
                        }
                        b.x = Math.min(maxX, Math.max(minX, b.x + fleeDir * 90 * dt));
                        b.stride += dt * 18;
                        setBabyWalking(true);
                        setBabyStepPhase(Math.sin(b.stride));
                        setBabySquash({ sx: 1, sy: 1, rot: 4 * fleeDir + Math.sin(b.stride) * 3 });
                        setBabyPos({ x: b.x, y: b.y + Math.abs(Math.sin(b.stride)) * -2 });
                      }
                    } else if (bf.mood === 'nimble') {
                      if (cornered && distCursor < 92 && bf.dodgeCooldown <= 0) {
                        bf.dodgeCooldown = 1.3;
                        const vaultX =
                          fleeDir === -1
                            ? Math.min(maxX, br.left + br.width * 0.74)
                            : Math.max(minX, br.left + br.width * 0.22);
                        launchBabyJumpTo(b.currentEl, false, vaultX);
                        b.jumpDuration = 0.4;
                      } else {
                        babyIsStrolling = true;
                        if (fleeDir !== b.facing) {
                          b.facing = fleeDir;
                          setBabyFacing(fleeDir);
                        }
                        b.x = Math.min(maxX, Math.max(minX, b.x + fleeDir * 235 * dt));
                        b.stride += dt * 32;
                        setBabyWalking(true);
                        setBabyStepPhase(Math.sin(b.stride));
                        setBabySquash({ sx: 1, sy: 1, rot: 11 * fleeDir + Math.sin(b.stride) * 4 });
                        setBabyPos({ x: b.x, y: b.y + Math.abs(Math.sin(b.stride)) * -3.5 });
                      }
                    } else {
                      if ((distCursor < 72 || (cornered && distCursor < 120)) && bf.dodgeCooldown <= 0) {
                        bf.dodgeCooldown = 1.05;
                        const vh = window.innerHeight;
                        const peers = getPerches().filter((el) => {
                          if (el === b.currentEl || el.dataset.tulipPerch === 'game') return false;
                          const pr = el.getBoundingClientRect();
                          return pr.top > 110 && pr.top < vh * 0.78;
                        });
                        if (peers.length > 0 && Math.random() < 0.55) {
                          launchBabyJumpTo(peers[Math.floor(Math.random() * peers.length)], false);
                          b.jumpDuration = Math.min(b.jumpDuration, 0.42);
                        } else {
                          const vaultX =
                            b.x < br.left + br.width * 0.5
                              ? Math.min(maxX, br.right - 22 - BABY_W)
                              : Math.max(minX, br.left + 22);
                          launchBabyJumpTo(b.currentEl, false, vaultX);
                          b.jumpDuration = 0.36;
                        }
                      } else {
                        babyIsStrolling = true;
                        if (fleeDir !== b.facing) {
                          b.facing = fleeDir;
                          setBabyFacing(fleeDir);
                        }
                        b.x = Math.min(maxX, Math.max(minX, b.x + fleeDir * 380 * dt));
                        b.stride += dt * 44;
                        setBabyWalking(true);
                        setBabyStepPhase(Math.sin(b.stride));
                        setBabySquash({ sx: 1, sy: 1, rot: 16 * fleeDir + Math.sin(b.stride) * 5 });
                        setBabyPos({ x: b.x, y: b.y + Math.abs(Math.sin(b.stride)) * -4 });
                        if (bf.puffCooldown <= 0) {
                          bf.puffCooldown = 0.12;
                          emitSparks(b.x + BABY_W / 2 - fleeDir * 10, b.y + BABY_H - 4, 2, ['#6AA2FF', '#FBBF24']);
                        }
                      }
                    }
                  } else {
                    if (bf.active) {
                      bf.active = false;
                      b.walkPause = 0.5;
                    }
                    bf.chaseDuration = Math.max(0, bf.chaseDuration - dt * 1.5);
                    bf.moodTimer = Math.max(0, bf.moodTimer - dt * 0.4);

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
                        b.x += dir * Math.min(Math.abs(dx), 58 * dt);
                        b.stride += dt * 19;
                        setBabyWalking(true);
                        setBabyStepPhase(Math.sin(b.stride));
                        setBabySquash({ sx: 1, sy: 1, rot: Math.sin(b.stride) * 5 });
                        setBabyPos({ x: b.x, y: b.y + Math.abs(Math.sin(b.stride)) * -3 });
                      }
                    }

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
                          b.species === 'sunflower' ? 'gold' : pickTulipVariant(true),
                          0.55 + Math.random() * 0.12,
                          b.species
                        );
                        emitSparks(br.left + spotRel, br.top + 3, 4, ['#22C55E', '#FBBF24']);
                        b.squashTimer = 0.16;
                      }
                    }
                  }
                }

                if (!babyIsStrolling) setBabyPos({ x: b.x, y: b.y });
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
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const performNormalJump = (customSpeech?: string, wasFleeing = false) => {
    const s = stateRef.current;
    const { w, h } = getHeroDims(s.heroSpecies);
    if (!customSpeech) {
      const greetings = wasFleeing
        ? ['got me! 😅', 'okay okay!', s.heroSpecies === 'sunflower' ? 'hey! 🌻' : 'hey! 🌷', 'boing!']
        : s.heroSpecies === 'sunflower'
          ? ['sunny! 🌻', 'boing!', 'so bright! ☀️', 'wheee!', '✨']
          : ['hi! 🌷', 'boing!', 'no ads!', 'wheee!', '✨'];
      showSpeech(greetings[Math.floor(Math.random() * greetings.length)], 950);
    } else {
      showSpeech(customSpeech, 950);
    }

    const vh = window.innerHeight;
    const peers = Array.from(document.querySelectorAll<HTMLElement>('[data-tulip-perch]')).filter((el) => {
      if (el === s.currentEl || el.dataset.tulipPerch === 'game') return false;
      const r = el.getBoundingClientRect();
      return r.width > 90 && r.top > 100 && r.top < vh * 0.8;
    });

    if (peers.length > 0) {
      const next = peers[Math.floor(Math.random() * peers.length)];
      const nr = next.getBoundingClientRect();
      const endX = nr.left + window.scrollX + 28 + Math.random() * Math.max(10, nr.width - 56 - w);
      const endY = nr.top + window.scrollY - h + 5;
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
      emitSparks(s.x + w / 2, s.y + h - 6, 8);
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
      emitSparks(s.x + w / 2, s.y + h - 6, 7);
    }
  };

  const handlePoke = () => {
    const s = stateRef.current;
    if ((s.mode !== 'perched' && s.mode !== 'replacing') || !s.currentEl) return;
    if (s.mode === 'replacing' && s.replaceState.phase === 'jump-to-bloom') return;

    const wasFleeing = s.flee.active;
    s.flee.active = false;
    s.flee.chaseDuration = 0;
    s.flee.alertTimer = 0;
    s.flee.tiredPauseTimer = 0;
    s.flee.moodTimer = 0;
    s.flee.recentCatches = Math.min(4, s.flee.recentCatches + 1);
    setExpression('normal');
    setLeafTilt(0);

    s.pokeCount += 1;

    // 3-stage easter egg milestones for active Hero (Tulip OR Sunflower!)
    if (s.pokeCount >= 8 && !s.unlocked.baby) {
      startEasterEggBaby(s.currentEl);
      return;
    }
    if (s.pokeCount >= 15 && !s.unlocked.giant) {
      startEasterEggGiant(s.currentEl);
      return;
    }
    if (s.pokeCount >= 22 && !s.unlocked.building) {
      startEasterEggBuilding(s.currentEl);
      return;
    }

    let teaser: string | undefined;
    if (s.pokeCount === 7 && !s.unlocked.baby) {
      teaser = s.heroSpecies === 'sunflower' ? 'hmm? 🌻' : 'hmm? 🌱';
    } else if (s.pokeCount === 14 && !s.unlocked.giant) {
      teaser = 'ooh! ✨';
    } else if (s.pokeCount === 21 && !s.unlocked.building) {
      teaser = 'idea... 💡';
    }

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
    performNormalJump(teaser, wasFleeing);
  };

  const handleBabyPoke = () => {
    const s = stateRef.current;
    const b = s.baby;
    if (!b.active || b.arc !== 'none' || b.mode !== 'perched') return;

    b.flee.active = false;
    b.flee.chaseDuration = 0;
    b.flee.moodTimer = 0;
    b.pokeCount += 1;

    // Click 3: Symmetric Coup!
    if (b.pokeCount >= 3) {
      b.arc = 'morphing';
      b.arcTimer = 0;
      b.arcStep = 0;
      b.mode = 'perched';
      setBabyJumping(false);
      setBabyWalking(false);
      showBabySpeech(b.species === 'tulip' ? 'wait... ☀️?!' : 'wait... 🌷?!', 1100);
      emitSparks(b.x + BABY_W / 2, b.y + BABY_H / 2, 10, ['#FACC15', '#EA7824', '#FFFFFF']);
      return;
    }

    // Click 1 & 2: Huge Bloom Storms matching Baby's species!
    const vh = window.innerHeight;
    const visibleCards = Array.from(document.querySelectorAll<HTMLElement>('[data-tulip-perch]')).filter((el) => {
      if (el.dataset.tulipPerch === 'game') return false;
      const r = el.getBoundingClientRect();
      return r.width > 90 && r.top > 75 && r.top < vh - 20;
    });

    const stormOriginX = b.x + BABY_W / 2;
    const stormOriginY = b.y + BABY_H * 0.45;
    const targets = visibleCards.length > 0 ? visibleCards.slice(0, 4) : b.currentEl ? [b.currentEl] : [];
    const totalSeeds = b.pokeCount === 1 ? 11 : 9;

    for (let i = 0; i < totalSeeds; i++) {
      const card = targets[i % targets.length];
      if (!card) continue;
      const cr = getDocRect(card);
      const targetRelX = pickOpenRelX(card, 24 + Math.random() * Math.max(20, cr.width - 48), 16);
      s.seeds.push({
        id: s.seedSeq++,
        el: card,
        relX: targetRelX,
        startX: stormOriginX,
        startY: stormOriginY,
        endX: cr.left + targetRelX,
        endY: cr.top + 3,
        t: -i * 0.04,
        duration: 0.48 + Math.random() * 0.22,
        arcHeight: 45 + Math.random() * 42,
        variant: b.species === 'sunflower' ? 'gold' : pickTulipVariant(true),
        kind: b.species,
        scale: 0.72 + Math.random() * 0.3,
      });
    }

    if (b.pokeCount === 1) {
      showBabySpeech(b.species === 'sunflower' ? 'SUNFLOWER STORM!! 🌻☀️' : 'TULIP STORM!! 🌷✨', 1150);
      emitSparks(b.x + BABY_W / 2, b.y + BABY_H - 4, 10, ['#EA7824', '#2857A4', '#22C55E', '#FBBF24']);
    } else {
      showBabySpeech(b.species === 'sunflower' ? 'feeling... dutch? 🌷' : 'feeling... sunny? ☀️', 1200);
      emitSparks(b.x + BABY_W / 2, b.y + BABY_H - 4, 12, ['#FACC15', '#F59E0B', '#EA7824']);
    }

    b.jumpStartX = b.x;
    b.jumpStartY = b.y;
    b.jumpEndX = b.x;
    b.jumpEndY = b.y;
    b.jumpT = 0;
    b.jumpDuration = 0.42;
    b.jumpArcHeight = 46;
    b.pendingEl = b.currentEl;
    b.landingIntoGame = false;
    b.mode = 'jumping';
    setBabyJumping(true);
  };

  const handleFallenPoke = (id: number) => {
    const s = stateRef.current;
    const found = s.fallenBuddies.find((f) => f.id === id);
    if (!found) return;
    const groans =
      found.species === 'sunflower'
        ? ['x_x', 'oof...', 'the sun sets... 🌻', 'my greenhouse...']
        : ['x_x', 'oof...', 'betrayed... 🌷', 'my tulips...'];
    const msg = groans[Math.floor(Math.random() * groans.length)];
    s.fallenBuddies = s.fallenBuddies.map((f) =>
      f.id === id ? { ...f, wiggle: 10, speech: msg } : f
    );
    setFallenBuddies(s.fallenBuddies);
    scheduleTimer(() => {
      stateRef.current.fallenBuddies = stateRef.current.fallenBuddies.map((f) =>
        f.id === id ? { ...f, speech: null } : f
      );
      setFallenBuddies(stateRef.current.fallenBuddies);
    }, 950);
  };

  if (!visible) return null;

  const isJumpingAnim = mode === 'jumping';

  const renderTulipSvg = (
    curWalking: boolean,
    curJumping: boolean,
    curStepPhase: number,
    curLeafTilt: number,
    curExpr: BuddyExpression,
    curCarrying: { variant: TulipVariant; kind: FlowerSpecies } | null
  ) => (
    <svg viewBox="-24 -58 48 62" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.22)]" fill="none">
      <g className="stroke-[#2857A4] dark:stroke-[#4E89E8]" strokeWidth="3.6" strokeLinecap="round">
        <line
          x1="-3"
          y1="-11"
          x2={curJumping ? '-9' : curWalking ? String(-3 + curStepPhase * 6) : '-4'}
          y2={curJumping ? '-2' : curWalking ? String(-1 - Math.max(0, curStepPhase) * 2.5) : '0'}
        />
        <line
          x1="3"
          y1="-11"
          x2={curJumping ? '9' : curWalking ? String(3 - curStepPhase * 6) : '4'}
          y2={curJumping ? '-4' : curWalking ? String(-1 - Math.max(0, -curStepPhase) * 2.5) : '0'}
        />
        <line x1="0" y1="-10" x2="0" y2="-24" />
      </g>

      <g transform={`rotate(${curLeafTilt} 0 -11)`}>
        {curCarrying && <CarriedTulipSvg variant={curCarrying.variant} kind={curCarrying.kind} />}
        <path
          d="M0 -11 Q16 -11 18 -25 Q6 -24 0 -11 Z"
          className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <line x1="2" y1="-12" x2="13" y2="-21" stroke="#EA7824" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      <path
        d="M-14 -48 L-14 -35 C-14 -26 -7 -22 0 -22 C7 -22 14 -26 14 -35 L14 -48 Q0 -44 -14 -48 Z"
        className="fill-white dark:fill-[#242B35]"
      />
      <path d="M-6 -45 Q0 -55 6 -45" stroke="#EA7824" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M-14 -48 L-14 -35 C-14 -26 -7 -22 0 -22 C7 -22 14 -26 14 -35 L14 -48"
        className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M-14 -48 Q-5 -46 0 -40" className="stroke-[#2857A4] dark:stroke-[#4E89E8]" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M14 -48 Q-6 -43 -6 -31 Q-6 -25 0 -22" stroke="#EA7824" strokeWidth="3.4" strokeLinecap="round" />

      {curExpr === 'ko' ? (
        <g className="stroke-slate-900 dark:stroke-white" strokeWidth="2.1" strokeLinecap="round">
          <line x1="1.5" y1="-37.5" x2="5.5" y2="-33.5" />
          <line x1="5.5" y1="-37.5" x2="1.5" y2="-33.5" />
          <line x1="7.5" y1="-37.5" x2="11.5" y2="-33.5" />
          <line x1="11.5" y1="-37.5" x2="7.5" y2="-33.5" />
        </g>
      ) : curExpr === 'happy' ? (
        <g className="stroke-slate-900 dark:stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.2 -34.5 Q3.5 -37.8 5.8 -34.5" />
          <path d="M7.2 -34.5 Q9.5 -37.8 11.8 -34.5" />
        </g>
      ) : curExpr === 'surprised' ? (
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
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-x-clip">
      {/* Persistent session tulip / sunflower garden */}
      {tulips.map((t) => (
        <PlantedTulipItem key={t.id} tulip={t} />
      ))}

      {/* Giant landmarks (Giant Tulip & Giant Beanstalk Sunflower) */}
      {giantLandmarks.map((g) =>
        g.species === 'sunflower' ? (
          <GiantSunflowerLandmark key={g.id} giant={g} />
        ) : (
          <GiantTulipLandmark key={g.id} giant={g} />
        )
      )}

      {/* Harvest-built landmarks (Dutch Windmill & Glass Greenhouse) */}
      {buildingLandmarks.map((b) =>
        b.species === 'sunflower' ? (
          <GlassGreenhouseLandmark key={b.id} building={b} />
        ) : (
          <TulipWindmillLandmark key={b.id} building={b} />
        )
      )}

      {/* Fallen former heroes */}
      {fallenBuddies.map((fb) => (
        <FallenBuddyItem key={fb.id} fallen={fb} onPoke={handleFallenPoke} />
      ))}

      {hatchingSprout && <HatchingSproutItem sprout={hatchingSprout} />}

      {uprootedTulips.map((item) => (
        <UprootedTulipItem key={item.id} item={item} />
      ))}

      {flyingSeeds.map((seed) => (
        <FlyingSeedItem key={seed.id} seed={seed} />
      ))}

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

      {/* Baby Sidekick / Morphed Rival */}
      {babyVisible &&
        (babyMorphedSpecies === 'sunflower' ? (
          <SunflowerBuddyView
            x={babyPos.x}
            y={babyPos.y}
            width={SUNFLOWER_W}
            height={SUNFLOWER_H}
            facing={babyFacing}
            squash={babySquash}
            walking={babyWalking}
            jumping={babyJumping}
            stepPhase={babyStepPhase}
            blinking={blinking}
            inGame={babyInGame}
            speech={babySpeech}
            leafTilt={0}
            mood={babyMood}
            onPoke={handleBabyPoke}
          />
        ) : babyMorphedSpecies === 'tulip' ? (
          <div
            onClick={handleBabyPoke}
            style={{
              left: babyPos.x,
              top: babyPos.y,
              width: BUDDY_W,
              height: BUDDY_H,
              opacity: babyInGame ? 0 : 1,
              transform: `scaleX(${babyFacing * babySquash.sx}) scaleY(${babySquash.sy}) rotate(${babySquash.rot}deg)`,
              transformOrigin: '50% 90%',
            }}
            className="pointer-events-auto cursor-pointer absolute"
          >
            {babySpeech && (
              <div
                style={{ transform: `scaleX(${babyFacing})` }}
                className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#EA7824] text-white font-display font-bold text-[10px] shadow-md animate-bounce"
              >
                {babySpeech}
              </div>
            )}
            {renderTulipSvg(
              babyWalking,
              babyJumping,
              babyStepPhase,
              0,
              babyMood === 'happy' ? 'happy' : 'normal',
              null
            )}
          </div>
        ) : (
          <BabyBuddyView
            species={babySpecies}
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
        ))}

      {/* Active Hero (Tulip Buddy OR Sunflower Guy) */}
      {heroSpecies === 'sunflower' ? (
        <SunflowerBuddyView
          x={pos.x}
          y={pos.y}
          width={SUNFLOWER_W}
          height={SUNFLOWER_H}
          facing={facing}
          squash={squash}
          walking={walking}
          jumping={isJumpingAnim}
          stepPhase={stepPhase}
          blinking={blinking}
          inGame={mode === 'in-game'}
          speech={speech}
          leafTilt={leafTilt}
          mood={expression === 'happy' ? 'happy' : 'normal'}
          expression={expression}
          carryingFlower={carryingFlower}
          onPoke={handlePoke}
        />
      ) : (
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
          {speech && (
            <div
              style={{ transform: `scaleX(${facing})` }}
              className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#EA7824] text-white font-display font-bold text-[10px] shadow-md animate-bounce"
            >
              {speech}
            </div>
          )}
          {renderTulipSvg(walking, isJumpingAnim, stepPhase, leafTilt, expression, carryingFlower)}
        </div>
      )}
    </div>
  );
}
