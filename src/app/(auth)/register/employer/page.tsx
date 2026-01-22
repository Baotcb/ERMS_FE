import { Metadata } from 'next'
import { EmployerRegisterForm } from '@/features/core/auth/components/employer-register-form'
import { RegisterHero } from '@/features/core/auth/components/register-hero'

export const metadata: Metadata = {
    title: 'Đăng ký Doanh nghiệp | ERMS',
    description: 'Đăng ký tài khoản doanh nghiệp để tuyển dụng nhân tài',
}

export default function EmployerRegisterPage() {
    return (
        <div className="w-full max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* Left Side - Reuse Hero but maybe we can customize it later if needed */}
                <RegisterHero />

                {/* Right Side - Employer Form */}
                <div className="w-full">
                    <EmployerRegisterForm />
                </div>
            </div>
        </div>
    )
}
