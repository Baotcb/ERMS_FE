'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { PlanDetail } from '@/features/dept-head/components/recruitment/plan-detail'
import type { RecruitmentPlan } from '@/features/dept-head/types/recruitment-plan-types'
import { handleApiResponse } from '@/utils/error-handler'

interface RecruitmentPlanDetailPageProps {
    planId: string
}

export default function RecruitmentPlanDetailPage({ planId }: RecruitmentPlanDetailPageProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [rejectReason, setRejectReason] = useState('')
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)

    const { data: plan, mutate } = useSWR<RecruitmentPlan>(
        `/api/RecruitmentPlans/${planId}`,
        async () => {
            const response = await apiClient.get(`/api/RecruitmentPlans/${planId}`)
            return handleApiResponse<RecruitmentPlan>(response, 'Không thể tải chi tiết kế hoạch tuyển dụng')
        }
    )

    const confirmAction = async () => {
        if (!actionType) return

        try {
            let res
            if (actionType === 'approve') {
                res = await apiClient.patch(`/api/RecruitmentPlans/approve`, { planId })
            } else {
                res = await apiClient.patch(`/api/RecruitmentPlans/reject`, { planId, rejectionReason: rejectReason })
            }

            if (res.ok) {
                toast({
                    title: actionType === 'approve' ? 'Đã phê duyệt' : 'Đã từ chối',
                    description: `Kế hoạch đã được xử lý thành công.`,
                })
                mutate()
                router.push('/enterprise/director/recruitment-plans')
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
            setActionType(null)
        }
    }

    if (!planId) return null

    const actionButtons = plan?.status === 'Pending' ? (
        <div className="flex gap-2">
            <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                    setRejectReason('')
                    setActionType('approve')
                }}
            >
                <Check className="w-4 h-4 mr-1" /> Phê duyệt
            </Button>
            <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                    setRejectReason('')
                    setActionType('reject')
                }}
            >
                <X className="w-4 h-4 mr-1" /> Từ chối
            </Button>
        </div>
    ) : null

    return (
        <>
            <PlanDetail planId={planId} headerActions={actionButtons} />

            <Dialog open={!!actionType} onOpenChange={(open) => !open && setActionType(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' ? 'Phê duyệt kế hoạch' : 'Từ chối kế hoạch'}
                        </DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn {actionType === 'approve' ? 'phê duyệt' : 'từ chối'} kế hoạch này không?
                        </DialogDescription>
                    </DialogHeader>

                    {actionType === 'reject' && (
                        <div className="py-2">
                            <label htmlFor="reject-reason-detail" className="text-sm font-medium mb-2 block">Lý do từ chối:</label>
                            <Textarea
                                id="reject-reason-detail"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Nhập lý do từ chối..."
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionType(null)}>Hủy</Button>
                        <Button
                            variant={actionType === 'reject' ? 'destructive' : 'default'}
                            onClick={confirmAction}
                        >
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
