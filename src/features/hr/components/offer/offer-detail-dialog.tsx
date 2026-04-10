'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { OfferStatusBadge } from './offer-status-badge'
import type { HROfferDto } from '../../types/offer-types'

interface OfferDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    offer: HROfferDto | null
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="text-sm text-slate-700">{value ?? <span className="text-slate-300 italic">—</span>}</span>
        </div>
    )
}

export function OfferDetailDialog({ open, onOpenChange, offer }: OfferDetailDialogProps) {
    if (!offer) return null

    const isExpired = new Date(offer.expirationDate) < new Date()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-[#0C4A6E] text-lg">Chi tiết Offer</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2">
                    <Row label="Vị trí" value={offer.position} />
                    <Row label="Phòng ban" value={offer.departmentName} />

                    {offer.offerCode && (
                        <Row
                            label="Mã Offer"
                            value={
                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                                    {offer.offerCode}
                                </span>
                            }
                        />
                    )}

                    <Row
                        label="Trạng thái"
                        value={
                            offer.applicationStage === 'Hired' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                                    <span className="size-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                                    Đã tuyển
                                </span>
                            ) : (
                                <OfferStatusBadge status={offer.status} />
                            )
                        }
                    />

                    <Row
                        label="Mức lương"
                        value={
                            <span className="text-[#0EA5E9] font-semibold">
                                {formatCurrency(offer.salary)} VND /{' '}
                                {offer.salaryFrequency === 'Monthly' ? 'Tháng' : 'Năm'}
                            </span>
                        }
                    />

                    {offer.bonus && <Row label="Thưởng" value={offer.bonus} />}
                    {offer.benefits && <Row label="Phúc lợi" value={offer.benefits} />}

                    <Row label="Ngày bắt đầu" value={formatDate(offer.startDate)} />
                    <Row
                        label="Hạn chấp nhận"
                        value={
                            <span className={isExpired ? 'text-red-500 font-medium' : undefined}>
                                {formatDate(offer.expirationDate)}
                                {isExpired && ' (Đã hết hạn)'}
                            </span>
                        }
                    />

                    {offer.sentAt && <Row label="Đã gửi lúc" value={formatDate(offer.sentAt)} />}
                    {offer.respondedAt && (
                        <Row label="Phản hồi lúc" value={formatDate(offer.respondedAt)} />
                    )}
                    {offer.candidateNote && (
                        <div className="col-span-2">
                            <Row label="Ghi chú ứng viên" value={offer.candidateNote} />
                        </div>
                    )}

                    {offer.offerLetterUrl && (
                        <div className="col-span-2">
                            <Row
                                label="Thư mời"
                                value={
                                    <a
                                        href={offer.offerLetterUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#0EA5E9] underline text-sm"
                                    >
                                        Xem thư mời
                                    </a>
                                }
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
