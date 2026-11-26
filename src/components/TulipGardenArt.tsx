export type TulipVariant = 'brand' | 'brand-inv' | 'gold' | 'coral' | 'lavender';
export type BuddyExpression = 'normal' | 'happy' | 'surprised';

export interface PlantedTulip {
  id: number;
  el: HTMLElement;
  relX: number;
  x: number;
  y: number;
  variant: TulipVariant;
  scale: number;
  tilt: number;
  swayDelay: number;
  fading?: boolean;
  visible: boolean;
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
}

export interface GiantTulipState {
  el: HTMLElement;
  relX: number;
  x: number;
  y: number;
  stage: 1 | 2 | 3;
  visible: boolean;
}

export interface WindmillState {
  el: HTMLElement;
  relX: number;
  x: number;
  y: number;
  stage: 1 | 2 | 3;
  visible: boolean;
}

/** Exact perch offset on the Giant Tulip's right leaf relative to its base (x, y). */
export const GIANT_LEAF_OFFSET_X = 24;
export const GIANT_LEAF_OFFSET_Y = -56;

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
        <svg
          viewBox="-14 -32 28 34"
          width="22"
          height="28"
          style={{ animationDelay: `${tulip.swayDelay}s` }}
          className="animate-tulip-sway overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.16)]"
          fill="none"
        >
          {/* Stem */}
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-12"
            className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Leaf */}
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
          {/* Tulip cup fill */}
          <path
            d="M-8 -27 L-8 -19 C-8 -13 -4 -11 0 -11 C4 -11 8 -13 8 -19 L8 -27 Q0 -24 -8 -27 Z"
            className="fill-white dark:fill-[#242B35]"
          />
          {/* Top center petal */}
          <path
            d="M-3.5 -25 Q0 -31 3.5 -25"
            stroke={style.accentStroke}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Outer cup outline */}
          <path
            d="M-8 -27 L-8 -19 C-8 -13 -4 -11 0 -11 C4 -11 8 -13 8 -19 L8 -27"
            className={style.cupStrokeClass}
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left inner curve */}
          <path
            d="M-8 -27 Q-3 -25.5 0 -22"
            className={style.cupStrokeClass}
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          {/* Swooping accent petal */}
          <path
            d="M8 -27 Q-3.5 -24 -3.5 -16.5 Q-3.5 -12.5 0 -11"
            stroke={style.accentStroke}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
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
        <svg
          viewBox="-16 -36 32 38"
          width="30"
          height="36"
          className="overflow-visible drop-shadow-[0_0_8px_rgba(251,191,36,0.75)]"
          fill="none"
        >
          {/* Golden glow halo */}
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
          <path
            d="M-4 -25 Q0 -32 4 -25"
            stroke="#FBBF24"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
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
      </div>
    </div>
  );
}

export function GiantTulipLandmark({ giant }: { giant: GiantTulipState }) {
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
          {/* Soft golden ambient aura at full bloom */}
          {giant.stage === 3 && (
            <circle cx="0" cy="-98" r="34" fill="#FBBF24" opacity="0.14" />
          )}

          {/* Bold arched stem */}
          <path
            d="M0 0 Q-4 -38 0 -72"
            className="stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Left balancing leaf */}
          <path
            d="M-1 -26 Q-28 -28 -32 -52 Q-11 -49 -1 -26 Z"
            className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="4.2"
            strokeLinejoin="round"
          />
          <line
            x1="-4"
            y1="-29"
            x2="-22"
            y2="-45"
            stroke="#EA7824"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Big right perch leaf — top surface sits right around (24, -56) */}
          <path
            d="M1 -40 Q28 -44 40 -62 Q16 -64 1 -40 Z"
            className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="4.4"
            strokeLinejoin="round"
          />
          <line
            x1="5"
            y1="-43"
            x2="28"
            y2="-56"
            stroke="#EA7824"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Giant Tulip Cup Fill */}
          <path
            d="M-26 -116 L-26 -93 C-26 -76 -13 -69 0 -69 C13 -69 26 -76 26 -93 L26 -116 Q0 -108 -26 -116 Z"
            className="fill-white dark:fill-[#242B35]"
          />

          {/* Top golden-orange center petal */}
          <path
            d="M-11 -111 Q0 -130 11 -111"
            stroke="#EA7824"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {giant.stage === 3 && (
            <path
              d="M-6 -116 Q0 -126 6 -116"
              stroke="#FBBF24"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          )}

          {/* Outer blue cup */}
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

          {/* Swooping orange inner petal */}
          <path
            d="M26 -116 Q-11 -106 -11 -85 Q-11 -74 0 -69"
            stroke="#EA7824"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>

        {/* Drifting ambient petals at full bloom */}
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

