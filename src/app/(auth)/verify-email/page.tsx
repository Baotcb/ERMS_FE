import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { VerifyEmailCard } from '@/features/core/auth'

export const metadata: Metadata = {
    title: 'Xác thực Email - ERMS',
    description: 'Kiểm tra email để xác thực tài khoản',
}

export default async function VerifyEmailPage() {
    const cookieStore = await cookies()
    const email = cookieStore.get('verify_email')?.value || null
    return <VerifyEmailCard email={email} />
}
