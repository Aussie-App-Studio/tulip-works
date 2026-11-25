import { useEffect, useState } from 'react';
import { Coffee, ExternalLink, Heart, Mail, ShoppingBag, Sparkles, X } from 'lucide-react';
import { siteConfig, type DonationTier } from '../data/siteConfig';
import type { TulipApp } from '../types';

export interface DonateModalState {
  open: boolean;
  app?: TulipApp;
  mode?: 'donate' | 'checkout';
  initialTier?: DonationTier;
}

interface DonateModalProps {
  state: DonateModalState;
  onClose: () => void;
}

export function DonateModal({ state, onClose }: DonateModalProps) {
  const [selectedTier, setSelectedTier] = useState<DonationTier>(
    state.initialTier || siteConfig.donationTiers[1] || siteConfig.donationTiers[0]
  );

  useEffect(() => {
    if (state.initialTier) {
      setSelectedTier(state.initialTier);
    }
  }, [state.initialTier]);

  useEffect(() => {
    if (!state.open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [state.open, onClose]);

  if (!state.open) return null;

  const { payments } = siteConfig;
  const isCheckout = state.mode === 'checkout' && state.app;
  const activePaymentLinks = [
    payments.kofiUrl ? { label: 'Support on Ko-fi', url: payments.kofiUrl, primary: true } : null,
    payments.buyMeACoffeeUrl
      ? { label: 'Buy Me a Coffee', url: payments.buyMeACoffeeUrl, primary: !payments.kofiUrl }
      : null,
    selectedTier.checkoutUrl || payments.stripeGeneralDonationUrl
      ? {
          label: `Pay ${payments.currencySymbol}${selectedTier.amount} via Stripe`,
          url: selectedTier.checkoutUrl || payments.stripeGeneralDonationUrl,
          primary: !payments.kofiUrl && !payments.buyMeACoffeeUrl,
        }
      : null,
    payments.lemonSqueezyStoreUrl
      ? { label: 'Lemon Squeezy Store', url: payments.lemonSqueezyStoreUrl, primary: false }
      : null,
  ].filter(Boolean) as { label: string; url: string; primary: boolean }[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="donate-modal-title"
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#212734] border-2 border-slate-200 dark:border-slate-700 shadow-2xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isCheckout && state.app ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 text-[#EA7824] flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3
              id="donate-modal-title"
              className="font-display font-extrabold text-2xl text-slate-900 dark:text-white"
            >
              Get {state.app.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {state.app.pricing.note || 'One-time purchase with instant digital download.'}
            </p>
            {state.app.pricing.checkoutUrl ? (
              <a
                href={state.app.pricing.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm bg-[#EA7824] hover:bg-[#D46515] text-white shadow-md"
              >
                <span>
                  Continue to Checkout ({payments.currencySymbol}
                  {state.app.pricing.priceUsd})
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#171C27] border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">
                  Checkout link not connected yet!
                </p>
                <p>
                  Drop your Lemon Squeezy, Gumroad, or Stripe Payment Link into{' '}
                  <code className="font-mono text-[#EA7824]">src/data/apps.ts</code> under{' '}
                  <code className="font-mono">pricing.checkoutUrl</code> to activate instant
                  checkout for this app.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1.5 pr-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA7824]">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Tulip Works Tip Jar</span>
              </div>
              <h3
                id="donate-modal-title"
                className="font-display font-extrabold text-2xl text-slate-900 dark:text-white"
              >
                {state.app ? `Support ${state.app.name}` : 'Shout Jesse a Coffee!'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                100% optional — helps keep Tulip Works completely ad-free and funds new apps.
              </p>
            </div>

            {/* Tier Selector */}
            <div className="grid grid-cols-2 gap-2.5">
              {siteConfig.donationTiers.map((tier) => {
                const isSelected = tier.id === selectedTier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#EA7824] bg-orange-50/70 dark:bg-orange-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{tier.emoji}</span>
                      <span className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                        {payments.currencySymbol}
                        {tier.amount}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                      {tier.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Payment Buttons OR Setup-Ready Fallback */}
            {activePaymentLinks.length > 0 ? (
              <div className="space-y-2.5">
                {activePaymentLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                      link.primary
                        ? 'bg-[#EA7824] hover:bg-[#D46515] text-white shadow-md shadow-orange-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    <Coffee className="w-4 h-4" />
                    <span>{link.label}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/25 text-xs text-slate-700 dark:text-slate-200 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Online Tip Jar opening soon!</span>
                  </div>
                  <p>
                    Thank you so much for wanting to support Tulip Works! While online checkout is
                    being hooked up, feel free to say hi or shout a coffee directly below.
                  </p>
                </div>

                <a
                  href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
                    `Supporting Tulip Works (${payments.currencySymbol}${selectedTier.amount} - ${selectedTier.label})`
                  )}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm bg-[#2857A4] hover:bg-[#1E4483] text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Message Jesse Directly</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
