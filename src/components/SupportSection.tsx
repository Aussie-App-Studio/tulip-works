import { useState } from 'react';
import { Coffee, CreditCard, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { siteConfig, type DonationTier } from '../data/siteConfig';

interface SupportSectionProps {
  onSelectTier: (tier: DonationTier) => void;
}

export function SupportSection({ onSelectTier }: SupportSectionProps) {
  const [activeTierId, setActiveTierId] = useState<string>(siteConfig.donationTiers[1]?.id || 'coffee');

  const selectedTier =
    siteConfig.donationTiers.find((t) => t.id === activeTierId) ||
    siteConfig.donationTiers[0];

  return (
    <section
      id="support"
      className="py-16 sm:py-22 scroll-mt-20 bg-gradient-to-b from-orange-50/70 via-[#FAF9F6] to-[#FAF9F6] dark:from-[#1C2230] dark:via-[#151A24] dark:to-[#151A24] border-t border-slate-200/70 dark:border-slate-800/70"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-[#212734] border-2 border-slate-200/90 dark:border-slate-700/80 shadow-xl shadow-orange-900/5 dark:shadow-black/30 p-7 sm:p-10 lg:p-12">
          {/* Decorative Corner Accent */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#EA7824]/15 blur-3xl"
          />

          <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/15 text-[#D46515] dark:text-orange-300 text-xs font-bold">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Support Indie Software</span>
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white leading-tight">
                Enjoying an app?{' '}
                <span className="text-[#EA7824]">Shout me a coffee!</span>
              </h2>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Zero ads, zero creepy trackers, zero nagging popups. If a Tulip Works app saved you
                time, helped your church, or kept your photos backed up for free, you can drop a
                tip in the jar to help cover developer store fees and fuel the next build.
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Secure checkout via Ko-fi, Stripe &amp; Lemon Squeezy
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#EA7824]" />
                  No account needed
                </span>
              </div>
            </div>

            {/* Right Interactive Tip Jar */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-slate-50 dark:bg-[#171C27] border border-slate-200/80 dark:border-slate-700/70 p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {siteConfig.donationTiers.map((tier) => {
                    const isSelected = tier.id === selectedTier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setActiveTierId(tier.id)}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-[#212734] border-[#EA7824] shadow-md shadow-orange-500/10'
                            : 'bg-white/60 dark:bg-[#212734]/50 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{tier.emoji}</span>
                          <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                            {siteConfig.payments.currencySymbol}
                            {tier.amount}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {tier.label}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  {selectedTier.emoji} {selectedTier.description}
                </p>

                <button
                  type="button"
                  onClick={() => onSelectTier(selectedTier)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-base bg-[#EA7824] hover:bg-[#D46515] text-white shadow-lg shadow-orange-500/25 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Coffee className="w-5 h-5" />
                  <span>
                    Send {siteConfig.payments.currencySymbol}
                    {selectedTier.amount} ({selectedTier.label})
                  </span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Also supports paid app downloads &amp; license packs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
