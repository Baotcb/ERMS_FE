import { EnterpriseRegisterForm } from '@/features/core/auth/components/enterprise-register-form'
import { RegisterHero } from '@/features/core/auth/components/register-hero'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Đăng ký Doanh nghiệp - ERMS',
    description: 'Đăng ký tài khoản doanh nghiệp mới',
}

export default function EmployerRegisterPage() {
    return (
        <div className="w-full max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* Reuse Hero for consistent look */}
                <RegisterHero />
                <EnterpriseRegisterForm />
            </div>
        </div>
    )
}
