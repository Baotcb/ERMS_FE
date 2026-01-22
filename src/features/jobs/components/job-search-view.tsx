import { HeroSection } from './home-hero-section'
import { BestJobsSection } from './home-best-jobs-section'
import { TopCompaniesSection } from './home-top-companies-section'

export function JobSearchView() {
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
