import { CheckCircle, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface OfferConfirmActionProps {
    isAccept: boolean
    onConfirm: () => void
}

export function OfferConfirmAction({ isAccept, onConfirm }: OfferConfirmActionProps) {
    return (
        <>
            <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
                    isAccept ? 'bg-green-100' : 'bg-red-50'
                }`}
            >
                {isAccept ? (
                    <CheckCircle className="w-11 h-11 text-green-500" />
                ) : (
                    <XCircle className="w-11 h-11 text-red-400" />
                )}
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
                {isAccept ? 'Xác nhận chấp nhận offer?' : 'Xác nhận từ chối offer?'}
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                {isAccept
                    ? 'Bạn sắp chấp nhận đề nghị công việc này. Hành động này không thể hoàn tác.'
                    : 'Bạn sắp từ chối đề nghị công việc này. Hành động này không thể hoàn tác.'}
            </p>
            <div className="flex gap-3 justify-center">
                <Button
                    variant="outline"
                    onClick={() => window.close()}
                    className="min-w-[100px]"
                >
                    Hủy
                </Button>
                <Button
                    onClick={onConfirm}
                    className={`min-w-[140px] ${
                        isAccept ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
                    } text-white`}
                >
                    {isAccept ? 'Chấp nhận' : 'Từ chối'}
                </Button>
            </div>
        </>
    )
}
