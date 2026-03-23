'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { Check, X, Eye, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import type { RecruitmentPlan, PlanListResponse } from '@/features/dept-head/types/recruitment-plan-types'

// Thông tin budget của campaign
interface CampaignBudgetMap {
    [campaignId: string]: {
        totalBudgetCeiling: number
        usedBudget: number
        pendingBudget: number
        remainingBudget: number
        actualCost: number
        campaignName: string
    }
}

function formatVND(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export function PlanApprovalList() {
    const { toast } = useToast()
    const [selectedPlan, setSelectedPlan] = useState<RecruitmentPlan | null>(null)
    const [rejectReason, setRejectReason] = useState('')
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
    const [budgetMap, setBudgetMap] = useState<CampaignBudgetMap>({})

    // Fetch Pending plans
    const { data, isLoading, mutate } = useSWR<PlanListResponse>(
        '/api/RecruitmentPlans/pending', // Use unique key
        () => apiClient.get('/api/RecruitmentPlans?Status=Pending&Page=1&PageSize=50').then(res => res.json())
    )

    // Fetch budget info cho tất cả campaigns liên quan
    const fetchBudgetInfoForPlans = useCallback(async (plans: RecruitmentPlan[]) => {
        const uniqueCampaignIds = [...new Set(plans.map(p => p.campaignId).filter(Boolean))]
        const newBudgetMap: CampaignBudgetMap = {}

        await Promise.all(
            uniqueCampaignIds.map(async (campaignId) => {
                try {
                    const res = await apiClient.get(`/api/recruitment-campaigns/${campaignId}`)
                    if (res.ok) {
                        const campaign = await res.json()
                        if (campaign.totalBudgetCeiling != null) {
                            newBudgetMap[campaignId] = {
                                totalBudgetCeiling: campaign.totalBudgetCeiling,
                                usedBudget: campaign.usedBudget ?? 0,
                                pendingBudget: campaign.pendingBudget ?? 0,
                                remainingBudget: campaign.remainingBudget ?? campaign.totalBudgetCeiling,
                                actualCost: campaign.actualCost ?? 0,
                                campaignName: campaign.campaignName,
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Failed to fetch budget for campaign ${campaignId}:`, e)
                }
            })
        )

        setBudgetMap(newBudgetMap)
    }, [])

    useEffect(() => {
        if (data?.items?.length) {
            fetchBudgetInfoForPlans(data.items)
        }
    }, [data, fetchBudgetInfoForPlans])

    const handleAction = (plan: RecruitmentPlan, type: 'approve' | 'reject') => {
        setSelectedPlan(plan)
        setActionType(type)
        setRejectReason('')
    }

    const confirmAction = async () => {
        if (!selectedPlan || !actionType) return

        try {
            let res
            if (actionType === 'approve') {
                res = await apiClient.patch(`/api/RecruitmentPlans/approve`, { planId: selectedPlan.id })
            } else {
                res = await apiClient.patch(`/api/RecruitmentPlans/reject`, { planId: selectedPlan.id, rejectionReason: rejectReason })
            }

            if (res.ok) {
                toast({
                    title: actionType === 'approve' ? 'Đã phê duyệt' : 'Đã từ chối',
                    description: `Kế hoạch ${selectedPlan.planName} đã được xử lý.`,
                })
                mutate()
            } else {
                const err = await res.json()
                throw new Error(err.message || 'Có lỗi xảy ra')
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xử lý kế hoạch'
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: errorMessage,
            })
        } finally {
            setSelectedPlan(null)
            setActionType(null)
        }
    }

    // Kiểm tra plan có vượt budget không
    const isPlanOverBudget = (plan: RecruitmentPlan): boolean => {
        const budget = budgetMap[plan.campaignId]
        if (!budget || !plan.totalBudget) return false
        return plan.totalBudget > budget.remainingBudget
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Phê duyệt kế hoạch</h2>
                    <p className="text-muted-foreground">
                        Danh sách các kế hoạch tuyển dụng đang chờ phê duyệt
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 flex flex-col min-h-[420px]">
                <div className="flex-1 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/80 border-b border-slate-100">
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Mã kế hoạch</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Tên kế hoạch</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Người tạo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Ngày gửi</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Ngân sách</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">Ngân sách chiến dịch</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4 text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : data?.items?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Không có kế hoạch nào cần duyệt
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.items?.map((plan) => {
                                    const overBudget = isPlanOverBudget(plan)
                                    const budget = budgetMap[plan.campaignId]

                                    return (
                                        <TableRow key={plan.id} className={overBudget ? 'bg-amber-50/50' : ''}>
                                            <TableCell className="font-mono text-xs">{plan.planCode}</TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {plan.planName}
                                                    {overBudget && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                                                        <AlertTriangle className="w-3 h-3" />
                                                                        Vượt ngân sách
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-xs">
                                                                    <p>Ngân sách kế hoạch ({formatVND(plan.totalBudget)}) vượt ngân sách còn lại của chiến dịch ({formatVND(budget?.remainingBudget ?? 0)})</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{plan.createdByName}</TableCell>
                                            <TableCell>{plan.updatedAt ? format(new Date(plan.updatedAt), 'dd/MM/yyyy') : format(new Date(plan.createdAt), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className={overBudget ? 'text-amber-700 font-semibold' : ''}>
                                                {formatVND(plan.totalBudget)}
                                            </TableCell>
                                            <TableCell>
                                                {budget ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <div className="text-xs space-y-0.5">
                                                                    <p className="text-gray-500">Còn lại: <span className={overBudget ? 'text-amber-600 font-semibold' : 'text-blue-600 font-semibold'}>{formatVND(budget.remainingBudget)}</span></p>
                                                                    <p className="text-gray-400">/ {formatVND(budget.totalBudgetCeiling)}</p>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-xs">
                                                                <div className="space-y-1 text-xs">
                                                                    <p>Tổng ngân sách: {formatVND(budget.totalBudgetCeiling)}</p>
                                                                    <p>Đã phân bổ: {formatVND(budget.usedBudget)}</p>
                                                                    <p>Đang chờ duyệt: {formatVND(budget.pendingBudget)}</p>
                                                                    <p className="font-semibold">Còn lại: {formatVND(budget.remainingBudget)}</p>
                                                                    {budget.actualCost > 0 && (
                                                                        <p className="font-semibold text-green-600 border-t border-gray-200 pt-1 mt-1">Chi phí thực tế: {formatVND(budget.actualCost)}</p>
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => window.location.href = `/enterprise/director/recruitment-plans/${plan.id}`}>
                                                    <Eye className="w-4 h-4 mr-1" /> Xem
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleAction(plan, 'approve')}
                                                >
                                                    <Check className="w-4 h-4 mr-1" /> Duyệt
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleAction(plan, 'reject')}
                                                >
                                                    <X className="w-4 h-4 mr-1" /> Từ chối
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

            </div>

            {/* Confirmation Dialog */}
            <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' ? 'Phê duyệt kế hoạch' : 'Từ chối kế hoạch'}
                        </DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn {actionType === 'approve' ? 'phê duyệt' : 'từ chối'} kế hoạch
                            <strong> {selectedPlan?.planName}</strong> không?
                            {actionType === 'approve' && selectedPlan && isPlanOverBudget(selectedPlan) && (
                                <span className="block mt-2 text-amber-600 text-sm">
                                    ⚠️ Lưu ý: Ngân sách kế hoạch này vượt hạn mức còn lại của chiến dịch. Bạn vẫn có thể phê duyệt.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {actionType === 'reject' && (
                        <div className="py-2">
                            <label htmlFor="reject-reason" className="text-sm font-medium mb-2 block">Lý do từ chối:</label>
                            <Textarea
                                id="reject-reason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Nhập lý do từ chối..."
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedPlan(null)}>Hủy</Button>
                        <Button
                            variant={actionType === 'reject' ? 'destructive' : 'default'}
                            onClick={confirmAction}
                        >
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
