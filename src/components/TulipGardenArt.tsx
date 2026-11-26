export type FlowerSpecies = 'tulip' | 'sunflower';
export type TulipVariant = 'brand' | 'brand-inv' | 'gold' | 'coral' | 'lavender';
export type BuddyExpression = 'normal' | 'happy' | 'surprised' | 'ko';

export interface PlantedTulip {
  id: number;
  el: HTMLElement;
  relX: number;
  x: number;
  y: number;
  variant: TulipVariant;
  kind?: FlowerSpecies;
  scale: number;
  tilt: number;
  swayDelay: number;
  fading?: boolean;
  visible: boolean;
}

export interface UprootedTulip {
  id: number;
  x: number;
  y: number;
  rot: number;
  opacity: number;
  variant: TulipVariant;
  kind?: FlowerSpecies;
}

export interface FlyingSeed {
  id: number;
  x: number;
  y: number;
  rot: number;
  isGolden?: boolean;
}

export interface HatchingSprout {
  x: number;
  y: number;
  wobbling: boolean;
  species: FlowerSpecies;
}

export interface GiantLandmarkState {
  id: number;
  species: FlowerSpecies;
  el: HTMLElement;
  relX: number;
  x: number;
  y: number;
  stage: 1 | 2 | 3;
  visible: boolean;
}

export interface BuildingLandmarkState {
  id: number;
  species: FlowerSpecies;
  el: HTMLElement;
  relX: number;
  x: number;
  y: number;
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  visible: boolean;
  sailColors?: string[];
}

export interface FallenBuddyState {
  id: number;
  species: FlowerSpecies;
  el: HTMLElement;
  relX: number;
  x: number;
  y: number;
  facing: 1 | -1;
  visible: boolean;
  wiggle: number;
  speech: string | null;
}

export function getVariantSailColor(variant: TulipVariant, fallbackIdx: number): string {
  switch (variant) {
    case 'gold':
      return '#F59E0B';
    case 'coral':
      return '#F43F5E';
    case 'lavender':
      return '#8B5CF6';
    case 'brand-inv':
      return '#2857A4';
    case 'brand':
    default:
      return fallbackIdx % 2 === 0 ? '#EA7824' : '#2857A4';
  }
}

/** Exact perch offset on the Giant Tulip's right leaf relative to its base (x, y). */
export const GIANT_LEAF_OFFSET_X = 24;
export const GIANT_LEAF_OFFSET_Y = -56;

/** Jack-and-the-Beanstalk 2-leaf climb offsets on the Giant Sunflower relative to its base (x, y). */
export const GIANT_SUNFLOWER_LEAF1_X = -22;
export const GIANT_SUNFLOWER_LEAF1_Y = -48;
export const GIANT_SUNFLOWER_LEAF2_X = 24;
export const GIANT_SUNFLOWER_LEAF2_Y = -88;

export function pickTulipVariant(preferAccent = false): TulipVariant {
  const r = Math.random();
  if (preferAccent) {
    if (r < 0.45) return 'brand';
    if (r < 0.55) return 'brand-inv';
    if (r < 0.7) return 'gold';
    if (r < 0.85) return 'coral';
    return 'lavender';
  }
  if (r < 0.65) return 'brand';
  if (r < 0.75) return 'brand-inv';
  if (r < 0.84) return 'gold';
  if (r < 0.92) return 'coral';
  return 'lavender';
}

interface VariantStyle {
  cupStrokeClass: string;
  accentStroke: string;
  leafVein: string;
}

const VARIANT_STYLES: Record<TulipVariant, VariantStyle> = {
  brand: {
    cupStrokeClass: 'stroke-[#2857A4] dark:stroke-[#4E89E8]',
    accentStroke: '#EA7824',
    leafVein: '#EA7824',
  },
  'brand-inv': {
    cupStrokeClass: 'stroke-[#EA7824]',
    accentStroke: '#2857A4',
    leafVein: '#2857A4',
  },
  gold: {
    cupStrokeClass: 'stroke-[#D97706] dark:stroke-[#FBBF24]',
    accentStroke: '#EA7824',
    leafVein: '#F59E0B',
  },
  coral: {
    cupStrokeClass: 'stroke-[#E11D48] dark:stroke-[#FB7185]',
    accentStroke: '#FB923C',
    leafVein: '#E11D48',
  },
  lavender: {
    cupStrokeClass: 'stroke-[#7C3AED] dark:stroke-[#A78BFA]',
    accentStroke: '#EA7824',
    leafVein: '#8B5CF6',
  },
};

