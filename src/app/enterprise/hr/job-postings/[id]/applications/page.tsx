'use client'

import { useParams } from 'next/navigation'
import { ApplicationsView } from '@/features/hr/components/application/applications-view'

export default function ApplicationsPage() {
    const params = useParams<{ id: string }>()

    return (
        <div className="container mx-auto py-6">
            <ApplicationsView jobPostingId={params.id} />
        </div>
    )
}
