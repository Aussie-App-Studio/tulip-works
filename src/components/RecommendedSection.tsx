import { useMemo, useState } from 'react';
import { Award, Compass, ExternalLink, Github, Info, Search, X } from 'lucide-react';
import { RECOMMENDED_ITEMS } from '../data/recommendations';
import type { RecommendationCategory, RecommendationLink } from '../types';

const NONPROFIT_PERK_LINKS = [
  { label: 'Canva for Nonprofits', url: 'https://www.canva.com/canva-for-nonprofits/' },
  { label: 'Google Workspace (Nonprofits)', url: 'https://www.google.com/nonprofits/offerings/workspace/' },
  { label: 'Google Ad Grants ($120k/yr)', url: 'https://www.google.com/grants/' },
  { label: 'ConnectingUp (AU Tech Library)', url: 'https://www.connectingup.org/' },
  { label: 'ACNC (AU Charity Status)', url: 'https://www.acnc.gov.au/' },
];

const CATEGORY_TABS: { id: RecommendationCategory; label: string; emoji: string }[] = [
  { id: 'all', label: 'All Picks', emoji: '🌟' },
  { id: 'extensions', label: 'Browser Extensions', emoji: '🧩' },
  { id: 'apps-web', label: 'Apps & Web Tools', emoji: '📱' },
  { id: 'privacy', label: 'Privacy & Ad-Block', emoji: '🛡️' },
  { id: 'church-reformed', label: 'Bible & Church', emoji: '⛪' },
];

function linkClassName(variant: RecommendationLink['variant'] = 'primary') {
  if (variant === 'github') {
    return 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200';
  }
  if (variant === 'secondary') {
    return 'bg-[#2857A4] hover:bg-[#1E4483] text-white shadow-xs';
  }
  return 'bg-[#EA7824] hover:bg-[#D46515] text-white shadow-xs';
}

export function RecommendedSection() {
  const [activeCategory, setActiveCategory] = useState<RecommendationCategory>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const map: Record<RecommendationCategory, number> = {
      all: RECOMMENDED_ITEMS.length,
      extensions: 0,
      'apps-web': 0,
      privacy: 0,
      'church-reformed': 0,
    };
    for (const item of RECOMMENDED_ITEMS) {
      for (const cat of item.categories) {
        map[cat] += 1;
      }
    }
    return map;
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RECOMMENDED_ITEMS.filter((item) => {
      const matchesCat =
        activeCategory === 'all' || item.categories.includes(activeCategory);
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.creator.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.platforms.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, query]);

  return (
    <section
      id="recommended"
      className="py-16 sm:py-22 scroll-mt-20 border-t border-slate-200/70 dark:border-slate-800/70"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2857A4] dark:text-[#6AA2FF]">
              <Compass className="w-4 h-4" />
              <span>Personal Picks · Not Affiliated</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white">
              Apps &amp; Extensions I Recommend
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
              Cool, genuinely useful apps, sites, and browser extensions made by other people that
              I use myself and think are worth having.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search picks, Firefox, church..."
              aria-label="Search recommended apps and extensions"
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

        {/* Not Affiliated Notice */}
        <div className="mb-8 flex items-start sm:items-center gap-2.5 px-4 py-3 rounded-2xl bg-blue-50/75 dark:bg-[#212734] border border-blue-200/70 dark:border-slate-700/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <Info className="w-4 h-4 text-[#2857A4] dark:text-[#6AA2FF] shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong className="text-slate-900 dark:text-white">No affiliation or sponsorships:</strong>{' '}
            I didn&apos;t build any of the tools below and I don&apos;t earn anything from sharing
            them — they&apos;re just great tools worth bookmarking.
          </span>
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

        {/* Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-14 rounded-3xl bg-white dark:bg-[#212734] border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-3xl mb-2">🧭</p>
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
              Show all picks
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                data-tulip-perch="card"
                className="tulip-card flex flex-col justify-between rounded-3xl bg-white dark:bg-[#212734] border-2 border-slate-200/85 dark:border-slate-700/75 hover:border-[#2857A4] dark:hover:border-[#EA7824] p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/40"
              >
                <div>
                  {/* Top row: Icon + Kind pill */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {item.icon ? (
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/90 border border-slate-200/85 dark:border-slate-700/80 shadow-sm p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={item.icon}
                          alt={`${item.name} icon`}
                          className="w-full h-full object-contain rounded-lg"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.accentGradient} text-white shadow-md flex items-center justify-center text-2xl shrink-0 border border-white/15`}
                      >
                        <span role="img" aria-label={item.name}>
                          {item.emoji}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {item.versionBadge && (
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#D46515] dark:bg-orange-500/20 dark:text-orange-300 border border-orange-200/80 dark:border-orange-500/30">
                          {item.versionBadge}
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                        {item.kindLabel}
                      </span>
                    </div>
                  </div>

                  {/* Title & Creator */}
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#2857A4] dark:text-[#6AA2FF] mt-0.5 mb-2.5">
                    By {item.creator}
                  </p>

                  {/* Tagline & Description */}
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1.5 leading-snug">
                    {item.tagline}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {item.note && (
                    <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 rounded-xl px-3 py-1.5 mb-4">
                      💡 {item.note}
                    </p>
                  )}
                </div>

                {/* Footer: Platform tags + External links */}
                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.links.map((link) => {
                      const isRepo =
                        link.url.includes('github.com') || link.url.includes('gitflic.ru');
                      return (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${linkClassName(
                            link.variant
                          )} ${item.links.length === 1 ? 'w-full' : 'flex-1 min-w-[115px]'}`}
                        >
                          {isRepo && link.variant === 'github' ? (
                            <Github className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="truncate">{link.label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Nonprofit & Church Tech Perks Callout */}
        <div className="mt-10 rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-orange-50/70 dark:from-[#1D2432] dark:via-[#212734] dark:to-[#242026] border border-slate-200/90 dark:border-slate-700/80 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#EA7824]">
                <Award className="w-4 h-4" />
                <span>Bonus Tip for Churches &amp; Charities</span>
              </div>
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                Registered Not-for-Profit? Unlock free Canva Pro, Google Workspace &amp; Microsoft 365
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                With official charity/nonprofit status (like ACNC in Australia), churches can claim
                free <strong>Canva Premium</strong>, <strong>Google Workspace</strong> +{' '}
                <strong>Google Ad Grants</strong>, and discounted/free <strong>Microsoft 365</strong>{' '}
                (Teams, Planner, Word &amp; OneDrive) via ConnectingUp.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end shrink-0 lg:max-w-md">
              {NONPROFIT_PERK_LINKS.map((perk) => (
                <a
                  key={perk.url}
                  href={perk.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#171C27] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#EA7824] hover:text-[#EA7824] transition-colors shadow-2xs"
                >
                  <span>{perk.label}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
