import { useState } from 'react';
import { Coffee, Menu, Moon, Sun, X } from 'lucide-react';
import { TulipLogo } from './TulipLogo';
import type { ThemeMode } from '../hooks/useTheme';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenDonate: () => void;
  sunflowerMode?: boolean;
}

const NAV_LINKS = [
  { href: '#apps', label: 'Apps' },
  { href: '#tulip-run', label: 'Tulip Run 🌷' },
  { href: '#in-production', label: 'In Production' },
  { href: '#recommended', label: 'Recommended' },
  { href: '#about', label: 'About Me' },
];

export function Navbar({ theme, onToggleTheme, onOpenDonate, sunflowerMode = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-[#FAF9F6]/85 dark:bg-[#151A24]/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand */}
        <a href="#" className="flex items-center gap-3 group">
          <TulipLogo className="w-11 h-11 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700/80 shadow-sm group-hover:scale-105 transition-transform" />
          <div className="leading-tight">
            <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white block">
              Tulip <span className="text-[#EA7824]">Works</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
              Apps &amp; extensions made for real people
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/80 dark:bg-[#242B35]/85 border border-slate-200/80 dark:border-slate-700/70 rounded-full p-1 shadow-xs shrink-0">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#2857A4] dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-700/60 transition-colors"
            >
              {link.href === '#tulip-run' && sunflowerMode ? 'Sunflower Run 🌻' : link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenDonate}
            className="whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-sm font-bold bg-[#EA7824] hover:bg-[#D46515] text-white shadow-sm shadow-orange-500/20 hover:shadow-md hover:shadow-orange-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <Coffee className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Tip Jar</span>
            <span className="sm:hidden">Tip</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#242B35] text-slate-700 dark:text-amber-300 hover:border-[#2857A4] dark:hover:border-[#EA7824] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#242B35] text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B212E] px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {link.href === '#tulip-run' && sunflowerMode ? 'Sunflower Run 🌻' : link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
