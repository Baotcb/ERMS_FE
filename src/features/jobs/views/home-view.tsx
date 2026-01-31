import { CandidateNavbar } from '@/components/layout/candidate-navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection as HomeHeroSection } from '../components/home-hero-section';
import { BestJobsSection as HomeBestJobsSection } from '../components/home-best-jobs-section';
import { TopCompaniesSection as HomeTopCompaniesSection } from '../components/home-top-companies-section';

export function HomeView() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <CandidateNavbar />
      <div className="flex-1">
        <HomeHeroSection />
        <HomeTopCompaniesSection />
        <HomeBestJobsSection />
      </div>
      <Footer />
    </main>
  );
}
