'use client'

import { use } from 'react'
import { ShortlistedList } from '@/features/dept-head/components/interview/shortlisted-list'

interface PageProps {
    params: Promise<{ planDetailId: string }>
}

export default function ShortlistedPage({ params }: PageProps) {
    const { planDetailId } = use(params)
    return <ShortlistedList planDetailId={planDetailId} />
}
