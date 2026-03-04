'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { VerifyEmailCard } from '@/features/core/auth'
import { LoadingSpinner } from '@/components/common'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || null
    return <VerifyEmailCard email={email} />
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <VerifyEmailContent />
        </Suspense>
    )
}
