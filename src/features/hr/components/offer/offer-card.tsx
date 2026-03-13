'use client'

import { memo, useState } from 'react'
import { Calendar, UserCheck } from 'lucide-react'
import type { HROfferDto } from '../../types/offer-types'
import { OfferStatusBadge } from './offer-status-badge'
import { ConfirmHireDialog } from './confirm-hire-dialog'

interface OfferCardProps {
    offer: HROfferDto
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount)
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

function formatShortDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
    })
}

export const OfferCard = memo(function OfferCard({ offer }: OfferCardProps) {
    const initials = getInitials(offer.position)
    const isExpired = new Date(offer.expirationDate) < new Date()
    const [hireOpen, setHireOpen] = useState(false)

    return (
        <>
            <div className="bg-white rounded-xl p-4 lg:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Candidate / Position Info */}
                    <div className="col-span-1 lg:col-span-4 flex items-center gap-4">
                        <div className="size-12 rounded-full bg-[#BBE1FA]/40 text-[#0F4C75] flex items-center justify-center font-bold text-lg shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-slate-900 font-bold truncate">
                                    {offer.position}
                                </h3>
                                {offer.offerCode && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                                        {offer.offerCode}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs font-semibold text-[#0F4C75]">
                                    {offer.departmentName}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Salary */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col items-start lg:items-center">
                        <span className="lg:hidden text-[10px] font-bold text-slate-400 uppercase">
                            Lương
                        </span>
                        <div className="text-sm font-bold text-slate-900">
                            {formatCurrency(offer.salary)} VND
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">
                            {offer.salaryFrequency === 'Monthly'
                                ? 'Hàng tháng'
                                : 'Hàng năm'}{' '}
                            (Gross)
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col items-start lg:items-center">
                        <span className="lg:hidden text-[10px] font-bold text-slate-400 uppercase">
                            Ngày bắt đầu
                        </span>
                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(offer.startDate)}
                        </div>
                        <div
                            className={`text-[10px] font-medium mt-0.5 ${isExpired ? 'text-red-500' : 'text-slate-400'
                                }`}
                        >
                            Hết hạn: {formatShortDate(offer.expirationDate)}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col items-start lg:items-center">
                        <span className="lg:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Trạng thái
                        </span>
                        {offer.applicationStage === 'Hired' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                                <span className="size-1.5 rounded-full bg-teal-500 mr-2" />
                                Đã tuyển
                            </span>
                        ) : (
                            <OfferStatusBadge status={offer.status} />
                        )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 lg:col-span-2 flex justify-end gap-2">
                        {offer.status === 'Accepted' && offer.applicationStage !== 'Hired' && (
                            <button
                                onClick={() => setHireOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors border border-emerald-200"
                                title="Xác nhận tuyển dụng"
                            >
                                <UserCheck className="w-4 h-4" />
                                Xác nhận tuyển
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmHireDialog
                open={hireOpen}
                onOpenChange={setHireOpen}
                applicationId={offer.applicationId}
                candidateName={offer.position}
                position={offer.position}
            />
        </>
    )
})
