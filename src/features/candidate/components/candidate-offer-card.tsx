'use client'

import { memo, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    ArrowRight,
    Briefcase,
    Building2,
    Calendar,
    DollarSign,
} from 'lucide-react'
import { OfferStatusBadge } from '@/features/hr/components/offer/offer-status-badge'
import { getCompanyProfileHref } from '@/features/jobs/utils/company-detail'
import type { CandidateOfferDto } from '../types/offer-types'

interface CandidateOfferCardProps {
    offer: CandidateOfferDto
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount)
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export const CandidateOfferCard = memo(function CandidateOfferCard({
    offer,
}: CandidateOfferCardProps) {
    const frequencyLabel = useMemo(
        () => (offer.salaryFrequency === 'Monthly' ? 'Tháng' : 'Năm'),
        [offer.salaryFrequency]
    )

    const isExpired = new Date(offer.expirationDate) < new Date()
    const companyHref = getCompanyProfileHref({
        id: offer.enterpriseId,
        enterpriseName: offer.enterpriseName,
    })

    const actionConfig = useMemo(() => {
        switch (offer.status) {
            case 'Sent':
                return { label: 'Xem chi tiết', style: 'bg-[#0F4C75] text-white hover:bg-[#0a3857]' }
            case 'Accepted':
                return { label: 'Đã nhận việc', style: 'bg-emerald-50 text-emerald-700 cursor-default' }
            case 'Rejected':
            case 'Expired':
            case 'Cancelled':
                return { label: 'Không khả dụng', style: 'bg-slate-100 text-slate-400 cursor-default' }
            default:
                return { label: 'Xem chi tiết', style: 'bg-slate-100 text-slate-600 hover:bg-slate-200' }
        }
    }, [offer.status])

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:h-24 sm:w-24">
                    {offer.enterpriseLogoUrl ? (
                        <div className="relative h-full w-full">
                            <Image
                                src={offer.enterpriseLogoUrl}
                                alt={offer.enterpriseName}
                                fill
                                sizes="96px"
                                className="object-contain p-2"
                            />
                        </div>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                            <Briefcase className="h-8 w-8 text-slate-400" />
                        </div>
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <OfferStatusBadge status={offer.status} />
                        {offer.offerCode && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                                {offer.offerCode}
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-base font-bold leading-6 text-slate-900 break-words">
                            {offer.position}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                            <Link
                                href={companyHref}
                                className="inline-flex min-w-0 items-center gap-1 text-[#0F4C75] transition-colors hover:text-[#0a3857]"
                            >
                                <Building2 className="h-3.5 w-3.5 shrink-0" />
                                <span className="break-words font-semibold">
                                    {offer.enterpriseName}
                                </span>
                            </Link>
                            <span className="inline-flex min-w-0 items-center gap-1">
                                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                                <span className="break-words">{offer.departmentName}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                            <DollarSign className="h-3.5 w-3.5 text-[#0F4C75]" />
                            {formatCurrency(offer.salary)} VND / {frequencyLabel}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                            <Calendar className="h-3.5 w-3.5" />
                            Bắt đầu: {formatDate(offer.startDate)}
                        </span>
                        {isExpired && (
                            <span className="text-xs font-medium text-red-500">
                                Hết hạn: {formatDate(offer.expirationDate)}
                            </span>
                        )}
                    </div>

                    {offer.status === 'Cancelled' && (
                        <p className="text-xs font-medium text-red-600">
                            Offer này đã bị hủy bởi nhà tuyển dụng. Vui lòng kiểm tra email để biết thêm chi tiết.
                        </p>
                    )}
                </div>

                <div className="flex w-full shrink-0 md:w-auto md:justify-end">
                    {offer.status === 'Sent' ? (
                        <Link
                            href={`/offers/${offer.offerId}`}
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors md:w-auto ${actionConfig.style}`}
                        >
                            {actionConfig.label}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <span
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold md:w-auto ${actionConfig.style}`}
                        >
                            {actionConfig.label}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
})
