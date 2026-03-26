import { CandidateOfferList } from './candidate-offer-list'
import { CandidateSidebar } from './candidate-sidebar'
import '@/features/jobs/styles/Jobs.css'

export function CandidateOffersPage() {
    return (
        <div className="topcv-page">
            <div className="topcv-page__container">
                <div className="topcv-page__main">
                    <h1 className="topcv-page__title">Äá» nghá»‹ cĂ´ng viá»‡c</h1>
                    <p className="text-slate-500 text-sm mb-6">
                        Danh sĂ¡ch cĂ¡c Ä‘á» nghá»‹ cĂ´ng viá»‡c báº¡n Ä‘Ă£ nháº­n vĂ  tráº¡ng thĂ¡i hiá»‡n táº¡i.
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
