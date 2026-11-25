import { useEffect, useRef, useState } from 'react';

type BuddyMode = 'perched' | 'jumping' | 'in-game';

interface Spark {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

const BUDDY_W = 42;
const BUDDY_H = 54;

/**
 * Friendly little Tulip Works buddy that lives on top of cards across the page!
 * - Strolls unpredictably along the top edge of whichever card he's perched on
 * - Drops/leaps from card to card as you scroll down (or up!)
 * - Hops right INTO the Tulip Run game canvas when you scroll there, and pops
 *   back OUT onto the cards below as you keep scrolling!
 * - Pure fun, zero interference with clicking anything on the page.
 */
export function TulipBuddy() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [facing, setFacing] = useState<1 | -1>(1);
  const [mode, setMode] = useState<BuddyMode>('perched');
  const [walking, setWalking] = useState(false);
  const [stepPhase, setStepPhase] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const [squash, setSquash] = useState({ sx: 1, sy: 1, rot: 0 });
  const [visible, setVisible] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [speech, setSpeech] = useState<string | null>(null);

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
    // Scroll re-target cooldown
    scrollCooldown: 0,
    initialized: false,
    sparkSeq: 1,
  });

  const emitSparks = (x: number, y: number, count = 6) => {
    const colors = ['#EA7824', '#2857A4', '#FBBF24', '#6AA2FF'];
    const batch: Spark[] = [];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * (0.15 + Math.random() * 0.7);
      const dist = 16 + Math.random() * 24;
      batch.push({
        id: stateRef.current.sparkSeq++,
        x,
        y,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 8,
        color: colors[i % colors.length],
      });
    }
    setSparks((prev) => [...prev.slice(-12), ...batch]);
    window.setTimeout(() => {
      const ids = new Set(batch.map((b) => b.id));
      setSparks((prev) => prev.filter((p) => !ids.has(p.id)));
    }, 520);
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

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

    const getPerches = (): HTMLElement[] =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-tulip-perch]')).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 90 && r.height > 40;
      });

    const pickTargetXOnCard = (rect: ReturnType<typeof getDocRect>) => {
      const pad = 28;
      const minX = rect.left + pad;
      const maxX = Math.max(minX, rect.right - pad - BUDDY_W);
      return minX + Math.random() * (maxX - minX);
    };

    const launchJumpTo = (targetEl: HTMLElement, intoGame: boolean) => {
      const s = stateRef.current;
      const r = getDocRect(targetEl);
      const endX = intoGame
        ? r.left + Math.min(110, r.width * 0.2)
        : pickTargetXOnCard(r);
      const endY = intoGame
        ? r.top + r.height * 0.72 - BUDDY_H
        : r.top - BUDDY_H + 5;

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
      emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 4, 5);
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
      s.walkTargetX = pickTargetXOnCard(r);
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
        if (stateRef.current.mode !== 'jumping') {
          pickBestPerchForViewport();
        }
      }, 95);
    };

    const onResize = () => {
      const s = stateRef.current;
      if (s.mode === 'perched' && s.currentEl) {
        const r = getDocRect(s.currentEl);
        s.y = r.top - BUDDY_H + 5;
        s.x = Math.min(Math.max(s.x, r.left + 20), Math.max(r.left + 20, r.right - 20 - BUDDY_W));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Animation loop for smooth strolling, parabolic leaps, and playful random hops
    let rafId = 0;
    let last = performance.now();
    let randomHopTimer = 4.2 + Math.random() * 4.5;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;

      if (s.initialized) {
        if (s.mode === 'jumping') {
          s.jumpT = Math.min(1, s.jumpT + dt / s.jumpDuration);
          const t = s.jumpT;
          // Smooth ease for horizontal, crisp gravity parabola for vertical
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
                s.walkTargetX = pickTargetXOnCard(r);
              }
              setMode('perched');
              emitSparks(s.x + BUDDY_W / 2, s.y + BUDDY_H - 4, 6);
            }
          }
        } else if (s.mode === 'perched' && s.currentEl) {
          // Keep glued to card top in case layout shifts (e.g. filter tabs changing grid height)
          if (!document.body.contains(s.currentEl)) {
            pickBestPerchForViewport();
          } else {
            const r = getDocRect(s.currentEl);
            const targetTop = r.top - BUDDY_H + 5;
            s.y += (targetTop - s.y) * Math.min(1, dt * 18);

            // Landing squash decay
            let isStrolling = false;
            if (s.squashTimer > 0) {
              s.squashTimer = Math.max(0, s.squashTimer - dt);
              const k = s.squashTimer / 0.22;
              setSquash({ sx: 1 + 0.2 * k, sy: 1 - 0.18 * k, rot: 0 });
            } else {
              // Stroll randomly along the card's top edge
              if (s.walkPause > 0) {
                s.walkPause -= dt;
                setWalking(false);
                setSquash({ sx: 1, sy: 1, rot: Math.sin(now * 0.003) * 1.8 });
              } else {
                const dx = s.walkTargetX - s.x;
                if (Math.abs(dx) < 3) {
                  s.walkPause = 1.1 + Math.random() * 2.2;
                  s.walkTargetX = pickTargetXOnCard(r);
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

              // Occasionally hop unpredictably to a neighboring visible card just for fun!
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

            if (!isStrolling) {
              setPos({ x: s.x, y: s.y });
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

  const handlePoke = () => {
    const s = stateRef.current;
    if (s.mode !== 'perched') return;
    const greetings = ['hi! 🌷', 'boing!', 'no ads!', 'wheee!', '✨'];
    setSpeech(greetings[Math.floor(Math.random() * greetings.length)]);
    window.setTimeout(() => setSpeech(null), 950);

    // Do a joyful little hop in place (or onto a neighboring visible card!)
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
      // Hop in place
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

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 overflow-x-clip"
    >
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
        {/* Optional tiny speech bubble when poked */}
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
              x2={mode === 'jumping' ? '-9' : walking ? String(-3 + stepPhase * 6) : '-4'}
              y2={mode === 'jumping' ? '-2' : walking ? String(-1 - Math.max(0, stepPhase) * 2.5) : '0'}
            />
            <line
              x1="3"
              y1="-11"
              x2={mode === 'jumping' ? '9' : walking ? String(3 - stepPhase * 6) : '4'}
              y2={mode === 'jumping' ? '-4' : walking ? String(-1 - Math.max(0, -stepPhase) * 2.5) : '0'}
            />
            {/* Stem */}
            <line x1="0" y1="-10" x2="0" y2="-24" />
          </g>

          {/* Leaf */}
          <path
            d="M0 -11 Q16 -11 18 -25 Q6 -24 0 -11 Z"
            className="fill-white dark:fill-[#242B35] stroke-[#2857A4] dark:stroke-[#4E89E8]"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <line x1="2" y1="-12" x2="13" y2="-21" stroke="#EA7824" strokeWidth="2.5" strokeLinecap="round" />

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

          {/* Cute blinking eyes */}
          {blinking ? (
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
