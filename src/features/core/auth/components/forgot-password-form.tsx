/**
 * Forgot Password Form Component
 * Uses React Hook Form + Zod for validation
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, LoadingSpinner } from '@/components/common'
import { forgotPassword } from '../api/auth-service'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas/auth-schemas'

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
        mode: 'onChange',
    })

    const handleSubmit = async (data: ForgotPasswordFormData) => {
        setError(null)
        setSuccess(null)
        setIsLoading(true)

        try {
            const response = await forgotPassword({
                email: data.email,
            })

            setSuccess(response.message || 'Vui lòng kiểm tra email để đặt lại mật khẩu')
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Không thể gửi email'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-dark to-brand-coral" />

                <div className="mb-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-light flex items-center justify-center">
                        <svg className="w-8 h-8 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-black dark:text-white">Quên mật khẩu ERMS</h1>
                    <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                        Đừng lo lắng, điều này đôi khi xảy ra. Vui lòng nhập địa chỉ email liên kết với tài khoản của bạn.
                    </p>
                </div>

                {error && <Alert type="error" message={error} className="mb-4" />}
                {success && <Alert type="success" message={success} className="mb-4" />}

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="email" className="mb-1">
                            Địa chỉ email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            {...form.register('email')}
                            disabled={isLoading}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full font-bold bg-brand-dark hover:bg-brand-dark/90 text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Đang gửi...
                            </>
                        ) : (
                            'Gửi yêu cầu'
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="text-sm text-gray-500 hover:text-primary"
                    >
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    )
}
