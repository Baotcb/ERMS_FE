'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Check, X, Eye } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import type { RecruitmentPlan, PlanListResponse } from '@/features/dept-head/types/recruitment-plan-types'

export function PlanApprovalList() {
    const { toast } = useToast()
    const [selectedPlan, setSelectedPlan] = useState<RecruitmentPlan | null>(null)
    const [rejectReason, setRejectReason] = useState('')
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)

    // Fetch Pending plans
    const { data, isLoading, mutate } = useSWR<PlanListResponse>(
        '/api/RecruitmentPlans/pending', // Use unique key
        () => apiClient.get('/api/RecruitmentPlans?Status=Pending&Page=1&PageSize=50').then(res => res.json())
    )

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

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã kế hoạch</TableHead>
                            <TableHead>Tên kế hoạch</TableHead>
                            <TableHead>Người tạo</TableHead>
                            <TableHead>Ngày gửi</TableHead>
                            <TableHead>Ngân sách</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : data?.items?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Không có kế hoạch nào cần duyệt
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.items?.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-mono text-xs">{plan.planCode}</TableCell>
                                    <TableCell className="font-medium">{plan.planName}</TableCell>
                                    <TableCell>{plan.createdByName}</TableCell>
                                    <TableCell>{plan.updatedAt ? format(new Date(plan.updatedAt), 'dd/MM/yyyy') : format(new Date(plan.createdAt), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.totalBudget)}</TableCell>
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
                            ))
                        )}
                    </TableBody>
                </Table>
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
                        </DialogDescription>
                    </DialogHeader>

                    {actionType === 'reject' && (
                        <div className="py-2">
                            <label className="text-sm font-medium mb-2 block">Lý do từ chối:</label>
                            <Textarea
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
