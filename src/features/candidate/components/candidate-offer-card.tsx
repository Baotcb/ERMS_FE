'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { Calendar, DollarSign, ArrowRight, Briefcase, Building2 } from 'lucide-react'
import { OfferStatusBadge } from '@/features/hr/components/offer/offer-status-badge'
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

    // Xác định text và style cho action button theo status
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 p-5">
                {/* Image placeholder */}
                <div className="w-full sm:w-28 h-20 sm:h-24 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    <Briefcase className="w-8 h-8 text-slate-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    {/* Status + Offer Code */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <OfferStatusBadge status={offer.status} />
                        {offer.offerCode && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                                {offer.offerCode}
                            </span>
                        )}
                    </div>

                    {/* Position */}
                    <h3 className="text-base font-bold text-slate-900 truncate">
                        {offer.position}
                    </h3>

                    {/* Department + Company */}
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {offer.departmentName}
                        </span>
                    </div>

                    {/* Salary + Start Date */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <DollarSign className="w-3.5 h-3.5 text-[#0F4C75]" />
                            {formatCurrency(offer.salary)} VND / {frequencyLabel}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            Bắt đầu: {formatDate(offer.startDate)}
                        </span>
                        {isExpired && (
                            <span className="text-xs text-red-500 font-medium">
                                Hết hạn: {formatDate(offer.expirationDate)}
                            </span>
                        )}
                    </div>

                    {/* Cancelled notice */}
                    {offer.status === 'Cancelled' && (
                        <p className="text-xs text-red-600 font-medium">
                            Offer này đã bị hủy bởi nhà tuyển dụng. Vui lòng kiểm tra email để biết thêm chi tiết.
                        </p>
                    )}
                </div>

                {/* Action */}
                <div className="flex items-center sm:ml-4">
                    {offer.status === 'Sent' ? (
                        <Link
                            href={`/offers/${offer.offerId}`}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${actionConfig.style}`}
                        >
                            {actionConfig.label}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <span
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold ${actionConfig.style}`}
                        >
                            {actionConfig.label}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
})
