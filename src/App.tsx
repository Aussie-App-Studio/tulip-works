import { useMemo, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TulipRunner } from './components/TulipRunner';
import { AppCatalog } from './components/AppCatalog';
import { InProduction } from './components/InProduction';
import { RecommendedSection } from './components/RecommendedSection';
import { SupportSection } from './components/SupportSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { AppModal } from './components/AppModal';
import { DonateModal, type DonateModalState } from './components/DonateModal';
import { TulipBuddy } from './components/TulipBuddy';
import { IN_PRODUCTION_APPS, TULIP_APPS } from './data/apps';
import { useTheme } from './hooks/useTheme';
import { useDetectedOS } from './hooks/useDetectedOS';
import { useGitHubReleases } from './hooks/useGitHubReleases';
import type { TulipApp } from './types';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const detectedOS = useDetectedOS();

  const [selectedApp, setSelectedApp] = useState<TulipApp | null>(null);
  const [donateModal, setDonateModal] = useState<DonateModalState>({ open: false });

  // Gather all GitHub repos referenced by direct downloads so we can live-sync latest releases
  const releaseRepos = useMemo(() => {
    const repos: string[] = [];
    for (const app of TULIP_APPS) {
      for (const dl of app.downloads) {
        if (dl.githubRepo) repos.push(dl.githubRepo);
      }
    }
    return repos;
  }, []);

  const releases = useGitHubReleases(releaseRepos);
  const featuredApps = useMemo(() => TULIP_APPS.filter((a) => a.featured), []);

  const handleCheckoutApp = (app: TulipApp) => {
    if (app.pricing.checkoutUrl) {
      window.open(app.pricing.checkoutUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelectedApp(null);
    setDonateModal({ open: true, app, mode: 'checkout' });
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <TulipBuddy />
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenDonate={() => setDonateModal({ open: true, mode: 'donate' })}
      />

      <main className="flex-1">
        <Hero
          featuredApps={featuredApps}
          totalLiveApps={TULIP_APPS.length}
          totalWipApps={IN_PRODUCTION_APPS.length}
          onSelectApp={setSelectedApp}
          onToggleTheme={toggleTheme}
        />

        <AppCatalog
          apps={TULIP_APPS}
          releases={releases}
          detectedOS={detectedOS}
          onSelectApp={setSelectedApp}
          onCheckoutApp={handleCheckoutApp}
        />

        <TulipRunner theme={theme} />

        <InProduction />

        <RecommendedSection />

        <SupportSection
          onSelectTier={(tier) =>
            setDonateModal({ open: true, mode: 'donate', initialTier: tier })
          }
        />

        <AboutSection />
      </main>

      <Footer onOpenDonate={() => setDonateModal({ open: true, mode: 'donate' })} />

      <AppModal
        app={selectedApp}
        releases={releases}
        detectedOS={detectedOS}
        onClose={() => setSelectedApp(null)}
        onDonateForApp={(app) => {
          setSelectedApp(null);
          setDonateModal({ open: true, app, mode: 'donate' });
        }}
        onCheckoutApp={handleCheckoutApp}
      />

      <DonateModal
        state={donateModal}
        onClose={() => setDonateModal({ open: false })}
      />
    </div>
  );
}

export default App;
