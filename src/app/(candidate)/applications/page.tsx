import { Metadata } from 'next'
import { ApplicationList } from '@/features/candidate/components/application-list'
import { CandidateSidebar } from '@/features/candidate/components/candidate-sidebar'
import '@/features/jobs/styles/Jobs.css'

export const metadata: Metadata = {
    title: 'Việc làm đã ứng tuyển | ERMS',
    description: 'Quản lý danh sách các công việc đã ứng tuyển',
}

export default function ApplicationsPage() {
    return (
        <div className="topcv-page">
            <div className="topcv-page__container">
                {/* Main Content */}
                <div className="topcv-page__main">
                    <h1 className="topcv-page__title">Việc làm đã ứng tuyển</h1>
                    <ApplicationList />
                </div>

                {/* Sidebar */}
                <aside>
                    <CandidateSidebar />
                </aside>
            </div>
        </div>
    )
}
