'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCurrentSubscription } from '../hooks/use-subscription'

export function PaymentResultPage() {
    const searchParams = useSearchParams()
    const status = searchParams.get('status') // PayOS sends status in returnUrl
    const orderCode = searchParams.get('orderCode')
    const { subscription, isLoading, mutate } = useCurrentSubscription()

    const isSuccess = status === 'PAID' && !!orderCode

    useEffect(() => {
        if (isSuccess) {
            mutate()
            const timer = setTimeout(() => mutate(), 3000)
            return () => clearTimeout(timer)
        }
    }, [isSuccess, mutate])


    return (
        <div className="max-w-lg mx-auto text-center py-16">
            {isSuccess ? (
                <>
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-3">
                        Thanh toán thành công!
                    </h1>
                    <p className="text-slate-500 mb-2">
                        Mã đơn hàng: <span className="font-mono font-medium">{orderCode}</span>
                    </p>
                    <p className="text-slate-500 mb-8">
                        Gói dịch vụ đã được nâng cấp thành công. Bạn có thể sử dụng tất cả
                        tính năng ngay bây giờ.
                    </p>
                    {subscription && !isLoading && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-sm text-green-800">
                            <div>Gói hiện tại: <strong>{subscription.currentPlan.planName}</strong></div>
                            {subscription.subscriptionEndDate && (
                                <div>Có hiệu lực đến: {new Date(subscription.subscriptionEndDate).toLocaleDateString('vi-VN')}</div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <>
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-3">
                        Thanh toán không thành công
                    </h1>
                    <p className="text-slate-500 mb-8">
                        Đơn hàng đã bị hủy hoặc thanh toán thất bại. Vui lòng thử lại.
                    </p>
                </>
            )}

            <div className="flex gap-3 justify-center">
                <Link href="/enterprise/hr/subscription">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại quản lý gói
                    </Button>
                </Link>
                <Link href="/enterprise/hr/dashboard">
                    <Button>Về trang chủ</Button>
                </Link>
            </div>
        </div>
    )
}
