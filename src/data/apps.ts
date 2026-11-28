import type { InProductionApp, TulipApp } from '../types';

/**
 * ============================================================================
 * TULIP WORKS — APP CATALOG
 * ============================================================================
 * Add, reorder, or edit apps right here.
 *
 * Desktop & direct downloads automatically query GitHub Releases when
 * `githubRepo` is provided — so publishing a new release on GitHub
 * automatically updates the version number, file size, and download links here!
 *
 * To make any download paid (via Lemon Squeezy, Stripe Payment Links, or Gumroad),
 * simply set:
 *   pricing: {
 *     type: 'paid',
 *     priceUsd: 9,
 *     checkoutUrl: 'https://tulipworks.lemonsqueezy.com/buy/your-product',
 *     note: 'One-time purchase · Lifetime updates'
 *   }
 */

export const TULIP_APPS: TulipApp[] = [
  {
    id: 'murmur',
    name: 'Murmur: Headphone Controls',
    tagline: 'Control your Sony, Bose, Soundcore, Galaxy Buds & AirPods — 100% offline.',
    description:
      'A fast, lightweight, strictly offline headphone control app for Windows, macOS, Linux, and Android. Switch Noise Cancelling and Ambient Sound modes, sculpt your EQ and bass, check live Left/Right/Case battery percentages, and toggle features like Speak-to-Chat, Wearing Detection, and Multipoint — with zero accounts, zero tracking, and zero internet required.',
    highlights: [
      'Supports Sony, Bose, Soundcore, Galaxy Buds & Apple AirPods',
      'Noise Cancelling, Adaptive Audio, Transparency & 20-step Ambient Sound',
      'Custom 5/8/10-band EQ, Clear Bass & saved sound profiles',
      'Live battery % (Left, Right & Case) + offline settings sync',
    ],
    icon: './app-icons/murmur.svg',
    banner: './app-banners/murmur.jpg',
    accentGradient: 'from-indigo-600 to-violet-600',
    fallbackEmoji: '🎧',
    platforms: ['windows', 'macos', 'linux', 'android'],
    categories: ['desktop', 'android', 'everyday'],
    featured: true,
    badge: 'Cross-Platform · Offline',
    githubRepo: 'Murmur-Headphone-Control',
    githubUrl: 'https://github.com/Aussie-App-Studio/Murmur-Headphone-Control',
    storeLinks: [
      {
        label: 'Android Page',
        store: 'web',
        url: 'https://aussie-app-studio.github.io/Murmur-Headphone-Control/',
      },
      {
        label: 'Android GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/Murmur-Headphone-Control',
      },
      {
        label: 'Windows GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/Murmur-Headphone-Control-PC',
      },
      {
        label: 'macOS GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/Murmur-Headphone-Control-Mac',
      },
      {
        label: 'Linux GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/Murmur-Headphone-Control-Linux',
      },
    ],
    downloads: [
      {
        platform: 'windows',
        label: 'Windows Portable (.exe)',
        subtitle: 'Windows 10 & 11 · Single file, no installer needed',
        githubRepo: 'Murmur-Headphone-Control-PC',
        assetMatch: '\\.exe$',
        url: 'https://github.com/Aussie-App-Studio/Murmur-Headphone-Control-PC/releases/latest/download/murmur.exe',
        version: 'v1.0.0',
        fileSize: '4.6 MB',
        installHint:
          'Run murmur.exe directly (if SmartScreen appears, click More info → Run anyway).',
      },
      {
        platform: 'macos',
        label: 'macOS Universal (.dmg)',
        subtitle: 'macOS 12+ · Apple Silicon & Intel',
        githubRepo: 'Murmur-Headphone-Control-Mac',
        assetMatch: '\\.dmg$',
        url: 'https://github.com/Aussie-App-Studio/Murmur-Headphone-Control-Mac/releases/latest/download/Murmur-macOS.dmg',
        version: 'v1.0.0',
        fileSize: '5.4 MB',
        installHint:
          'Open the .dmg, drag Murmur to Applications, and allow Bluetooth access when prompted.',
      },
      {
        platform: 'linux',
        label: 'Linux x86_64 (.tar.gz)',
        subtitle: 'X11 & Wayland · Native Rust binary + .desktop launcher',
        githubRepo: 'Murmur-Headphone-Control-Linux',
        assetMatch: '\\.tar\\.gz$',
        url: 'https://github.com/Aussie-App-Studio/Murmur-Headphone-Control-Linux/releases/latest/download/murmur-linux-x86_64.tar.gz',
        version: 'v1.0.0',
        fileSize: '4.4 MB',
        installHint: 'Extract the archive and run the binary or included .desktop launcher.',
      },
      {
        platform: 'android',
        label: 'Android App (.apk)',
        subtitle: 'Android 12+ · Zero internet permission',
        githubRepo: 'Murmur-Headphone-Control',
        assetMatch: '\\.apk$',
        url: 'https://github.com/Aussie-App-Studio/Murmur-Headphone-Control/releases/latest/download/Murmur-v1.0.0.apk',
        version: 'v1.0.0',
        fileSize: '3.1 MB',
        installHint:
          'Tap the downloaded .apk on your Android phone, allow install from browser, and grant Nearby devices.',
      },
    ],
    pricing: {
      type: 'free',
      note: '100% free, offline & open source across all platforms',
    },
    installSteps: {
      title: 'Quick Setup',
      steps: [
        'Pair your headphones in your device Bluetooth settings.',
        'Download Murmur for Windows, macOS, Linux, or Android below.',
        'Open Murmur — your connected headphones appear right away, with zero sign-in or internet required.',
      ],
    },
  },
  {
    id: 'pix-relay',
    name: 'Pix Relay',
    tagline: 'Auto-sync your photos & videos to a backup Pixel over home Wi-Fi.',
    description:
      'Automatically back up photos and videos from your daily phone, Mac, Linux machine, or Windows PC straight to a dedicated Pixel 1–4 over your own home Wi-Fi. No cloud middleman, no mobile data used, and end-to-end encrypted on your local network.',
    highlights: [
      'Works across macOS, Linux, Windows & Android',
      '100% local Wi-Fi — zero internet or cloud middleman',
      'Supports Apple Photos Library on Mac & custom folders on PC/Linux',
      'Encrypted transfer with zero tracking or accounts',
    ],
    icon: './app-icons/pix-relay.png',
    banner: './app-banners/pix-relay.jpg',
    accentGradient: 'from-blue-600 to-cyan-500',
    fallbackEmoji: '📸',
    platforms: ['macos', 'linux', 'windows', 'android'],
    categories: ['desktop', 'android', 'everyday'],
    featured: true,
    badge: 'Multi-Platform Flagship',
    githubRepo: 'Pix-Relay',
    githubUrl: 'https://github.com/Aussie-App-Studio/Pix-Relay',
    storeLinks: [
      {
        label: 'Setup & Docs Page',
        store: 'web',
        url: 'https://aussie-app-studio.github.io/Pix-Relay/',
      },
      {
        label: 'View on GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/Pix-Relay',
      },
    ],
    downloads: [
      {
        platform: 'macos',
        label: 'macOS Universal (.dmg)',
        subtitle: 'Apple Silicon & Intel Macs',
        githubRepo: 'Pix-Relay-Auto-Mac-Sync',
        assetMatch: '\\.dmg$',
        url: 'https://github.com/Aussie-App-Studio/Pix-Relay-Auto-Mac-Sync/releases/latest/download/Pix-Relay-Auto-Mac-Sync-Universal.dmg',
        version: 'v1.0.0',
        fileSize: '12.4 MB',
        installHint: 'Open the .dmg file and drag Pix Relay into your Applications folder.',
      },
      {
        platform: 'linux',
        label: 'Linux Ubuntu / Debian (.deb)',
        subtitle: 'Recommended for Ubuntu, Mint & Pop!_OS',
        githubRepo: 'Pix-Relay-Auto-Linux-Sync',
        assetMatch: '\\.deb$',
        url: 'https://github.com/Aussie-App-Studio/Pix-Relay-Auto-Linux-Sync/releases/latest/download/Pix-Relay-Auto-Linux-Sync-amd64.deb',
        version: 'v1.0.0',
        fileSize: '8.0 MB',
        installHint: 'Double-click to install with Software Center, or run sudo apt install ./file.deb.',
      },
      {
        platform: 'linux',
        label: 'Linux Portable (.AppImage)',
        subtitle: 'Works on almost any Linux distro',
        githubRepo: 'Pix-Relay-Auto-Linux-Sync',
        assetMatch: '\\.AppImage$',
        url: 'https://github.com/Aussie-App-Studio/Pix-Relay-Auto-Linux-Sync/releases/latest/download/Pix-Relay-Auto-Linux-Sync-x86_64.AppImage',
        version: 'v1.0.0',
        fileSize: '82.4 MB',
        installHint: 'Right-click → Properties → Allow executing as program, then double-click.',
      },
      {
        platform: 'linux',
        label: 'Linux Fedora / RHEL (.rpm)',
        subtitle: 'For Fedora, openSUSE & Red Hat',
        githubRepo: 'Pix-Relay-Auto-Linux-Sync',
        assetMatch: '\\.rpm$',
        url: 'https://github.com/Aussie-App-Studio/Pix-Relay-Auto-Linux-Sync/releases/latest/download/Pix-Relay-Auto-Linux-Sync-x86_64.rpm',
        version: 'v1.0.0',
        fileSize: '8.0 MB',
        installHint: 'Install via Software Center or run sudo dnf install ./file.rpm.',
      },
      {
        platform: 'android',
        label: 'Android App (.apk)',
        subtitle: 'For both your daily phone & backup Pixel',
        githubRepo: 'Pix-Relay',
        assetMatch: '\\.apk$',
        url: 'https://github.com/Aussie-App-Studio/Pix-Relay/releases/latest/download/PixRelay-v1.0.0.apk',
        version: 'v1.0.0',
        fileSize: '2.7 MB',
        installHint: 'Tap the downloaded .apk on your Android phone and allow install from browser.',
      },
    ],
    pricing: {
      type: 'pwyw',
      note: 'Free to download · Optional tip if it saves you cloud storage fees!',
    },
    installSteps: {
      title: 'Quick 1-Minute Setup',
      steps: [
        'Download the app for your Mac, Linux computer, or Android phone below.',
        'Install Pix Relay on your backup Pixel and open it on the same home Wi-Fi.',
        'Pair your devices once — after that, photos sync quietly in the background.',
      ],
    },
  },
  {
    id: 'wallpaper-scheduler',
    name: 'Wallpaper Scheduler',
    tagline: 'Automatically switch your Windows wallpaper & Light/Dark mode by time of day.',
    description:
      'A super lightweight (~0.6 MB!) native Windows 11 app that changes your desktop wallpaper — and optionally flips Windows between Light and Dark mode — at sunrise, sunset, or any custom schedule you choose.',
    highlights: [
      'Tiny 0.6 MB native Windows app — practically zero RAM usage',
      'Sunrise & sunset auto-scheduling or custom time slots',
      'Syncs Windows Light & Dark mode automatically',
      '100% offline, open source, no ads, no accounts',
    ],
    icon: './app-icons/wallpaper-scheduler.png',
    banner: './app-banners/wallpaper-scheduler.jpg',
    accentGradient: 'from-amber-500 to-orange-600',
    fallbackEmoji: '🌅',
    platforms: ['windows'],
    categories: ['desktop', 'everyday'],
    featured: true,
    badge: 'Windows 11 Favorite',
    githubRepo: 'wallpaper-scheduler',
    githubUrl: 'https://github.com/Aussie-App-Studio/wallpaper-scheduler',
    storeLinks: [
      {
        label: 'GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/wallpaper-scheduler',
      },
      {
        label: 'App Page',
        store: 'web',
        url: 'https://aussie-app-studio.github.io/wallpaper-scheduler/',
      },
    ],
    downloads: [
      {
        platform: 'windows',
        label: 'Windows Portable (.zip)',
        subtitle: 'Windows 10 & 11 (64-bit) · No installer needed',
        githubRepo: 'wallpaper-scheduler',
        assetMatch: '\\.zip$',
        url: 'https://github.com/Aussie-App-Studio/wallpaper-scheduler/releases/latest/download/WallpaperScheduler-v1.0.0-win-x64.zip',
        version: 'v1.0.0',
        fileSize: '603 KB',
        installHint: 'Unzip the folder and double-click WallpaperScheduler.exe. Done!',
      },
    ],
    pricing: {
      type: 'free',
      note: 'Free & open source forever · Tips always appreciated!',
    },
    installSteps: {
      title: 'Quick 30-Second Setup',
      steps: [
        'Download the portable .zip from GitHub or directly from this site.',
        'Unzip the folder and double-click WallpaperScheduler.exe (no installer needed).',
        'Pick your day & night wallpapers (or folders) and let it run silently!',
      ],
    },
  },
  {
    id: 'bible-hover',
    name: 'Bible Hover',
    tagline: 'Hover over any Bible reference on the web to read it instantly in 0ms.',
    description:
      'Reading an article, blog, or email that mentions "Romans 8:28" or "Psalm 23"? Just hover your mouse over it! Bible Hover pops up the full passage instantly — offline, zero lag, with multiple translations and classic commentaries.',
    highlights: [
      'Instant 0ms popups — Berean Standard Bible (BSB) built right in offline',
      'Supports BSB, KJV, ESV, NIV, NLT, NASB, CSB, NKJV & international languages',
      'Built-in classic commentaries right inside the hover card',
      'Works on Chrome, Edge, Brave, Arc, and Vivaldi',
    ],
    icon: './app-icons/bible-hover.png',
    banner: './app-banners/bible-hover.jpg',
    accentGradient: 'from-blue-700 to-indigo-600',
    fallbackEmoji: '📖',
    platforms: ['chrome'],
    categories: ['extensions', 'bible-church'],
    featured: true,
    badge: 'Chrome Web Store',
    githubRepo: 'Bible-Hover',
    githubUrl: 'https://github.com/Aussie-App-Studio/Bible-Hover',
    storeLinks: [
      {
        label: 'Chrome Web Store',
        store: 'chrome-store',
        url: 'https://chromewebstore.google.com/detail/bible-hover-%E2%80%94-instant-scr/eikdpekimeeaiehcbnhigbjbgpcfnmbp',
      },
      {
        label: 'GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/Bible-Hover',
      },
    ],
    downloads: [
      {
        platform: 'chrome',
        label: 'Direct Extension (.zip)',
        subtitle: 'Chrome, Edge, Brave, Arc & Vivaldi',
        githubRepo: 'Bible-Hover',
        assetMatch: '\\.zip$',
        url: 'https://github.com/Aussie-App-Studio/Bible-Hover/releases/latest/download/Bible-Hover-v1.0.3.zip',
        version: 'v1.0.3',
        fileSize: '1.3 MB',
      },
    ],
    pricing: {
      type: 'free',
      note: '100% Free · Zero ads or tracking',
    },
  },
  {
    id: 'deep-bible',
    name: 'Deep Bible for Bible.com',
    tagline: 'Turn YouVersion (Bible.com) into a distraction-free study Bible powerhouse.',
    description:
      'Upgrades Bible.com in your browser with instant 1-key translation switching (tap E for ESV, N for NIV, B for BSB!), verse-by-verse commentaries, Strong’s Greek & Hebrew word lookups, cross-references, and side-by-side parallel view.',
    highlights: [
      'Tap a single key to swap Bible translations in 0ms',
      'Verse commentaries, Strong’s Greek/Hebrew lexicon & cross-references',
      'Parallel translation comparison & clean distraction-free reading mode',
      'Keeps your native YouVersion cloud highlights intact',
    ],
    icon: './app-icons/deep-bible.png',
    banner: './app-banners/deep-bible.jpg',
    accentGradient: 'from-orange-500 to-rose-600',
    fallbackEmoji: '⚡',
    platforms: ['chrome'],
    categories: ['extensions', 'bible-church'],
    featured: true,
    badge: 'Study Powerhouse',
    githubRepo: 'Deep-Bible',
    githubUrl: 'https://github.com/Aussie-App-Studio/Deep-Bible',
    storeLinks: [
      {
        label: 'Find on Chrome Store',
        store: 'chrome-store',
        url: 'https://chromewebstore.google.com/search/Deep%20Bible%3A%20Study%20Tools%20for%20YouVersion',
      },
      {
        label: 'GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/Deep-Bible',
      },
    ],
    downloads: [],
    pricing: {
      type: 'free',
      note: 'Free browser extension',
    },
  },
  {
    id: 'confession-hover',
    name: 'Confession Hover',
    tagline: 'Instant hover previews for historic Christian creeds, catechisms & confessions.',
    description:
      'The Reformed companion to Bible Hover! Whenever a webpage cites the Heidelberg Catechism (HC Q&A 1), Westminster Confession (WCF 1.1), Belgic Confession, or Canons of Dort, hover over it to read the full text instantly.',
    highlights: [
      'Instant 0ms offline lookup for Reformed confessions, catechisms & creeds',
      'Pairs seamlessly with Bible Hover on any article or study site',
      'Works on Chrome, Edge, Brave, Arc, Vivaldi & Opera',
      '30-second direct install or Chrome Web Store',
    ],
    icon: './app-icons/confession-hover.png',
    banner: './app-banners/confession-hover.jpg',
    accentGradient: 'from-sky-600 to-blue-800',
    fallbackEmoji: '📜',
    platforms: ['chrome'],
    categories: ['extensions', 'bible-church'],
    githubRepo: 'Confession-Hover',
    githubUrl: 'https://github.com/Aussie-App-Studio/Confession-Hover',
    storeLinks: [
      {
        label: 'Chrome Web Store',
        store: 'chrome-store',
        url: 'https://chromewebstore.google.com/search/Confession%20Hover',
      },
      {
        label: 'GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/Confession-Hover',
      },
    ],
    downloads: [
      {
        platform: 'chrome',
        label: 'Direct Extension (.zip)',
        subtitle: 'Chrome, Edge, Brave & Vivaldi',
        githubRepo: 'Confession-Hover',
        assetMatch: 'Confession-Hover\\.zip$',
        url: 'https://github.com/Aussie-App-Studio/Confession-Hover/releases/latest/download/Confession-Hover.zip',
        version: 'v1.0.0',
        fileSize: '270 KB',
      },
    ],
    pricing: {
      type: 'free',
      note: 'Free for everyone',
    },
    installSteps: {
      title: '30-Second Direct Browser Install',
      steps: [
        'Download Confession-Hover.zip and extract it into a folder you’ll keep.',
        'Open chrome://extensions (or edge://extensions) and turn on Developer mode.',
        'Click "Load unpacked" and pick the extracted folder — you’re all set!',
      ],
    },
  },
  {
    id: 'protext',
    name: 'ProText for Google Messages',
    tagline: 'Gorgeous themes, chat folders, Undo Send & power tools for Google Messages.',
    description:
      'Gives Google Messages on your computer the glow-up it deserves! Pick from 12+ gorgeous themes (AMOLED Black, Dracula, Warm Paper, Pink Sakura, or build your own), organize chats into folders, and rescue typos with Undo Send.',
    highlights: [
      '12+ built-in themes plus a live Custom Theme Builder',
      'Smart chat folders to separate family, work & church messages',
      'Undo Send safety net & handy keyboard shortcuts',
      '100% local in your browser — zero servers, zero message reading',
    ],
    icon: './app-icons/protext.png',
    banner: './app-banners/protext.jpg',
    accentGradient: 'from-violet-600 to-fuchsia-600',
    fallbackEmoji: '💬',
    platforms: ['chrome'],
    categories: ['extensions', 'everyday'],
    featured: true,
    githubRepo: 'ProText',
    githubUrl: 'https://github.com/Aussie-App-Studio/ProText',
    storeLinks: [
      {
        label: 'View on GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/ProText',
      },
    ],
    downloads: [],
    pricing: {
      type: 'free',
      note: 'Free & open source (GPLv3)',
    },
  },
  {
    id: 'crca-forms',
    name: 'CRCA Forms & Documents',
    tagline: 'All CRCA liturgical forms, creeds, confessions & Church Order — even offline.',
    description:
      'A free, dead-simple tool for pastors, elders, worship leaders, and church members in the Christian Reformed Churches of Australia. Search, copy, read, and print liturgical forms, confessions, and Church Order in seconds.',
    highlights: [
      'Instant search across CRCA liturgical forms, creeds & Church Order',
      'Clean copy & print formatting for bulletins and services',
      'Works completely offline once installed',
      'Made for Chrome, Edge, and Brave on Windows & Mac',
    ],
    icon: './app-icons/crca-forms.png',
    banner: './app-banners/crca-forms.jpg',
    accentGradient: 'from-teal-600 to-emerald-600',
    fallbackEmoji: '⛪',
    platforms: ['chrome', 'web'],
    categories: ['extensions', 'bible-church'],
    githubRepo: 'crca-forms-and-documents',
    githubUrl: 'https://github.com/Aussie-App-Studio/crca-forms-and-documents',
    storeLinks: [
      {
        label: 'GitHub & Online Guide',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/crca-forms-and-documents',
      },
    ],
    downloads: [
      {
        platform: 'chrome',
        label: 'Browser Add-on (.zip)',
        subtitle: 'Chrome, Edge & Brave (Windows & Mac)',
        githubRepo: 'crca-forms-and-documents',
        assetMatch: '\\.zip$',
        url: 'https://github.com/Aussie-App-Studio/crca-forms-and-documents/releases/latest/download/CRCA-Forms-Extension.zip',
        version: 'v1.1.0',
      },
    ],
    pricing: {
      type: 'free',
      note: 'Free gift for the church',
    },
  },
  {
    id: 'auto-context-wallpaper',
    name: 'Auto Context Smart Wallpaper',
    tagline: 'Your Android wallpaper adapts automatically to your day, weather & music.',
    description:
      'An intelligent Android live wallpaper that changes your background automatically based on rules you choose — time of day, weekdays, live weather, or even what you’re listening to on Spotify — all privately on your phone.',
    highlights: [
      'Switches wallpapers automatically by time, weekday, weather, or music',
      'Smart visual layers and custom rules built around your daily routine',
      'Clean, battery-friendly Android live wallpaper',
      'Available right now on Google Play',
    ],
    icon: './app-icons/auto-context.png',
    banner: './app-banners/auto-context.jpg',
    accentGradient: 'from-orange-500 to-amber-600',
    fallbackEmoji: '🎨',
    platforms: ['android'],
    categories: ['android', 'everyday'],
    featured: true,
    badge: 'Google Play',
    storeLinks: [
      {
        label: 'Google Play',
        store: 'play-store',
        url: 'https://play.google.com/store/apps/details?id=com.autocontext.app&hl=en_AU',
      },
    ],
    downloads: [],
    pricing: {
      type: 'free',
      note: 'Available on Google Play',
    },
  },
  {
    id: 'fade-sleep-timer',
    name: 'Fade Sleep Timer',
    tagline: 'Fall asleep to podcasts or music with a gentle audio fade-out & Do Not Disturb.',
    description:
      'Stop getting jolted awake when a sleep timer abruptly cuts off your audio! Fade Sleep Timer smoothly lowers the volume over time, pauses your playback, turns on Do Not Disturb, and even works with Google Assistant voice commands.',
    highlights: [
      'Smooth, gentle audio fade-out instead of a harsh cut-off',
      'Automatic Do Not Disturb integration while you sleep',
      'Works with Spotify, YouTube, Audible, podcasts & voice commands',
      'Open source, zero ads, zero data collection',
    ],
    icon: './app-icons/fade-sleep.png',
    banner: './app-banners/fade-sleep.jpg',
    accentGradient: 'from-indigo-600 to-purple-700',
    fallbackEmoji: '🌙',
    platforms: ['android'],
    categories: ['android', 'everyday'],
    githubRepo: 'Fade-Sleep-Timer',
    githubUrl: 'https://github.com/Aussie-App-Studio/Fade-Sleep-Timer',
    storeLinks: [
      {
        label: 'Google Play',
        store: 'play-store',
        url: 'https://play.google.com/store/apps/details?id=com.gollan.fadesleeptimer',
      },
      {
        label: 'GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/Fade-Sleep-Timer',
      },
    ],
    downloads: [],
    pricing: {
      type: 'free',
      note: 'Free & open source',
    },
  },
  {
    id: 'church-library-app',
    name: 'Church Library Kiosk',
    tagline: 'Turn any Android tablet into a self-service church book library.',
    description:
      'Makes running a church or community book library effortless! Point the tablet camera at a book’s ISBN barcode to catalog it automatically with cover art, let church members borrow & return books themselves, and sync across tablets offline.',
    highlights: [
      'Scan ISBN barcodes to add books & covers in seconds',
      'Friendly self-service kiosk mode for members to borrow & return',
      'Offline-first with peer-to-peer multi-tablet sync & PIN admin dashboard',
      'Supports 50+ languages · No subscriptions or cloud fees',
    ],
    icon: './app-icons/church-library.png',
    banner: './app-banners/church-library.jpg',
    accentGradient: 'from-emerald-600 to-teal-700',
    fallbackEmoji: '📚',
    platforms: ['android'],
    categories: ['android', 'bible-church'],
    githubRepo: 'Church-Library-App',
    githubUrl: 'https://github.com/Aussie-App-Studio/Church-Library-App',
    storeLinks: [
      {
        label: 'Google Play',
        store: 'play-store',
        url: 'https://play.google.com/store/apps/details?id=com.ChurchBookLibrary',
      },
      {
        label: 'GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/Church-Library-App',
      },
    ],
    downloads: [],
    pricing: {
      type: 'free',
      note: 'Free for churches & communities',
    },
  },
  {
    id: 'penrith-bins',
    name: 'Penrith Bins',
    tagline: 'Never put the wrong bin out on the kerb again (Penrith, NSW).',
    description:
      'A fast, clean bin-night reminder built for Penrith City Council residents in Western Sydney. Know at a glance whether it’s Red, Yellow, or Green bin night — without fighting clunky council PDFs.',
    highlights: [
      'Instant answer for which bins go out this week',
      'Built specifically for Penrith City Council schedules',
      'Clean, fast & zero clutter or ads',
    ],
    icon: './app-icons/penrith-bins.png',
    banner: './app-banners/penrith-bins.jpg',
    accentGradient: 'from-lime-600 to-green-700',
    fallbackEmoji: '🚛',
    platforms: ['android'],
    categories: ['android', 'everyday'],
    githubRepo: 'Penrith-Bins',
    githubUrl: 'https://github.com/Aussie-App-Studio/Penrith-Bins',
    storeLinks: [
      {
        label: 'Google Play',
        store: 'play-store',
        url: 'https://play.google.com/store/apps/details?id=au.com.penrithbins',
      },
      {
        label: 'GitHub',
        store: 'github',
        url: 'https://github.com/Aussie-App-Studio/Penrith-Bins',
      },
    ],
    downloads: [],
    pricing: {
      type: 'free',
      note: 'Free local utility',
    },
  },
];

