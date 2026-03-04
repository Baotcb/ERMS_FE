import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { ConfirmEmailCard } from '@/features/core/auth'
import { config } from '@/config'

export const metadata: Metadata = {
    title: 'Xác thực Email - ERMS',
    description: 'Xác nhận địa chỉ email của bạn',
}

interface PageProps {
    searchParams: Promise<{ userId?: string; token?: string; email?: string }>
}

import { logger } from '@/lib/logger'

async function verifyEmail(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
        // Remove trailing slash to avoid double-slash in URL
        let apiUrl = config.apiUrl
        while (apiUrl.endsWith('/')) apiUrl = apiUrl.slice(0, -1)


        const response = await fetch(`${apiUrl}/api/Auth/confirm-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, token }),
            cache: 'no-store',
        })

        // Handle empty response body gracefully
        const text = await response.text()
        let data: { message?: string } = {}
        if (text) {
            try {
                data = JSON.parse(text)
            } catch {
                // Response is not JSON
            }
        }

        if (!response.ok) {
            return { success: false, message: data.message || `Xác thực email thất bại (${response.status})` }
        }
        return { success: true, message: data.message || 'Xác thực email thành công!' }
    } catch (err) {
        logger.error('Verify email error:', err)
        return { success: false, message: 'Không thể kết nối đến server' }
    }
}

export default async function ConfirmEmailPage({ searchParams }: PageProps) {
    const { userId, token: rawToken, email: emailParam } = await searchParams
    const token = rawToken ? decodeURIComponent(rawToken) : undefined

    // Fallback to cookie if email not in search params
    const cookieStore = await cookies()
    const email = emailParam || cookieStore.get('verify_email')?.value

    if (!userId || !token) {
        return <ConfirmEmailCard status="invalid" message="Link xác thực không hợp lệ." email={email} />
    }

    const result = await verifyEmail(userId, token)
    if (result.success) {
        cookieStore.delete('verify_email')
    }
    return <ConfirmEmailCard status={result.success ? 'success' : 'error'} message={result.message} email={email} />
}
