import { Metadata } from 'next'
import { CandidateApplicationsPage } from '@/features/candidate/components/candidate-applications-page'

export const metadata: Metadata = {
    title: 'Viá»‡c lĂ m Ä‘Ă£ á»©ng tuyá»ƒn | ERMS',
    description: 'Quáº£n lĂ½ danh sĂ¡ch cĂ¡c cĂ´ng viá»‡c Ä‘Ă£ á»©ng tuyá»ƒn',
}

export default function ApplicationsPage() {
    return <CandidateApplicationsPage />
}