/**
 * ============================================================================
 * IN PRODUCTION — APPS CURRENTLY GROWING IN THE WORKSHOP
 * ============================================================================
 */
export const IN_PRODUCTION_APPS: InProductionApp[] = [
  {
    id: 'updated-morning-and-evening',
    name: 'Updated Morning & Evening',
    tagline: 'Charles Spurgeon’s classic daily devotional — renewed in clear modern English.',
    description:
      '732 rich, Christ-centered morning and evening readings by Charles H. Spurgeon, carefully updated into crisp contemporary English (paired with the BSB Bible) — with a 1-tap toggle to compare against the original 1860s Victorian classic (KJV).',
    stage: 'In Development',
    progress: 80,
    platforms: ['android'],
    accentColor: '#D97706',
    icon: './app-icons/morning-evening.svg',
    emoji: '☀️',
    eta: 'Coming soon',
    githubUrl: 'https://github.com/Aussie-App-Studio/Updated-Morning-and-Evening',
  },
  {
    id: 'stow-cards',
    name: 'Stow Cards: Offline Wallet',
    tagline: 'All your store & loyalty barcodes in one lightning-fast offline wallet.',
    description:
      'Ditch the bloated loyalty apps! Scan your store cards once, pin your favorites to resizable home screen widgets, and scan at the checkout in half a second — 100% offline.',
    stage: 'In Development',
    progress: 72,
    platforms: ['android'],
    accentColor: '#2857A4',
    icon: './app-icons/stow-cards.png',
    emoji: '💳',
    eta: 'Coming soon',
  },
  {
    id: 'the-intercessor',
    name: 'The Intercessor',
    tagline: 'A calm, focused prayer & follow-up companion.',
    description:
      'Designed for pastors and everyday Christians who never want to forget when they say "I’ll pray for you." Organize people, prayer requests, and gentle follow-up reminders.',
    stage: 'In Development',
    progress: 65,
    platforms: ['android'],
    accentColor: '#7C3AED',
    icon: './app-icons/the-intercessor.png',
    emoji: '🙏',
    eta: 'Active build',
  },
  {
    id: 'five-plus-two',
    name: 'The 5+2 Project',
    tagline: 'Un-gating theological resources for the global church.',
    description:
      'A big-hearted initiative to make solid, trustworthy Christian & theological books and study resources freely accessible to pastors and believers everywhere.',
    stage: 'In Development',
    progress: 55,
    platforms: ['web'],
    accentColor: '#0D9488',
    icon: './app-icons/five-plus-two.svg',
    emoji: '🍞',
    eta: 'Long-term vision',
  },
  {
    id: 'goal-charts',
    name: 'Goal Charts',
    tagline: 'Fun job & star charts right on your home screen.',
    description:
      'A cheerful, visual chart app for kids and families to track daily jobs, earn stars, and celebrate little wins together — with handy home screen widgets.',
    stage: 'Prototyping',
    progress: 45,
    platforms: ['android'],
    accentColor: '#EAB308',
    icon: './app-icons/goal-charts.svg',
    emoji: '⭐',
    eta: 'In the workshop',
  },
  {
    id: 'pastors-scripture-primer',
    name: 'Pastors Scripture Primer',
    tagline: 'Bite-sized Bible & theology flash cards.',
    description:
      'Quick, memorable flash cards to help hide Scripture in your heart and review key doctrines in a couple of minutes while waiting for coffee.',
    stage: 'Early Build',
    progress: 35,
    platforms: ['android'],
    accentColor: '#DC2626',
    icon: './app-icons/scripture-primer.webp',
    emoji: '🃏',
    eta: 'Sprouting',
  },
];
