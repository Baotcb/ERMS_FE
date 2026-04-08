'use client'

import { memo } from 'react'
import type { OfferStatus } from '../../types/offer-types'

interface OfferStatusBadgeProps {
    status: OfferStatus
}

const STATUS_CONFIG: Record<OfferStatus, {
    label: string
    bg: string
    text: string
    dot: string
}> = {
    Draft: {
        label: 'Bản nháp',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        dot: 'bg-slate-400',
    },
    PendingApproval: {
        label: 'Đang chờ duyệt',
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
    },
    Approved: {
        label: 'Đã duyệt',
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        dot: 'bg-blue-500',
    },
    Sent: {
        label: 'Đã gửi',
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        dot: 'bg-indigo-500',
    },
    Accepted: {
        label: 'Đã chấp nhận',
        bg: 'bg-green-100',
        text: 'text-green-700',
        dot: 'bg-green-500',
    },
    Rejected: {
        label: 'Đã từ chối',
        bg: 'bg-red-100',
        text: 'text-red-700',
        dot: 'bg-red-500',
    },
    Expired: {
        label: 'Hết hạn',
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        dot: 'bg-gray-400',
    },
    Cancelled: {
        label: 'Đã hủy',
        bg: 'bg-red-100',
        text: 'text-red-800',
        dot: 'bg-red-500',
    },
}

export const OfferStatusBadge = memo(function OfferStatusBadge({
    status,
}: OfferStatusBadgeProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.Draft

    return (
        <span
            className={`inline-flex items-center justify-center min-w-[120px] px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}
        >
            <span className={`size-1.5 rounded-full ${config.dot} mr-2 flex-shrink-0`} />
            {config.label}
        </span>
    )
})
