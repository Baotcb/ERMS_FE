import { useState } from 'react'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useWithdrawApplication } from '../hooks/use-applications'
import { useToast } from '@/hooks/use-toast'

interface WithdrawApplicationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    applicationId: string
    jobTitle: string
    onSuccess?: () => void
}

export function WithdrawApplicationDialog({
    open, onOpenChange, applicationId, jobTitle, onSuccess
}: WithdrawApplicationDialogProps) {
    const [reason, setReason] = useState('')
    const { trigger, isMutating } = useWithdrawApplication()
    const { toast } = useToast()

    const handleWithdraw = async () => {
        try {
            await trigger({
                applicationId,
                data: reason.trim() ? { reason: reason.trim() } : undefined,
            })
            toast({
                title: 'Đã rút đơn',
                description: 'Đơn ứng tuyển đã được rút thành công.',
            })
            onOpenChange(false)
            onSuccess?.()
        } catch {
            toast({
                title: 'Lỗi',
                description: 'Không thể rút đơn ứng tuyển. Vui lòng thử lại.',
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
                    <DialogTitle>Rút đơn ứng tuyển</DialogTitle>
                    <DialogDescription>
                        Bạn sắp rút đơn ứng tuyển vị trí <strong>{jobTitle}</strong>. 
                        Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="withdraw-reason">Lý do rút đơn (tùy chọn)</Label>
                        <Textarea
                            id="withdraw-reason"
                            placeholder="Nhập lý do rút đơn ứng tuyển..."
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
                        onClick={handleWithdraw}
                        disabled={isMutating}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Xác nhận rút đơn
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
