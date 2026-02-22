import { Suspense } from 'react'
import { HRAccountForm } from '@/features/core/auth/components/hr-account-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Tạo tài khoản HR - ERMS',
    description: 'Thiết lập tài khoản quản trị nhân sự',
}

export default function HRAccountPage() {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-80px)] py-10">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
                <Suspense>
                    <HRAccountForm />
                </Suspense>
            </div>
        </div>
    )
}
