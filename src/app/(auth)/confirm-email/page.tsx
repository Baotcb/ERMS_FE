import { Metadata } from 'next'
import { ConfirmEmailCard } from '@/features/core/auth'
import { config } from '@/config'

export const metadata: Metadata = {
    title: 'Xác thực Email - ERMS',
    description: 'Xác nhận địa chỉ email của bạn',
}

interface PageProps {
    searchParams: Promise<{ userId?: string; token?: string; email?: string }>
}

async function verifyEmail(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(`${config.apiUrl}/api/Auth/confirm-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, token }),
            cache: 'no-store',
        })
        const data = await response.json()
        if (!response.ok) {
            return { success: false, message: data.message || 'Xác thực email thất bại' }
        }
        return { success: true, message: data.message || 'Xác thực email thành công!' }
    } catch {
        return { success: false, message: 'Không thể kết nối đến server' }
    }
}

export default async function ConfirmEmailPage({ searchParams }: PageProps) {
    const { userId, token, email } = await searchParams

    if (!userId || !token) {
        return <ConfirmEmailCard status="invalid" message="Link xác thực không hợp lệ." email={email} />
    }

    const result = await verifyEmail(userId, token)
    return <ConfirmEmailCard status={result.success ? 'success' : 'error'} message={result.message} email={email} />
}
