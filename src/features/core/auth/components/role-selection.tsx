'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { User, Briefcase } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/common'
import { useState } from 'react'

export function RoleSelection() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const enterpriseId = searchParams.get('enterpriseId')
    const [showAlert, setShowAlert] = useState(false)

    if (!enterpriseId) {
        return (
            <Alert type="error" message="Missing Enterprise ID. Please register enterprise first." />
        )
    }

    const handleDirectorSelect = () => {
        setShowAlert(true)
    }

    const handleHRSelect = () => {
        router.push(`/register/hr?enterpriseId=${enterpriseId}`)
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chọn vai trò của bạn</h1>
                <p className="text-gray-500 dark:text-gray-400">Bước 2: Xác định vị trí làm việc</p>
            </div>

            {showAlert && (
                <Alert
                    type="warning"
                    message="Tính năng dành cho Giám đốc đang được phát triển. Vui lòng quay lại sau."
                    className="mb-6"
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* HR Manager Option */}
                <Card
                    className="p-6 cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-center space-y-4 group"
                    onClick={handleHRSelect}
                >
                    <div className="w-16 h-16 bg-blue-100 text-brand-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">HR Manager</h3>
                        <p className="text-sm text-gray-500">Quản lý tuyển dụng và nhân sự</p>
                    </div>
                </Card>

                {/* Director Option */}
                <Card
                    className="p-6 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all text-center space-y-4 group"
                    onClick={handleDirectorSelect}
                >
                    <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">Director</h3>
                        <p className="text-sm text-gray-500">Giám đốc / Chủ doanh nghiệp</p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
