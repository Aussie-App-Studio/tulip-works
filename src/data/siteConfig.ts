/**
 * ============================================================================
 * TULIP WORKS — SITE & PAYMENTS CONFIGURATION
 * ============================================================================
 * Edit this file to drop in your real Ko-fi, Buy Me a Coffee, Stripe Payment
 * Links, or Lemon Squeezy checkout URLs anytime — zero backend required!
 */

export interface DonationTier {
  id: string;
  amount: number;
  label: string;
  emoji: string;
  description: string;
  /** Optional direct Stripe Payment Link / Lemon Squeezy URL for this exact amount */
  checkoutUrl?: string;
}

export const siteConfig = {
  brandName: 'Tulip Works',
  tagline: 'Useful, fun apps for everyday people.',
  githubOwner: 'Aussie-App-Studio',
  githubProfileUrl: 'https://github.com/Aussie-App-Studio',
  contactEmail: 'jessegollan@gmail.com',
  location: 'Australia',

  /**
   * --------------------------------------------------------------------------
   * DONATIONS & PAID DOWNLOADS LINKS
   * --------------------------------------------------------------------------
   * Replace these URLs with your live Ko-fi, Buy Me a Coffee, Stripe Payment
   * Links, or Lemon Squeezy store URL when you're ready to go live.
   * Leave as empty string '' to show the clean built-in "Ready to Connect" guide
   * in the modal so visitors never hit a broken 404 link!
   */
  payments: {
    currencySymbol: '$',
    currencyCode: 'AUD',
    kofiUrl: '', // e.g. 'https://ko-fi.com/tulipworks'
    buyMeACoffeeUrl: '', // e.g. 'https://buymeacoffee.com/tulipworks'
    stripeGeneralDonationUrl: '', // e.g. 'https://donate.stripe.com/...'
    lemonSqueezyStoreUrl: '', // e.g. 'https://tulipworks.lemonsqueezy.com'
  },

  donationTiers: [
    {
      id: 'coffee',
      amount: 5,
      label: 'Shout a Flat White',
      emoji: '☕',
      description: 'Keeps the late-night bug fixes rolling.',
      checkoutUrl: '',
    },
    {
      id: 'pizza',
      amount: 10,
      label: 'Midnight Pizza Fuel',
      emoji: '🍕',
      description: 'Fuels late-night feature builds and weekend tinkering.',
      checkoutUrl: '',
    },
    {
      id: 'tulip-bunch',
      amount: 20,
      label: 'A Bunch of Tulips',
      emoji: '🌷',
      description: 'Covers store fees & server costs for months.',
      checkoutUrl: '',
    },
    {
      id: 'legend',
      amount: 50,
      label: 'Absolute Legend',
      emoji: '🧡',
      description: 'Huge boost toward keeping all apps 100% ad-free.',
      checkoutUrl: '',
    },
  ] as DonationTier[],

  about: {
    heading: 'Hey! I’m Jesse — the guy behind Tulip Works.',
    intro:
      "I’m not trying to get hired by Big Tech, and this isn’t a flashy tech resume. I just genuinely love building useful, clean, ad-free apps and browser extensions for my church, my friends, and everyday people.",
    tulipStory:
      'Why "Tulip Works"? A quiet nod to Reformed theology (if you know, you know), a genuine love of tulips, and a soft spot for tinkering with ideas until they bloom into something genuinely useful.',
    mission:
      "If you clicked over here from one of my Chrome extensions, Android apps, or Windows/Mac tools — welcome! Everything I make lives right here so you can grab whatever else looks handy, no accounts or tracking required.",
    quickFacts: [
      {
        emoji: '🛠️',
        title: 'Tinkerer at Heart',
        text: 'If a tiny everyday annoyance bugs me twice, there’s a solid chance I’ll build an app to fix it.',
      },
      {
        emoji: '🛡️',
        title: 'Zero Ads. Zero Tracking.',
        text: 'Every single app respects your privacy and works offline wherever possible.',
      },
      {
        emoji: '🇦🇺',
        title: 'Made in Australia',
        text: 'Built in spare evenings & weekends for friends, churches, and real humans.',
      },
      {
        emoji: '🙌',
        title: 'Built for Normies',
        text: 'No confusing setup or bloat — just click download and get on with your day.',
      },
    ],
  },
};
