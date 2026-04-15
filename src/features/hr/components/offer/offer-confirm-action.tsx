import { CheckCircle, XCircle, Briefcase, Calendar, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import type { OfferPublicInfo } from '@/features/hr/types/offer-types'

interface OfferConfirmActionProps {
    isAccept: boolean
    onConfirm: () => void
    offerData: OfferPublicInfo | null
}

export function OfferConfirmAction({ isAccept, onConfirm, offerData }: OfferConfirmActionProps) {
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
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {isAccept
                    ? 'Bạn sắp chấp nhận đề nghị công việc này. Hành động này không thể hoàn tác.'
                    : 'Bạn sắp từ chối đề nghị công việc này. Hành động này không thể hoàn tác.'}
            </p>
            
            {offerData && (
                <div className="bg-slate-50 rounded-xl p-5 mb-8 text-left border border-slate-100 flex flex-col gap-3">
                    <p className="font-semibold text-slate-800 text-lg border-b pb-2 mb-1">{offerData.position}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span>
                            {offerData.salary.toLocaleString('vi-VN')} VNĐ / {offerData.salaryFrequency === 'Monthly' ? 'tháng' : 'năm'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span>Phòng ban: {offerData.departmentName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Bắt đầu từ: {format(new Date(offerData.startDate), 'dd/MM/yyyy')}</span>
                    </div>
                </div>
            )}
            
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
