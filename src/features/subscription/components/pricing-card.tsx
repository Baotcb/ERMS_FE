'use client'

import { ArrowUpRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLAN_FEATURES } from '../constants'
import type { SubscriptionPlan } from '../types'

interface PricingCardProps {
    plan: SubscriptionPlan
    isCurrentPlan: boolean
    hasPendingPayment: boolean
    onSelectPlan: (planId: string) => void
    isLoading: boolean
}

export function PricingCard({ plan, isCurrentPlan, hasPendingPayment, onSelectPlan, isLoading }: PricingCardProps) {
    const isFree = plan.price === 0
    const isPro = !isFree
    const features = isFree ? PLAN_FEATURES.free : PLAN_FEATURES.pro
    const monthlyEquivalent = isPro ? Math.round(plan.price / 3).toLocaleString('vi-VN') : null

    return (
        <div className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 flex flex-col transition-all duration-300 ${
            isPro
                ? 'border-blue-500 bg-gradient-to-b from-blue-50/80 to-white shadow-lg shadow-blue-100 ring-1 ring-blue-500 hover:-translate-y-1 hover:shadow-blue-200'
                : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300'
        }`}>
            {isPro && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />
            )}

            {isPro && (
                <div className="absolute top-4 right-4">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" />
                        Khuyến nghị
                    </span>
                </div>
            )}

            <div className="mb-5 pr-24">
                <h3 className="text-xl font-semibold text-slate-900">{plan.planName}</h3>
                <p className={`mt-1 text-xs font-medium ${isPro ? 'text-blue-700' : 'text-slate-500'}`}>
                    {isPro ? 'Dành cho doanh nghiệp đang mở rộng đội ngũ' : 'Dành cho doanh nghiệp mới bắt đầu'}
                </p>
                {plan.description && <p className="mt-2 text-sm text-slate-600">{plan.description}</p>}
            </div>

            <div className="mb-6">
                <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                        {isFree ? 'Miễn phí' : `${plan.price.toLocaleString('vi-VN')}đ`}
                    </span>
                    {!isFree && <span className="text-slate-500 text-sm pb-1">/quý</span>}
                </div>
                {!isFree && (
                    <p className="text-xs text-slate-500 mt-1">
                        Tương đương khoảng {monthlyEquivalent}đ/tháng
                    </p>
                )}
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] text-slate-500">Tin tuyển dụng</p>
                    <p className="text-base font-semibold text-slate-900">{plan.maxJobPostings}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] text-slate-500">Khóa đào tạo</p>
                    <p className="text-base font-semibold text-slate-900">{plan.maxCourses}</p>
                </div>
            </div>

            <ul className="space-y-3 mb-7 flex-1">
                {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                    </li>
                ))}
            </ul>

            <Button
                onClick={() => onSelectPlan(plan.id)}
                disabled={isFree || hasPendingPayment || isLoading}
                variant={isPro ? 'default' : 'outline'}
                className={`w-full ${isPro ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'text-slate-500 border-slate-200'}`}
            >
                {isCurrentPlan && isFree ? 'Gói hiện tại'
                    : isCurrentPlan ? 'Gia hạn'
                    : hasPendingPayment ? 'Có đơn chờ thanh toán'
                    : isFree ? 'Gói mặc định'
                    : isLoading ? 'Đang xử lý...'
                    : 'Nâng cấp ngay'}
            </Button>
        </div>
    )
}
