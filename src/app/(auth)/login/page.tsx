import { LoginForm } from '@/features/core/auth'
import { LoginHero } from '@/features/core/auth/components/login-hero'

export default function LoginPage() {
  return (
    <div className="w-full max-w-5xl">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100 dark:border-gray-700">
        {/* Form Section */}
        <LoginForm />

        {/* Hero Section */}
        <LoginHero />
      </div>
    </div>
  )
}
