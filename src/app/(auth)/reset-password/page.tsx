'use client'

import { FormProvider } from 'react-hook-form'
import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'
import { useResetPassword } from '@/features/auth/hooks/use-reset-password'

export default function ResetPasswordPage() {
  const { form, isLoading, error, email, token, onSubmit } = useResetPassword()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <Navbar user={null} />

      <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12">
        <FormProvider {...form}>
          <ResetPasswordForm
            onSubmit={onSubmit}
            isLoading={isLoading}
            error={error}
            email={email}
            token={token}
          />
        </FormProvider>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}