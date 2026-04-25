'use client'

import { useState, useEffect, useMemo } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import {
    Plus, Send, MoreVertical, Eye, Pencil, Trash2,
    FolderOpen, Clock, CheckCircle2, Banknote, Users, ListFilter
} from 'lucide-react'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api-client'
import { CreatePlanForm } from '@/features/dept-head/components/recruitment/create-plan-form'
import type { RecruitmentPlan, PlanListResponse } from '@/features/dept-head/types/recruitment-plan-types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

/* ─── Status Config ──────────────────────────────────── */

const STATUS_CONFIG: Record<string, {
    label: string
    dotClass: string
    bgClass: string
    textClass: string
    ringClass: string
}> = {
    Draft: {
        label: 'Nháp',
        dotClass: 'bg-gray-500',
        bgClass: 'bg-gray-100',
        textClass: 'text-gray-600',
        ringClass: '',
    },
    Pending: {
        label: 'Chờ duyệt',
        dotClass: 'bg-yellow-500',
        bgClass: 'bg-yellow-50',
        textClass: 'text-yellow-700',
        ringClass: 'ring-1 ring-inset ring-yellow-600/20',
    },
    Approved: {
        label: 'Đã duyệt',
        dotClass: 'bg-green-500',
        bgClass: 'bg-green-50',
        textClass: 'text-green-700',
        ringClass: 'ring-1 ring-inset ring-green-600/20',
    },
    Rejected: {
        label: 'Từ chối',
        dotClass: 'bg-red-500',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        ringClass: 'ring-1 ring-inset ring-red-600/10',
    },
}

type StatusFilter = 'all' | 'Draft' | 'Pending' | 'Approved' | 'Rejected'

const FILTER_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Draft', label: 'Nháp' },
    { value: 'Pending', label: 'Chờ duyệt' },
    { value: 'Approved', label: 'Đã duyệt' },
    { value: 'Rejected', label: 'Từ chối' },
]

/* ─── Format VND ─────────────────────────────────────── */

function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount)
}

function formatBudgetShort(amount: number): string {
    if (amount >= 1_000_000_000) {
        const val = amount / 1_000_000_000
        return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} Tỷ`
    }
    if (amount >= 1_000_000) {
        const val = amount / 1_000_000
        return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} Tr`
    }
    return formatVND(amount)
}

/* ─── Helpers ────────────────────────────────────────── */

/** Only Draft / Rejected plans can be submitted */
function canSubmitPlan(status: string): boolean {
    return status === 'Draft' || status === 'Rejected'
}

/* ─── Component ──────────────────────────────────────── */

/**
 * CampaignPlanWrapper
 *
 * Shows list of recruitment plans belonging to a specific campaign.
 * - Stat cards (total, pending, approved, budget)
 * - Filter tabs by status
 * - Card-row list with checkbox (only Draft/Rejected)
 * - Floating bulk action bar
 * - Create / Edit plan dialog
 */
