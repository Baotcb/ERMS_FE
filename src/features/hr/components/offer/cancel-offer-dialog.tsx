'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AlertCircle } from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useCancelOffer } from '../../hooks/use-offers'
import type { HROfferDto } from '../../types/offer-types'

const cancelOfferSchema = z.object({
    cancellationReason: z.string()
        .min(1, 'Vui lòng nhập lý do hủy')
        .max(1000, 'Lý do không được vượt quá 1000 ký tự'),
})

type CancelOfferFormValues = z.infer<typeof cancelOfferSchema>

interface CancelOfferDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    offer: HROfferDto
}

export function CancelOfferDialog({ open, onOpenChange, offer }: CancelOfferDialogProps) {
    const { trigger: cancelOffer, isMutating } = useCancelOffer()
    const { toast } = useToast()

    const form = useForm<CancelOfferFormValues>({
        resolver: zodResolver(cancelOfferSchema),
        defaultValues: {
            cancellationReason: '',
        },
    })

    const onSubmit = async (data: CancelOfferFormValues) => {
        try {
            await cancelOffer({
                offerId: offer.id,
                cancellationReason: data.cancellationReason.trim(),
            })
            form.reset()
            onOpenChange(false)
            toast({
                title: 'Hủy offer thành công',
                description: 'Ứng viên sẽ nhận được email thông báo.',
            })
        } catch (error) {
            console.error(error)
            toast({
                title: 'Hủy offer thất bại',
                description: 'Đã xảy ra lỗi. Vui lòng thử lại.',
                variant: 'destructive',
            })
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!isMutating) {
            if (!open) form.reset()
            onOpenChange(open)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Hủy offer — {offer.offerCode}</DialogTitle>
                </DialogHeader>

                <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Cảnh báo</AlertTitle>
                    <AlertDescription className="text-sm mt-1">
                        Hành động này sẽ hủy offer và thông báo cho ứng viên qua email.
                        {offer.status === 'Accepted' && (
                            <p className="mt-2 font-bold underline underline-offset-2">
                                Xin lưu ý: Ứng viên đã chấp nhận offer này!
                            </p>
                        )}
                    </AlertDescription>
                </Alert>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="cancellationReason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lý do hủy (sẽ được gửi email cho ứng viên)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nhập lý do hủy offer..."
                                            className="resize-none min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-6 gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isMutating}
                            >
                                Đóng
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={isMutating}
                            >
                                {isMutating ? 'Đang xử lý...' : 'Xác nhận hủy'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
