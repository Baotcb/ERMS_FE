import { Metadata } from 'next'
import { CandidateOfferList } from '@/features/candidate/components/candidate-offer-list'
import { CandidateSidebar } from '@/features/candidate/components/candidate-sidebar'
import '@/features/jobs/styles/Jobs.css'

export const metadata: Metadata = {
    title: 'Đề nghị công việc | ERMS',
    description: 'Danh sách các đề nghị công việc bạn đã nhận và trạng thái hiện tại.',
}

export default function OffersPage() {
    return (
        <div className="topcv-page">
            <div className="topcv-page__container">
                {/* Main Content */}
                <div className="topcv-page__main">
                    <h1 className="topcv-page__title">Đề nghị công việc</h1>
                    <p className="text-slate-500 text-sm mb-6">
                        Danh sách các đề nghị công việc bạn đã nhận và trạng thái hiện tại.
                    </p>
                    <CandidateOfferList />
                </div>

                {/* Sidebar */}
                <aside>
                    <CandidateSidebar />
                </aside>
            </div>
        </div>
    )
}
