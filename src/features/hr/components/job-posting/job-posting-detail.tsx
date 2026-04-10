'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit2, CheckCircle, XCircle, Users, Clock, DollarSign, Briefcase, MapPin, GraduationCap, Globe, UserCheck, CalendarDays, Link2, Share2, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

import { useJobPosting, usePublishJobPosting, useCloseJobPosting } from '../../hooks/use-job-postings'
import { StatusBadge } from './status-badge'
import { AddExternalCvDialog } from '../application/add-external-cv-dialog'
import type { JobStatus } from '../../types/job-posting-types'

const HISTORY_LIMIT = 20

export function JobPostingDetail({ postingId }: { postingId: string }) {
    const router = useRouter()
    const { toast } = useToast()
    const [showAllHistory, setShowAllHistory] = useState(false)

    const { data: detail, isLoading, error, mutate } = useJobPosting(postingId)
    const { trigger: publishJob, isMutating: isPublishing } = usePublishJobPosting()
    const { trigger: closeJob, isMutating: isClosing } = useCloseJobPosting()

    const handlePublish = async () => {
        try {
            await publishJob(postingId)
            toast({ title: 'Đăng tuyển thành công', variant: 'default' })
            mutate()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
            toast({ title: 'Lỗi đăng tuyển', description: message, variant: 'destructive' })
        }
    }

    const handleClose = async () => {
        try {
            await closeJob(postingId)
            toast({ title: 'Đóng tuyển dụng thành công', variant: 'default' })
            mutate()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
            toast({ title: 'Lỗi đóng tuyển dụng', description: message, variant: 'destructive' })
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (error || !detail) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <div className="p-8 text-center bg-red-50 text-red-500 rounded-lg">
                    <p>Không thể tải dữ liệu. Vui lòng thử lại.</p>
                    <Button variant="outline" className="mt-4" onClick={() => mutate()}>Thử lại</Button>
                </div>
            </div>
        )
    }

    const historyList = showAllHistory
        ? (detail.history ?? [])
        : (detail.history ?? []).slice(0, HISTORY_LIMIT)
    const hiddenHistoryCount = (detail.history?.length ?? 0) - HISTORY_LIMIT

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1 shrink-0">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#212f3f]">{detail.jobTitle}</h1>
                                <StatusBadge status={detail.status} />
                            </div>
                            <p className="text-sm text-[#6f7882] flex flex-wrap items-center gap-2">
                                <span className="font-medium text-[#212f3f]">#{detail.jobCode}</span>
                                <span>•</span>
                                <span>{detail.departmentName}</span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Tạo {detail.createdAt ? format(new Date(detail.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : '—'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {detail.status === 'Draft' && (
                            <>
                                <Button variant="outline" onClick={() => router.push(`/enterprise/hr/job-postings/${detail.id}/edit`)}>
                                    <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
                                </Button>
                                <Button onClick={handlePublish} disabled={isPublishing} className="bg-[#1B5583] hover:bg-[#154360] text-white shadow-none">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {isPublishing ? 'Đang đăng...' : 'Đăng tuyển'}
                                </Button>
                            </>
                        )}
                        {detail.status === 'Published' && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const url = `${window.location.origin}/jobs/${detail.id}`
                                        navigator.clipboard.writeText(url)
                                        toast({ title: 'Đã sao chép liên kết' })
                                    }}
                                >
                                    <Link2 className="w-4 h-4 mr-2" /> Copy Link
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const url = encodeURIComponent(`${window.location.origin}/jobs/${detail.id}`)
                                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400')
                                    }}
                                >
                                    <Share2 className="w-4 h-4 mr-2" /> Facebook
                                </Button>
                                <Button variant="outline" onClick={() => router.push(`/enterprise/hr/job-postings/${detail.id}/edit`)}>
                                    <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
                                </Button>
                                <Button variant="destructive" onClick={handleClose} disabled={isClosing}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {isClosing ? 'Đang đóng...' : 'Đóng tuyển'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Highlight boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <HighlightBox
                        icon={<DollarSign className="w-6 h-6" />}
                        label="Mức lương"
                        value={detail.showSalary
                            ? ((detail.salaryRangeMin || 0) > 0 || (detail.salaryRangeMax || 0) > 0
                                ? `${((detail.salaryRangeMin || 0) / 1000000).toLocaleString('vi-VN')} - ${((detail.salaryRangeMax || 0) / 1000000).toLocaleString('vi-VN')} triệu`
                                : 'Thỏa thuận')
                            : 'Bảo mật'}
                        accentColor="#1B5583"
                    />
                    <HighlightBox
                        icon={<MapPin className="w-6 h-6" />}
                        label="Địa điểm"
                        value={detail.location || '—'}
                        accentColor="#1B5583"
                    />
                    <HighlightBox
                        icon={<Briefcase className="w-6 h-6" />}
                        label="Kinh nghiệm"
                        value={detail.experienceLevel || 'Không yêu cầu'}
                        accentColor="#1B5583"
                    />
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6 bg-white border border-slate-200 p-1 rounded-lg flex w-fit max-w-full overflow-x-auto">
                    <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-[#1B5583] data-[state=active]:text-white data-[state=active]:shadow-sm">Tổng quan</TabsTrigger>
                    <TabsTrigger value="pipeline" className="rounded-md data-[state=active]:bg-[#1B5583] data-[state=active]:text-white data-[state=active]:shadow-sm">Ứng viên</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-md data-[state=active]:bg-[#1B5583] data-[state=active]:text-white data-[state=active]:shadow-sm">Lịch sử</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-lg border border-[#e8e8e8] p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-[#212f3f] mb-5 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[#1b5583] rounded-full" />
                                    Chi tiết công việc
                                </h3>
                                <div className="space-y-6">
                                    <DescriptionSection title="Mô tả công việc" content={detail.description || '—'} />
                                    {detail.requirements && <DescriptionSection title="Yêu cầu ứng viên" content={detail.requirements} />}
                                    {detail.benefits && <DescriptionSection title="Quyền lợi" content={detail.benefits} />}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-[#e8e8e8] p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-[#212f3f] mb-5 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[#1b5583] rounded-full" />
                                    Thông tin thêm
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                                    <GeneralInfoItem icon={<UserCheck className="w-5 h-5" />} label="Cấp bậc" value={detail.experienceLevel || "—"} />
                                    <GeneralInfoItem icon={<GraduationCap className="w-5 h-5" />} label="Học vấn" value={detail.educationLevel || "—"} />
                                    <GeneralInfoItem icon={<Briefcase className="w-5 h-5" />} label="Hình thức" value={detail.employmentType || "—"} />
                                    <GeneralInfoItem icon={<Globe className="w-5 h-5" />} label="Làm việc" value={detail.remoteOption || "—"} />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-lg border border-[#e8e8e8] p-5 shadow-sm">
                                <h4 className="font-bold text-sm text-[#212f3f] mb-4">Thông tin chung</h4>
                                <div className="space-y-3.5">
                                    <SidebarInfoRow
                                        icon={<DollarSign className="w-[18px] h-[18px]" />}
                                        label="Mức lương"
                                        value={detail.showSalary
                                            ? ((detail.salaryRangeMin || 0) > 0 || (detail.salaryRangeMax || 0) > 0
                                                ? `${((detail.salaryRangeMin || 0) / 1000000).toLocaleString('vi-VN')} - ${((detail.salaryRangeMax || 0) / 1000000).toLocaleString('vi-VN')} triệu`
                                                : 'Thỏa thuận')
                                            : 'Bảo mật'
                                        }
                                        highlight
                                    />
                                    <SidebarInfoRow
                                        icon={<Briefcase className="w-[18px] h-[18px]" />}
                                        label="Kinh nghiệm"
                                        value={detail.experienceLevel || '—'}
                                    />
                                    <SidebarInfoRow
                                        icon={<Users className="w-[18px] h-[18px]" />}
                                        label="Số lượng"
                                        value={`${detail.quantity || 1} người`}
                                    />
                                    <SidebarInfoRow
                                        icon={<MapPin className="w-[18px] h-[18px]" />}
                                        label="Địa điểm"
                                        value={detail.location || '—'}
                                    />
                                    <SidebarInfoRow
                                        icon={<CalendarDays className="w-[18px] h-[18px]" />}
                                        label="Hạn nộp"
                                        value={detail.applicationDeadline ? format(new Date(detail.applicationDeadline), 'dd/MM/yyyy') : '—'}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-[#e8e8e8] p-5 shadow-sm">
                                <h4 className="font-bold text-sm text-[#212f3f] mb-4">Liên kết quản lý</h4>
                                <div className="space-y-3.5">
                                    {detail.planName && (
                                        <SidebarInfoRow
                                            icon={<Briefcase className="w-[18px] h-[18px]" />}
                                            label="Kế hoạch"
                                            value={detail.planName}
                                        />
                                    )}
                                    {(detail.quotaUsed !== undefined || detail.quotaTotal !== undefined) && (
                                        <SidebarInfoRow
                                            icon={<Users className="w-[18px] h-[18px]" />}
                                            label="Chỉ tiêu"
                                            value={`${detail.quotaUsed ?? 0}/${detail.quotaTotal ?? '?'} người`}
                                        />
                                    )}
                                    {detail.createdByName && (
                                        <SidebarInfoRow
                                            icon={<UserCheck className="w-[18px] h-[18px]" />}
                                            label="Người tạo"
                                            value={detail.createdByName}
                                        />
                                    )}
                                    {detail.publishedByName && (
                                        <SidebarInfoRow
                                            icon={<UserCheck className="w-[18px] h-[18px]" />}
                                            label="Người đăng"
                                            value={detail.publishedByName}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="pipeline">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Tiến trình ứng viên ({detail.totalApplications ?? detail.applicationCount ?? 0})</h3>
                            <div className="flex items-center gap-2">
                                {detail.status === 'Published' && (
                                    <AddExternalCvDialog
                                        jobPostingId={detail.id}
                                        onSuccess={() => mutate()}
                                        trigger={
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <UserPlus className="w-4 h-4" />
                                                Thêm CV
                                            </Button>
                                        }
                                    />
                                )}
                                <Button variant="outline" onClick={() => router.push(`/enterprise/hr/job-postings/${detail.id}/applications`)}>
                                    <Users className="w-4 h-4 mr-2" /> Xem danh sách ứng viên
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                                { label: 'Ứng tuyển', count: detail.appliedCount ?? 0, color: 'bg-slate-100 text-slate-700' },
                                { label: 'Đang xem xét', count: detail.reviewingCount ?? 0, color: 'bg-blue-100 text-blue-700' },
                                { label: 'Shortlist', count: detail.shortlistedCount ?? 0, color: 'bg-indigo-100 text-indigo-700' },
                                { label: 'Xếp lịch PV', count: detail.interviewScheduledCount ?? 0, color: 'bg-purple-100 text-purple-700' },
                                { label: 'Đã PV', count: detail.interviewedCount ?? 0, color: 'bg-fuchsia-100 text-fuchsia-700' },
                                { label: 'Xử lý Offer', count: detail.offerProcessingCount ?? 0, color: 'bg-amber-100 text-amber-700' },
                                { label: 'Đã gửi Offer', count: detail.offeredCount ?? 0, color: 'bg-orange-100 text-orange-700' },
                                { label: 'Đã tuyển', count: detail.hiredCount ?? 0, color: 'bg-green-100 text-green-700' },
                                { label: 'Từ chối', count: detail.rejectedCount ?? 0, color: 'bg-red-100 text-red-700' },
                                { label: 'Rút lui', count: detail.withdrawnCount ?? 0, color: 'bg-gray-200 text-gray-700' },
                            ].map((stage, i) => (
                                <div key={i} className="p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors bg-slate-50 flex flex-col items-center text-center">
                                    <span className="text-sm font-medium text-slate-500 mb-2">{stage.label}</span>
                                    <span className={`text-2xl font-bold px-3 py-1 rounded-full ${stage.color}`}>{stage.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Lịch sử thay đổi</h3>
                        {historyList.length > 0 ? (
                            <>
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {historyList.map((entry, index) => (
                                        <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                <span className="text-xs font-semibold">{index + 1}</span>
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="font-bold text-slate-900">{entry.action}</div>
                                                    <time className="text-xs font-medium text-slate-500">{format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')}</time>
                                                </div>
                                                <div className="text-sm text-slate-500 mb-2">
                                                    Thực hiện bởi: <span className="font-medium text-slate-700">{entry.performedByName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    {entry.previousStatus && <StatusBadge status={entry.previousStatus as JobStatus} />}
                                                    {entry.previousStatus && <span>→</span>}
                                                    <StatusBadge status={entry.newStatus as JobStatus} />
                                                </div>
                                                {entry.note && (
                                                    <p className="text-sm mt-3 text-slate-600 bg-slate-50 p-2 rounded italic">
                                                        &quot;{entry.note}&quot;
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {!showAllHistory && hiddenHistoryCount > 0 && (
                                    <div className="mt-6 text-center">
                                        <Button variant="outline" onClick={() => setShowAllHistory(true)}>
                                            Xem thêm {hiddenHistoryCount} mục
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-slate-500 py-8">
                                Chưa có lịch sử thay đổi.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

/* =========================================
   Helper Components - TopCV Style
   ========================================= */

function HighlightBox({ icon, label, value, accentColor }: {
    icon: React.ReactNode
    label: string
    value: string
    accentColor: string
}) {
    return (
        <div className="flex items-center gap-3 bg-[#f4f5f5] rounded-lg px-4 py-3">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
            >
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#a6acb2] leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-[#212f3f] truncate">{value}</p>
            </div>
        </div>
    )
}

function DescriptionSection({ title, content }: { title: string; content: string }) {
    return (
        <div>
            <h3
                className="text-[15px] font-bold text-[#212f3f] mb-3 pl-3 relative"
                style={{ borderLeft: '3px solid #1B5583' }}
            >
                {title}
            </h3>
            <div className="text-sm text-[#4a4a4a] leading-[1.8] whitespace-pre-line">
                {content}
            </div>
        </div>
    )
}

function GeneralInfoItem({ icon, label, value }: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#B5D5F5]/20 text-[#1B5583] flex items-center justify-center flex-shrink-0 mt-0.5">
                {icon}
            </div>
            <div>
                <p className="text-xs text-[#a6acb2] mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-[#212f3f]">{value}</p>
            </div>
        </div>
    )
}

function SidebarInfoRow({ icon, label, value, highlight = false }: {
    icon: React.ReactNode
    label: string
    value: string
    highlight?: boolean
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f4f5f5] text-[#6f7882] flex items-center justify-center flex-shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#a6acb2] leading-none mb-1">{label}</p>
                <p className={`text-sm font-medium truncate ${highlight ? 'text-[#1B5583] font-bold' : 'text-[#212f3f]'}`}>
                    {value}
                </p>
            </div>
        </div>
    )
}
