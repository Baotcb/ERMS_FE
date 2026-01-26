import { CandidateNavbar } from '@/components/layout/candidate-navbar';
import { Footer } from '@/components/layout/footer';
import { HomeHeroSection, HomeBestJobsSection, HomeTopCompaniesSection } from '../components';

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
