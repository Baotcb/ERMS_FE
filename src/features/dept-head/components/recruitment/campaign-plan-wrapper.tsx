'use client'

import { useState, useEffect } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { Loader2, Plus, Send, CheckSquare, Square } from 'lucide-react'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api-client'
import { CreatePlanForm } from '@/features/dept-head/components/recruitment/create-plan-form'
import type { RecruitmentPlan, PlanListResponse } from '@/features/dept-head/types/recruitment-plan-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
    Draft: 'Nháp',
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt',
    Rejected: 'Từ chối',
}



/**
 * CampaignPlanWrapper
 *
 * Logic (1-N relationship):
 * 1. Fetch ALL plans and filter by campaignId
 * 2. Show list of plans (can have multiple plans per campaign)
 * 3. Show plan details inline - can expand/collapse
 * 4. Can submit individual plans or multiple plans at once
 * 5. Click on a plan to view/edit in detail mode
 * 6. Button to create new plan for this campaign
 */
export default function CampaignPlanWrapper({ campaignId }: { campaignId: string }) {
    const { toast } = useToast()
    const { mutate: globalMutate } = useSWRConfig()
    const [plans, setPlans] = useState<RecruitmentPlan[]>([])
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedPlanIds, setSelectedPlanIds] = useState<Set<string>>(new Set())
    const [isSubmittingMultiple, setIsSubmittingMultiple] = useState(false)
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null)

    // Fetch plans list (PageSize 100 to filtering client-side)
    const { data: listData, mutate: mutateList } = useSWR<PlanListResponse>(
        '/api/RecruitmentPlans?Page=1&PageSize=100',
        () => apiClient.get('/api/RecruitmentPlans?Page=1&PageSize=100').then(res => res.json())
    )

    useEffect(() => {
        if (listData && listData.items) {
            // Filter plans belonging to this campaign
            const campaignPlans = listData.items.filter((p: RecruitmentPlan) => p.campaignId === campaignId)
            setPlans(campaignPlans)
        }
    }, [listData, campaignId])

    const handlePlanCreated = () => {
        mutateList()
    }

    const handleOpenChange = (open: boolean) => {
        setIsCreateOpen(open)
        if (!open) {
            setEditingPlanId(null)
            // Revalidate plan-details counts khi đóng dialog
            globalMutate(
                (key: string) => typeof key === 'string' && key.startsWith('/api/plan-details'),
                undefined,
                { revalidate: true }
            )
        }
    }

    const handleEditPlan = (planId: string) => {
        setEditingPlanId(planId)
        setIsCreateOpen(true)
    }

    const handleToggleSelect = (planId: string) => {
        setSelectedPlanIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(planId)) {
                newSet.delete(planId)
            } else {
                newSet.add(planId)
            }
            return newSet
        })
    }

    const handleSubmitMultiplePlans = async () => {
        if (selectedPlanIds.size === 0) return

        setIsSubmittingMultiple(true)
        const submittedPlanIds = Array.from(selectedPlanIds)
        const failedPlans: string[] = []
        const errorMessages: string[] = []

        try {
            // Submit plans sequentially or parallel
            // Since API might not support bulk, loop
            await Promise.all(submittedPlanIds.map(async (id) => {
                try {
                    // Xác định endpoint dựa trên status của plan
                    const plan = plans.find(p => p.id === id)
                    const endpoint = plan?.status === 'Rejected'
                        ? '/api/RecruitmentPlans/resubmit'
                        : '/api/RecruitmentPlans/submit'
                    const res = await apiClient.patch(endpoint, { planId: id })
                    if (!res.ok) {
                        const err = await res.json()
                        failedPlans.push(id)
                        errorMessages.push(`Plan ${id}: ${err.message}`)
                    }
                } catch {
                    failedPlans.push(id)
                    errorMessages.push(`Plan ${id}: Lỗi mạng`)
                }
            }))

            if (failedPlans.length === 0) {
                toast({
                    title: 'Đã gửi duyệt thành công',
                    description: `Đã gửi ${submittedPlanIds.length} kế hoạch lên cấp trên.`,
                    className: 'bg-green-50 border-green-200'
                })
                setSelectedPlanIds(new Set())
                mutateList()
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Gửi duyệt thất bại một phần',
                    description: `Gửi thành công ${submittedPlanIds.length - failedPlans.length}/${submittedPlanIds.length} kế hoạch.`,
                })
                // Remove successful ones from selection
                setSelectedPlanIds(new Set(failedPlans))
            }

        } catch {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Có lỗi xảy ra khi gửi duyệt' })
        } finally {
            setIsSubmittingMultiple(false)
        }
    }

    return (
        <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {plans.length}
                    </span>
                    Kế hoạch tuyển dụng
                </h3>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    size="sm"
                    className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 h-8"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Thêm kế hoạch
                </Button>
            </div>

            {plans.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500 mb-3">Chưa có kế hoạch nào</p>
                    <Button onClick={() => setIsCreateOpen(true)} variant="outline" size="sm">
                        <Plus className="w-3 h-3 mr-1" /> Tạo ngay
                    </Button>
                </div>
            ) : (
                <>
                    {/* Bulk Submit Action */}
                    {plans.some(p => p.status === 'Draft' || p.status === 'Rejected') && selectedPlanIds.size > 0 && (
                        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <span className="text-sm font-medium text-blue-800">
                                Đã chọn {selectedPlanIds.size} kế hoạch
                            </span>
                            <Button
                                onClick={handleSubmitMultiplePlans}
                                disabled={isSubmittingMultiple}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                            >
                                {isSubmittingMultiple ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                                Gửi đi
                            </Button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {plans.map((plan) => (
                            <PlanItemCompact
                                key={plan.id}
                                plan={plan}
                                isSelected={selectedPlanIds.has(plan.id)}
                                onToggleSelect={() => handleToggleSelect(plan.id)}
                                onEdit={() => handleEditPlan(plan.id)}
                            />
                        ))}
                    </div>
                </>
            )}

            <CreatePlanForm
                open={isCreateOpen}
                onOpenChange={handleOpenChange}
                defaultCampaignId={campaignId}
                onSuccess={handlePlanCreated}
                editPlanId={editingPlanId}
            />
        </div>
    )
}

function PlanItemCompact({
    plan,
    isSelected,
    onToggleSelect,
    onEdit
}: {
    plan: RecruitmentPlan
    isSelected: boolean
    onToggleSelect: () => void
    onEdit: () => void
}) {
    // Fetch details count specifically for this plan
    const { data: detailsData } = useSWR(
        `/api/plan-details?recruitmentPlanId=${plan.id}`,
        () => apiClient.get(`/api/plan-details?recruitmentPlanId=${plan.id}`).then(res => res.json())
    )

    // Check if detailsData is an array (API returns array directly) or has items property
    const detailsCount = Array.isArray(detailsData) ? detailsData.length : (detailsData?.items?.length || 0)

    const canSubmit = plan.status === 'Draft' || plan.status === 'Rejected'

    return (
        <Card className={`border hover:shadow-sm transition-all ${isSelected ? 'border-blue-300 ring-1 ring-blue-200' : 'border-gray-200'}`}>
            <CardContent className="p-3">
                <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    {canSubmit ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleSelect()
                            }}
                            className="flex-shrink-0 text-gray-400 hover:text-blue-600 focus:outline-none"
                        >
                            {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-green-600" />
                            ) : (
                                <Square className="w-5 h-5" />
                            )}
                        </button>
                    ) : (
                        <div className="w-5" /> // Spacer
                    )}

                    {/* Main Content Info - Horizontal Layout */}
                    <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                        {/* Name & Badge */}
                        <div className="col-span-4 pr-2">
                            <div className="flex items-center gap-2 mb-1">
                                <h3
                                    className="text-sm font-semibold text-gray-800 truncate cursor-pointer hover:text-blue-600 hover:underline"
                                    title={plan.planName}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onEdit()
                                    }}
                                >
                                    {plan.planName}
                                </h3>
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 whitespace-nowrap ${STATUS_COLORS[plan.status]}`}>
                                    {STATUS_LABELS[plan.status]}
                                </Badge>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                                {plan.planCode}
                            </div>
                        </div>

                        {/* Date */}
                        <div className="col-span-3">
                            <label className="text-[10px] text-gray-400 block uppercase">Thời gian</label>
                            <span className="text-xs text-gray-600">
                                {format(new Date(plan.startDate), 'dd/MM/yyyy')} - {format(new Date(plan.endDate), 'dd/MM/yyyy')}
                            </span>
                        </div>

                        {/* Budget */}
                        <div className="col-span-3">
                            <label className="text-[10px] text-gray-400 block uppercase">Ngân sách</label>
                            <span className="text-xs font-medium text-gray-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.totalBudget)}
                            </span>
                        </div>

                        {/* Proposals Count */}
                        <div className="col-span-2 text-right">
                            <label className="text-[10px] text-gray-400 block uppercase text-right">Đề xuất</label>
                            <span className="text-sm font-bold text-[#0F4C75]">
                                {detailsCount}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