export function PlantedTulipItem({ tulip }: { tulip: PlantedTulip }) {
  if (!tulip.visible) return null;
  const style = VARIANT_STYLES[tulip.variant];

  return (
    <div
      style={{
        left: tulip.x,
        top: tulip.y,
        transform: `translate(-50%, -100%) scale(${tulip.scale}) rotate(${tulip.tilt}deg)`,
        transformOrigin: 'bottom center',
      }}
      className={`pointer-events-none absolute transition-all duration-700 ${
        tulip.fading ? 'opacity-0 scale-75' : 'opacity-100'
      }`}
    >
      <div className="animate-tulip-sprout">
        {tulip.kind === 'sunflower' ? (
          <svg
            viewBox="-14 -32 28 34"
            width="22"
            height="28"
            style={{ animationDelay: `${tulip.swayDelay}s` }}
            className="animate-tulip-sway overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.16)]"
            fill="none"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-14"
              className="stroke-[#15803D] dark:stroke-[#4ADE80]"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M0 -3 Q10 -3 11 -11 Q4 -10 0 -3 Z"
              className="fill-[#22C55E] dark:fill-[#16A34A] stroke-[#15803D] dark:stroke-[#4ADE80]"
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
            <g transform="translate(0, -21)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <ellipse
                  key={deg}
                  cx="0"
                  cy="-7.5"
                  rx="2.3"
                  ry="4.2"
                  transform={`rotate(${deg})`}
                  fill="#FACC15"
                  stroke="#D97706"
                  strokeWidth="1.2"
                />
              ))}
              <circle cx="0" cy="0" r="5.2" fill="#78350F" stroke="#92400E" strokeWidth="1.4" />
              <circle cx="-1.8" cy="-1.2" r="0.7" fill="#FACC15" opacity="0.85" />
              <circle cx="1.8" cy="-0.8" r="0.7" fill="#FACC15" opacity="0.85" />
              <circle cx="0" cy="1.8" r="0.7" fill="#FACC15" opacity="0.85" />
            </g>
          </svg>
        ) : (
          <svg
            viewBox="-14 -32 28 34"
            width="22"
            height="28"
            style={{ animationDelay: `${tulip.swayDelay}s` }}
            className="animate-tulip-sway overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.16)]"
            fill="none"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-12"
              className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M0 -2 Q10 -2 11 -11 Q4 -10 0 -2 Z"
              className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
              strokeWidth="2.1"
              strokeLinejoin="round"
            />
            <line
              x1="1.5"
              y1="-3"
              x2="8"
              y2="-8.5"
              stroke={style.leafVein}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M-8 -27 L-8 -19 C-8 -13 -4 -11 0 -11 C4 -11 8 -13 8 -19 L8 -27 Q0 -24 -8 -27 Z"
              className="fill-white dark:fill-[#242B35]"
            />
            <path
              d="M-3.5 -25 Q0 -31 3.5 -25"
              stroke={style.accentStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M-8 -27 L-8 -19 C-8 -13 -4 -11 0 -11 C4 -11 8 -13 8 -19 L8 -27"
              className={style.cupStrokeClass}
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M-8 -27 Q-3 -25.5 0 -22"
              className={style.cupStrokeClass}
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <path
              d="M8 -27 Q-3.5 -24 -3.5 -16.5 Q-3.5 -12.5 0 -11"
              stroke={style.accentStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

export function FlyingSeedItem({ seed }: { seed: FlyingSeed }) {
  return (
    <div
      style={{
        left: seed.x,
        top: seed.y,
        transform: `translate(-50%, -50%) rotate(${seed.rot}deg)`,
      }}
      className="pointer-events-none absolute"
    >
      <svg viewBox="-6 -8 12 14" width="10" height="12" fill="none">
        <path
          d="M0 -6 C3.5 -2 4 3 0 5 C-4 3 -3.5 -2 0 -6 Z"
          fill={seed.isGolden ? '#FBBF24' : '#EA7824'}
          stroke={seed.isGolden ? '#FEF08A' : '#9A3412'}
          strokeWidth="1.2"
        />
        <circle cx="-1" cy="-1.5" r="1" fill="#FFFFFF" opacity="0.85" />
      </svg>
    </div>
  );
}

export function HatchingSproutItem({ sprout }: { sprout: HatchingSprout }) {
  return (
    <div
      style={{
        left: sprout.x,
        top: sprout.y,
        transform: 'translate(-50%, -100%)',
      }}
      className="pointer-events-none absolute"
    >
      <div className={sprout.wobbling ? 'animate-sprout-wobble' : 'animate-tulip-sprout'}>
        {sprout.species === 'sunflower' ? (
          <svg
            viewBox="-16 -36 32 38"
            width="30"
            height="36"
            className="overflow-visible drop-shadow-[0_0_8px_rgba(250,204,21,0.85)]"
            fill="none"
          >
            <circle cx="0" cy="-20" r="14" fill="#FACC15" opacity="0.24" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-14"
              className="stroke-[#15803D] dark:stroke-[#4ADE80]"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M0 -3 Q11 -3 12 -12 Q4 -11 0 -3 Z"
              className="fill-[#22C55E] dark:fill-[#16A34A] stroke-[#15803D] dark:stroke-[#4ADE80]"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <g transform="translate(0, -21)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <ellipse
                  key={deg}
                  cx="0"
                  cy="-8.5"
                  rx="2.6"
                  ry="4.8"
                  transform={`rotate(${deg})`}
                  fill="#FACC15"
                  stroke="#D97706"
                  strokeWidth="1.3"
                />
              ))}
              <circle cx="0" cy="0" r="6" fill="#78350F" stroke="#92400E" strokeWidth="1.6" />
            </g>
          </svg>
        ) : (
          <svg
            viewBox="-16 -36 32 38"
            width="30"
            height="36"
            className="overflow-visible drop-shadow-[0_0_8px_rgba(251,191,36,0.75)]"
            fill="none"
          >
            <circle cx="0" cy="-18" r="13" fill="#FBBF24" opacity="0.2" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-12"
              className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M0 -3 Q11 -3 12 -12 Q4 -11 0 -3 Z"
              className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path
              d="M-9 -27 L-9 -19 C-9 -12 -4.5 -10 0 -10 C4.5 -10 9 -12 9 -19 L9 -27 Q0 -23 -9 -27 Z"
              className="fill-white dark:fill-[#242B35]"
            />
            <path d="M-4 -25 Q0 -32 4 -25" stroke="#FBBF24" strokeWidth="2.6" strokeLinecap="round" />
            <path
              d="M-9 -27 L-9 -19 C-9 -12 -4.5 -10 0 -10 C4.5 -10 9 -12 9 -19 L9 -27"
              className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 -27 Q-4 -23 -4 -16 Q-4 -12 0 -10"
              stroke="#EA7824"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

export function GiantTulipLandmark({ giant }: { giant: GiantLandmarkState }) {
  if (!giant.visible) return null;
  const stageScale = giant.stage === 1 ? 0.36 : giant.stage === 2 ? 0.68 : 1;

  return (
    <div
      style={{
        left: giant.x,
        top: giant.y,
        transform: 'translate(-50%, -100%)',
      }}
      className="pointer-events-none absolute"
    >
      <div
        key={giant.stage}
        style={{
          transform: `scale(${stageScale})`,
          transformOrigin: 'bottom center',
        }}
        className="animate-giant-pop relative transition-transform duration-500 ease-out"
      >
        <svg
          viewBox="-44 -132 88 136"
          width="88"
          height="136"
          className="overflow-visible drop-shadow-[0_6px_12px_rgba(0,0,0,0.22)]"
          fill="none"
        >
          {giant.stage === 3 && <circle cx="0" cy="-98" r="34" fill="#FBBF24" opacity="0.14" />}

          <path
            d="M0 0 Q-4 -38 0 -72"
            className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="6"
            strokeLinecap="round"
          />

          <path
            d="M-1 -26 Q-28 -28 -32 -52 Q-11 -49 -1 -26 Z"
            className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="4.2"
            strokeLinejoin="round"
          />
          <line x1="-4" y1="-29" x2="-22" y2="-45" stroke="#EA7824" strokeWidth="3" strokeLinecap="round" />

          <path
            d="M1 -40 Q28 -44 40 -62 Q16 -64 1 -40 Z"
            className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="4.4"
            strokeLinejoin="round"
          />
          <line x1="5" y1="-43" x2="28" y2="-56" stroke="#EA7824" strokeWidth="3.2" strokeLinecap="round" />

          <path
            d="M-26 -116 L-26 -93 C-26 -76 -13 -69 0 -69 C13 -69 26 -76 26 -93 L26 -116 Q0 -108 -26 -116 Z"
            className="fill-white dark:fill-[#242B35]"
          />
          <path
            d="M-11 -111 Q0 -130 11 -111"
            stroke="#EA7824"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {giant.stage === 3 && (
            <path d="M-6 -116 Q0 -126 6 -116" stroke="#FBBF24" strokeWidth="2.4" strokeLinecap="round" />
          )}
          <path
            d="M-26 -116 L-26 -93 C-26 -76 -13 -69 0 -69 C13 -69 26 -76 26 -93 L26 -116"
            className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M-26 -116 Q-9 -112 0 -101"
            className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="4.6"
            strokeLinecap="round"
          />
          <path
            d="M26 -116 Q-11 -106 -11 -85 Q-11 -74 0 -69"
            stroke="#EA7824"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>

        {giant.stage === 3 && (
          <>
            <span
              style={{ left: 14, top: 18, animationDelay: '0s' }}
              className="animate-petal-drift absolute w-2 h-2 rounded-full bg-[#EA7824]/80"
            />
            <span
              style={{ left: 68, top: 24, animationDelay: '1.1s' }}
              className="animate-petal-drift absolute w-1.5 h-1.5 rounded-full bg-[#FBBF24]/90"
            />
            <span
              style={{ left: 42, top: 10, animationDelay: '2.2s' }}
              className="animate-petal-drift absolute w-2 h-1.5 rounded-full bg-[#4E89E8]/80"
            />
          </>
        )}
      </div>
    </div>
  );
}

export function GiantSunflowerLandmark({ giant }: { giant: GiantLandmarkState }) {
  if (!giant.visible) return null;
  const stageScale = giant.stage === 1 ? 0.36 : giant.stage === 2 ? 0.68 : 1;

  return (
    <div
      style={{
        left: giant.x,
        top: giant.y,
        transform: 'translate(-50%, -100%)',
      }}
      className="pointer-events-none absolute"
    >
      <div
        key={giant.stage}
        style={{
          transform: `scale(${stageScale})`,
          transformOrigin: 'bottom center',
        }}
        className="animate-giant-pop relative transition-transform duration-500 ease-out"
      >
        <svg
          viewBox="-48 -150 96 154"
          width="96"
          height="154"
          className="overflow-visible drop-shadow-[0_6px_12px_rgba(0,0,0,0.24)]"
          fill="none"
        >
          {giant.stage === 3 && <circle cx="0" cy="-118" r="38" fill="#FACC15" opacity="0.18" />}

          {/* Winding Jack-and-the-Beanstalk vine stalk */}
          <path
            d="M0 0 C-10 -34 12 -66 -3 -104"
            className="stroke-[#15803D] dark:stroke-[#4ADE80]"
            strokeWidth="6.5"
            strokeLinecap="round"
          />

          {/* Curly beanstalk tendrils */}
          <path
            d="M-3 -20 Q-16 -22 -14 -30 Q-10 -34 -7 -28"
            className="stroke-[#22C55E] dark:stroke-[#4ADE80]"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M4 -60 Q18 -62 16 -70 Q12 -74 9 -68"
            className="stroke-[#22C55E] dark:stroke-[#4ADE80]"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Step 1 Climb Leaf (Left, around (-22, -48)) */}
          <path
            d="M-4 -32 Q-30 -34 -38 -52 Q-16 -56 -4 -32 Z"
            className="fill-[#22C55E] dark:fill-[#16A34A] stroke-[#15803D] dark:stroke-[#4ADE80]"
            strokeWidth="3.8"
            strokeLinejoin="round"
          />
          <line x1="-8" y1="-35" x2="-28" y2="-48" stroke="#FACC15" strokeWidth="2.8" strokeLinecap="round" />

          {/* Step 2 Climb Leaf (Right, around (24, -88)) */}
          <path
            d="M3 -70 Q30 -72 40 -92 Q16 -96 3 -70 Z"
            className="fill-[#22C55E] dark:fill-[#16A34A] stroke-[#15803D] dark:stroke-[#4ADE80]"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <line x1="7" y1="-73" x2="29" y2="-88" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />

          {/* Huge radiant 12-petal sunflower crown at (0, -118) */}
          <g transform="translate(0, -118)">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-22"
                rx="6"
                ry="11"
                transform={`rotate(${deg})`}
                fill="#FACC15"
                stroke="#D97706"
                strokeWidth="2.2"
              />
            ))}
            <circle cx="0" cy="0" r="16" fill="#78350F" stroke="#92400E" strokeWidth="3" />
            <circle cx="-6" cy="-5" r="1.5" fill="#FACC15" opacity="0.7" />
            <circle cx="6" cy="-4" r="1.5" fill="#FACC15" opacity="0.7" />
            <circle cx="0" cy="6" r="1.5" fill="#FACC15" opacity="0.7" />
            <circle cx="-5" cy="4" r="1.3" fill="#D97706" opacity="0.75" />
            <circle cx="5" cy="5" r="1.3" fill="#D97706" opacity="0.75" />
          </g>
        </svg>

        {giant.stage === 3 && (
          <>
            <span
              style={{ left: 16, top: 20, animationDelay: '0s' }}
              className="animate-petal-drift absolute w-2 h-2 rounded-full bg-[#FACC15]/90"
            />
            <span
              style={{ left: 74, top: 26, animationDelay: '1.1s' }}
              className="animate-petal-drift absolute w-1.5 h-1.5 rounded-full bg-[#F59E0B]/90"
            />
            <span
              style={{ left: 48, top: 12, animationDelay: '2.2s' }}
              className="animate-petal-drift absolute w-2 h-1.5 rounded-full bg-[#4ADE80]/80"
            />
          </>
        )}
      </div>
    </div>
  );
}

