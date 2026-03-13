'use client'

import { useState, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useConfirmHire } from '../../hooks/use-offers'

interface ConfirmHireDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    applicationId: string
    candidateName: string
    position: string
}

export function ConfirmHireDialog({
    open,
    onOpenChange,
    applicationId,
    candidateName,
    position,
}: ConfirmHireDialogProps) {
    const [email, setEmail] = useState('')
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [result, setResult] = useState<{
        employeeCode: string
        employeeEmail: string
    } | null>(null)
    const { trigger, isMutating } = useConfirmHire()

    const handleSubmit = useCallback(async () => {
        if (!email.trim()) return
        setErrorMsg(null)
        try {
            const res = await trigger({
                applicationId,
                employeeEmail: email.trim(),
            })
            if (!res) {
                setErrorMsg('Không nhận được phản hồi từ server. Vui lòng thử lại.')
                return
            }
            setResult({
                employeeCode: res.employeeCode,
                employeeEmail: res.employeeEmail,
            })
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.'
            setErrorMsg(message)
        }
    }, [trigger, applicationId, email])

    const handleClose = useCallback(() => {
        onOpenChange(false)
        // Reset sau khi đóng để lần mở tiếp sạch
        setTimeout(() => {
            setEmail('')
            setErrorMsg(null)
            setResult(null)
        }, 200)
    }, [onOpenChange])

    const initials = candidateName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0">
                <DialogHeader className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-lg bg-emerald-100 text-emerald-700">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold">
                                Xác nhận tuyển dụng
                            </DialogTitle>
                            <DialogDescription className="text-sm mt-0.5">
                                Tạo tài khoản nhân viên mới
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6">
                    {!result ? (
                        <div className="flex flex-col gap-5">
                            {/* Candidate info */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="size-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                                    <span className="text-white text-lg font-bold">{initials}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 text-base font-bold truncate">{candidateName}</p>
                                    <p className="text-slate-500 text-sm truncate">{position}</p>
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                                    Đã chấp nhận
                                </span>
                            </div>

                            {/* Error message */}
                            {errorMsg && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-red-700">{errorMsg}</p>
                                </div>
                            )}

                            {/* Email input */}
                            <div className="flex flex-col gap-2">
                                <Label>
                                    Email công ty cho nhân viên mới{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="email"
                                    placeholder="nhanvien@congty.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <p className="text-xs text-slate-400">
                                    Email này sẽ được dùng làm tài khoản đăng nhập hệ thống. Mật khẩu tạm sẽ được gửi qua email cá nhân ứng viên.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Success state */
                        <div className="flex flex-col items-center text-center gap-4 py-4">
                            <div className="size-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Tuyển dụng thành công!
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Tài khoản nhân viên đã được tạo và thông tin đăng nhập đã gửi qua email.
                                </p>
                            </div>
                            <div className="w-full bg-slate-50 rounded-lg p-4 text-left space-y-2">
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-semibold">Mã nhân viên</span>
                                    <p className="text-slate-900 font-mono font-bold">{result.employeeCode}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 uppercase font-semibold">Email công ty</span>
                                    <p className="text-slate-900 font-medium">{result.employeeEmail}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t border-slate-100">
                    {!result ? (
                        <>
                            <Button variant="ghost" onClick={handleClose} disabled={isMutating}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isMutating || !email.trim()}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                                {isMutating ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <UserCheck className="w-4 h-4 mr-2" />
                                )}
                                Xác nhận tuyển
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full">
                            Đóng
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
