'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Download,
    FileText,
    Loader2,
    Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { OfferStatusBadge } from '@/features/hr/components/offer/offer-status-badge'
import { getCompanyProfileHref } from '@/features/jobs/utils/company-detail'
import { useMyOfferById, useAcceptOffer, useRejectOffer } from '../hooks/use-offers'

interface CandidateOfferDetailProps {
    offerId: string
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

export function CandidateOfferDetail({ offerId }: CandidateOfferDetailProps) {
    const router = useRouter()
    const { data: offer, isLoading } = useMyOfferById(offerId)
    const { trigger: accept, isMutating: isAccepting } = useAcceptOffer()
    const { trigger: reject, isMutating: isRejecting } = useRejectOffer()

    const [showRejectForm, setShowRejectForm] = useState(false)
    const [rejectNote, setRejectNote] = useState('')
    const [hasSubmitted, setHasSubmitted] = useState(false)

    // Tính countdown
    const countdown = useMemo(() => {
        if (!offer) return null
        const now = new Date()
        const exp = new Date(offer.expirationDate)
        const diff = exp.getTime() - now.getTime()
        if (diff <= 0) return { expired: true, text: 'Đã hết hạn' }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        return { expired: false, text: `Còn ${days} ngày ${hours} giờ` }
    }, [offer])

    const handleAccept = useCallback(async () => {
        try {
            await accept({ offerId })
            router.push('/offers')
        } catch {
            // Error handled by SWR
        }
    }, [accept, offerId, router])

    const handleReject = useCallback(async () => {
        setHasSubmitted(true)
        if (!rejectNote.trim()) return
        try {
            await reject({ offerId, candidateNote: rejectNote.trim() })
            router.push('/offers')
        } catch {
            // Error handled by SWR
        }
    }, [reject, offerId, rejectNote, router])

    const canRespond = offer?.status === 'Sent' && !countdown?.expired

    if (isLoading) {
        return (
            <div className="max-w-[960px] mx-auto space-y-6">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-80 rounded-xl" />
            </div>
        )
    }

    if (!offer) {
        return (
            <div className="max-w-[960px] mx-auto text-center py-16 text-slate-400">
                <p className="text-lg font-semibold">
                    Không tìm thấy đề nghị công việc
                </p>
                <Button
                    variant="ghost"
                    className="mt-4"
                    onClick={() => router.push('/offers')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách
                </Button>
            </div>
        )
    }

    const frequencyLabel =
        offer.salaryFrequency === 'Monthly' ? 'tháng' : 'năm'

    // Parse benefits thành mảng tags
    const benefitTags = offer.benefits
        ? offer.benefits.split(',').map((b) => b.trim()).filter(Boolean)
        : []

    // Parse bonus thành danh sách
    const bonusItems = offer.bonus
        ? offer.bonus.split(',').map((b) => b.trim()).filter(Boolean)
        : []
    const companyHref = getCompanyProfileHref({
        id: offer.enterpriseId,
        enterpriseName: offer.enterpriseName,
    })

    return (
        <div className="max-w-[960px] mx-auto flex flex-col gap-6">
            {/* Banner */}
            {offer.status === 'Cancelled' ? (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-400 p-8 text-white shadow-lg">
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                'radial-gradient(#ffffff 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />
                    <div className="relative z-10 flex flex-col items-center text-center gap-3">
                        <div className="size-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-2 shadow-inner border border-white/20">
                            <span className="text-4xl">❌</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                            Đề nghị công việc đã bị hủy
                        </h1>
                        <p className="text-red-50 text-base md:text-lg max-w-2xl">
                            Offer này đã bị hủy bởi nhà tuyển dụng. Vui lòng kiểm tra email của bạn để biết thêm chi tiết.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0F4C75] to-[#3282B8] p-8 text-white shadow-lg">
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                'radial-gradient(#ffffff 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />
                    <div className="relative z-10 flex flex-col items-center text-center gap-3">
                        <div className="size-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-2 shadow-inner border border-white/20">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                            Chúc mừng! Bạn đã nhận được đề nghị công việc
                        </h1>
                        <p className="text-blue-100 text-base md:text-lg max-w-2xl">
                            Chúng tôi rất ấn tượng với kỹ năng và kinh nghiệm của
                            bạn. Dưới đây là chi tiết lời mời gia nhập đội ngũ của
                            chúng tôi.
                        </p>
                    </div>
                </div>
            )}

            {/* Timer Alert */}
            {offer.status !== 'Cancelled' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start sm:items-center gap-3 shadow-sm">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                        <div>
                            <h3 className="text-sm font-bold text-amber-800">
                                Thời hạn phản hồi
                            </h3>
                            <p className="text-sm text-amber-700">
                                Vui lòng phản hồi trước{' '}
                                <span className="font-bold">
                                    23:59 ngày {formatDate(offer.expirationDate)}
                                </span>
                            </p>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-md border border-amber-100 shadow-sm">
                            <span
                                className={`text-sm font-mono font-medium ${countdown?.expired
                                        ? 'text-red-600'
                                        : 'text-amber-700'
                                    }`}
                            >
                                {countdown?.text}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                    <div className="size-16 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0 shadow-sm">
                        {offer.enterpriseLogoUrl ? (
                            <div className="relative h-full w-full">
                                <Image
                                    src={offer.enterpriseLogoUrl}
                                    alt={offer.enterpriseName}
                                    fill
                                    sizes="64px"
                                    className="object-contain p-2"
                                />
                            </div>
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
                                <Building2 className="w-7 h-7" />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-500">
                            Doanh nghiệp tuyển dụng
                        </p>
                        <Link
                            href={companyHref}
                            className="mt-1 block text-lg font-bold text-slate-900 break-words transition-colors hover:text-[#0F4C75]"
                        >
                            {offer.enterpriseName}
                        </Link>
                        <p className="mt-1 text-sm text-slate-500 break-words">
                            {offer.departmentName}
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full sm:w-auto border-[#0F4C75] text-[#0F4C75] hover:bg-[#0F4C75] hover:text-white"
                        asChild
                    >
                        <Link href={companyHref}>Xem trang công ty</Link>
                    </Button>
                </div>
            </div>

            {/* Offer Details Card */}
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
                {/* Card Header */}
                <div className="border-b border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-[#0F4C75]/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[#0F4C75]" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">
                                Mã Offer
                            </p>
                            <code className="text-slate-900 font-mono font-bold text-base bg-slate-100 px-2 py-0.5 rounded">
                                {offer.offerCode || 'N/A'}
                            </code>
                        </div>
                    </div>
                    <OfferStatusBadge status={offer.status} />
                </div>

                {/* Card Body — 2 column grid */}
                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Column 1: Thông tin vị trí */}
                        <div className="space-y-5 min-w-0">
                            <h3 className="text-slate-900 text-lg font-bold flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                                Thông tin vị trí
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">
                                    Vị trí công việc
                                </p>
                                <p className="text-slate-900 font-semibold text-lg break-words">
                                    {offer.position}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">
                                    Phòng ban
                                </p>
                                <p className="text-slate-900 font-medium break-words">
                                    {offer.departmentName}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">
                                    Ngày bắt đầu dự kiến
                                </p>
                                <div className="flex items-center gap-2 text-slate-900 font-medium">
                                    <Calendar className="w-4 h-4 text-[#0F4C75]" />
                                    {formatDate(offer.startDate)}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Chế độ đãi ngộ */}
                        <div className="space-y-5 min-w-0">
                            <h3 className="text-slate-900 text-lg font-bold flex items-center gap-2 pb-2 border-b border-slate-100">
                                <span className="text-slate-400 text-xl">💰</span>
                                Chế độ đãi ngộ
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">
                                    Mức lương cơ bản (Gross)
                                </p>
                                <p className="text-[#0F4C75] font-bold text-2xl tracking-tight">
                                    {formatCurrency(offer.salary)} VNĐ{' '}
                                    <span className="text-sm font-normal text-slate-500 align-middle">
                                        / {frequencyLabel}
                                    </span>
                                </p>
                            </div>

                            {bonusItems.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500">
                                        Thưởng & Hoa hồng
                                    </p>
                                    <ul className="list-disc list-inside text-slate-900 font-medium text-sm space-y-1">
                                        {bonusItems.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {benefitTags.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500">
                                        Phúc lợi nổi bật
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {benefitTags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Attachment */}
                {offer.offerLetterUrl && (
                    <div className="px-6 md:px-8 py-6 bg-slate-50 border-t border-slate-100">
                        <p className="text-sm font-semibold text-slate-700 mb-3">
                            Tài liệu đính kèm
                        </p>
                        <a
                            href={offer.offerLetterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-[#0F4C75]/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="size-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-slate-900 truncate group-hover:text-[#0F4C75] transition-colors">
                                        Offer_Letter.pdf
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Tải xuống để xem
                                    </span>
                                </div>
                            </div>
                            <div className="p-2 text-slate-400 hover:text-[#0F4C75] rounded-full transition-all">
                                <Download className="w-5 h-5" />
                            </div>
                        </a>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {canRespond && (
                <div className="flex flex-col items-center gap-4 py-6">
                    {!showRejectForm ? (
                        <>
                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                <Button
                                    onClick={handleAccept}
                                    disabled={isAccepting || isRejecting}
                                    className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md text-base active:scale-[0.98] transition-all"
                                >
                                    {isAccepting ? (
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                    )}
                                    Chấp nhận Offer
                                </Button>
                                <Button
                                    onClick={() => setShowRejectForm(true)}
                                    disabled={isAccepting || isRejecting}
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold text-base active:scale-[0.98] transition-all"
                                >
                                    <XCircle className="w-5 h-5 mr-2" />
                                    Từ chối Offer
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500 text-center max-w-lg px-4">
                                Bằng việc nhấn &quot;Chấp nhận Offer&quot;, bạn
                                đồng ý với các điều khoản và điều kiện được nêu
                                trong Thư mời làm việc đính kèm.
                            </p>
                        </>
                    ) : (
                        <div className="w-full max-w-md space-y-4">
                            <p className="text-sm font-semibold text-slate-700">
                                Lý do từ chối <span className="text-red-500">*</span>
                            </p>
                            <div>
                                <Textarea
                                    placeholder="Nhập lý do từ chối..."
                                    rows={3}
                                    value={rejectNote}
                                    onChange={(e) => setRejectNote(e.target.value)}
                                />
                                {hasSubmitted && !rejectNote.trim() && (
                                    <p className="text-xs text-red-500 mt-1">Vui lòng nhập lý do từ chối.</p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => { setShowRejectForm(false); setRejectNote(''); setHasSubmitted(false) }}
                                    disabled={isRejecting}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleReject}
                                    disabled={isRejecting || !rejectNote.trim()}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                                >
                                    {isRejecting ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <XCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Xác nhận từ chối
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Back button */}
            <div className="pt-2 pb-8">
                <Button
                    variant="ghost"
                    className="text-slate-500 hover:text-[#0F4C75]"
                    onClick={() => router.push('/offers')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách đề nghị
                </Button>
            </div>
        </div>
    )
}
