'use client'

import { AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface FeatureLimitBannerProps {
    currentCount: number
    maxCount: number
    resourceName: string // "tin tuyển dụng" | "khóa đào tạo"
    className?: string
}

export function FeatureLimitBanner({
    currentCount,
    maxCount,
    resourceName,
    className = '',
}: FeatureLimitBannerProps) {
    const usagePercent = Math.min((currentCount / maxCount) * 100, 100)
    const isAtLimit = currentCount >= maxCount
    const isNearLimit = usagePercent >= 80 && !isAtLimit

    if (!isNearLimit && !isAtLimit) return null

    return (
        <div
            className={`rounded-lg border p-4 ${
                isAtLimit
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
            } ${className}`}
        >
            <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${isAtLimit ? 'text-red-500' : 'text-amber-500'}`} />
                <div className="flex-1">
                    <p className="text-sm font-medium">
                        {isAtLimit
                            ? `Đã đạt giới hạn ${maxCount} ${resourceName}`
                            : `Sắp đạt giới hạn ${resourceName} (${currentCount}/${maxCount})`}
                    </p>
                    <p className="text-xs mt-1 opacity-80">
                        {isAtLimit
                            ? `Bạn không thể thêm ${resourceName} mới. Vui lòng nâng cấp gói dịch vụ.`
                            : `Bạn đang sử dụng ${currentCount}/${maxCount} ${resourceName}.`}
                    </p>
                    <Link
                        href="/enterprise/hr/subscription"
                        className="inline-flex items-center gap-1 text-xs font-medium mt-2 underline underline-offset-2"
                    >
                        Nâng cấp gói dịch vụ
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
