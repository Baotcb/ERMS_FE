/**
 * Login Form Component
 * Uses React Hook Form + Zod for validation with performance optimizations
 */

'use client'

import { useState, useCallback, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, LoadingSpinner } from '@/components/common'
import { login } from '../api/auth-service'
import { loginSchema } from '../schemas/auth-schemas'
import { parseJwt } from '@/utils/jwt'
import { config } from '@/config'
import { getProfile } from '@/features/core/user-profile/api/profile-service'

import type { LoginFormData } from '../schemas/auth-schemas'
import { useAuth } from '../hooks/use-auth'
import { User } from '@/stores/auth-store'

export const LoginForm = memo(function LoginForm() {
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
            rememberMe: false,
        },
    })

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev)
    }, [])

    const handleGoogleLogin = useCallback(() => {
        setError(null)
        // Redirect to backend OAuth flow
        const backendUrl = config.apiUrl || window.location.origin
        window.location.href = `${backendUrl}/api/Auth/google-login-redirect`
    }, [])

    const handleSubmit = useCallback(
        async (data: LoginFormData) => {
            setError(null)
            setSuccess(null)
            setIsLoading(true)

            try {
                const response = await login({
                    email: data.email,
                    password: data.password,
                })

                // Parse token to get user role and info
                const decodedToken = parseJwt(response.token)
                const role = String(decodedToken?.role || decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '')
                const userId = String(decodedToken?.nameid || decodedToken?.sub || 'unknown')

                // Fetch full profile to get correct display name
                let fullName = data.email.split('@')[0];
                try {
                    const profile = await getProfile(response.token);
                    if (profile && profile.fullName) {
                        fullName = profile.fullName;
                    }
                } catch (e) {
                    console.error('Failed to fetch profile on login', e);
                }

                // Construct user object
                const user: User = {
                    id: userId,
                    email: data.email,
                    fullName: fullName,
                    role: role || undefined
                }

                // Update global auth state
                authLogin(response.token, user, data.rememberMe)

                // Set cookies for middleware authentication and SSR
                const maxAge = data.rememberMe ? 7 * 24 * 60 * 60 : undefined // 7 days if remember me
                document.cookie = `auth_token=${response.token}; path=/; ${maxAge ? `max-age=${maxAge};` : ''} SameSite=Lax`
                document.cookie = `user_role=${role}; path=/; ${maxAge ? `max-age=${maxAge};` : ''} SameSite=Lax`
                document.cookie = `user_name=${encodeURIComponent(fullName)}; path=/; ${maxAge ? `max-age=${maxAge};` : ''} SameSite=Lax`

                setSuccess('Đăng nhập thành công! Đang chuyển hướng...')

                // Redirect after short delay for UX
                setTimeout(() => {
                    if (role === 'Candidate') {
                        router.push('/candidate/jobs')
                    } else {
                        // Redirect HR/Managers to the new HR dashboard (Offers page)
                        router.push('/offers')
                    }
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

    return (
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
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

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div>
                    <Label htmlFor="email" className="mb-2">
                        Email hoặc Tên đăng nhập
                    </Label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail className="h-5 w-5" />
                        </div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            {...form.register('email')}
                            className="pl-10"
                            disabled={isLoading}
                        />
                    </div>
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1">
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
                            className="pl-10 pr-10"
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
                        <input
                            id="remember-me"
                            type="checkbox"
                            {...form.register('rememberMe')}
                            disabled={isLoading}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="remember-me" className="text-sm cursor-pointer">
                            Ghi nhớ đăng nhập
                        </Label>
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
})
