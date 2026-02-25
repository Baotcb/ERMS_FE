'use client'

import { use } from 'react'
import { ShortlistedList } from '@/features/dept-head/components/interview/shortlisted-list'

interface PageProps {
    params: Promise<{ jobPostingId: string }>
}

export default function ShortlistedPage({ params }: PageProps) {
    const { jobPostingId } = use(params)
    return <ShortlistedList jobPostingId={jobPostingId} />
}
