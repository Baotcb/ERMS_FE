import { Metadata } from 'next'
import { CandidateOffersPage } from '@/features/candidate/components/candidate-offers-page'

export const metadata: Metadata = {
    title: 'Äá» nghá»‹ cĂ´ng viá»‡c | ERMS',
    description: 'Danh sĂ¡ch cĂ¡c Ä‘á» nghá»‹ cĂ´ng viá»‡c báº¡n Ä‘Ă£ nháº­n vĂ  tráº¡ng thĂ¡i hiá»‡n táº¡i.',
}

export default function OffersPage() {
    return <CandidateOffersPage />
}