export function TulipWindmillLandmark({ windmill }: { windmill: WindmillState }) {
  if (!windmill.visible) return null;

  return (
    <div
      style={{
        left: windmill.x,
        top: windmill.y,
        transform: 'translate(-50%, -100%)',
      }}
      className="pointer-events-none absolute"
    >
      <div key={windmill.stage} className="animate-giant-pop">
        <svg
          viewBox="-36 -86 72 90"
          width="72"
          height="90"
          className="overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
          fill="none"
        >
          {/* Stage 1+: Tapered geometric tower */}
          <path
            d="M-15 0 L-10 -44 L10 -44 L15 0 Z"
            className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Little arched door */}
          <path
            d="M-4.5 0 L-4.5 -10 A4.5 4.5 0 0 1 4.5 -10 L4.5 0 Z"
            fill="#EA7824"
          />
          {/* Little round window */}
          <circle
            cx="0"
            cy="-27"
            r="4"
            className="fill-sky-100 dark:fill-slate-700 stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="2.2"
          />

          {/* Stage 2+: Domed cap roof */}
          {windmill.stage >= 2 && (
            <path
              d="M-11.5 -44 Q0 -62 11.5 -44 Z"
              className="fill-[#2857A4] dark:fill-[#4E89E8] stroke-[#2857A4] dark:stroke-[#4E89E8]"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
          )}

          {/* Stage 3: Spinning 4-blade Tulip-Petal Sails */}
          {windmill.stage >= 3 && (
            <g transform="translate(0, -44)">
              <g className="animate-windmill-spin">
                {[0, 90, 180, 270].map((deg, idx) => {
                  const isOrange = idx % 2 === 0;
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
                        fill={isOrange ? '#EA7824' : '#2857A4'}
                        stroke={isOrange ? '#EA7824' : '#4E89E8'}
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                    </g>
                  );
                })}
              </g>
            </g>
          )}

          {/* Stage 2+: Center axle hub */}
          {windmill.stage >= 2 && (
            <circle
              cx="0"
              cy="-44"
              r="3.8"
              fill="#FBBF24"
              stroke="#EA7824"
              strokeWidth="1.8"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

interface BabyBuddyViewProps {
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
  return (
    <div
      onClick={onPoke}
      title="Mini Tulip Buddy!"
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
          className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded-full bg-[#2857A4] text-white font-display font-bold text-[9px] shadow-md animate-bounce"
        >
          {speech}
        </div>
      )}

      <svg
        viewBox="-24 -62 48 66"
        className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.2)]"
        fill="none"
      >
        {/* Little baby sprout curl on top */}
        <path
          d="M0 -48 Q3 -58 9 -56"
          stroke="#EA7824"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Little running legs */}
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

        {/* Leaf */}
        <path
          d="M0 -11 Q15 -11 16 -24 Q6 -23 0 -11 Z"
          className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <line
          x1="2"
          y1="-12"
          x2="12"
          y2="-20"
          stroke="#EA7824"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Tulip Cup Fill */}
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

        {/* Extra big cute baby eyes */}
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
    </div>
  );
}
