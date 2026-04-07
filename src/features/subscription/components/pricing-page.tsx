'use client'

import { useState } from 'react'
import { Briefcase, GraduationCap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import { PricingCard } from './pricing-card'
import { CurrentPlanBadge } from './current-plan-badge'
import { FeatureLimitBanner } from './feature-limit-banner'
import { useSubscriptionPlans, useCurrentSubscription } from '../hooks/use-subscription'
import { createPaymentOrder } from '../api/subscription-service'

function getUsagePercent(current: number, max: number) {
    if (max <= 0) return 0
    return Math.min(Math.round((current / max) * 100), 100)
}

function getUsageState(usagePercent: number) {
    if (usagePercent >= 100) {
        return {
            label: 'Đã đầy',
            badgeClass: 'bg-red-100 text-red-700 border-red-200',
            meterClass: '[&>div]:bg-red-500',
            cardClass: 'border-red-200 bg-red-50/50',
        }
    }

    if (usagePercent >= 80) {
        return {
            label: 'Cần theo dõi',
            badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
            meterClass: '[&>div]:bg-amber-500',
            cardClass: 'border-amber-200 bg-amber-50/50',
        }
    }

    return {
        label: 'Ổn định',
        badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        meterClass: '[&>div]:bg-blue-600',
        cardClass: 'border-slate-200 bg-white',
    }
}

export function PricingPage() {
    const { toast } = useToast()
    const { plans, isLoading: plansLoading } = useSubscriptionPlans()
    const { subscription, isLoading: subLoading } = useCurrentSubscription()
    const [isProcessing, setIsProcessing] = useState(false)

    const handleSelectPlan = async (planId: string) => {
        setIsProcessing(true)
        try {
            const result = await createPaymentOrder(planId)
            window.location.href = result.checkoutUrl
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Không thể tạo đơn thanh toán',
                variant: 'destructive',
            })
            setIsProcessing(false)
        }
    }

    if (plansLoading || subLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        )
    }

    const orderedPlans = [...(plans ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)

    const usageCards = subscription
        ? [
            {
                key: 'job-postings',
                title: 'Tin tuyển dụng',
                icon: Briefcase,
                current: subscription.usage.currentJobPostings,
                max: subscription.currentPlan.maxJobPostings,
            },
            {
                key: 'courses',
                title: 'Khóa đào tạo',
                icon: GraduationCap,
                current: subscription.usage.currentCourses,
                max: subscription.currentPlan.maxCourses,
            },
        ]
        : []

    return (
        <div className="max-w-6xl mx-auto">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-8 shadow-sm mb-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Quản lý gói dịch vụ</h1>
                        <p className="mt-1 text-slate-500">Theo dõi mức sử dụng và chọn gói phù hợp với tốc độ tăng trưởng doanh nghiệp</p>
                    </div>
                    {subscription && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500">Gói hiện tại:</span>
                                <CurrentPlanBadge planCode={subscription.currentPlan.planCode} planName={subscription.currentPlan.planName} />
                            </div>
                            {subscription.subscriptionEndDate && (
                                <div className="mt-2 text-xs text-slate-500">
                                    Hết hạn: {new Date(subscription.subscriptionEndDate).toLocaleDateString('vi-VN')}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {subscription && (
                    <div className="mt-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {usageCards.map((usageCard) => {
                                const usagePercent = getUsagePercent(usageCard.current, usageCard.max)
                                const usageState = getUsageState(usagePercent)
                                const Icon = usageCard.icon

                                return (
                                    <div key={usageCard.key} className={`rounded-2xl border p-4 ${usageState.cardClass}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Icon className="h-4 w-4" />
                                                <span className="text-sm font-medium">{usageCard.title}</span>
                                            </div>
                                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${usageState.badgeClass}`}>
                                                {usageState.label}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-end justify-between">
                                            <div className="text-2xl font-bold text-slate-900">
                                                {usageCard.current}
                                                <span className="text-base font-medium text-slate-500">/{usageCard.max}</span>
                                            </div>
                                            <div className="text-xs font-medium text-slate-500">{usagePercent}%</div>
                                        </div>

                                        <Progress value={usagePercent} className={`h-2 mt-3 bg-slate-200 ${usageState.meterClass}`} />
                                    </div>
                                )
                            })}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <FeatureLimitBanner
                                currentCount={subscription.usage.currentJobPostings}
                                maxCount={subscription.currentPlan.maxJobPostings}
                                resourceName="tin tuyển dụng"
                            />
                            <FeatureLimitBanner
                                currentCount={subscription.usage.currentCourses}
                                maxCount={subscription.currentPlan.maxCourses}
                                resourceName="khóa đào tạo"
                            />
                        </div>

                        <p className="text-xs text-slate-500">
                            Khi mức sử dụng vượt 80%, hệ thống sẽ hiển thị cảnh báo để bạn chủ động nâng cấp trước khi bị chặn thao tác tạo mới.
                        </p>
                    </div>
                )}
            </section>

            <section>
                <div className="mb-5 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold text-slate-900">So sánh nhanh gói dịch vụ</h2>
                        <p className="text-sm text-slate-500">Tập trung vào giới hạn sử dụng, tính năng AI và mức hỗ trợ</p>
                    </div>
                    {subscription?.hasPendingPayment && (
                        <p className="text-xs font-medium text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-3 py-1 w-fit">
                            Bạn đang có đơn chờ thanh toán
                        </p>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {orderedPlans.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            isCurrentPlan={subscription?.currentPlan.id === plan.id}
                            hasPendingPayment={subscription?.hasPendingPayment ?? false}
                            onSelectPlan={handleSelectPlan}
                            isLoading={isProcessing}
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}
