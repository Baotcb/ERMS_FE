'use client'

import { useState, useCallback, memo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, RefreshCw, ArrowRight, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common'
import { resendConfirmation } from '../api/auth-service'

type ConfirmStatus = 'success' | 'error' | 'invalid'

interface ConfirmEmailCardProps {
    status: ConfirmStatus
    message: string
    email?: string
}

const RESEND_COOLDOWN_MS = 15_000

export const ConfirmEmailCard = memo(function ConfirmEmailCard({ status, message, email }: ConfirmEmailCardProps) {
    const router = useRouter()
    const [isResending, setIsResending] = useState(false)
    const [resendMessage, setResendMessage] = useState<string | null>(null)
    const inFlightRef = useRef(false)
    const lastRequestedAtRef = useRef(0)

    const handleResend = useCallback(async () => {
        if (!email || inFlightRef.current) return

        const now = Date.now()
        if (now - lastRequestedAtRef.current < RESEND_COOLDOWN_MS) {
            setResendMessage('Vui lòng chờ ít giây trước khi gửi lại email xác thực.')
            return
        }

        inFlightRef.current = true
        lastRequestedAtRef.current = now
        setIsResending(true)
        setResendMessage(null)

        try {
            await resendConfirmation(email)
            setResendMessage('Email xác thực mới đã được gửi!')
        } catch (err) {
            setResendMessage(err instanceof Error ? err.message : 'Gửi lại email thất bại')
        } finally {
            inFlightRef.current = false
            setIsResending(false)
        }
    }, [email])

    const handleGoToLogin = useCallback(() => {
        router.push('/login')
    }, [router])

    const getStatusConfig = () => {
        switch (status) {
            case 'success':
                return {
                    icon: CheckCircle,
                    iconColor: 'text-green-500',
                    bgColor: 'bg-green-100 dark:bg-green-900/30',
                    barColor: 'bg-gradient-to-r from-green-400 to-emerald-500',
                    titleColor: 'text-green-600',
                    title: 'Xác thực thành công!',
                }
            case 'invalid':
                return {
                    icon: AlertTriangle,
                    iconColor: 'text-amber-500',
                    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
                    barColor: 'bg-gradient-to-r from-amber-400 to-orange-500',
                    titleColor: 'text-amber-600',
                    title: 'Link không hợp lệ',
                }
            default:
                return {
                    icon: XCircle,
                    iconColor: 'text-red-500',
                    bgColor: 'bg-red-100 dark:bg-red-900/30',
                    barColor: 'bg-gradient-to-r from-red-400 to-rose-500',
                    titleColor: 'text-red-600',
                    title: 'Xác thực thất bại',
                }
        }
    }

    const config = getStatusConfig()
    const IconComponent = config.icon

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden text-center">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${config.barColor}`} />

                <div className={`w-20 h-20 mx-auto mb-6 ${config.bgColor} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-10 h-10 ${config.iconColor}`} />
                </div>

                <h1 className={`text-2xl font-bold mb-3 ${config.titleColor}`}>
                    {config.title}
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {message}
                </p>

                {resendMessage && (
                    <p className={`text-sm mb-4 ${resendMessage.includes('thất bại') ? 'text-red-500' : 'text-green-600'}`}>
                        {resendMessage}
                    </p>
                )}

                {status === 'success' ? (
                    <Button
                        className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold cursor-pointer transition-colors"
                        onClick={handleGoToLogin}
                    >
                        Đăng nhập ngay
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <div className="space-y-3">
                        {email && (
                            <Button
                                variant="outline"
                                className="w-full cursor-pointer hover:border-brand-primary hover:text-brand-primary transition-colors"
                                onClick={handleResend}
                                disabled={isResending}
                            >
                                {isResending ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Gửi lại email xác thực
                                    </>
                                )}
                            </Button>
                        )}
                        <Link
                            href="/login"
                            className="block text-sm text-gray-500 hover:text-brand-primary transition-colors cursor-pointer"
                        >
                            Quay lại đăng nhập
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
})
