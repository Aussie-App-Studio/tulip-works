import { Coffee, Github, Heart, Mail } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { TulipLogo } from './TulipLogo';

interface FooterProps {
  onOpenDonate: () => void;
}

export function Footer({ onOpenDonate }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1B212E] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <TulipLogo className="w-12 h-12 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700" />
            <div>
              <div className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                Tulip <span className="text-[#EA7824]">Works</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Useful, ad-free apps &amp; extensions made in {siteConfig.location}.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={siteConfig.githubProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>
            <button
              type="button"
              onClick={onOpenDonate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#EA7824] hover:bg-[#D46515] text-white transition-colors cursor-pointer"
            >
              <Coffee className="w-4 h-4" />
              <span>Tip Jar</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p className="inline-flex items-center gap-1.5">
            <span>© {year} Tulip Works · Made with</span>
            <Heart className="w-3.5 h-3.5 text-[#EA7824] fill-current" />
            <span>and 🌷 in Australia.</span>
          </p>
          <p>Zero ads · Zero trackers · Built for friends &amp; everyday humans.</p>
        </div>
      </div>
    </footer>
  );
}
