'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function DirectorPlanDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const id = params.id as string

    const [rejectReason, setRejectReason] = useState('')
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)

    // Fetch Plan to check status for buttons
    const { data: plan, mutate } = useSWR<RecruitmentPlan>(
        `/api/RecruitmentPlans/${id}`,
        () => apiClient.get(`/api/RecruitmentPlans/${id}`).then(res => res.json())
    )

    const confirmAction = async () => {
        if (!actionType) return

        try {
            let res
            if (actionType === 'approve') {
                res = await apiClient.patch(`/api/RecruitmentPlans/approve`, { planId: id })
            } else {
                res = await apiClient.patch(`/api/RecruitmentPlans/reject`, { planId: id, rejectionReason: rejectReason })
            }

            if (res.ok) {
                toast({
                    title: actionType === 'approve' ? 'Đã phê duyệt' : 'Đã từ chối',
                    description: `Kế hoạch đã được xử lý thành công.`,
                })
                mutate()
                // Don't auto-redirect, let them see the updated status in PlanDetail
                // Or redirect? Usually better to stay or redirect to list.
                // Let's redirect to list.
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

    if (!id) return null

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
            <PlanDetail planId={id} headerActions={actionButtons} />

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