export function TulipWindmillLandmark({ building }: { building: BuildingLandmarkState }) {
  if (!building.visible) return null;

  return (
    <div
      style={{
        left: building.x,
        top: building.y,
        transform: 'translate(-50%, -100%)',
      }}
      className="pointer-events-none absolute"
    >
      <div key={building.stage} className="animate-giant-pop">
        <svg
          viewBox="-36 -86 72 90"
          width="72"
          height="90"
          className="overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
          fill="none"
        >
          {building.stage === 1 && (
            <>
              <path
                d="M-15 0 L-12.5 -22 L12.5 -22 L15 0 Z"
                className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              <path d="M-4.5 0 L-4.5 -10 A4.5 4.5 0 0 1 4.5 -10 L4.5 0 Z" fill="#EA7824" />
            </>
          )}

          {building.stage >= 2 && (
            <>
              <path
                d="M-15 0 L-10 -44 L10 -44 L15 0 Z"
                className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              <path d="M-4.5 0 L-4.5 -10 A4.5 4.5 0 0 1 4.5 -10 L4.5 0 Z" fill="#EA7824" />
              <circle
                cx="0"
                cy="-27"
                r="4"
                className="fill-sky-100 dark:fill-slate-700 stroke-[#2857A4] dark:stroke-[#4E89E8]"
                strokeWidth="2.2"
              />
            </>
          )}

          {building.stage >= 3 && (
            <path
              d="M-11.5 -44 Q0 -62 11.5 -44 Z"
              className="fill-[#2857A4] dark:fill-[#4E89E8] stroke-[#2857A4] dark:stroke-[#4E89E8]"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
          )}

          {building.stage >= 4 && building.stage < 7 && (
            <g transform="translate(0, -44)">
              {[0, 90, 180].slice(0, building.stage - 3).map((deg, idx) => {
                const defaultColor = idx % 2 === 0 ? '#EA7824' : '#2857A4';
                const sailColor = building.sailColors?.[idx] ?? defaultColor;
                return (
                  <g key={deg} transform={`rotate(${deg})`}>
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="-30"
                      className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0 -8 Q9 -15 8 -26 Q2 -28 0 -20 Z"
                      fill={sailColor}
                      stroke={sailColor === '#2857A4' ? '#4E89E8' : sailColor}
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {building.stage === 7 && (
            <g transform="translate(0, -44)">
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 0 0"
                  to="360 0 0"
                  dur="6s"
                  repeatCount="indefinite"
                />
                {[0, 90, 180, 270].map((deg, idx) => {
                  const defaultColor = idx % 2 === 0 ? '#EA7824' : '#2857A4';
                  const sailColor = building.sailColors?.[idx] ?? defaultColor;
                  return (
                    <g key={deg} transform={`rotate(${deg})`}>
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="-30"
                        className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0 -8 Q9 -15 8 -26 Q2 -28 0 -20 Z"
                        fill={sailColor}
                        stroke={sailColor === '#2857A4' ? '#4E89E8' : sailColor}
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                    </g>
                  );
                })}
              </g>
            </g>
          )}

          {building.stage >= 3 && (
            <circle cx="0" cy="-44" r="3.8" fill="#FBBF24" stroke="#EA7824" strokeWidth="1.8" />
          )}
        </svg>
      </div>
    </div>
  );
}

export function GlassGreenhouseLandmark({ building }: { building: BuildingLandmarkState }) {
  if (!building.visible) return null;

  return (
    <div
      style={{
        left: building.x,
        top: building.y,
        transform: 'translate(-50%, -100%)',
      }}
      className="pointer-events-none absolute"
    >
      <div key={building.stage} className="animate-giant-pop">
        <svg
          viewBox="-40 -88 80 92"
          width="80"
          height="92"
          className="overflow-visible drop-shadow-[0_4px_10px_rgba(0,0,0,0.22)]"
          fill="none"
        >
          {/* Stage 1+: Conservatory base wall & arched door */}
          <path
            d="M-24 0 L-24 -12 L24 -12 L24 0 Z"
            className="fill-amber-100 dark:fill-[#2B3340] stroke-[#15803D] dark:stroke-[#4ADE80]"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />

          {/* Stage 2+: Sunlit glass walls + mullions */}
          {building.stage >= 2 && (
            <>
              <rect
                x="-23"
                y="-38"
                width="46"
                height="26"
                className="fill-amber-50/75 dark:fill-amber-300/15 stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <line
                x1="-11"
                y1="-38"
                x2="-11"
                y2="-12"
                className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth="1.8"
              />
              <line
                x1="11"
                y1="-38"
                x2="11"
                y2="-12"
                className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth="1.8"
              />
            </>
          )}

          {/* Stage 3+: Warm sunlit interior glow & 3 tiny glowing blooms inside */}
          {building.stage >= 3 && (
            <>
              <circle cx="0" cy="-24" r="14" fill="#FACC15" opacity="0.22" />
              {[-16, 0, 16].map((bx, idx) => (
                <g key={bx} transform={`translate(${bx}, -13)`}>
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={idx === 1 ? '-11' : '-8'}
                    className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="0"
                    cy={idx === 1 ? -13 : -10}
                    r={idx === 1 ? 4.2 : 3.4}
                    fill="#FACC15"
                    stroke="#D97706"
                    strokeWidth="1.2"
                  />
                  <circle cx="0" cy={idx === 1 ? -13 : -10} r="1.7" fill="#78350F" />
                </g>
              ))}
            </>
          )}

          {/* Arched door rendered cleanly over base/blooms */}
          <path d="M-5.5 0 L-5.5 -10 A5.5 5.5 0 0 1 5.5 -10 L5.5 0 Z" fill="#D97706" />

          {/* Stage 4: Roof truss frame only */}
          {building.stage === 4 && (
            <path
              d="M-27 -38 L0 -58 L27 -38 Z"
              className="stroke-[#15803D] dark:stroke-[#4ADE80]"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
          )}

          {/* Stage 5+: Sunlit glass roof panes + sunbeam highlights */}
          {building.stage >= 5 && (
            <>
              <path
                d="M-27 -38 L0 -58 L27 -38 Z"
                className="fill-amber-100/70 dark:fill-amber-200/20 stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth="2.6"
                strokeLinejoin="round"
              />
              <line x1="-13" y1="-44" x2="-4" y2="-52" stroke="#FEF9C3" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="-42" x2="15" y2="-49" stroke="#FEF9C3" strokeWidth="2" strokeLinecap="round" />
              <line
                x1="0"
                y1="-58"
                x2="0"
                y2="-38"
                className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth="2"
              />
            </>
          )}

          {/* Stage 6+: Golden finial spire */}
          {building.stage >= 6 && (
            <line
              x1="0"
              y1="-58"
              x2="0"
              y2="-72"
              stroke="#D97706"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          )}

          {/* Stage 7: Spinning golden sun-vane centered cleanly at (0, -72) */}
          {building.stage === 7 && (
            <g transform="translate(0, -72)">
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 0 0"
                  to="360 0 0"
                  dur="5.5s"
                  repeatCount="indefinite"
                />
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <g key={deg} transform={`rotate(${deg})`}>
                    <line x1="0" y1="0" x2="0" y2="-13" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
                    <ellipse
                      cx="0"
                      cy="-10"
                      rx="2.3"
                      ry="4.2"
                      fill="#FACC15"
                      stroke="#D97706"
                      strokeWidth="1.1"
                    />
                  </g>
                ))}
              </g>
            </g>
          )}

          {/* Stage 6+: Hub cap */}
          {building.stage >= 6 && (
            <circle cx="0" cy="-72" r="3.4" fill="#FACC15" stroke="#D97706" strokeWidth="1.8" />
          )}
        </svg>
      </div>
    </div>
  );
}

export function CarriedTulipSvg({
  variant,
  kind = 'tulip',
}: {
  variant: TulipVariant;
  kind?: FlowerSpecies;
}) {
  const style = VARIANT_STYLES[variant];
  if (kind === 'sunflower') {
    return (
      <g transform="translate(18, -22) rotate(18) scale(0.92)">
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-14"
          className="stroke-[#15803D] dark:stroke-[#4ADE80]"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M0 -2 Q9 -2 10 -10 Q3.5 -9 0 -2 Z"
          className="fill-[#22C55E] dark:fill-[#16A34A] stroke-[#15803D] dark:stroke-[#4ADE80]"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <g transform="translate(0, -21)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-7.5"
              rx="2.3"
              ry="4.2"
              transform={`rotate(${deg})`}
              fill="#FACC15"
              stroke="#D97706"
              strokeWidth="1.2"
            />
          ))}
          <circle cx="0" cy="0" r="5.2" fill="#78350F" stroke="#92400E" strokeWidth="1.4" />
        </g>
      </g>
    );
  }
  return (
    <g transform="translate(18, -22) rotate(18) scale(0.92)">
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="-12"
        className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M0 -2 Q9 -2 10 -10 Q3.5 -9 0 -2 Z"
        className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M-8 -27 L-8 -19 C-8 -13 -4 -11 0 -11 C4 -11 8 -13 8 -19 L8 -27 Q0 -24 -8 -27 Z"
        className="fill-white dark:fill-[#242B35]"
      />
      <path
        d="M-3.5 -25 Q0 -31 3.5 -25"
        stroke={style.accentStroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M-8 -27 L-8 -19 C-8 -13 -4 -11 0 -11 C4 -11 8 -13 8 -19 L8 -27"
        className={style.cupStrokeClass}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 -27 Q-3.5 -24 -3.5 -16.5 Q-3.5 -12.5 0 -11"
        stroke={style.accentStroke}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </g>
  );
}

interface BabyBuddyViewProps {
  species?: FlowerSpecies;
  x: number;
  y: number;
  width: number;
  height: number;
  facing: 1 | -1;
  squash: { sx: number; sy: number; rot: number };
  walking: boolean;
  jumping: boolean;
  stepPhase: number;
  blinking: boolean;
  inGame: boolean;
  speech: string | null;
  onPoke: () => void;
}

export function BabyBuddyView({
  species = 'tulip',
  x,
  y,
  width,
  height,
  facing,
  squash,
  walking,
  jumping,
  stepPhase,
  blinking,
  inGame,
  speech,
  onPoke,
}: BabyBuddyViewProps) {
  const isSun = species === 'sunflower';
  return (
    <div
      onClick={onPoke}
      title={isSun ? 'Mini Sunflower Buddy!' : 'Mini Tulip Buddy!'}
      style={{
        left: x,
        top: y,
        width,
        height,
        opacity: inGame ? 0 : 1,
        transform: `scaleX(${facing * squash.sx}) scaleY(${squash.sy}) rotate(${squash.rot}deg)`,
        transformOrigin: '50% 90%',
      }}
      className={`absolute transition-opacity duration-200 ${
        inGame ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
      }`}
    >
      {speech && (
        <div
          style={{ transform: `scaleX(${facing})` }}
          className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded-full text-white font-display font-bold text-[9px] shadow-md animate-bounce ${
            isSun ? 'bg-[#D97706]' : 'bg-[#2857A4]'
          }`}
        >
          {speech}
        </div>
      )}

      {isSun ? (
        <svg
          viewBox="-24 -62 48 66"
          className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)]"
          fill="none"
        >
          {/* Cute baby sprout curl on top */}
          <path d="M0 -49 Q3 -58 9 -56" stroke="#22C55E" strokeWidth="2.8" strokeLinecap="round" />

          {/* Little green running legs & stem */}
          <g className="stroke-[#15803D] dark:stroke-[#4ADE80]" strokeWidth="3.8" strokeLinecap="round">
            <line
              x1="-3"
              y1="-11"
              x2={jumping ? '-8' : walking ? String(-3 + stepPhase * 5.5) : '-4'}
              y2={jumping ? '-2' : walking ? String(-1 - Math.max(0, stepPhase) * 2.5) : '0'}
            />
            <line
              x1="3"
              y1="-11"
              x2={jumping ? '8' : walking ? String(3 - stepPhase * 5.5) : '4'}
              y2={jumping ? '-4' : walking ? String(-1 - Math.max(0, -stepPhase) * 2.5) : '0'}
            />
            <line x1="0" y1="-10" x2="0" y2="-23" />
          </g>

          {/* Green baby leaf */}
          <path
            d="M0 -11 Q15 -11 16 -24 Q6 -23 0 -11 Z"
            className="fill-[#22C55E] dark:fill-[#16A34A] stroke-[#15803D] dark:stroke-[#4ADE80]"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* Cute 8-petal baby sunflower head */}
          <g transform="translate(0, -35)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-13"
                rx="4"
                ry="6.6"
                transform={`rotate(${deg})`}
                fill="#FACC15"
                stroke="#D97706"
                strokeWidth="1.7"
              />
            ))}
            <circle cx="0" cy="0" r="10.5" fill="#78350F" stroke="#92400E" strokeWidth="2.2" />
            {blinking ? (
              <g stroke="#FEF9C3" strokeWidth="2.1" strokeLinecap="round">
                <line x1="-3.5" y1="-0.5" x2="0.5" y2="-0.5" />
                <line x1="2.5" y1="-0.5" x2="6.5" y2="-0.5" />
              </g>
            ) : (
              <g>
                <circle cx="-1.5" cy="-0.5" r="2.3" fill="#FEF9C3" />
                <circle cx="4.8" cy="-0.5" r="2.3" fill="#FEF9C3" />
                <circle cx="-0.9" cy="-1.2" r="0.9" fill="#18181B" />
                <circle cx="5.4" cy="-1.2" r="0.9" fill="#18181B" />
              </g>
            )}
          </g>
        </svg>
      ) : (
        <svg
          viewBox="-24 -62 48 66"
          className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)]"
          fill="none"
        >
          <path d="M0 -48 Q3 -58 9 -56" stroke="#EA7824" strokeWidth="2.8" strokeLinecap="round" />
          <g className="stroke-[#2857A4] dark:stroke-[#4E89E8]" strokeWidth="3.8" strokeLinecap="round">
            <line
              x1="-3"
              y1="-11"
              x2={jumping ? '-8' : walking ? String(-3 + stepPhase * 5.5) : '-4'}
              y2={jumping ? '-2' : walking ? String(-1 - Math.max(0, stepPhase) * 2.5) : '0'}
            />
            <line
              x1="3"
              y1="-11"
              x2={jumping ? '8' : walking ? String(3 - stepPhase * 5.5) : '4'}
              y2={jumping ? '-4' : walking ? String(-1 - Math.max(0, -stepPhase) * 2.5) : '0'}
            />
            <line x1="0" y1="-10" x2="0" y2="-23" />
          </g>
          <path
            d="M0 -11 Q15 -11 16 -24 Q6 -23 0 -11 Z"
            className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <line x1="2" y1="-12" x2="12" y2="-20" stroke="#EA7824" strokeWidth="2.4" strokeLinecap="round" />
          <path
            d="M-13 -46 L-13 -34 C-13 -25 -6.5 -21 0 -21 C6.5 -21 13 -25 13 -34 L13 -46 Q0 -42 -13 -46 Z"
            className="fill-white dark:fill-[#242B35]"
          />
          <path
            d="M-5.5 -43 Q0 -52 5.5 -43"
            stroke="#EA7824"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M-13 -46 L-13 -34 C-13 -25 -6.5 -21 0 -21 C6.5 -21 13 -25 13 -34 L13 -46"
            className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M-13 -46 Q-5 -44 0 -38"
            className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M13 -46 Q-5 -41 -5 -30 Q-5 -24 0 -21"
            stroke="#EA7824"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          {blinking ? (
            <g className="stroke-slate-900 dark:stroke-white" strokeWidth="2.2" strokeLinecap="round">
              <line x1="1" y1="-33.5" x2="5.5" y2="-33.5" />
              <line x1="7.5" y1="-33.5" x2="12" y2="-33.5" />
            </g>
          ) : (
            <g>
              <circle cx="3.2" cy="-33.5" r="2.4" className="fill-slate-900 dark:fill-white" />
              <circle cx="9.6" cy="-33.5" r="2.4" className="fill-slate-900 dark:fill-white" />
              <circle cx="4" cy="-34.4" r="0.85" fill="#FFFFFF" />
              <circle cx="10.4" cy="-34.4" r="0.85" fill="#FFFFFF" />
            </g>
          )}
        </svg>
      )}
    </div>
  );
}

export function UprootedTulipItem({ item }: { item: UprootedTulip }) {
  const style = VARIANT_STYLES[item.variant];
  return (
    <div
      style={{
        left: item.x,
        top: item.y,
        opacity: item.opacity,
        transform: `translate(-50%, -50%) rotate(${item.rot}deg)`,
      }}
      className="pointer-events-none absolute"
    >
      {item.kind === 'sunflower' ? (
        <svg viewBox="-14 -32 28 34" width="18" height="24" fill="none">
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-14"
            className="stroke-[#15803D] dark:stroke-[#4ADE80]"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <g transform="translate(0, -21)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-7.5"
                rx="2.3"
                ry="4.2"
                transform={`rotate(${deg})`}
                fill="#FACC15"
                stroke="#D97706"
                strokeWidth="1.2"
              />
            ))}
            <circle cx="0" cy="0" r="5.2" fill="#78350F" stroke="#92400E" strokeWidth="1.4" />
          </g>
        </svg>
      ) : (
        <svg viewBox="-12 -30 24 32" width="18" height="24" fill="none">
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-11"
            className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M-7 -25 L-7 -18 C-7 -12.5 -3.5 -10.5 0 -10.5 C3.5 -10.5 7 -12.5 7 -18 L7 -25 Q0 -22 -7 -25 Z"
            className="fill-white dark:fill-[#242B35]"
          />
          <path d="M-3 -23.5 Q0 -29 3 -23.5" stroke={style.accentStroke} strokeWidth="2.1" strokeLinecap="round" />
          <path
            d="M-7 -25 L-7 -18 C-7 -12.5 -3.5 -10.5 0 -10.5 C3.5 -10.5 7 -12.5 7 -18 L7 -25"
            className={style.cupStrokeClass}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 -25 Q-3 -22 -3 -15.5 Q-3 -12 0 -10.5"
            stroke={style.accentStroke}
            strokeWidth="2.1"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

interface SunflowerBuddyViewProps extends Omit<BabyBuddyViewProps, 'species'> {
  leafTilt: number;
  mood?: 'normal' | 'angry' | 'happy';
  expression?: BuddyExpression;
  carryingFlower?: { variant: TulipVariant; kind: FlowerSpecies } | null;
}

export function SunflowerBuddyView({
  x,
  y,
  width,
  height,
  facing,
  squash,
  walking,
  jumping,
  stepPhase,
  blinking,
  inGame,
  speech,
  leafTilt,
  mood = 'normal',
  expression = 'normal',
  carryingFlower = null,
  onPoke,
}: SunflowerBuddyViewProps) {
  return (
    <div
      onClick={onPoke}
      title="Sunflower Guy — click me!"
      style={{
        left: x,
        top: y,
        width,
        height,
        opacity: inGame ? 0 : 1,
        transform: `scaleX(${facing * squash.sx}) scaleY(${squash.sy}) rotate(${squash.rot}deg)`,
        transformOrigin: '50% 90%',
      }}
      className={`absolute transition-opacity duration-200 ${
        inGame ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
      }`}
    >
      {speech && (
        <div
          style={{ transform: `scaleX(${facing})` }}
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#D97706] text-white font-display font-bold text-[10px] shadow-md animate-bounce"
        >
          {speech}
        </div>
      )}

      <svg
        viewBox="-26 -62 52 66"
        className="w-full h-full drop-shadow-[0_4px_7px_rgba(0,0,0,0.24)]"
        fill="none"
      >
        <g className="stroke-[#15803D] dark:stroke-[#4ADE80]" strokeWidth="3.6" strokeLinecap="round">
          <line
            x1="-3.5"
            y1="-11"
            x2={jumping ? '-9' : walking ? String(-3.5 + stepPhase * 6) : '-4.5'}
            y2={jumping ? '-2' : walking ? String(-1 - Math.max(0, stepPhase) * 2.5) : '0'}
          />
          <line
            x1="3.5"
            y1="-11"
            x2={jumping ? '9' : walking ? String(3.5 - stepPhase * 6) : '4.5'}
            y2={jumping ? '-4' : walking ? String(-1 - Math.max(0, -stepPhase) * 2.5) : '0'}
          />
          <line x1="0" y1="-10" x2="0" y2="-23" />
        </g>

        <g transform={`rotate(${leafTilt} 0 -11)`}>
          {carryingFlower && (
            <CarriedTulipSvg variant={carryingFlower.variant} kind={carryingFlower.kind} />
          )}
          <path
            d="M0 -11 Q16 -11 18 -24 Q6 -23 0 -11 Z"
            className="fill-[#22C55E] dark:fill-[#16A34A] stroke-[#15803D] dark:stroke-[#4ADE80]"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <line x1="2" y1="-12" x2="13" y2="-20" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g transform="translate(0, -37)">
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-14.5"
              rx="4.2"
              ry="7.5"
              transform={`rotate(${deg})`}
              fill="#FACC15"
              stroke="#D97706"
              strokeWidth="1.8"
            />
          ))}

          <circle cx="0" cy="0" r="11.5" fill="#78350F" stroke="#92400E" strokeWidth="2.4" />
          <circle cx="-5.5" cy="4.5" r="0.9" fill="#D97706" opacity="0.65" />
          <circle cx="5.8" cy="4.2" r="0.9" fill="#D97706" opacity="0.65" />
          <circle cx="0" cy="6.2" r="0.9" fill="#D97706" opacity="0.65" />

          {expression === 'ko' ? (
            <g stroke="#FEF9C3" strokeWidth="2.1" strokeLinecap="round">
              <line x1="-3.5" y1="-2.5" x2="0.5" y2="1.5" />
              <line x1="0.5" y1="-2.5" x2="-3.5" y2="1.5" />
              <line x1="3" y1="-2.5" x2="7" y2="1.5" />
              <line x1="7" y1="-2.5" x2="3" y2="1.5" />
            </g>
          ) : expression === 'happy' || mood === 'happy' ? (
            <g stroke="#FEF9C3" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M-4.5 -0.5 Q-2.2 -3.8 0 -0.5" />
              <path d="M2.2 -0.5 Q4.5 -3.8 6.8 -0.5" />
            </g>
          ) : expression === 'surprised' ? (
            <g>
              <circle cx="-1.5" cy="-0.5" r="2.8" fill="#FEF9C3" />
              <circle cx="5" cy="-0.5" r="2.8" fill="#FEF9C3" />
              <circle cx="-0.9" cy="-1.2" r="1.1" fill="#18181B" />
              <circle cx="5.6" cy="-1.2" r="1.1" fill="#18181B" />
            </g>
          ) : mood === 'angry' ? (
            <g>
              <circle cx="-1.5" cy="0" r="2.2" fill="#FEF9C3" />
              <circle cx="5" cy="0" r="2.2" fill="#FEF9C3" />
              <circle cx="-0.9" cy="-0.3" r="1" fill="#18181B" />
              <circle cx="5.6" cy="-0.3" r="1" fill="#18181B" />
              <line x1="-4.5" y1="-4.2" x2="0.5" y2="-2.4" stroke="#FACC15" strokeWidth="2.1" strokeLinecap="round" />
              <line x1="7.8" y1="-4.2" x2="3" y2="-2.4" stroke="#FACC15" strokeWidth="2.1" strokeLinecap="round" />
            </g>
          ) : blinking ? (
            <g stroke="#FEF9C3" strokeWidth="2" strokeLinecap="round">
              <line x1="-4" y1="-0.5" x2="0.5" y2="-0.5" />
              <line x1="2.5" y1="-0.5" x2="7" y2="-0.5" />
            </g>
          ) : (
            <g>
              <circle cx="-1.5" cy="-0.5" r="2.2" fill="#FEF9C3" />
              <circle cx="5" cy="-0.5" r="2.2" fill="#FEF9C3" />
              <circle cx="-0.9" cy="-1.1" r="0.85" fill="#18181B" />
              <circle cx="5.6" cy="-1.1" r="0.85" fill="#18181B" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

export function FallenBuddyItem({
  fallen,
  onPoke,
}: {
  fallen: FallenBuddyState;
  onPoke: (id: number) => void;
}) {
  if (!fallen.visible) return null;
  const isSun = fallen.species === 'sunflower';
  const w = isSun ? 38 : 42;
  const h = isSun ? 48 : 54;

  return (
    <div
      onClick={() => onPoke(fallen.id)}
      title={isSun ? 'KO’d Sunflower' : 'KO’d Tulip'}
      style={{
        left: fallen.x,
        top: fallen.y,
        width: w,
        height: h,
        transform: `scaleX(${fallen.facing}) rotate(${88 * fallen.facing + fallen.wiggle}deg)`,
        transformOrigin: '50% 90%',
      }}
      className="pointer-events-auto cursor-pointer absolute"
    >
      {fallen.speech && (
        <div
          style={{ transform: `rotate(${-88 * fallen.facing}deg) scaleX(${fallen.facing})` }}
          className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-white font-display font-bold text-[10px] shadow-md ${
            isSun ? 'bg-[#D97706]' : 'bg-[#EA7824]'
          }`}
        >
          {fallen.speech}
        </div>
      )}

      {isSun ? (
        <svg viewBox="-26 -62 52 66" className="w-full h-full opacity-90" fill="none">
          <g className="stroke-[#15803D] dark:stroke-[#4ADE80]" strokeWidth="3.6" strokeLinecap="round">
            <line x1="-3.5" y1="-11" x2="-6" y2="-1" />
            <line x1="3.5" y1="-11" x2="6" y2="-2" />
            <line x1="0" y1="-10" x2="0" y2="-23" />
          </g>
          <path
            d="M0 -11 Q16 -11 18 -24 Q6 -23 0 -11 Z"
            className="fill-[#22C55E] dark:fill-[#16A34A] stroke-[#15803D] dark:stroke-[#4ADE80]"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <g transform="translate(0, -37)">
            {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-14.5"
                rx="4.2"
                ry="7.5"
                transform={`rotate(${deg})`}
                fill="#FACC15"
                stroke="#D97706"
                strokeWidth="1.8"
              />
            ))}
            <circle cx="0" cy="0" r="11.5" fill="#78350F" stroke="#92400E" strokeWidth="2.4" />
            <g stroke="#FEF9C3" strokeWidth="2.1" strokeLinecap="round">
              <line x1="-3.5" y1="-2.5" x2="0.5" y2="1.5" />
              <line x1="0.5" y1="-2.5" x2="-3.5" y2="1.5" />
              <line x1="3" y1="-2.5" x2="7" y2="1.5" />
              <line x1="7" y1="-2.5" x2="3" y2="1.5" />
            </g>
          </g>
        </svg>
      ) : (
        <svg viewBox="-24 -58 48 62" className="w-full h-full opacity-90" fill="none">
          <g className="stroke-[#2857A4] dark:stroke-[#4E89E8]" strokeWidth="3.6" strokeLinecap="round">
            <line x1="-3" y1="-11" x2="-5" y2="-1" />
            <line x1="3" y1="-11" x2="5" y2="-2" />
            <line x1="0" y1="-10" x2="0" y2="-24" />
          </g>
          <path
            d="M0 -11 Q16 -11 18 -25 Q6 -24 0 -11 Z"
            className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <line x1="2" y1="-12" x2="13" y2="-21" stroke="#EA7824" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M-14 -48 L-14 -35 C-14 -26 -7 -22 0 -22 C7 -22 14 -26 14 -35 L14 -48 Q0 -44 -14 -48 Z"
            className="fill-white dark:fill-[#242B35]"
          />
          <path d="M-6 -45 Q0 -55 6 -45" stroke="#EA7824" strokeWidth="3.4" strokeLinecap="round" />
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
          <path
            d="M14 -48 Q-6 -43 -6 -31 Q-6 -25 0 -22"
            stroke="#EA7824"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <g className="stroke-slate-900 dark:stroke-white" strokeWidth="2.1" strokeLinecap="round">
            <line x1="1.5" y1="-37.5" x2="5.5" y2="-33.5" />
            <line x1="5.5" y1="-37.5" x2="1.5" y2="-33.5" />
            <line x1="7.5" y1="-37.5" x2="11.5" y2="-33.5" />
            <line x1="11.5" y1="-37.5" x2="7.5" y2="-33.5" />
          </g>
        </svg>
      )}
    </div>
  );
}
