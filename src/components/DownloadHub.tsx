import { useState } from 'react';
import {
  Apple,
  CheckCircle2,
  Download,
  ExternalLink,
  HardDriveDownload,
  Info,
  Monitor,
  ShoppingBag,
  Smartphone,
  Terminal,
} from 'lucide-react';
import type { DirectDownload, GitHubReleaseInfo, PlatformId, TulipApp } from '../types';
import type { DetectedOS } from '../hooks/useDetectedOS';
import { resolveDownload } from '../hooks/useGitHubReleases';
import { AppIcon } from './PlatformBadge';

interface DownloadHubProps {
  apps: TulipApp[];
  releases: Record<string, GitHubReleaseInfo>;
  detectedOS: { os: DetectedOS; label: string };
  onSelectApp: (app: TulipApp) => void;
  onCheckoutApp: (app: TulipApp) => void;
}

const OS_TABS: {
  id: DetectedOS;
  label: string;
  icon: typeof Monitor;
  installNote: string;
  fileTypes: string;
}[] = [
  {
    id: 'windows',
    label: 'Windows',
    icon: Monitor,
    fileTypes: '.exe · .zip · Microsoft Store',
    installNote:
      'For portable .zip apps, extract the folder and double-click the .exe. If Windows SmartScreen says "unrecognized app", click "More info" → "Run anyway" (indie apps without pricey certificates show that prompt!).',
  },
  {
    id: 'macos',
    label: 'macOS',
    icon: Apple,
    fileTypes: '.dmg (Apple Silicon & Intel)',
    installNote:
      'Open the downloaded .dmg and drag the app into Applications. If macOS says the developer cannot be verified, right-click the app in Applications and choose "Open".',
  },
  {
    id: 'linux',
    label: 'Linux',
    icon: Terminal,
    fileTypes: '.deb · .AppImage · .rpm',
    installNote:
      'Ubuntu/Debian/Mint users: grab the .deb. Fedora/openSUSE: grab the .rpm. Want a portable single file that runs anywhere? Pick the .AppImage and mark it executable.',
  },
  {
    id: 'android',
    label: 'Android',
    icon: Smartphone,
    fileTypes: '.apk · Google Play',
    installNote:
      'Most Android apps are on Google Play, while direct releases (like Pix Relay) download as a single .apk file — tap it after downloading and allow installs from your browser.',
  },
];

interface DownloadRow {
  app: TulipApp;
  download: DirectDownload;
}

