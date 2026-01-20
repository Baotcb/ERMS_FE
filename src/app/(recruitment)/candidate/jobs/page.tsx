/**
 * Job Search Page
 * Main page for candidates to search and browse jobs
 */

import { HeroSection } from '@/features/domains/home/hero-section'
import { BestJobsSection } from '@/features/domains/home/best-jobs-section'
import { TopCompaniesSection } from '@/features/domains/home/top-companies-section'

export default function JobSearchPage() {
  return (
    <>
      <HeroSection />

      <div className="bg-[#F7F9FC]">
        <BestJobsSection />
        <TopCompaniesSection />
      </div>
    </>
  )
}
