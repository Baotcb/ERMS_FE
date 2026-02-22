import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { CandidateNavbar } from '@/components/layout/candidate-navbar';
import { Footer } from '@/components/layout/footer';

const HeroSection = dynamic(() => import('../components/home-hero-section').then(mod => mod.HeroSection), {
  loading: () => <div className="h-[500px] bg-[#00b14f] animate-pulse" />,
});

const BestJobsSection = dynamic(() => import('../components/home-best-jobs-section').then(mod => mod.BestJobsSection), {
  loading: () => <div className="h-[400px] bg-[#f4f5f5] animate-pulse" />,
});

const TopCompaniesSection = dynamic(() => import('../components/home-top-companies-section').then(mod => mod.TopCompaniesSection), {
  loading: () => <div className="h-[300px] bg-white animate-pulse" />,
});

export function HomeView() {
  return (
    <main className="min-h-screen flex flex-col bg-[#f4f5f5]">
      <CandidateNavbar />
      <div className="flex-1">
        <Suspense fallback={<div className="h-[500px] bg-[#00b14f] animate-pulse" />}>
          <HeroSection />
        </Suspense>
        <Suspense fallback={<div className="h-[300px] bg-white animate-pulse" />}>
          <TopCompaniesSection />
        </Suspense>
        <Suspense fallback={<div className="h-[400px] bg-[#f4f5f5] animate-pulse" />}>
          <BestJobsSection />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
