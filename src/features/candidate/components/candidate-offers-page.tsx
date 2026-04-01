import { CandidateOfferList } from './candidate-offer-list'
import { CandidateSidebar } from './candidate-sidebar'
import '@/features/jobs/styles/Jobs.css'

export function CandidateOffersPage() {
    return (
        <div className="topcv-page">
            <div className="topcv-page__container">
                <div className="topcv-page__main">
                    <h1 className="topcv-page__title">Đề nghị công việc</h1>
                    <p className="text-slate-500 text-sm mb-6">
                        Danh sách các đề nghị công việc bạn đã nhận và trạng thái hiện tại.
                    </p>
                    <CandidateOfferList />
                </div>

                <aside>
                    <CandidateSidebar />
                </aside>
            </div>
        </div>
    )
}