export function DownloadHub({
  apps,
  releases,
  detectedOS,
  onSelectApp,
  onCheckoutApp,
}: DownloadHubProps) {
  const [selectedOS, setSelectedOS] = useState<DetectedOS>(detectedOS.os);

  const activeTab = OS_TABS.find((t) => t.id === selectedOS) || OS_TABS[0];

  const directRows: DownloadRow[] = apps.flatMap((app) =>
    app.downloads
      .filter((d) => d.platform === selectedOS)
      .map((download) => ({ app, download }))
  );

  // Also list apps available on this OS via a store (e.g. Play Store / Microsoft Store) without a direct binary
  const storeOnlyApps = apps.filter(
    (app) =>
      app.platforms.includes(selectedOS as PlatformId) &&
      !app.downloads.some((d) => d.platform === selectedOS)
  );

  return (
    <section
      id="downloads"
      className="py-16 sm:py-22 scroll-mt-20 bg-white/75 dark:bg-[#1A202D]/75 border-y border-slate-200/80 dark:border-slate-800/80"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-9">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2857A4] dark:text-[#6AA2FF]">
              <HardDriveDownload className="w-4 h-4" />
              <span>Direct Distribution · Powered by GitHub Releases</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white">
              Download for Your Device
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
              Grab installers straight from this website — always synced with the latest release for{' '}
              <strong className="text-slate-900 dark:text-white">
                Windows, macOS, Linux, and Android
              </strong>
              .
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start md:self-auto px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/25 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Looks like you&apos;re on {detectedOS.label}</span>
          </div>
        </div>

        {/* OS Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {OS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedOS === tab.id;
            const isDetected = detectedOS.os === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedOS(tab.id)}
                className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2857A4] dark:bg-[#EA7824] text-white border-transparent shadow-lg shadow-blue-900/15 dark:shadow-orange-900/25'
                    : 'bg-white dark:bg-[#212734] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 hover:border-[#2857A4]/60 dark:hover:border-[#EA7824]/60'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-[#2857A4] dark:text-[#EA7824]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-base leading-tight flex items-center gap-1.5">
                    <span>{tab.label}</span>
                  </div>
                  <div
                    className={`text-[11px] truncate mt-0.5 ${
                      isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isDetected ? 'Your device' : tab.fileTypes}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Direct Installer List */}
        <div className="space-y-4">
          {directRows.map(({ app, download }) => {
            const resolved = resolveDownload(download, releases);
            const isPaid = app.pricing.type === 'paid';

            return (
              <div
                key={`${app.id}-${download.label}`}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#212734] border-2 border-slate-200/85 dark:border-slate-700/75 shadow-xs hover:border-[#2857A4]/60 dark:hover:border-[#EA7824]/60 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <button
                    type="button"
                    onClick={() => onSelectApp(app)}
                    className="cursor-pointer shrink-0"
                    title={`View ${app.name} details`}
                  >
                    <AppIcon app={app} size="md" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectApp(app)}
                        className="font-display font-extrabold text-lg text-slate-900 dark:text-white hover:text-[#EA7824] transition-colors cursor-pointer"
                      >
                        {app.name}
                      </button>
                      {resolved.version && (
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {resolved.version}
                        </span>
                      )}
                      {resolved.fileSize && (
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {resolved.fileSize}
                        </span>
                      )}
                      {resolved.isLive && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          Latest Live
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#2857A4] dark:text-[#6AA2FF] mt-0.5">
                      {download.label}
                      {download.subtitle ? ` — ${download.subtitle}` : ''}
                    </p>
                    {download.installHint && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {download.installHint}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {isPaid ? (
                    <button
                      type="button"
                      onClick={() => onCheckoutApp(app)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-[#EA7824] hover:bg-[#D46515] text-white shadow-sm shadow-orange-500/20 active:scale-95 transition-all cursor-pointer w-full md:w-auto"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Buy &amp; Download (${app.pricing.priceUsd})</span>
                    </button>
                  ) : (
                    <a
                      href={resolved.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-[#EA7824] hover:bg-[#D46515] text-white shadow-sm shadow-orange-500/20 active:scale-95 transition-all w-full md:w-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Now</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {/* Store-distributed apps for this OS */}
          {storeOnlyApps.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Also available for {activeTab.label} via app stores &amp; GitHub:
              </p>
              <div className="grid sm:grid-cols-2 gap-3.5">
                {storeOnlyApps.map((app) => {
                  const primaryLink = app.storeLinks[0];
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/90 dark:bg-[#212734]/80 border border-slate-200 dark:border-slate-700/70"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <AppIcon app={app} size="sm" />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onSelectApp(app)}
                            className="font-display font-bold text-sm text-slate-900 dark:text-white hover:text-[#EA7824] truncate block cursor-pointer"
                          >
                            {app.name}
                          </button>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {app.tagline}
                          </p>
                        </div>
                      </div>
                      {primaryLink && (
                        <a
                          href={primaryLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#151A24] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#2857A4] dark:hover:border-[#EA7824] shrink-0 transition-colors"
                        >
                          <span>{primaryLink.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Normie-friendly Install Help Callout */}
        <div className="mt-8 flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-400/20 text-sm text-slate-700 dark:text-slate-200">
          <Info className="w-5 h-5 text-[#2857A4] dark:text-[#6AA2FF] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white">
              Quick {activeTab.label} Install Tip:{' '}
            </span>
            {activeTab.installNote}
          </div>
        </div>
      </div>
    </section>
  );
}
