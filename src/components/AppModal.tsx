import { useEffect } from 'react';
import {
  Check,
  Coffee,
  Download,
  ExternalLink,
  Github,
  ShoppingBag,
  X,
} from 'lucide-react';
import type { GitHubReleaseInfo, TulipApp } from '../types';
import type { DetectedOS } from '../hooks/useDetectedOS';
import { AppIcon, PlatformBadge } from './PlatformBadge';
import { resolveDownload } from '../hooks/useGitHubReleases';

interface AppModalProps {
  app: TulipApp | null;
  releases: Record<string, GitHubReleaseInfo>;
  detectedOS: { os: DetectedOS; label: string };
  onClose: () => void;
  onDonateForApp: (app: TulipApp) => void;
  onCheckoutApp: (app: TulipApp) => void;
}

export function AppModal({
  app,
  releases,
  detectedOS,
  onClose,
  onDonateForApp,
  onCheckoutApp,
}: AppModalProps) {
  useEffect(() => {
    if (!app) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [app, onClose]);

  if (!app) return null;

  const isPaid = app.pricing.type === 'paid';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#212734] border-2 border-slate-200 dark:border-slate-700 shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close app details"
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 pr-10 mb-5">
          <AppIcon app={app} size="lg" />
          <div className="min-w-0">
            <h3
              id="app-modal-title"
              className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight"
            >
              {app.name}
            </h3>
            <p className="text-sm sm:text-base font-medium text-[#2857A4] dark:text-[#6AA2FF] mt-1">
              {app.tagline}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {app.platforms.map((platform) => (
                <PlatformBadge key={platform} platform={platform} />
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {app.description}
        </p>

        {/* Highlights */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Why people love it
          </h4>
          <ul className="space-y-2">
            {app.highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200"
              >
                <span className="mt-0.5 p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Paid Download Banner (when configured as paid) */}
        {isPaid && (
          <div className="mb-6 p-5 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                ${app.pricing.priceUsd} {app.pricing.currency || 'AUD'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {app.pricing.note || 'One-time purchase · Instant digital download'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCheckoutApp(app)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-[#EA7824] hover:bg-[#D46515] text-white shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy &amp; Download</span>
            </button>
          </div>
        )}

        {/* Direct Downloads */}
        {app.downloads.length > 0 && !isPaid && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Direct Downloads (Latest GitHub Release)
            </h4>
            <div className="space-y-2.5">
              {[...app.downloads]
                .sort((a, b) =>
                  a.platform === detectedOS.os ? -1 : b.platform === detectedOS.os ? 1 : 0
                )
                .map((dl) => {
                  const resolved = resolveDownload(dl, releases);
                  const isMyOS = dl.platform === detectedOS.os;
                  return (
                    <a
                      key={dl.label}
                      href={resolved.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border group transition-colors ${
                        isMyOS
                          ? 'bg-orange-50/70 dark:bg-orange-500/10 border-[#EA7824]/50 hover:border-[#EA7824]'
                          : 'bg-slate-50 dark:bg-[#171C27] border-slate-200 dark:border-slate-700 hover:border-[#EA7824]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#EA7824] transition-colors flex flex-wrap items-center gap-2">
                          <span>{dl.label}</span>
                          {isMyOS && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EA7824] text-white">
                              For your {detectedOS.label}
                            </span>
                          )}
                          {resolved.version && (
                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {resolved.version}
                            </span>
                          )}
                          {resolved.fileSize && (
                            <span className="font-mono text-[11px] text-slate-500">
                              {resolved.fileSize}
                            </span>
                          )}
                        </div>
                        {dl.subtitle && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {dl.subtitle}
                          </div>
                        )}
                        {dl.installHint && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            💡 {dl.installHint}
                          </div>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#EA7824] text-white shrink-0">
                        <Download className="w-3.5 h-3.5" />
                        <span>Get</span>
                      </span>
                    </a>
                  );
                })}
            </div>
          </div>
        )}

        {/* Quick Install Steps */}
        {app.installSteps && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200/70 dark:border-blue-400/20">
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-2">
              {app.installSteps.title}
            </h4>
            <ol className="space-y-1.5 list-decimal list-inside text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {app.installSteps.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Store Links + Tip Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/70">
          <div className="flex flex-wrap gap-2">
            {app.storeLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  link.store === 'github'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    : 'bg-[#2857A4] hover:bg-[#1E4483] text-white'
                }`}
              >
                {link.store === 'github' ? (
                  <Github className="w-3.5 h-3.5" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onDonateForApp(app)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-50 dark:bg-orange-500/15 text-[#D46515] dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-500/25 transition-colors cursor-pointer"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Tip for this app</span>
          </button>
        </div>
      </div>
    </div>
  );
}
