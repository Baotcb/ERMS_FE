'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ConfirmEmailCard } from '@/features/core/auth'
import { confirmEmail } from '@/features/core/auth/api/auth-service'
import { LoadingSpinner } from '@/components/common'

type ConfirmStatus = 'loading' | 'success' | 'error' | 'invalid'

function ConfirmEmailContent() {
    const searchParams = useSearchParams()
    const userId = searchParams.get('userId')
    const rawToken = searchParams.get('token')
    const email = searchParams.get('email') || undefined
    const token = rawToken ? decodeURIComponent(rawToken) : null

    const isInvalidParams = !userId || !token
    const [status, setStatus] = useState<ConfirmStatus>(isInvalidParams ? 'invalid' : 'loading')
    const [message, setMessage] = useState(isInvalidParams ? 'Link xác thực không hợp lệ.' : '')

    useEffect(() => {
        if (isInvalidParams) return

        let cancelled = false

        async function verify() {
            try {
                const result = await confirmEmail(userId!, token!)
                if (cancelled) return
                setStatus('success')
                setMessage(result.message || 'Xác thực email thành công!')
            } catch (err) {
                if (cancelled) return
                setStatus('error')
                setMessage(err instanceof Error ? err.message : 'Xác thực email thất bại')
            }
        }

        verify()

        return () => {
            cancelled = true
        }
    }, [userId, token, isInvalidParams])

    if (status === 'loading') {
        return (
            <div className="w-full max-w-md mx-auto text-center py-16">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Đang xác thực email...</p>
            </div>
        )
    }

    return (
        <ConfirmEmailCard
            status={status === 'invalid' ? 'invalid' : status === 'success' ? 'success' : 'error'}
            message={message}
            email={email}
        />
    )
}

export default function ConfirmEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="w-full max-w-md mx-auto text-center py-16">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
                </div>
            }
        >
            <ConfirmEmailContent />
        </Suspense>
    )
}