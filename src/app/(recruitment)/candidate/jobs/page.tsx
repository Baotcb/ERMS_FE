/**
 * Job Search Page
 * Main page for candidates to search and browse jobs
 */

import { JobHero } from '@/features/domains/jobs/components/job-hero'
import { JobFilter } from '@/features/domains/jobs/components/job-filter'
import { JobList } from '@/features/domains/jobs/components/job-list'

export default function JobSearchPage() {
  return (
    <>
      <JobHero />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-20 pb-20">
        <JobFilter />
        <JobList />
      </div>
    </>
  )
}
