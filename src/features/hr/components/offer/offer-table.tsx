'use client'

import { useState } from 'react'
import { UserCheck } from 'lucide-react'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import type { HROfferDto } from '../../types/offer-types'
import { OfferStatusBadge } from './offer-status-badge'
import { ConfirmHireDialog } from './confirm-hire-dialog'

interface OfferTableProps {
    data: HROfferDto[]
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

export function OfferTable({ data }: OfferTableProps) {
    const [hireDialog, setHireDialog] = useState<{ open: boolean; offer: HROfferDto | null }>({
        open: false,
        offer: null,
    })

    if (data.length === 0) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="p-4 rounded-full bg-sky-50 mb-4">
                    <UserCheck className="w-8 h-8 text-[#0EA5E9]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600">Chưa có offer nào</h3>
                <p className="text-slate-400 mt-2 max-w-sm">
                    Tạo offer mới cho ứng viên từ danh sách đơn ứng tuyển.
                </p>
            </div>
        )
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Vị trí & Phòng ban
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                            Lương
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Ngày bắt đầu
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Hết hạn
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                            Trạng thái
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                            Hành động
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                    {data.map((offer) => {
                        const isExpired = new Date(offer.expirationDate) < new Date()

                        return (
                            <TableRow key={offer.id} className="hover:bg-sky-50/30 transition-colors group">
                                {/* Position & Department */}
                                <TableCell className="px-6 py-4 align-middle">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[#0C4A6E] text-sm">
                                                {offer.position}
                                            </span>
                                            {offer.offerCode && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                                                    {offer.offerCode}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-400 mt-0.5">
                                            {offer.departmentName}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Salary */}
                                <TableCell className="px-6 py-4 align-middle text-right whitespace-nowrap">
                                    <div>
                                        <span className="text-[#0EA5E9] font-semibold text-sm">
                                            {formatCurrency(offer.salary)} VND
                                        </span>
                                        <div className="text-[10px] text-slate-400 uppercase mt-0.5">
                                            {offer.salaryFrequency === 'Monthly' ? 'Hàng tháng' : 'Hàng năm'} (Gross)
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Start Date */}
                                <TableCell className="px-6 py-4 align-middle text-sm text-slate-600 whitespace-nowrap">
                                    {formatDate(offer.startDate)}
                                </TableCell>

                                {/* Expiration Date */}
                                <TableCell className="px-6 py-4 align-middle whitespace-nowrap">
                                    <span className={`text-sm ${isExpired ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                                        {formatDate(offer.expirationDate)}
                                    </span>
                                </TableCell>

                                {/* Status */}
                                <TableCell className="px-6 py-4 align-middle text-center">
                                    {offer.applicationStage === 'Hired' ? (
                                        <span className="inline-flex items-center justify-center min-w-[120px] px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                                            <span className="size-1.5 rounded-full bg-teal-500 mr-2 flex-shrink-0" />
                                            Đã tuyển
                                        </span>
                                    ) : (
                                        <OfferStatusBadge status={offer.status} />
                                    )}
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="px-6 py-4 align-middle text-right">
                                    {offer.status === 'Accepted' && offer.applicationStage !== 'Hired' && (
                                        <button
                                            onClick={() => setHireDialog({ open: true, offer })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors border border-emerald-200 ml-auto"
                                            title="Xác nhận tuyển dụng"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            Xác nhận tuyển
                                        </button>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            {hireDialog.offer && (
                <ConfirmHireDialog
                    open={hireDialog.open}
                    onOpenChange={(open) => setHireDialog((prev) => ({ ...prev, open }))}
                    applicationId={hireDialog.offer.applicationId}
                    candidateName={hireDialog.offer.position}
                    position={hireDialog.offer.position}
                />
            )}
        </>
    )
}
