import { useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  Heart,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { AppIcon, PlatformBadge, PLATFORM_META } from './PlatformBadge';
import type { AppCategory, DirectDownload, GitHubReleaseInfo, TulipApp } from '../types';
import type { DetectedOS } from '../hooks/useDetectedOS';
import { resolveDownload } from '../hooks/useGitHubReleases';

interface AppCatalogProps {
  apps: TulipApp[];
  releases: Record<string, GitHubReleaseInfo>;
  detectedOS: { os: DetectedOS; label: string };
  onSelectApp: (app: TulipApp) => void;
  onCheckoutApp: (app: TulipApp) => void;
}

const CATEGORY_TABS: { id: AppCategory; label: string; emoji: string }[] = [
  { id: 'all', label: 'Everything', emoji: '✨' },
  { id: 'desktop', label: 'Win / Mac / Linux', emoji: '💻' },
  { id: 'extensions', label: 'Browser Extensions', emoji: '🧩' },
  { id: 'android', label: 'Android Apps', emoji: '📱' },
  { id: 'bible-church', label: 'Bible & Church', emoji: '📖' },
  { id: 'everyday', label: 'Everyday Tools', emoji: '🛠️' },
];

function pickBestDownload(app: TulipApp, detectedOS: DetectedOS): DirectDownload | null {
  if (app.downloads.length === 0) return null;
  const osMatch = app.downloads.find((d) => d.platform === detectedOS);
  return osMatch || app.downloads[0];
}

export function AppCatalog({
  apps,
  releases,
  detectedOS,
  onSelectApp,
  onCheckoutApp,
}: AppCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<AppCategory>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const map: Record<AppCategory, number> = {
      all: apps.length,
      desktop: 0,
      extensions: 0,
      android: 0,
      'bible-church': 0,
      everyday: 0,
    };
    for (const app of apps) {
      for (const cat of app.categories) {
        map[cat] += 1;
      }
    }
    return map;
  }, [apps]);

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesCategory =
        activeCategory === 'all' || app.categories.includes(activeCategory);
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        app.name.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.platforms.some((p) => p.includes(q))
      );
    });
  }, [apps, activeCategory, query]);

  return (
    <section id="apps" className="py-16 sm:py-22 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#EA7824]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready to Grab</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white">
              Apps &amp; Extensions I&apos;ve Made
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-xl">
              Download directly from any card — or click a tile for all OS options, install tips,
              and details.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps, Bible, Mac..."
              aria-label="Search apps"
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-[#212734] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2857A4] dark:focus:border-[#EA7824] shadow-xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-9">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#2857A4] dark:bg-[#EA7824] text-white border-transparent shadow-md shadow-blue-900/15 dark:shadow-orange-900/25'
                    : 'bg-white dark:bg-[#212734] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-[#2857A4]/60 dark:hover:border-[#EA7824]/60'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* App Grid */}
        {filteredApps.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-white dark:bg-[#212734] border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-3xl mb-2">🌷</p>
            <p className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Nothing matched &ldquo;{query}&rdquo;
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Try clearing your search or checking a different category.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveCategory('all');
              }}
              className="px-4 py-2 rounded-full bg-[#2857A4] text-white text-sm font-bold cursor-pointer"
            >
              Show all apps
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => {
              const bestDl = pickBestDownload(app, detectedOS.os);
              const resolvedDl = bestDl ? resolveDownload(bestDl, releases) : null;
              const primaryStore =
                app.storeLinks.find((l) => l.store !== 'github') || app.storeLinks[0];
              const isPaid = app.pricing.type === 'paid';
              const extraDownloadsCount = Math.max(0, app.downloads.length - 1);

              return (
                <article
                  key={app.id}
                  onClick={() => onSelectApp(app)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectApp(app);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  className="tulip-card group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-[#212734] border-2 border-slate-200/85 dark:border-slate-700/75 hover:border-[#EA7824] dark:hover:border-[#EA7824] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-900/8 dark:hover:shadow-black/35 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#EA7824]"
                >
                  <div>
                    {/* Top row: Icon + Pricing/Feature Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <AppIcon app={app} size="md" />
                      <div className="flex flex-col items-end gap-1.5">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30">
                            <Tag className="w-3 h-3" />${app.pricing.priceUsd}
                          </span>
                        ) : app.pricing.type === 'pwyw' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/25">
                            <Heart className="w-3 h-3" />
                            Free · Tip Optional
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            Free
                          </span>
                        )}

                        {app.badge && (
                          <span className="text-[11px] font-bold text-[#2857A4] dark:text-sky-300">
                            {app.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Tagline */}
                    <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-[#EA7824] transition-colors mb-1.5">
                      {app.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {app.tagline}
                    </p>
                  </div>

                  {/* Bottom row: Platforms + Direct Download / Store Action */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {app.platforms.map((platform) => (
                        <PlatformBadge key={platform} platform={platform} compact />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {isPaid ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCheckoutApp(app);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#EA7824] hover:bg-[#D46515] text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                          <span>Buy (${app.pricing.priceUsd})</span>
                        </button>
                      ) : bestDl && resolvedDl ? (
                        <a
                          href={resolvedDl.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#EA7824] hover:bg-[#D46515] text-white shadow-xs transition-colors truncate"
                          title={`Download ${bestDl.label}${resolvedDl.fileSize ? ` (${resolvedDl.fileSize})` : ''}`}
                        >
                          <Download className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {bestDl.platform === 'chrome'
                              ? 'Download .zip'
                              : `Download (${PLATFORM_META[bestDl.platform].short})`}
                          </span>
                          {resolvedDl.fileSize && (
                            <span className="font-mono text-[10px] opacity-85 hidden sm:inline">
                              {resolvedDl.fileSize}
                            </span>
                          )}
                        </a>
                      ) : primaryStore ? (
                        <a
                          href={primaryStore.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#2857A4] hover:bg-[#1E4483] text-white shadow-xs transition-colors truncate"
                        >
                          <span className="truncate">{primaryStore.label}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApp(app);
                        }}
                        className="px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
                      >
                        {extraDownloadsCount > 0 ? `+${extraDownloadsCount} OS` : 'Details'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