export default function CampaignPlanWrapper({ campaignId }: { campaignId: string }) {
    const { toast } = useToast()
    const { mutate: globalMutate } = useSWRConfig()
    const [plans, setPlans] = useState<RecruitmentPlan[]>([])
    const [dialog, setDialog] = useState<{ open: boolean; editingPlanId: string | null }>({ open: false, editingPlanId: null })
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isSubmittingBulk, setIsSubmittingBulk] = useState(false)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

    // Fetch plans list
    const { data: listData, mutate: mutateList, isLoading } = useSWR<PlanListResponse>(
        '/api/RecruitmentPlans?Page=1&PageSize=100',
        () => apiClient.get('/api/RecruitmentPlans?Page=1&PageSize=100').then(res => res.json())
    )

    useEffect(() => {
        if (listData?.items) {
            const campaignPlans = listData.items.filter((p: RecruitmentPlan) => p.campaignId === campaignId)
            setPlans(campaignPlans)
        }
    }, [listData, campaignId])

    // Filter by status tab
    const filteredPlans = useMemo(() => {
        if (statusFilter === 'all') return plans
        return plans.filter(p => p.status === statusFilter)
    }, [plans, statusFilter])

    // Stats (based on all plans of this campaign, not filtered)
    const stats = useMemo(() => {
        const total = plans.length
        const pending = plans.filter(p => p.status === 'Pending').length
        const approved = plans.filter(p => p.status === 'Approved').length
        const totalBudget = plans.reduce((sum, p) => sum + p.totalBudget, 0)
        return { total, pending, approved, totalBudget }
    }, [plans])

    // Dialog handlers
    const handleOpenChange = (open: boolean) => {
        setDialog(prev => ({ ...prev, open }))
        if (!open) {
            setDialog(prev => ({ ...prev, editingPlanId: null }))
            globalMutate(
                (key: string) => typeof key === 'string' && key.startsWith('/api/plan-details'),
                undefined,
                { revalidate: true }
            )
        }
    }

    const handleEditPlan = (planId: string) => {
        setDialog({ open: true, editingPlanId: planId })
    }

    // Selection
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const clearSelection = () => setSelectedIds(new Set())

    // Submit single plan
    const handleSubmitPlan = async (planId: string, name: string, status: string) => {
        if (!canSubmitPlan(status)) return

        const isResubmit = status === 'Rejected'
        const confirmMsg = isResubmit
            ? `Bạn có chắc chắn muốn gửi lại kế hoạch "${name}" đi phê duyệt?`
            : `Bạn có chắc chắn muốn gửi kế hoạch "${name}" đi phê duyệt? Bạn sẽ không thể chỉnh sửa sau khi gửi.`

        if (!confirm(confirmMsg)) return

        try {
            const endpoint = isResubmit
                ? '/api/RecruitmentPlans/resubmit'
                : '/api/RecruitmentPlans/submit'
            const res = await apiClient.patch(endpoint, { planId })
            if (res.ok) {
                toast({
                    title: isResubmit ? 'Đã gửi lại phê duyệt' : 'Đã gửi phê duyệt',
                    description: `Kế hoạch "${name}" đã được gửi tới Giám đốc.`,
                })
                mutateList()
            } else {
                const err = await res.json()
                throw new Error(err.message || 'Lỗi khi gửi kế hoạch')
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi gửi kế hoạch'
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: errorMessage,
            })
        }
    }

    // Delete a plan
    const handleDeletePlan = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bản nháp này?')) return

        try {
            const res = await apiClient.delete('/api/RecruitmentPlans', { id })
            if (res.ok) {
                toast({
                    title: 'Đã xóa',
                    description: 'Kế hoạch đã được xóa thành công.',
                })
                mutateList()
            }
        } catch (error) {
            console.error(error)
        }
    }

    // Bulk submit — only submits Draft/Rejected plans
    const handleBulkSubmit = async () => {
        if (selectedIds.size === 0) return
        setIsSubmittingBulk(true)

        // Only submit plans that are Draft or Rejected
        const submittableIds = Array.from(selectedIds).filter(id => {
            const plan = plans.find(p => p.id === id)
            return plan && canSubmitPlan(plan.status)
        })

        if (submittableIds.length === 0) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không có kế hoạch nào có thể gửi duyệt.' })
            setIsSubmittingBulk(false)
            return
        }

        const failedIds: string[] = []

        try {
            await Promise.all(submittableIds.map(async (id) => {
                try {
                    const plan = plans.find(p => p.id === id)
                    const endpoint = plan?.status === 'Rejected'
                        ? '/api/RecruitmentPlans/resubmit'
                        : '/api/RecruitmentPlans/submit'
                    const res = await apiClient.patch(endpoint, { planId: id })
                    if (!res.ok) failedIds.push(id)
                } catch {
                    failedIds.push(id)
                }
            }))

            if (failedIds.length === 0) {
                toast({
                    title: 'Đã gửi duyệt thành công',
                    description: `Đã gửi ${submittableIds.length} kế hoạch lên cấp trên.`,
                })
                clearSelection()
                mutateList()
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Gửi duyệt thất bại một phần',
                    description: `Gửi thành công ${submittableIds.length - failedIds.length}/${submittableIds.length} kế hoạch.`,
                })
                setSelectedIds(new Set(failedIds))
            }
        } catch {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Có lỗi xảy ra khi gửi duyệt' })
        } finally {
            setIsSubmittingBulk(false)
        }
    }

    // Bulk delete
    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return
        if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} kế hoạch đã chọn?`)) return

        const ids = Array.from(selectedIds)
        let successCount = 0
        for (const id of ids) {
            try {
                const res = await apiClient.delete('/api/RecruitmentPlans', { id })
                if (res.ok) successCount++
            } catch { /* skip */ }
        }
        if (successCount > 0) {
            toast({ title: 'Đã xóa', description: `Đã xóa ${successCount} kế hoạch.` })
            clearSelection()
            mutateList()
        }
    }

    return (
        <div className="space-y-6">
            {/* ─── Page Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Kế hoạch tuyển dụng</h1>
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-[#0F4C75]">
                        {stats.total}
                    </span>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 rounded-lg border-gray-300 text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        <ListFilter className="h-4 w-4" />
                        Lọc & Sắp xếp
                    </Button>
                    <Button
                        onClick={() => setDialog(prev => ({ ...prev, open: true }))}
                        className="gap-2 rounded-lg bg-[#22C55E] hover:bg-[#16a34a] text-white font-semibold shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm kế hoạch
                    </Button>
                </div>
            </div>

            {/* ─── Stats Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Tổng kế hoạch</p>
                        <FolderOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>

                {/* Pending */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Chờ duyệt</p>
                        <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pending}</p>
                    <div className="mt-2 text-xs text-gray-500">Cần xử lý ngay</div>
                </div>

                {/* Approved */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Đã duyệt</p>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.approved}</p>
                    <div className="mt-2 text-xs text-gray-500">Đang triển khai</div>
                </div>

                {/* Budget */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Ngân sách dự kiến</p>
                        <Banknote className="h-5 w-5 text-[#0F4C75]" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{formatBudgetShort(stats.totalBudget)}</p>
                    <div className="mt-2 text-xs text-gray-500">VND</div>
                </div>
            </div>

            {/* ─── Filter Tabs ─── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => { setStatusFilter(tab.value); clearSelection() }}
                        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${statusFilter === tab.value
                                ? 'bg-[#0F4C75] text-white shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── Column Headers ─── */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-4 pl-8">Tên kế hoạch</div>
                <div className="col-span-2">Mã KH</div>
                <div className="col-span-2">Trạng thái</div>
                <div className="col-span-2">Thời gian</div>
                <div className="col-span-2 text-right">Ngân sách</div>
            </div>

            {/* ─── Plan List ─── */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-[#0F4C75] rounded-full mb-3" />
                        <p className="text-sm">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center hover:bg-gray-100 transition-colors cursor-pointer group">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 group-hover:bg-[#0F4C75]/20 transition-colors">
                            <Plus className="h-6 w-6 text-gray-500 group-hover:text-[#0F4C75]" />
                        </div>
                        <h3 className="mt-3 text-sm font-semibold text-gray-900">Chưa có kế hoạch nào</h3>
                        <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo một kế hoạch tuyển dụng mới.</p>
                        <div className="mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDialog(prev => ({ ...prev, open: true }))}
                                className="group-hover:ring-[#0F4C75] group-hover:text-[#0F4C75] transition-all"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Tạo ngay
                            </Button>
                        </div>
                    </div>
                ) : (
                    filteredPlans.map((plan) => (
                        <PlanCardRow
                            key={plan.id}
                            plan={plan}
                            isSelected={selectedIds.has(plan.id)}
                            onToggleSelect={() => toggleSelect(plan.id)}
                            onEdit={() => handleEditPlan(plan.id)}
                            onSubmit={() => handleSubmitPlan(plan.id, plan.planName, plan.status)}
                            onDelete={() => handleDeletePlan(plan.id)}
                        />
                    ))
                )}
            </div>

            {/* ─── Floating Bulk Action Bar ─── */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-900 p-4 shadow-xl text-white">
                        <div className="flex items-center gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 font-bold text-sm">
                                {selectedIds.size}
                            </div>
                            <p className="text-sm font-medium">
                                Đã chọn {selectedIds.size} kế hoạch
                            </p>
                            <span className="h-4 w-px bg-gray-700" />
                            <button
                                onClick={clearSelection}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Bỏ chọn
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleBulkDelete}
                                className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
                            >
                                Xoá
                            </button>
                            <button
                                onClick={handleBulkSubmit}
                                disabled={isSubmittingBulk}
                                className="flex items-center gap-2 rounded-lg bg-[#0F4C75] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#0a3655] transition-colors disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                                Gửi đi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Create / Edit Plan Dialog ─── */}
            <CreatePlanForm
                open={dialog.open}
                onOpenChange={handleOpenChange}
                defaultCampaignId={campaignId}
                onSuccess={() => mutateList()}
                editPlanId={dialog.editingPlanId}
            />
        </div>
    )
}

/* ─── Plan Card Row ──────────────────────────────────── */

function PlanCardRow({
    plan,
    isSelected,
    onToggleSelect,
    onEdit,
    onSubmit,
    onDelete,
}: {
    plan: RecruitmentPlan
    isSelected: boolean
    onToggleSelect: () => void
    onEdit: () => void
    onSubmit: () => void
    onDelete: () => void
}) {
    // Fetch details count for this plan
    const { data: detailsData } = useSWR(
        `/api/plan-details?recruitmentPlanId=${plan.id}`,
        () => apiClient.get(`/api/plan-details?recruitmentPlanId=${plan.id}`).then(res => res.json())
    )

    const detailsCount = Array.isArray(detailsData) ? detailsData.length : (detailsData?.items?.length || 0)

    const statusCfg = STATUS_CONFIG[plan.status] ?? STATUS_CONFIG.Draft
    const submittable = canSubmitPlan(plan.status)
    const isRejected = plan.status === 'Rejected'
    const isApproved = plan.status === 'Approved'

    return (
        <div
            className={`group relative grid grid-cols-1 lg:grid-cols-12 gap-4 items-center rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all ${isApproved
                    ? 'border-l-4 border-l-[#22C55E] border-gray-200 hover:border-[#0F4C75]/30'
                    : isRejected
                        ? 'border-gray-200 bg-gray-50/50 opacity-80 hover:opacity-100'
                        : isSelected
                            ? 'border-[#0F4C75]/30 ring-1 ring-[#0F4C75]/20 border-gray-200'
                            : 'border-gray-200 hover:border-[#0F4C75]/30'
                }`}
        >
            {/* Checkbox & Title */}
            <div className="lg:col-span-4 flex items-center gap-4">
                <div className={`flex items-center h-full ${submittable ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'
                    }`}>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={onToggleSelect}
                        className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-[#0F4C75] data-[state=checked]:border-[#0F4C75]"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <button
                        onClick={onEdit}
                        className={`block text-base font-semibold truncate text-left hover:text-[#0F4C75] transition-colors ${isRejected ? 'text-gray-700' : 'text-gray-900'
                            }`}
                    >
                        {plan.planName}
                    </button>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {detailsCount} vị trí
                        </span>
                        <span>•</span>
                        <span>Tạo bởi: {plan.createdByName}</span>
                    </div>
                </div>
            </div>

            {/* Plan Code */}
            <div className="lg:col-span-2 flex lg:block items-center justify-between">
                <span className="lg:hidden text-xs font-medium text-gray-500 uppercase">Mã KH</span>
                <span className={`font-mono text-sm px-2 py-1 rounded ${isRejected ? 'text-gray-500 bg-gray-200/50' : 'text-gray-600 bg-gray-100'
                    }`}>
                    {plan.planCode}
                </span>
            </div>

            {/* Status */}
            <div className="lg:col-span-2 flex lg:block items-center justify-between">
                <span className="lg:hidden text-xs font-medium text-gray-500 uppercase">Trạng thái</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bgClass} ${statusCfg.textClass} ${statusCfg.ringClass}`}>
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                    {statusCfg.label}
                </span>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-2 flex lg:block items-center justify-between">
                <span className="lg:hidden text-xs font-medium text-gray-500 uppercase">Thời gian</span>
                <div className={`text-sm ${isRejected ? 'text-gray-500' : 'text-gray-600'}`}>
                    <div>{format(new Date(plan.startDate), 'dd/MM/yyyy')}</div>
                    <div className="text-xs text-gray-400">đến {format(new Date(plan.endDate), 'dd/MM/yyyy')}</div>
                </div>
            </div>

            {/* Budget */}
            <div className="lg:col-span-2 flex lg:block items-center justify-between text-right">
                <span className="lg:hidden text-xs font-medium text-gray-500 uppercase">Ngân sách</span>
                <span className={`text-sm font-semibold ${isRejected ? 'text-gray-700 line-through' : 'text-gray-900'
                    }`}>
                    {formatVND(plan.totalBudget)}{' '}
                    <span className="text-xs font-normal text-gray-500">VND</span>
                </span>
            </div>

            {/* Action Menu (hover) */}
            <div className="absolute right-2 top-2 lg:right-4 lg:top-1/2 lg:-translate-y-1/2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#0F4C75] transition-colors">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem onClick={onEdit}>
                            <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                        </DropdownMenuItem>

                        {/* Only Draft/Rejected can edit, submit, delete */}
                        {submittable && (
                            <>
                                <DropdownMenuItem onClick={onEdit}>
                                    <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onSubmit}>
                                    <Send className="mr-2 h-4 w-4" /> {isRejected ? 'Gửi lại duyệt' : 'Gửi duyệt'}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
