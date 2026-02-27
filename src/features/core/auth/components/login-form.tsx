/**
 * Login Form Component
 * Uses React Hook Form + Zod for validation with performance optimizations
 */

'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, LoadingSpinner } from '@/components/common'
import { loginSchema } from '../schemas/auth-schemas'
import { loginAction } from '../actions/auth'

import type { LoginFormData } from '../schemas/auth-schemas'
import { useAuth } from '../hooks/use-auth'

export function LoginForm() {
    const router = useRouter()
    const { login: authLogin } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: true,
        },
    })

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev)
    }, [])

    const handleGoogleLogin = useCallback(() => {
        setError(null)
        // Redirect to internal API route handle logic Google OAuth2.0
        window.location.href = '/api/auth/google'
    }, [])

    const handleSubmit = useCallback(
        async (data: LoginFormData) => {
            setError(null)
            setSuccess(null)
            setIsLoading(true)

            try {
                // Call Server Action
                const result = await loginAction(data)

                if (!result.success || !result.user) {
                    throw new Error(result.error || 'Đăng nhập thất bại')
                }

                const { user } = result

                // Update global auth state (client store)
                // Note: The token is now HttpOnly cookie, so we don't pass it to the store's "token" field 
                // OR we pass a dummy/flag, because the store might expect a token string for API calls.
                // WE NEED TO UPDATE AUTH STORE TO NOT REQUIRE TOKEN STRING OR HANDLE COOKIE-BASED AUTH.
                // For now, we update the user info.
                authLogin('COOKIE_AUTH', {
                    id: user.id || 'unknown',
                    email: user.email || data.email,
                    fullName: user.fullName,
                    role: user.role
                })

                setSuccess('Đăng nhập thành công! Đang chuyển hướng...')

                // Redirect after short delay for UX
                setTimeout(() => {
                    router.push('/')
                    router.refresh()
                }, 500)
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Đăng nhập thất bại'
                setError(errorMessage)
            } finally {
                setIsLoading(false)
            }
        },
        [router, authLogin]
    )

    const onSubmit = useCallback(async (data: LoginFormData) => {
        await handleSubmit(data)
    }, [handleSubmit])

    return (
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            {/* Headers are fine */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-lg bg-brand-dark shadow-lg flex items-center justify-center text-white">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold text-brand-dark dark:text-white tracking-tight">
                            ERMS
                        </span>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            Tuyển dụng & Đào tạo
                        </span>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Chào mừng trở lại
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Vui lòng nhập thông tin để truy cập tài khoản của bạn.
                </p>
            </div>

            {error && <Alert type="error" message={error} className="mb-6" />}
            {success && <Alert type="success" message={success} className="mb-6" />}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Inputs exist ... */}
                <div>
                    <Label htmlFor="email" className="mb-2">
                        Email hoặc Tên đăng nhập
                    </Label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            {...form.register('email')}
                            className="pl-10"
                            disabled={isLoading}
                            aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                        />
                    </div>
                    {form.formState.errors.email && (
                        <p id="email-error" className="text-sm text-red-500 mt-1" role="alert">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="password" className="mb-2">
                        Mật khẩu
                    </Label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock className="h-5 w-5" />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="•••••••"
                            {...form.register('password')}
                            className="pl-10"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 transition-colors"
                            onClick={togglePasswordVisibility}
                            disabled={isLoading}
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {form.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.password.message}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                    </div>
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-brand-dark hover:text-brand-primary transition-colors"
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold bg-brand-dark hover:bg-brand-dark/90 text-white"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Đang đăng nhập...
                        </>
                    ) : (
                        'Đăng nhập vào ERMS'
                    )}
                </Button>

                <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-slate-800 text-gray-500">
                            Hoặc
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-bold"
                    disabled={isLoading}
                    onClick={handleGoogleLogin}
                >
                    Đăng nhập với Google
                </Button>
            </form>

            <div className="mt-8">
                <p className="text-center text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-brand-coral font-bold hover:underline">
                        Đăng ký tài khoản mới →
                    </Link>
                </p>
            </div>
        </div>
    )
}
