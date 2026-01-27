import { Metadata } from 'next'
import { VerifyEmailCard } from '@/features/core/auth'

export const metadata: Metadata = {
    title: 'Xác thực Email - ERMS',
    description: 'Kiểm tra email để xác thực tài khoản',
}

export default function VerifyEmailPage() {
    return <VerifyEmailCard />
}
