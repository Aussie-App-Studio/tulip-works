import { ArrowDown, Gamepad2, ShieldCheck, Sparkles, SunMoon } from 'lucide-react';
import { TulipLogo } from './TulipLogo';
import { AppIcon } from './PlatformBadge';
import type { TulipApp } from '../types';

interface HeroProps {
  featuredApps: TulipApp[];
  totalLiveApps: number;
  totalWipApps: number;
  onSelectApp: (app: TulipApp) => void;
  onToggleTheme: () => void;
}

export function Hero({
  featuredApps,
  totalLiveApps,
  totalWipApps,
  onSelectApp,
  onToggleTheme,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-tulip-dots border-b border-slate-200/70 dark:border-slate-800/70">
      {/* Subtle Dutch Blue & Orange ambient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#2857A4]/12 dark:bg-[#2857A4]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#EA7824]/15 dark:bg-[#EA7824]/15 blur-3xl"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-18 sm:pb-22">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#212734] border border-slate-200 dark:border-slate-700/80 shadow-xs text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
              <span className="inline-block w-2 h-2 rounded-full bg-[#EA7824] animate-pulse" />
              <span>Indie apps from Australia · Zero ads, zero tracking</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 dark:text-white leading-[1.06]">
              Useful little apps{' '}
              <span className="relative inline-block text-[#2857A4] dark:text-[#6AA2FF]">
                for real people.
                <svg
                  aria-hidden="true"
                  viewBox="0 0 280 14"
                  className="absolute -bottom-1.5 left-0 w-full h-3 text-[#EA7824]"
                  fill="none"
                >
                  <path
                    d="M3 10.5C68 3 195 2 277 9.5"
                    stroke="currentColor"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Welcome to <strong className="text-slate-900 dark:text-white">Tulip Works</strong>! If
              you clicked over here from one of my Chrome extensions, Android apps, or desktop tools
              — glad you made it. Here&apos;s everything else I&apos;ve built, plus what&apos;s
              growing next.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <a
                href="#apps"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-base bg-[#EA7824] hover:bg-[#D46515] text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore All Apps</span>
                <ArrowDown className="w-4 h-4" />
              </a>

              <a
                href="#tulip-run"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-base bg-white dark:bg-[#212734] text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-[#2857A4] dark:hover:border-[#EA7824] shadow-xs active:scale-[0.98] transition-all"
              >
                <Gamepad2 className="w-4 h-4 text-[#2857A4] dark:text-[#EA7824]" />
                <span>Play Tulip Run</span>
              </a>
            </div>

            {/* Normie Trust Pills */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                No weird tracking or logins
              </span>
              <span>•</span>
              <span>{totalLiveApps} Ready to Use</span>
              <span>•</span>
              <span>{totalWipApps} In Production</span>
            </div>
          </div>

          {/* Right Brand & Interactive Showcase */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              {/* Main Logo Card — matches exact white (#FFFFFF) / dark (#242B35) logo background */}
              <div className="relative rounded-3xl bg-white dark:bg-[#242B35] border-2 border-slate-200/90 dark:border-slate-700/80 shadow-2xl shadow-slate-900/8 dark:shadow-black/40 p-6 sm:p-7">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2857A4] dark:text-sky-300 bg-blue-50 dark:bg-blue-500/15 px-2.5 py-1 rounded-full">
                    Tulip Works HQ
                  </span>
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#EA7824] dark:hover:text-[#EA7824] transition-colors cursor-pointer"
                    title="Click to see the other logo!"
                  >
                    <SunMoon className="w-3.5 h-3.5" />
                    <span>Flip theme</span>
                  </button>
                </div>

                {/* Big Hero Tulip Logo */}
                <div className="flex justify-center py-2">
                  <TulipLogo className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl" />
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/70">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2.5">
                    Jump straight to a crowd favorite:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {featuredApps.slice(0, 4).map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => onSelectApp(app)}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-[#171C27] hover:bg-orange-50 dark:hover:bg-orange-500/10 border border-slate-200/70 dark:border-slate-700/60 hover:border-[#EA7824]/50 text-left transition-all cursor-pointer group"
                      >
                        <AppIcon app={app} size="sm" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#EA7824] transition-colors">
                            {app.id === 'deep-bible'
                              ? 'Deep Bible'
                              : app.id === 'wallpaper-scheduler'
                                ? 'Wallpaper Sync'
                                : app.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {app.platforms.includes('macos')
                              ? 'Win · Mac · Linux'
                              : app.platforms.includes('windows')
                                ? 'Windows 11'
                                : app.platforms.includes('chrome')
                                  ? 'Chrome Extension'
                                  : 'Android App'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fun floating decorative badge */}
              <div className="hidden sm:flex items-center gap-2 absolute -top-4 -right-4 px-3.5 py-2 rounded-2xl bg-[#2857A4] text-white text-xs font-bold shadow-lg shadow-blue-900/25 animate-float-slow">
                <span>🌷</span>
                <span>100% Indie · Zero Bloat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
