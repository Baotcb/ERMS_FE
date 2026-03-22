import { useState } from 'react'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useRejectApplication } from '../../hooks/use-applications'
import { useToast } from '@/hooks/use-toast'

interface RejectApplicationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    applicationId: string
    candidateName: string
    onSuccess?: () => void
}

export function RejectApplicationDialog({
    open, onOpenChange, applicationId, candidateName, onSuccess
}: RejectApplicationDialogProps) {
    const [reason, setReason] = useState('')
    const { trigger, isMutating } = useRejectApplication()
    const { toast } = useToast()

    const handleReject = async () => {
        if (!reason.trim()) return   // Guard — button cũng disabled
        try {
            await trigger({ id: applicationId, data: { rejectionReason: reason.trim() } })
            toast({
                title: 'Đã từ chối',
                description: `Đã từ chối hồ sơ của ${candidateName}. Ứng viên sẽ nhận email thông báo.`,
            })
            onOpenChange(false)
            onSuccess?.()
        } catch {
            toast({
                title: 'Lỗi',
                description: 'Không thể từ chối hồ sơ. Vui lòng thử lại.',
                variant: 'destructive',
            })
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) setReason('')
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Từ chối hồ sơ ứng viên</DialogTitle>
                    <DialogDescription>
                        Hồ sơ của ứng viên <strong>{candidateName}</strong> sẽ bị <strong className="text-red-600">từ chối</strong>. 
                        Ứng viên sẽ nhận email thông báo kết quả. Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reject-reason">
                            Lý do từ chối <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="reject-reason"
                            placeholder="Nhập lý do từ chối ứng viên..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="h-32"
                            maxLength={2000}
                        />
                        <div className="text-xs text-right text-muted-foreground">
                            {reason.length}/2000 ký tự
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isMutating}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleReject}
                        disabled={isMutating || !reason.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Xác nhận từ chối
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
