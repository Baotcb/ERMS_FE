'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { respondOfferByToken } from '@/features/hr/api/offer-service'

type Status = 'confirm' | 'loading' | 'accepted' | 'rejected' | 'error'

export default function OfferResponsePage() {
    const params = useParams<{ token: string }>()
    const searchParams = useSearchParams()
    const action = searchParams.get('action') as 'accept' | 'reject' | null
    const [status, setStatus] = useState<Status>('confirm')
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const isAccept = action === 'accept'
    const isValidAction = action === 'accept' || action === 'reject'

    const handleConfirm = async () => {
        const token = params.token
        if (!token || !isValidAction) {
            setStatus('error')
            return
        }
        setStatus('loading')
        try {
            await respondOfferByToken(token, action)
            setStatus(isAccept ? 'accepted' : 'rejected')
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : null)
            setStatus('error')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 max-w-md w-full text-center">
                {/* Step 1: Confirmation screen */}
                {status === 'confirm' && isValidAction && (
                    <>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${isAccept ? 'bg-green-100' : 'bg-red-50'}`}>
                            {isAccept
                                ? <CheckCircle className="w-11 h-11 text-green-500" />
                                : <XCircle className="w-11 h-11 text-red-400" />}
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
                                onClick={handleConfirm}
                                className={`min-w-[140px] ${isAccept ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                            >
                                {isAccept ? '✅ Chấp nhận' : '❌ Từ chối'}
                            </Button>
                        </div>
                    </>
                )}

                {/* Invalid action */}
                {status === 'confirm' && !isValidAction && (
                    <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <AlertCircle className="w-11 h-11 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Liên kết không hợp lệ</h1>
                        <p className="text-slate-500 text-sm">Liên kết này không đúng định dạng. Vui lòng kiểm tra lại email.</p>
                    </>
                )}

                {/* Loading */}
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-14 h-14 text-slate-400 animate-spin mx-auto mb-5" />
                        <h1 className="text-xl font-semibold text-slate-700">Đang xử lý phản hồi...</h1>
                        <p className="text-slate-500 mt-2 text-sm">Vui lòng chờ trong giây lát.</p>
                    </>
                )}

                {/* Accepted */}
                {status === 'accepted' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle className="w-11 h-11 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Bạn đã chấp nhận offer!</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Chúc mừng! Chúng tôi rất vui được chào đón bạn. Nhà tuyển dụng sẽ liên hệ với bạn sớm để thực hiện các bước tiếp theo.
                        </p>
                    </>
                )}

                {/* Rejected */}
                {status === 'rejected' && (
                    <>
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <XCircle className="w-11 h-11 text-slate-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Bạn đã từ chối offer.</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Cảm ơn bạn đã phản hồi. Chúc bạn tìm được cơ hội phù hợp hơn trong tương lai.
                        </p>
                    </>
                )}

                {/* Error */}
                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <AlertCircle className="w-11 h-11 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Không thể xử lý yêu cầu.</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {errorMsg ?? 'Liên kết đã hết hạn, không hợp lệ hoặc đã được sử dụng. Vui lòng liên hệ nhà tuyển dụng nếu cần hỗ trợ.'}
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}


    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-14 h-14 text-slate-400 animate-spin mx-auto mb-5" />
                        <h1 className="text-xl font-semibold text-slate-700">Đang xử lý phản hồi...</h1>
                        <p className="text-slate-500 mt-2 text-sm">Vui lòng chờ trong giây lát.</p>
                    </>
                )}

                {status === 'accepted' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <CheckCircle className="w-11 h-11 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">{MESSAGES.accepted.title}</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">{MESSAGES.accepted.body}</p>
                    </>
                )}

                {status === 'rejected' && (
                    <>
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <XCircle className="w-11 h-11 text-slate-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">{MESSAGES.rejected.title}</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">{MESSAGES.rejected.body}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <AlertCircle className="w-11 h-11 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">{MESSAGES.error.title}</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {errorMsg ?? MESSAGES.error.body}
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
