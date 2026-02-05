'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Loader2, Plus, ChevronRight, FileText, Send, CheckSquare, Square, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api-client'
import { PlanDetail } from '@/features/dept-head/components/recruitment/plan-detail'
import { CreatePlanForm } from '@/features/dept-head/components/recruitment/create-plan-form'
import type { RecruitmentPlan, PlanListResponse, PlanDetail as PlanDetailData } from '@/features/dept-head/types/recruitment-plan-types'
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

const PRIORITY_COLORS: Record<string, string> = {
    Normal: 'border-gray-300 text-gray-600',
    High: 'border-yellow-500 text-yellow-600',
    Urgent: 'border-red-500 text-red-600',
}

const PRIORITY_LABELS: Record<string, string> = {
    Normal: 'Bình thường',
    High: 'Cao',
    Urgent: 'Khẩn cấp',
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
    const [plans, setPlans] = useState<RecruitmentPlan[]>([])
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
    const [isSearching, setIsSearching] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedPlanIds, setSelectedPlanIds] = useState<Set<string>>(new Set())
    const [expandedPlanIds, setExpandedPlanIds] = useState<Set<string>>(new Set())
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
    const [isSubmittingMultiple, setIsSubmittingMultiple] = useState(false)

    // Fetch plans list
    const { data, error, isLoading, mutate } = useSWR<PlanListResponse>(
        '/api/RecruitmentPlans?Page=1&PageSize=100',
        () => apiClient.get('/api/RecruitmentPlans?Page=1&PageSize=100').then(res => res.json())
    )

    useEffect(() => {
        if (data && data.items) {
            // Filter plans belonging to this campaign (1-N relationship)
            const campaignPlans = data.items.filter((p: RecruitmentPlan) => p.campaignId === campaignId)
            setPlans(campaignPlans)
            setIsSearching(false)
        } else if (error) {
            setIsSearching(false)
        }
    }, [data, error, campaignId])

    // When a plan is created, refresh and show it
    const handlePlanCreated = () => {
        mutate()
        setIsCreateOpen(false)
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

    const handleToggleExpand = (planId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setExpandedPlanIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(planId)) {
                newSet.delete(planId)
            } else {
                newSet.add(planId)
            }
            return newSet
        })
    }

    const handleSubmitPlan = async (planId: string, planName: string) => {
        if (!confirm(`Bạn có chắc chắn muốn gửi kế hoạch "${planName}" đi phê duyệt? Bạn sẽ không thể chỉnh sửa sau khi gửi.`)) {
            return
        }

        setIsSubmitting(planId)
        try {
            const res = await apiClient.patch('/api/RecruitmentPlans/submit', { id: planId })
            if (res.ok) {
                toast({
                    title: 'Đã gửi phê duyệt',
                    description: `Kế hoạch "${planName}" đã được gửi tới Giám đốc.`,
                })
                setSelectedPlanIds(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(planId)
                    return newSet
                })
                mutate()
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
        } finally {
            setIsSubmitting(null)
        }
    }

    const handleSubmitMultiplePlans = async () => {
        if (selectedPlanIds.size === 0) {
            toast({
                variant: 'destructive',
                title: 'Chưa chọn kế hoạch',
                description: 'Vui lòng chọn ít nhất một kế hoạch để gửi.',
            })
            return
        }

        // Optimistic update
        // We do NOT validate client-side for PlanDetails because the list API might not include them completely.
        // We interpret "no details" in the list as potentially incomplete data, so we let the backend validate.
        const submittedPlanIds = Array.from(selectedPlanIds)
        setPlans(prevPlans => prevPlans.map(p =>
            submittedPlanIds.includes(p.id) ? { ...p, status: 'Pending' } : p
        ))

        setIsSubmittingMultiple(true)
        const failedPlans: string[] = []
        const errorMessages: string[] = []

        try {
            // Submit each plan sequentially
            for (const planId of submittedPlanIds) {
                try {
                    const res = await apiClient.patch('/api/RecruitmentPlans/submit', { PlanId: planId })
                    if (!res.ok) {
                        failedPlans.push(planId)
                        // Try to get error message from backend
                        try {
                            const errData = await res.json()
                            const planName = plans.find(p => p.id === planId)?.planName || 'Kế hoạch'

                            let msg = errData.message
                            if (!msg && errData.errors) {
                                // Handle validation errors
                                msg = Object.values(errData.errors).flat().join(', ')
                            }
                            if (!msg && errData.title) {
                                msg = errData.title
                            }
                            if (!msg) msg = 'Lỗi từ server'

                            errorMessages.push(`${planName}: ${msg}`)
                        } catch (e) {
                            errorMessages.push(`Lỗi kết nối khi gửi kế hoạch`)
                        }
                    }
                } catch (err) {
                    failedPlans.push(planId)
                    errorMessages.push(`Lỗi hệ thống: ${err instanceof Error ? err.message : 'Unknown error'}`)
                }
            }

            if (failedPlans.length === 0) {
                toast({
                    title: 'Đã gửi phê duyệt',
                    description: `${selectedPlanIds.size} kế hoạch đã được gửi tới Giám đốc.`,
                })
                setSelectedPlanIds(new Set())
            } else {
                // Revert status for failed plans
                setPlans(prevPlans => prevPlans.map(p =>
                    failedPlans.includes(p.id) ? { ...p, status: 'Draft' } : p
                ))

                toast({
                    variant: 'destructive',
                    title: 'Có lỗi xảy ra khi gửi kế hoạch',
                    description: (
                        <div className="mt-2 text-sm max-h-[300px] overflow-y-auto">
                            <p className="mb-2 font-medium text-red-100">
                                {selectedPlanIds.size - failedPlans.length} thành công, {failedPlans.length} thất bại.
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                {errorMessages.map((msg, idx) => (
                                    <li key={idx} className="text-xs">{msg}</li>
                                ))}
                            </ul>
                        </div>
                    ),
                    duration: 5000,
                })
            }
            mutate() // Re-fetch to ensure data consistency
        } catch (error: unknown) {
            // Revert all on catastrophic error
            setPlans(prevPlans => prevPlans.map(p =>
                submittedPlanIds.includes(p.id) ? { ...p, status: 'Draft' } : p
            ))

            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi gửi kế hoạch'
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: errorMessage,
            })
        } finally {
            setIsSubmittingMultiple(false)
        }
    }

    const draftPlans = plans.filter(p => p.status === 'Draft')
    const hasDraftPlans = draftPlans.length > 0

    if (isLoading || isSearching) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
                <p className="mt-4 text-gray-500">Đang tải danh sách kế hoạch...</p>
            </div>
        )
    }

    // If a plan is selected, show its details
    if (selectedPlanId) {
        return (
            <div>
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => setSelectedPlanId(null)}
                >
                    ← Quay lại danh sách kế hoạch
                </Button>
                <PlanDetail planId={selectedPlanId} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0F4C75]">
                        Danh sách Kế hoạch Tuyển dụng
                    </h2>
                    <p className="text-muted-foreground">
                        Chiến dịch này có {plans.length} kế hoạch
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-[#0F4C75] hover:bg-[#0F4C75]/90"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo kế hoạch mới
                </Button>
            </div>

            {/* Plans List */}
            {plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-gray-50">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Chưa có kế hoạch nào</p>
                    <p className="text-gray-500 mb-4">Bắt đầu tạo kế hoạch đầu tiên cho chiến dịch này.</p>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        size="lg"
                        className="bg-[#0F4C75]"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Lập kế hoạch ngay
                    </Button>
                </div>
            ) : (
                <>
                    {/* Bulk Submit Button */}
                    {hasDraftPlans && selectedPlanIds.size > 0 && (
                        <div className="sticky top-0 z-10 bg-white border rounded-lg p-4 shadow-md mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <span className="font-medium">
                                        Đã chọn {selectedPlanIds.size} kế hoạch
                                    </span>
                                </div>
                                <Button
                                    onClick={handleSubmitMultiplePlans}
                                    disabled={isSubmittingMultiple}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmittingMultiple ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                    )}
                                    Gửi {selectedPlanIds.size} kế hoạch
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {plans.map((plan) => {
                            const isSelected = selectedPlanIds.has(plan.id)
                            const isExpanded = expandedPlanIds.has(plan.id)
                            const canSubmit = plan.status === 'Draft'
                            const isSubmittingThis = isSubmitting === plan.id

                            return (
                                <Card
                                    key={plan.id}
                                    className={`hover:shadow-md transition-all border-l-4 ${isExpanded ? 'shadow-md' : ''}`}
                                    style={{
                                        borderLeftColor: plan.status === 'Approved' ? '#22c55e' :
                                            plan.status === 'Rejected' ? '#ef4444' :
                                                plan.status === 'Pending' ? '#eab308' : '#9ca3af'
                                    }}
                                >
                                    <CardContent className="p-0">
                                        {/* Plan Header - Always Visible */}
                                        <div className="p-4">
                                            <div className="flex items-start gap-3">
                                                {/* Checkbox for bulk submit */}
                                                {canSubmit && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleToggleSelect(plan.id)
                                                        }}
                                                        className="mt-1 flex-shrink-0"
                                                    >
                                                        {isSelected ? (
                                                            <CheckSquare className="w-5 h-5 text-green-600" />
                                                        ) : (
                                                            <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                                        )}
                                                    </button>
                                                )}

                                                {/* Expand/Collapse Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleToggleExpand(plan.id, e)}
                                                    className="mt-1 flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                                    )}
                                                </button>

                                                {/* Plan Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3
                                                            className="font-semibold text-lg text-[#0F4C75] cursor-pointer hover:underline hover:text-blue-700 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setSelectedPlanId(plan.id)
                                                            }}
                                                        >
                                                            {plan.planName}
                                                        </h3>
                                                        <Badge
                                                            variant="outline"
                                                            className={`border-0 ${STATUS_COLORS[plan.status]}`}
                                                        >
                                                            {STATUS_LABELS[plan.status] || plan.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-12 gap-4 items-center text-sm text-gray-500">
                                                        <div className="col-span-3">
                                                            <div className="text-gray-400 text-xs mb-1">Mã kế hoạch</div>
                                                            <div className="font-medium text-gray-700">{plan.planCode}</div>
                                                        </div>
                                                        <div className="col-span-4">
                                                            <div className="text-gray-400 text-xs mb-1">Thời gian</div>
                                                            <div className="text-gray-700 line-clamp-1">
                                                                {format(new Date(plan.startDate), 'dd/MM/yyyy')} - {format(new Date(plan.endDate), 'dd/MM/yyyy')}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-3">
                                                            <div className="text-gray-400 text-xs mb-1">Ngân sách</div>
                                                            <div className="font-medium text-gray-700">
                                                                {new Intl.NumberFormat('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND'
                                                                }).format(plan.totalBudget)}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <div className="text-gray-400 text-xs mb-1">Đề xuất</div>
                                                            <div className={plan.planDetails?.length > 0 ? 'text-blue-600 font-semibold' : 'text-gray-700'}>
                                                                {plan.planDetails?.length || 0}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* View Detail Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedPlanId(plan.id)
                                                    }}
                                                >
                                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Expanded Plan Details */}
                                        {isExpanded && (
                                            <>
                                                <div className="border-t px-4 py-3 bg-gray-50">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <FileText className="w-4 h-4 text-gray-500" />
                                                        <span className="font-medium text-gray-700">
                                                            Danh sách đề xuất tuyển dụng
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            ({plan.planDetails?.length || 0} đề xuất)
                                                        </span>
                                                    </div>

                                                    {plan.planDetails?.length === 0 ? (
                                                        <div className="text-center py-4 text-gray-500 text-sm">
                                                            Chưa có đề xuất nào trong kế hoạch này
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {plan.planDetails.map((detail: PlanDetailData) => (
                                                                <div
                                                                    key={detail.id}
                                                                    className="flex items-center justify-between p-3 bg-white border rounded-md hover:border-blue-300 transition-colors"
                                                                >
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="font-medium text-gray-900">
                                                                                {detail.positionTitle || `Position #${detail.positionId}`}
                                                                            </span>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={`text-xs ${PRIORITY_COLORS[detail.priority]}`}
                                                                            >
                                                                                {PRIORITY_LABELS[detail.priority] || detail.priority}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="text-sm text-gray-500 space-y-0.5">
                                                                            <p>Số lượng: <span className="font-semibold">{detail.quantity}</span></p>
                                                                            <p>Lương tối đa: {new Intl.NumberFormat('vi-VN', {
                                                                                style: 'currency',
                                                                                currency: 'VND'
                                                                            }).format(detail.salaryRangeMax || 0)}</p>
                                                                            {detail.minExperience !== undefined && detail.minExperience !== null && (
                                                                                <p>Kinh nghiệm: {detail.minExperience}{detail.maxExperience ? ` - ${detail.maxExperience}` : ''} năm</p>
                                                                            )}
                                                                            {detail.justification && (
                                                                                <p className="text-xs text-gray-400 italic">
                                                                                    {detail.justification}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </>
            )}

            {/* Create Plan Dialog */}
            <CreatePlanForm
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                defaultCampaignId={campaignId}
                onSuccess={handlePlanCreated}
            />
        </div>
    )
}
