import { Globe, Monitor, Smartphone, Terminal, Chrome, Apple } from 'lucide-react';
import type { PlatformId, TulipApp } from '../types';

export const PLATFORM_META: Record<
  PlatformId,
  { label: string; short: string; colorClass: string; icon: typeof Monitor }
> = {
  windows: {
    label: 'Windows',
    short: 'Win',
    colorClass:
      'bg-sky-100 text-sky-800 border-sky-200/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/25',
    icon: Monitor,
  },
  macos: {
    label: 'macOS',
    short: 'Mac',
    colorClass:
      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/20 dark:text-slate-200 dark:border-slate-400/25',
    icon: Apple,
  },
  linux: {
    label: 'Linux',
    short: 'Linux',
    colorClass:
      'bg-amber-100 text-amber-900 border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/25',
    icon: Terminal,
  },
  android: {
    label: 'Android',
    short: 'Android',
    colorClass:
      'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/25',
    icon: Smartphone,
  },
  chrome: {
    label: 'Chrome / Edge',
    short: 'Browser',
    colorClass:
      'bg-blue-100 text-blue-800 border-blue-200/80 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/25',
    icon: Chrome,
  },
  web: {
    label: 'Web',
    short: 'Web',
    colorClass:
      'bg-orange-100 text-orange-800 border-orange-200/80 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-400/25',
    icon: Globe,
  },
};

export function PlatformBadge({
  platform,
  compact = false,
}: {
  platform: PlatformId;
  compact?: boolean;
}) {
  const meta = PLATFORM_META[platform];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${meta.colorClass}`}
    >
      <Icon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{compact ? meta.short : meta.label}</span>
    </span>
  );
}

export function AppIcon({
  app,
  size = 'md',
}: {
  app: Pick<TulipApp, 'name' | 'icon' | 'accentGradient' | 'fallbackEmoji'>;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses =
    size === 'sm'
      ? 'w-11 h-11 rounded-xl text-xl'
      : size === 'lg'
        ? 'w-20 h-20 rounded-2xl text-4xl'
        : 'w-14 h-14 rounded-2xl text-2xl';

  if (app.icon) {
    return (
      <div
        className={`${sizeClasses} shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-center`}
      >
        <img
          src={app.icon}
          alt={`${app.name} icon`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} shrink-0 bg-gradient-to-br ${app.accentGradient} text-white shadow-md flex items-center justify-center border border-white/20`}
    >
      <span role="img" aria-label={app.name}>
        {app.fallbackEmoji || '🌷'}
      </span>
    </div>
  );
}
