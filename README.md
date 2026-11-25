# 🌷 Tulip Works Website

The official home for **Tulip Works** — showcasing all apps, Chrome extensions, desktop utilities (Windows, macOS, Linux), Android apps, and upcoming projects in production.

## Quick Customization Guide

### 1. Plug in Donations & Paid Downloads
Open [`src/data/siteConfig.ts`](src/data/siteConfig.ts) and paste in your links under `payments`:
- `kofiUrl` — e.g. `https://ko-fi.com/tulipworks`
- `buyMeACoffeeUrl` — e.g. `https://buymeacoffee.com/tulipworks`
- `stripeGeneralDonationUrl` — a Stripe Payment Link for tips
- `lemonSqueezyStoreUrl` — your Lemon Squeezy / Gumroad store

To sell a specific app download, open [`src/data/apps.ts`](src/data/apps.ts) and change that app's `pricing` field:
```ts
pricing: {
  type: 'paid',
  priceUsd: 9,
  checkoutUrl: 'https://tulipworks.lemonsqueezy.com/buy/your-app',
  note: 'One-time purchase · Instant download + updates',
}
```

### 2. Add or Update Apps & Desktop Downloads
Edit [`src/data/apps.ts`](src/data/apps.ts):
- Live apps live in `TULIP_APPS`.
- Upcoming / beta apps live in `IN_PRODUCTION_APPS`.
- Any download entry with a `githubRepo` automatically fetches the latest release tag, file size, and `.dmg` / `.exe` / `.zip` / `.deb` / `.AppImage` / `.rpm` / `.apk` link directly from GitHub Releases!

### 3. Local Development
```bash
npm install
npm run dev
```

### 4. Automatic GitHub Pages Deployment
Every push to `main` automatically builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.
