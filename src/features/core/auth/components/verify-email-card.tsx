'use client'

import { useEffect, useReducer, useRef, useCallback, memo } from 'react'
import Link from 'next/link'
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, LoadingSpinner } from '@/components/common'
import { resendConfirmation } from '../api/auth-service'

interface VerifyEmailCardProps {
    email: string | null
}

type SendState = { isResending: boolean; resendSuccess: boolean; error: string | null }
type SendAction =
    | { type: 'start' }
    | { type: 'success' }
    | { type: 'error'; message: string }
    | { type: 'done' }

function sendReducer(state: SendState, action: SendAction): SendState {
    switch (action.type) {
        case 'start': return { isResending: true, resendSuccess: false, error: null }
        case 'success': return { ...state, resendSuccess: true }
        case 'error': return { ...state, error: action.message }
        case 'done': return { ...state, isResending: false }
    }
}

export const VerifyEmailCard = memo(function VerifyEmailCard({ email }: VerifyEmailCardProps) {
    const [{ isResending, resendSuccess, error }, dispatch] = useReducer(sendReducer, {
        isResending: false,
        resendSuccess: false,
        error: null,
    })
    const autoSentRef = useRef(false)

    // Auto-send verification email on first mount
    useEffect(() => {
        if (email && !autoSentRef.current) {
            autoSentRef.current = true
            dispatch({ type: 'start' })
            resendConfirmation(email)
                .then(() => dispatch({ type: 'success' }))
                .catch((err) => dispatch({ type: 'error', message: err instanceof Error ? err.message : 'Gửi email xác thực thất bại' }))
                .finally(() => dispatch({ type: 'done' }))
        }
    }, [email])

    const handleResend = useCallback(async () => {
        if (!email) return
        dispatch({ type: 'start' })
        try {
            await resendConfirmation(email)
            dispatch({ type: 'success' })
        } catch (err) {
            dispatch({ type: 'error', message: err instanceof Error ? err.message : 'Gửi lại email thất bại' })
        } finally {
            dispatch({ type: 'done' })
        }
    }, [email])

    // Mask email for display (e.g., h***@gmail.com)
    const maskedEmail = email
        ? email.replace(/^(.{1,2})(.*)(@.*)$/, (_, start, middle, end) =>
            start + '*'.repeat(Math.min(middle.length, 5)) + end)
        : null

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden text-center">
                {/* Accent bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-coral" />

                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-brand-secondary/30 rounded-full flex items-center justify-center">
                    <Mail className="w-10 h-10 text-brand-primary" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Kiểm tra Email của bạn
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Chúng tôi đã gửi email xác thực đến:
                </p>

                <p className="text-brand-primary font-semibold mb-6">
                    {maskedEmail || 'Email đã đăng ký'}
                </p>

                {/* Instructions */}
                <div className="bg-brand-light dark:bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">
                        Hướng dẫn:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Mở hộp thư email của bạn</li>
                        <li>• Tìm email từ <strong className="text-brand-primary">ERMS System</strong></li>
                        <li>• Click vào nút &quot;Xác thực ngay&quot;</li>
                        <li>• Kiểm tra thư mục Spam nếu không thấy</li>
                    </ul>
                </div>

                {/* Error alert */}
                {error && <Alert type="error" message={error} className="mb-4" />}

                {/* Resend button */}
                {resendSuccess ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 py-2 mb-4">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Email đã được gửi lại!</span>
                    </div>
                ) : (
                    email && (
                        <Button
                            variant="outline"
                            className="w-full mb-4 cursor-pointer hover:border-brand-primary hover:text-brand-primary transition-colors"
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
                    )
                )}

                {/* Back to login */}
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-brand-primary transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Quay lại đăng nhập
                </Link>
            </div>
        </div>
    )
})
