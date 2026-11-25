import { Mail, Sprout } from 'lucide-react';
import { IN_PRODUCTION_APPS } from '../data/apps';
import { siteConfig } from '../data/siteConfig';
import { PlatformBadge } from './PlatformBadge';

const STAGE_STYLES: Record<string, string> = {
  'Beta Testing':
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  'In Development':
    'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  Prototyping:
    'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  'Early Build':
    'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
};

export function InProduction() {
  return (
    <section
      id="in-production"
      className="py-16 sm:py-22 scroll-mt-20 border-t border-slate-200/70 dark:border-slate-800/70"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Sprout className="w-4 h-4" />
              <span>Currently Growing</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white">
              Apps in Production
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
              A sneak peek at what&apos;s currently being tinkered with in the Tulip Works workshop.
              Want to try a beta or suggest an idea? Flick me a message!
            </p>
          </div>

          <a
            href={`mailto:${siteConfig.contactEmail}?subject=Beta%20Tester%20for%20Tulip%20Works!`}
            className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2.5 rounded-2xl text-sm font-bold bg-white dark:bg-[#212734] text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-[#EA7824] transition-colors shadow-xs"
          >
            <Mail className="w-4 h-4 text-[#EA7824]" />
            <span>Join a Beta Test</span>
          </a>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {IN_PRODUCTION_APPS.map((item) => (
            <div
              key={item.id}
              className="tulip-card flex flex-col justify-between rounded-3xl bg-white dark:bg-[#212734] border-2 border-dashed border-slate-300/90 dark:border-slate-700/80 hover:border-solid hover:border-[#2857A4] dark:hover:border-[#EA7824] p-6"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  {item.icon ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm shrink-0">
                      <img
                        src={item.icon}
                        alt={`${item.name} icon`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-black/5 dark:border-white/10 shrink-0"
                      style={{ backgroundColor: `${item.accentColor}1A` }}
                    >
                      <span role="img" aria-label={item.name}>
                        {item.emoji}
                      </span>
                    </div>
                  )}

                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                      STAGE_STYLES[item.stage] || STAGE_STYLES['In Development']
                    }`}
                  >
                    {item.stage}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mb-1.5">
                  {item.name}
                </h3>
                <p className="text-sm font-semibold text-[#2857A4] dark:text-[#6AA2FF] mb-2">
                  {item.tagline}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                  {item.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.eta || 'In progress'}
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-200">
                      {item.progress}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.progress}%`,
                        background:
                          'linear-gradient(90deg, #2857A4 0%, #EA7824 100%)',
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {item.platforms.map((platform) => (
                      <PlatformBadge key={platform} platform={platform} compact />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-slate-400">Coming soon</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
