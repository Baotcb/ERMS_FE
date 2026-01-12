import { RegisterForm } from '@/features/core/auth'
import { RegisterHero } from '@/features/core/auth/components/register-hero'

export default function RegisterPage() {
  return (
    <div className="w-full max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left Side - Info */}
        <RegisterHero />

        {/* Right Side - Form */}
        <div className="w-full">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
