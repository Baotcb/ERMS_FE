import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useForwardApplication } from '../../hooks/use-applications'
import { useToast } from '@/hooks/use-toast'

interface ForwardApplicationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    applicationId: string
    candidateName: string
    onSuccess?: () => void
}

export function ForwardApplicationDialog({
    open,
    onOpenChange,
    applicationId,
    candidateName,
    onSuccess
}: ForwardApplicationDialogProps) {
    const [note, setNote] = useState('')
    const { trigger, isMutating } = useForwardApplication()
    const { toast } = useToast()

    const handleForward = async () => {
        try {
            await trigger({ id: applicationId, data: { hrNote: note } })
            toast({
                title: 'Thành công',
                description: `Đã chuyển hồ sơ của ${candidateName} cho Trưởng bộ phận`,
            })
            onOpenChange(false)
            onSuccess?.()
        } catch {
            toast({
                title: 'Lỗi',
                description: 'Không thể chuyển hồ sơ. Vui lòng thử lại.',
                variant: 'destructive',
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Chuyển hồ sơ cho Trưởng bộ phận</DialogTitle>
                    <DialogDescription>
                        Hồ sơ của ứng viên <strong>{candidateName}</strong> sẽ được chuyển sang trạng thái <strong>Shortlisted</strong> để Trưởng bộ phận xem xét.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="hr-note">Ghi chú của HR (Tùy chọn)</Label>
                        <Textarea
                            id="hr-note"
                            placeholder="Nhập nhận xét, điểm mạnh/yếu của ứng viên..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-32"
                            maxLength={2000}
                        />
                        <div className="text-xs text-right text-muted-foreground">
                            {note.length}/2000 ký tự
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMutating}>
                        Hủy
                    </Button>
                    <Button onClick={handleForward} disabled={isMutating}>
                        {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Chuyển hồ sơ
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
