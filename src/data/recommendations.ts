import type { RecommendedItem } from '../types';

/**
 * ============================================================================
 * TULIP WORKS — RECOMMENDED APPS & EXTENSIONS (NOT AFFILIATED)
 * ============================================================================
 * Hand-picked third-party apps, websites, and browser extensions that Jesse
 * personally uses and recommends. Not affiliated with any of these creators.
 */

export const RECOMMENDED_ITEMS: RecommendedItem[] = [
  {
    id: 'ublock-origin',
    name: 'uBlock Origin (& uBO Lite)',
    creator: 'Raymond Hill (gorhill)',
    kindLabel: 'Browser Extension',
    tagline: 'The gold-standard open-source ad & tracker blocker.',
    description:
      'Use full uBlock Origin on Firefox or Brave for maximum control, or grab uBlock Origin Lite on Chrome (the lightweight Manifest V3 version after Google nerfed MV2 extensions).',
    note: 'Full engine on Firefox & Brave · Manifest V3 "Lite" edition on Chrome',
    icon: './recommended-icons/ublock-origin.png',
    emoji: '🛡️',
    accentGradient: 'from-rose-600 to-red-700',
    platforms: ['Firefox', 'Brave', 'Chrome (Lite)', 'Open Source'],
    categories: ['extensions'],
    links: [
      {
        label: 'Firefox (Full)',
        url: 'https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/',
        variant: 'primary',
      },
      {
        label: 'Chrome (Lite)',
        url: 'https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh',
        variant: 'secondary',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/gorhill/uBlock',
        variant: 'github',
      },
    ],
  },
  {
    id: 'brave-browser',
    name: 'Brave Browser',
    creator: 'Brave Software',
    kindLabel: 'Desktop & Mobile Browser',
    tagline: 'Fast, privacy-first web browser with built-in ad & tracker blocking.',
    description:
      'Blocks creepy trackers, popups, and YouTube ads out of the box on Windows, Mac, Linux, Android, and iPhone/iPad — without breaking your favourite Chrome extensions.',
    icon: './recommended-icons/brave.png',
    emoji: '🦁',
    accentGradient: 'from-orange-500 to-red-600',
    platforms: ['Win / Mac / Linux', 'Android', 'Apple iOS'],
    categories: ['pc-desktop'],
    links: [
      {
        label: 'Desktop Download',
        url: 'https://brave.com/download/',
        variant: 'primary',
      },
      {
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=com.brave.browser',
        variant: 'secondary',
      },
      {
        label: 'App Store',
        url: 'https://apps.apple.com/app/brave-browser-private-web/id1052879175',
        variant: 'github',
      },
    ],
  },
  {
    id: 'microsoft-powertoys',
    name: 'Microsoft PowerToys',
    creator: 'Microsoft (Open Source)',
    kindLabel: 'Windows App',
    tagline: 'Official Microsoft Swiss-army knife of productivity utilities for Windows.',
    description:
      'Packed with super handy free tools — FancyZones window snapping, Color Picker, Text Extractor (copy text from any image), Always on Top, Image Resizer, Awake, and quick app launcher.',
    icon: './recommended-icons/powertoys.png',
    emoji: '🧰',
    accentGradient: 'from-sky-500 to-blue-700',
    platforms: ['Windows 10 / 11', 'Microsoft Store', 'Open Source'],
    categories: ['pc-desktop'],
    links: [
      {
        label: 'Microsoft Store',
        url: 'https://apps.microsoft.com/detail/XP89DCGQ3K6VLD',
        variant: 'primary',
      },
      {
        label: 'Microsoft Docs',
        url: 'https://learn.microsoft.com/windows/powertoys/',
        variant: 'secondary',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/microsoft/PowerToys',
        variant: 'github',
      },
    ],
  },
  {
    id: 'wintoys',
    name: 'Wintoys',
    creator: 'Bogdan Pătrăucean',
    kindLabel: 'Windows App',
    tagline: 'Clean, optimize, debloat & tweak Windows 10/11 safely in one spot.',
    description:
      'An all-in-one Windows toolbox for toggling privacy & ad settings, clearing junk, uninstalling stubborn built-in apps, managing startup items and services, and running native repair tools — without digging through the registry.',
    icon: './recommended-icons/wintoys.png',
    emoji: '🛠️',
    accentGradient: 'from-blue-600 to-indigo-700',
    platforms: ['Windows 10 / 11', 'Microsoft Store', 'Free'],
    categories: ['pc-desktop'],
    links: [
      {
        label: 'Microsoft Store',
        url: 'https://apps.microsoft.com/detail/9P8LTPGCBZXD',
        variant: 'primary',
      },
      {
        label: 'Official Page',
        url: 'https://bogdan-patraucean.github.io/about/wintoys/',
        variant: 'secondary',
      },
    ],
  },
  {
    id: 'updated-works',
    name: 'Updated Works',
    creator: 'updatedworks.com',
    kindLabel: 'Web Library',
    tagline: 'Puritan, Reformed & classic Christian works in clean modern English.',
    description:
      'A wonderful free online library providing sentence-by-sentence modern English editions of Richard Baxter, John Bunyan, Thomas Watson, Augustine, and other historic Christian classics.',
    icon: './recommended-icons/updated-works.png',
    emoji: '📚',
    accentGradient: 'from-amber-600 to-orange-600',
    platforms: ['Web', 'Free Reading'],
    categories: ['church-reformed'],
    links: [
      {
        label: 'Visit updatedworks.com',
        url: 'https://updatedworks.com',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'the-singing-bible',
    name: 'The Singing Bible',
    creator: 'thesinging.bible',
    kindLabel: 'Mobile App',
    tagline: 'Every chapter of Scripture sung word-for-word in 20+ music styles.',
    description:
      'A fun, unique way to soak in the Bible on a commute or with kids — the literal words of Scripture set to music across more than 20 genres.',
    icon: './recommended-icons/the-singing-bible.png',
    emoji: '🎵',
    accentGradient: 'from-fuchsia-600 to-purple-700',
    platforms: ['Android', 'Apple iOS', 'Web'],
    categories: ['church-reformed'],
    links: [
      {
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=bible.thesinging.app',
        variant: 'primary',
      },
      {
        label: 'App Store',
        url: 'https://apps.apple.com/us/app/thesinging-bible/id6812311036',
        variant: 'secondary',
      },
      {
        label: 'Website',
        url: 'https://thesinging.bible/',
        variant: 'github',
      },
    ],
  },
  {
    id: 'reformed-companion',
    name: 'Reformed Companion',
    creator: 'Clayton Larson',
    kindLabel: 'Mobile App',
    tagline: 'Historic creeds, confessions, and catechisms right in your pocket.',
    description:
      'A super clean mobile app packed with Reformed confessions (Westminster, Belgic, Canons of Dort, 1689), catechisms with ESV/KJV proof texts, built-in quizzes, and study tools.',
    icon: './recommended-icons/reformed-companion.png',
    emoji: '✝️',
    accentGradient: 'from-blue-700 to-indigo-700',
    platforms: ['Android', 'Apple iOS'],
    categories: ['church-reformed'],
    links: [
      {
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=com.cdlarson91.reformedcompanion',
        variant: 'primary',
      },
      {
        label: 'App Store',
        url: 'https://apps.apple.com/app/reformed-companion/id1547283397',
        variant: 'secondary',
      },
      {
        label: 'Website',
        url: 'https://reformedcompanion.com',
        variant: 'github',
      },
    ],
  },
  {
    id: 'new-city-catechism',
    name: 'New City Catechism',
    creator: 'The Gospel Coalition & Crossway',
    kindLabel: 'Mobile & Web App',
    tagline: '52 foundational Christian Q&As with Adult and Kids modes.',
    description:
      'Complements Reformed Companion nicely — includes short devotions, Scripture readings, and a Kids mode with simpler wording and a children’s choir singing every question and answer.',
    icon: './recommended-icons/new-city-catechism.png',
    emoji: '🎶',
    accentGradient: 'from-sky-600 to-cyan-700',
    platforms: ['Android', 'Apple iOS', 'Web'],
    categories: ['church-reformed'],
    links: [
      {
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=com.crossway.newcitycatechism',
        variant: 'primary',
      },
      {
        label: 'App Store',
        url: 'https://apps.apple.com/us/app/new-city-catechism/id564035762',
        variant: 'secondary',
      },
      {
        label: 'Web App',
        url: 'https://newcitycatechism.com/',
        variant: 'github',
      },
    ],
  },
  {
    id: 'freeshow',
    name: 'FreeShow',
    creator: 'FreeShow (Christian Indie Dev)',
    kindLabel: 'Desktop & Companion App',
    tagline: 'Free, open-source church presentation software (ProPresenter alternative).',
    description:
      'A slick, volunteer-friendly replacement for PowerPoint, ProPresenter, or EasyWorship — complete with a companion mobile app to control slides right from the front.',
    icon: './recommended-icons/freeshow.png',
    emoji: '📽️',
    accentGradient: 'from-indigo-600 to-blue-700',
    platforms: ['Win / Mac / Linux', 'Mobile Remote', 'Open Source'],
    categories: ['church-reformed'],
    links: [
      {
        label: 'Visit freeshow.app',
        url: 'https://freeshow.app/',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'planning-center',
    name: 'Planning Center Suite',
    creator: 'Planning Center',
    kindLabel: 'Church Platform',
    tagline: 'All-in-one church management suite for services, rosters & people.',
    description:
      'A modular toolkit for churches to plan Sunday services, schedule volunteers and musicians, run kids check-ins, manage directories, and connect the congregation via Church Center.',
    icon: './recommended-icons/planning-center.png',
    emoji: '⛪',
    accentGradient: 'from-emerald-600 to-teal-700',
    platforms: ['Web', 'iOS & Android'],
    categories: ['church-reformed'],
    links: [
      {
        label: 'Visit planningcenter.com',
        url: 'https://www.planningcenter.com',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'mealtrain',
    name: 'MealTrain',
    creator: 'mealtrain.com',
    kindLabel: 'Community Tool',
    tagline: 'Organize meals for sick, elderly, or new-parent families effortlessly.',
    description:
      'Set dates, dietary needs, and delivery preferences once, send out one link, and let church or friends claim a day without messy group-chat coordination.',
    icon: './recommended-icons/mealtrain.png',
    emoji: '🍲',
    accentGradient: 'from-orange-500 to-rose-600',
    platforms: ['Web', 'Free'],
    categories: ['church-reformed'],
    links: [
      {
        label: 'Visit mealtrain.com',
        url: 'https://www.mealtrain.com/',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'volunteersignup',
    name: 'VolunteerSignup',
    creator: 'volunteersignup.org',
    kindLabel: 'Event Roster Tool',
    tagline: 'Simple, free volunteer sign-up sheets for church & community events.',
    description:
      'Spin up lightweight sign-up sheets for working bees, camps, or big events in minutes so volunteers can pick slots themselves with zero account friction.',
    emoji: '📋',
    accentGradient: 'from-teal-600 to-cyan-700',
    platforms: ['Web', 'Free'],
    categories: ['church-reformed'],
    links: [
      {
        label: 'Visit volunteersignup.org',
        url: 'https://www.volunteersignup.org/',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'google-my-maps',
    name: 'Google My Maps',
    creator: 'Google',
    kindLabel: 'Web Mapping Tool',
    tagline: 'Create private, custom interactive maps for small groups & households.',
    description:
      'Different from regular Google Maps — plot church households, small group locations, and contact info on a private layered map to spot community gaps and orient newcomers.',
    icon: './recommended-icons/google-my-maps.png',
    emoji: '🗺️',
    accentGradient: 'from-emerald-600 to-green-700',
    platforms: ['Web', 'Free'],
    categories: ['church-reformed'],
    links: [
      {
        label: 'Open Google My Maps',
        url: 'https://www.google.com/maps/d/',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'safe-ministry-check',
    name: 'Safe Ministry Check',
    creator: 'safeministrycheck.com.au',
    kindLabel: 'Church Compliance',
    tagline: 'Clean, modern child-safety training & screening for Australian churches.',
    description:
      'Practical, easy-to-use online safety training and volunteer screening built specifically for churches — much lighter and friendlier to manage for small-to-medium teams.',
    icon: './recommended-icons/safe-ministry-check.ico',
    emoji: '🦺',
    accentGradient: 'from-sky-700 to-blue-800',
    platforms: ['Web', 'Australia'],
    categories: ['church-reformed'],
    links: [
      {
        label: 'Visit safeministrycheck.com.au',
        url: 'https://safeministrycheck.com.au/',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'scribe',
    name: 'Scribe',
    creator: 'scribehow.com',
    kindLabel: 'Productivity Tool',
    tagline: 'Turn any workflow into an illustrated step-by-step guide in seconds.',
    description:
      'Records your clicks and screenshots automatically, then writes clean, editable how-to guides — a lifesaver for training volunteers on slides, audio uploads, or church software.',
    icon: './recommended-icons/scribe.png',
    emoji: '📝',
    accentGradient: 'from-violet-600 to-indigo-700',
    platforms: ['Web', 'Browser Extension', 'Free Tier'],
    categories: ['extensions'],
    links: [
      {
        label: 'Visit scribehow.com',
        url: 'https://scribehow.com/',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'calibre-google-play-books',
    name: 'Calibre + Google Play Books',
    creator: 'Kovid Goyal & Google',
    kindLabel: 'Ebook Workflow',
    tagline: 'Organize & convert ebooks in Calibre, then sync & listen in Play Books.',
    description:
      'Use free, open-source Calibre on desktop to manage, edit covers, and convert EPUB/PDF/MOBI files — then upload them to Google Play Books to read on any device or listen with AI read-aloud.',
    note: 'Make/prep the ebook in Calibre → upload to Google Play Books',
    icon: './recommended-icons/calibre.png',
    emoji: '📖',
    accentGradient: 'from-amber-600 to-yellow-600',
    platforms: ['Win / Mac / Linux', 'Web', 'Android / iOS'],
    categories: ['pc-desktop'],
    links: [
      {
        label: 'Calibre (Desktop)',
        url: 'https://calibre-ebook.com/',
        variant: 'primary',
      },
      {
        label: 'Google Play Books',
        url: 'https://play.google.com/books',
        variant: 'secondary',
      },
    ],
  },
  {
    id: 'google-messages-web',
    name: 'Google Messages for Web',
    creator: 'Google',
    kindLabel: 'Desktop / Android Utility',
    tagline: 'Send & copy-paste Android texts straight from your computer browser.',
    description:
      'Pair Google’s default Messages app on your Android phone with your Mac or Windows browser so you can text contacts and groups from your keyboard without breaking focus.',
    note: 'Android only · Requires Google Messages as your default SMS app',
    icon: './recommended-icons/google-messages.png',
    emoji: '💬',
    accentGradient: 'from-blue-600 to-sky-600',
    platforms: ['Web', 'Android'],
    categories: ['mobile-web'],
    links: [
      {
        label: 'Messages for Web',
        url: 'https://messages.google.com/',
        variant: 'primary',
      },
      {
        label: 'Android App',
        url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.messaging',
        variant: 'secondary',
      },
    ],
  },
  {
    id: 'qrcode-monkey',
    name: 'QRCode Monkey',
    creator: 'qrcode-monkey.com',
    kindLabel: 'Web Utility',
    tagline: 'Free, zero-clutter high-res QR code generator.',
    description:
      'Great for adding scannable links onto printed church forms, pew cards, or flyers — send people straight to digital sign-up forms with no paywall traps.',
    icon: './recommended-icons/qrcode-monkey.png',
    emoji: '📱',
    accentGradient: 'from-slate-600 to-slate-800',
    platforms: ['Web', 'Free'],
    categories: ['mobile-web'],
    links: [
      {
        label: 'Visit qrcode-monkey.com',
        url: 'https://www.qrcode-monkey.com/',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    creator: 'Microsoft',
    kindLabel: 'Collaboration & Chat',
    tagline: 'Team chat, video meetings, and file sharing — free for churches as not-for-profits.',
    description:
      'Churches registered as not-for-profits can get Microsoft 365 Business Basic (including Microsoft Teams, Outlook, and OneDrive) for free through Microsoft Nonprofits — great for keeping elders, deacons, and ministry teams coordinated.',
    note: 'Free for eligible churches & not-for-profits via Microsoft Nonprofits',
    emoji: '💬',
    accentGradient: 'from-indigo-600 to-blue-700',
    platforms: ['Web', 'Win / Mac', 'iOS & Android'],
    categories: ['mobile-web'],
    links: [
      {
        label: 'Microsoft Nonprofits',
        url: 'https://www.microsoft.com/en-us/nonprofits/microsoft-365',
        variant: 'primary',
      },
      {
        label: 'Teams Web App',
        url: 'https://teams.microsoft.com/',
        variant: 'secondary',
      },
    ],
  },
  {
    id: 'canva',
    name: 'Canva',
    creator: 'Canva',
    kindLabel: 'Design Platform',
    tagline: 'Easy graphic design for church flyers, slides, and social posts — free Pro for not-for-profits.',
    description:
      'Churches as registered not-for-profits can get Canva Pro for free through Canva for Nonprofits — unlocking premium templates, brand kits, background remover, and team folders for bulletins, sermon slides, and event graphics.',
    note: 'Canva Pro is free for eligible churches & not-for-profits',
    emoji: '🎨',
    accentGradient: 'from-cyan-500 to-violet-600',
    platforms: ['Web', 'iOS & Android', 'Free for Nonprofits'],
    categories: ['mobile-web'],
    links: [
      {
        label: 'Canva for Nonprofits',
        url: 'https://www.canva.com/canva-for-nonprofits/',
        variant: 'primary',
      },
      {
        label: 'Open Canva',
        url: 'https://www.canva.com/',
        variant: 'secondary',
      },
    ],
  },
  {
    id: 'sponsorblock',
    name: 'SponsorBlock for YouTube',
    creator: 'Ajay Ramachandran (ajayyy)',
    kindLabel: 'Browser Extension',
    tagline: 'Automatically skip sponsorships, intros, outros & nagging prompts.',
    description:
      'A brilliant crowdsourced extension that seamlessly jumps past in-video sponsor reads, merch plugs, and "don’t forget to subscribe" segments on YouTube.',
    icon: './recommended-icons/sponsorblock.png',
    emoji: '⏭️',
    accentGradient: 'from-red-600 to-orange-600',
    platforms: ['Chrome Store', 'Open Source'],
    categories: ['extensions'],
    links: [
      {
        label: 'Chrome Web Store',
        url: 'https://chromewebstore.google.com/detail/sponsorblock-for-youtube-s/mnjggcdmjocbbbhaepdhchncahnbgone',
        variant: 'primary',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/ajayyy/SponsorBlock',
        variant: 'github',
      },
    ],
  },
  {
    id: 'video-speed-controller',
    name: 'Video Speed Controller',
    creator: 'Ilya Grigorik (igrigorik)',
    kindLabel: 'Browser Extension',
    tagline: 'Speed up, slow down, or rewind any HTML5 video with keyboard shortcuts.',
    description:
      'Works on YouTube, lectures, embedded players, and nearly any video on the web. Tweak playback speed in 0.1x increments or jump forward/back without hunting for player controls.',
    icon: './recommended-icons/video-speed-controller.png',
    emoji: '⏩',
    accentGradient: 'from-violet-600 to-purple-700',
    platforms: ['Chrome Store', 'Open Source'],
    categories: ['extensions'],
    links: [
      {
        label: 'Chrome Web Store',
        url: 'https://chromewebstore.google.com/detail/video-speed-controller/nffaoalbilbmmfgbnbgppjihopabppdk',
        variant: 'primary',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/igrigorik/videospeed',
        variant: 'github',
      },
    ],
  },
  {
    id: 'bypass-paywalls-clean',
    name: 'Bypass Paywalls Clean',
    creator: 'magnolia1234',
    kindLabel: 'Browser Extension',
    tagline: 'Read news and articles cleanly without paywall clutter.',
    description:
      'A community-maintained extension that unlocks supported news sites. Not hosted on the Chrome Web Store — grab the releases from GitFlic and load unpacked in Chrome or install on Firefox.',
    note: 'Hosted on GitFlic (manual .zip / .xpi install)',
    emoji: '📰',
    accentGradient: 'from-slate-700 to-slate-900',
    platforms: ['Chrome (Unpacked)', 'Firefox', 'GitFlic'],
    categories: ['extensions'],
    links: [
      {
        label: 'GitFlic Releases',
        url: 'https://gitflic.ru/project/magnolia1234/bpc_uploads',
        variant: 'primary',
      },
      {
        label: 'Chrome Repo',
        url: 'https://gitflic.ru/project/magnolia1234/bypass-paywalls-chrome-clean',
        variant: 'github',
      },
      {
        label: 'Firefox Repo',
        url: 'https://gitflic.ru/project/magnolia1234/bypass-paywalls-firefox-clean',
        variant: 'github',
      },
    ],
  },
  {
    id: 'save-image-as-png',
    name: 'Save Image As PNG',
    creator: 'Rob W',
    kindLabel: 'Browser Extension',
    tagline: 'Right-click any pesky .webp image and save it straight as a PNG.',
    description:
      'Adds a "Save Image As PNG" option to your right-click menu and converts WebP or AVIF images locally on the fly before saving — zero background memory used.',
    icon: './recommended-icons/save-image-as-png.png',
    emoji: '🖼️',
    accentGradient: 'from-emerald-600 to-green-700',
    platforms: ['Chrome Store', 'Chromium'],
    categories: ['extensions'],
    links: [
      {
        label: 'Chrome Web Store',
        url: 'https://chromewebstore.google.com/detail/save-image-as-png/nkokmeaibnajheohncaamjggkanfbphi',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'view-image',
    name: 'View Image',
    versionBadge: '5.2.0',
    creator: 'Joshua B (bijij)',
    kindLabel: 'Browser Extension',
    tagline: 'Re-implements the Google Images "View Image" button.',
    description:
      'Brings back the classic "View Image" and "Search by Image" buttons on Google Image Search so you can open full-resolution images in one click.',
    icon: './recommended-icons/view-image.png',
    emoji: '🔍',
    accentGradient: 'from-amber-500 to-orange-600',
    platforms: ['Chrome Store', 'Firefox', 'Open Source'],
    categories: ['extensions'],
    links: [
      {
        label: 'Chrome Web Store',
        url: 'https://chromewebstore.google.com/detail/view-image/jpcmhcelnjdmblfmjabdeclccemkghjk',
        variant: 'primary',
      },
      {
        label: 'Firefox',
        url: 'https://addons.mozilla.org/en-US/firefox/addon/view-image/',
        variant: 'secondary',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/bijij/ViewImage',
        variant: 'github',
      },
    ],
  },
  {
    id: 'link-to-text-fragment',
    name: 'Link to Text Fragment',
    creator: 'Google Chrome Labs',
    kindLabel: 'Browser Extension',
    tagline: 'Copy a direct link that scrolls straight to & highlights any quote.',
    description:
      'Highlight any paragraph or sentence on a webpage, right-click, and copy a special URL that automatically scrolls recipients directly to that exact highlighted text.',
    icon: './recommended-icons/link-to-text-fragment.png',
    emoji: '🔗',
    accentGradient: 'from-cyan-600 to-blue-600',
    platforms: ['Chrome Store', 'Chromium'],
    categories: ['extensions'],
    links: [
      {
        label: 'Chrome Web Store',
        url: 'https://chromewebstore.google.com/detail/link-to-text-fragment/pbcodcjpfjdpcineamnnmbkkmkdpajjg',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'google-analytics-opt-out',
    name: 'Google Analytics Opt-out Add-on',
    creator: 'Google',
    kindLabel: 'Browser Extension',
    tagline: 'Stops websites from sending your visit data to Google Analytics.',
    description:
      'An official add-on by Google that instructs Google Analytics scripts (ga.js, analytics.js, gtag.js) not to collect or report your browsing activity across sites.',
    icon: './recommended-icons/google-analytics-opt-out.png',
    emoji: '🔒',
    accentGradient: 'from-sky-600 to-blue-700',
    platforms: ['Chrome Store', 'Chromium'],
    categories: ['extensions'],
    links: [
      {
        label: 'Chrome Web Store',
        url: 'https://chromewebstore.google.com/detail/google-analytics-opt-out/fllaojicojecljbmefodhfapmkghcbnh',
        variant: 'primary',
      },
    ],
  },
  {
    id: 'iba-opt-out',
    name: 'IBA Opt-out (by Google)',
    creator: 'Google',
    kindLabel: 'Browser Extension',
    tagline: 'Persistently opts you out of Google’s interest-based ad cookies.',
    description:
      'Official Google extension that keeps your DoubleClick personalized advertising opt-out active — and automatically preserves it even after you clear your browser cookies.',
    icon: './recommended-icons/iba-opt-out.png',
    emoji: '🚫',
    accentGradient: 'from-indigo-600 to-violet-700',
    platforms: ['Chrome Store', 'Chromium'],
    categories: ['extensions'],
    links: [
      {
        label: 'Chrome Web Store',
        url: 'https://chromewebstore.google.com/detail/iba-opt-out-by-google/gbiekjoijknlhijdjbaadobpkdhmoebb',
        variant: 'primary',
      },
    ],
  },
];
