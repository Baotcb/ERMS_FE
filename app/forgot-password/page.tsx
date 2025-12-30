'use client'

import { FormProvider } from 'react-hook-form'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password'

export default function ForgotPasswordPage() {
  const { form, isLoading, error, onSubmit } = useForgotPassword()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <Navbar user={null} />

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
