export type PlatformId = 'windows' | 'macos' | 'linux' | 'android' | 'chrome' | 'web';

export type AppCategory =
  | 'all'
  | 'desktop'
  | 'extensions'
  | 'android'
  | 'bible-church'
  | 'everyday';

export type PricingType = 'free' | 'pwyw' | 'paid';

export interface AppPricing {
  type: PricingType;
  /** Display price for paid apps, e.g. 5 for $5 AUD */
  priceUsd?: number;
  currency?: string;
  /** External checkout link (Lemon Squeezy, Stripe Payment Link, Gumroad) */
  checkoutUrl?: string;
  /** Friendly note shown next to the price */
  note?: string;
}

export interface DirectDownload {
  platform: PlatformId;
  label: string;
  /** e.g. "macOS Universal (.dmg)" */
  subtitle?: string;
  /** GitHub repo slug under the owner, e.g. "Pix-Relay-Auto-Mac-Sync", to auto-fetch latest release asset */
  githubRepo?: string;
  /** Optional filename matcher (regex string) when a repo has multiple assets */
  assetMatch?: string;
  /** Fallback direct URL (used immediately & if GitHub API rate-limits) */
  url: string;
  /** Fallback version label */
  version?: string;
  /** Fallback size label, e.g. "12.4 MB" */
  fileSize?: string;
  /** Optional quick normie-friendly install hint */
  installHint?: string;
}

export interface StoreLink {
  label: string;
  store: 'play-store' | 'chrome-store' | 'microsoft-store' | 'web' | 'github';
  url: string;
}

export interface TulipApp {
  id: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  icon?: string;
  /** Optional wide feature graphic / screenshot shown on the card & modal */
  banner?: string;
  /** Fallback gradient & emoji/icon key when no PNG icon exists */
  accentGradient: string;
  fallbackEmoji?: string;
  platforms: PlatformId[];
  categories: Exclude<AppCategory, 'all'>[];
  featured?: boolean;
  badge?: string;
  githubRepo?: string;
  githubUrl?: string;
  storeLinks: StoreLink[];
  downloads: DirectDownload[];
  pricing: AppPricing;
  installSteps?: {
    title: string;
    steps: string[];
  };
}

export interface InProductionApp {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stage: 'Beta Testing' | 'In Development' | 'Prototyping' | 'Early Build';
  progress: number;
  platforms: PlatformId[];
  accentColor: string;
  icon?: string;
  emoji: string;
  eta?: string;
  githubUrl?: string;
}

export interface GitHubReleaseAsset {
  name: string;
  size: number;
  browser_download_url: string;
  download_count: number;
}

export interface GitHubReleaseInfo {
  tagName: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  assets: GitHubReleaseAsset[];
}

export type RecommendationCategory =
  | 'church-reformed'
  | 'pc-desktop'
  | 'extensions'
  | 'mobile-web'
  | 'all';

export interface RecommendationLink {
  label: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'github';
}

export interface RecommendedItem {
  id: string;
  name: string;
  versionBadge?: string;
  creator: string;
  kindLabel: string;
  tagline: string;
  description: string;
  note?: string;
  icon?: string;
  emoji: string;
  accentGradient: string;
  platforms: string[];
  categories: Exclude<RecommendationCategory, 'all'>[];
  links: RecommendationLink[];
}
