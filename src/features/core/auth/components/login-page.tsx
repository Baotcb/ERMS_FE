import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/common'
import { LoginForm } from './login-form'
import { LoginHero } from './login-hero'

function LoginLoadingState() {
    return (
        <div className="flex w-full items-center justify-center py-16 md:w-1/2">
            <LoadingSpinner />
        </div>
    )
}

export function LoginPage() {
    return (
        <div className="w-full max-w-5xl">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100 dark:border-gray-700">
                <Suspense fallback={<LoginLoadingState />}>
                    <LoginForm />
                </Suspense>
                <LoginHero />
            </div>
        </div>
    )
}
