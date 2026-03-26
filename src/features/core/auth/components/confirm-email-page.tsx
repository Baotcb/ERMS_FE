'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoadingSpinner } from '@/components/common'
import { ConfirmEmailCard } from './confirm-email-card'
import { confirmEmail } from '../api/auth-service'

type ConfirmStatus = 'loading' | 'success' | 'error' | 'invalid'

function ConfirmEmailLoadingState({ label }: { label: string }) {
    return (
        <div className="w-full max-w-md mx-auto text-center py-16">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{label}</p>
        </div>
    )
}

function ConfirmEmailContent() {
    const searchParams = useSearchParams()
    const userId = searchParams.get('userId')
    const rawToken = searchParams.get('token')
    const email = searchParams.get('email') || undefined
    const token = rawToken ? rawToken.replace(/ /g, '+') : null

    const isInvalidParams = !userId || !token
    const [status, setStatus] = useState<ConfirmStatus>(isInvalidParams ? 'invalid' : 'loading')
    const [message, setMessage] = useState(isInvalidParams ? 'Link xĂ¡c thá»±c khĂ´ng há»£p lá»‡.' : '')

    useEffect(() => {
        if (isInvalidParams) return

        let cancelled = false

        async function verify() {
            try {
                const result = await confirmEmail(userId!, token!)
                if (cancelled) return
                setStatus('success')
                setMessage(result.message || 'XĂ¡c thá»±c email thĂ nh cĂ´ng!')
            } catch (err) {
                if (cancelled) return
                setStatus('error')
                setMessage(err instanceof Error ? err.message : 'XĂ¡c thá»±c email tháº¥t báº¡i')
            }
        }

        verify()

        return () => {
            cancelled = true
        }
    }, [userId, token, isInvalidParams])

    if (status === 'loading') {
        return <ConfirmEmailLoadingState label="Äang xĂ¡c thá»±c email..." />
    }

    return (
        <ConfirmEmailCard
            status={status === 'invalid' ? 'invalid' : status === 'success' ? 'success' : 'error'}
            message={message}
            email={email}
        />
    )
}

export function ConfirmEmailPage() {
    return (
        <Suspense fallback={<ConfirmEmailLoadingState label="Äang táº£i..." />}>
            <ConfirmEmailContent />
        </Suspense>
    )
}
