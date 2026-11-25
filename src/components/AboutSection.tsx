import { Github, Mail, MapPin } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { TulipLogo } from './TulipLogo';

export function AboutSection() {
  const { about } = siteConfig;

  return (
    <section
      id="about"
      className="py-16 sm:py-22 scroll-mt-20 border-t border-slate-200/70 dark:border-slate-800/70"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Story Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2857A4] dark:text-[#6AA2FF]">
              <span>👋 About Me</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white leading-tight">
              {about.heading}
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>{about.intro}</p>
              <p className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-[#212734] border-l-4 border-[#EA7824] text-slate-800 dark:text-slate-200 font-medium">
                🌷 {about.tulipStory}
              </p>
              <p>{about.mission}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`mailto:${siteConfig.contactEmail}?subject=Hey%20from%20Tulip%20Works!`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-[#2857A4] hover:bg-[#1E4483] text-white shadow-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Say Hi / Send an App Idea</span>
              </a>

              <a
                href={siteConfig.githubProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-white dark:bg-[#212734] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#EA7824] transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub (@{siteConfig.githubOwner})</span>
              </a>

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">
                <MapPin className="w-3.5 h-3.5 text-[#EA7824]" />
                {siteConfig.location}
              </span>
            </div>
          </div>

          {/* Right Quick Facts + Both Logos Showcase */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              {about.quickFacts.map((fact) => (
                <div
                  key={fact.title}
                  data-tulip-perch="card"
                  className="p-4 rounded-2xl bg-white dark:bg-[#212734] border border-slate-200/85 dark:border-slate-700/75 shadow-xs"
                >
                  <div className="text-2xl mb-2">{fact.emoji}</div>
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {fact.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {fact.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Dual Brand Mark Card showing both Light & Dark Tulip Works logos */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#212734] border border-slate-200/85 dark:border-slate-700/75 flex items-center justify-between gap-4">
              <div>
                <p className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Built for Day &amp; Night
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Two official Tulip Works badges — one for sunny mornings, one for late-night tinkering.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <TulipLogo
                  variant="light"
                  className="w-13 h-13 rounded-xl border border-slate-200 shadow-xs"
                  alt="Tulip Works light logo"
                />
                <TulipLogo
                  variant="dark"
                  className="w-13 h-13 rounded-xl border border-slate-700 shadow-xs"
                  alt="Tulip Works dark logo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
