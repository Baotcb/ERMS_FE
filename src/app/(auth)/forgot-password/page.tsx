'use client'

import { FormProvider } from 'react-hook-form'
import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password'

export default function ForgotPasswordPage() {
    const { form, isLoading, error, onSubmit } = useForgotPassword()

    // Navbar usually takes a user prop but here we can pass null or handle it in Navbar
    // Checking Navbar signature might be good, but assuming it handles no user/null

    return (
        <div className="flex min-h-screen flex-col">
            {/* Navbar */}
            <Navbar />

            <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12">
                <FormProvider {...form}>
                    <ForgotPasswordForm
                        onSubmit={onSubmit}
                        isLoading={isLoading}
                        error={error}
                    />
                </FormProvider>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}
