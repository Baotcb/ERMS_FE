'use client'

import { SavedJobList } from './saved-job-list'
import { CandidateSidebar } from '@/features/candidate/components/candidate-sidebar'
import { SavedJobsHeaderClient } from './saved-jobs-header-client'
import '@/features/jobs/styles/Jobs.css'

export function SavedJobsView() {
    return (
        <div className="topcv-page">
            <div className="topcv-page__container">
                {/* Main Content */}
                <div className="topcv-page__main">
                    <SavedJobsHeaderClient />
                    <SavedJobList />
                </div>

                {/* Sidebar */}
                <aside>
                    <CandidateSidebar />
                </aside>
            </div>
        </div>
    )
}
