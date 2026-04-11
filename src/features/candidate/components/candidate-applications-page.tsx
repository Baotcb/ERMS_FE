import { ApplicationList } from './application-list'
import { CandidateSidebar } from './candidate-sidebar'
import '@/features/jobs/styles/Jobs.css'

export function CandidateApplicationsPage() {
    return (
        <div className="topcv-page">
            <div className="topcv-page__container">
                <div className="topcv-page__main">
                    <h1 className="topcv-page__title">Việc làm đã ứng tuyển</h1>
                    <ApplicationList />
                </div>

                <aside>
                    <CandidateSidebar />
                </aside>
            </div>
        </div>
    )
}
