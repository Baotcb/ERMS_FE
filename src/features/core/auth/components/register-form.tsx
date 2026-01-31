/**
 * Register Form Component
 * Uses React Hook Form + Zod for validation with performance optimizations
 */

'use client'

import { useState, useCallback, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, LoadingSpinner } from '@/components/common'
import { register } from '../api/auth-service'
import { registerSchema, type RegisterFormData } from '../schemas/auth-schemas'

export const RegisterForm = memo(function RegisterForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeTerms: false,
        },
        mode: 'onChange',
    })

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev)
    }, [])

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword((prev) => !prev)
    }, [])

    const handleSubmit = useCallback(
        async (data: RegisterFormData) => {
            setError(null)
            setSuccess(null)
            setIsLoading(true)

            try {
                const response = await register({
                    email: data.email,
                    password: data.password,
                    fullName: data.fullName,
                    role: 'Candidate',
                })

                setSuccess(response.message || 'Đăng ký thành công!')

                // Redirect after short delay for UX
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Đăng ký thất bại'
                setError(errorMessage)
            } finally {
                setIsLoading(false)
            }
        },
        [router]
    )

    const handleGoogleLogin = useCallback(() => {
        setError(null)
        // Redirect to internal API route handle logic Google OAuth2.0
        window.location.href = '/api/auth/google'
    }, [])

    return (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-coral" />

            <div className="mb-8 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tạo tài khoản ERMS
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Đăng ký để truy cập các tài liệu đào tạo độc quyền.
                </p>
            </div>

            {error && <Alert type="error" message={error} className="mb-6" />}
            {success && <Alert type="success" message={success} className="mb-6" />}

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                <div>
                    <Label htmlFor="fullName" className="mb-1">
                        Họ và tên
                    </Label>
                    <Input
                        id="fullName"
                        placeholder="Nguyễn Văn A"
                        {...form.register('fullName')}
                        disabled={isLoading}
                    />
                    {form.formState.errors.fullName && (
                        <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.fullName.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="email" className="mb-1">
                        Email công việc
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="password" className="mb-1">
                            Mật khẩu
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="pr-10"
                                {...form.register('password')}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                onClick={togglePasswordVisibility}
                                disabled={isLoading}
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword" className="mb-1">
                            Xác nhận mật khẩu
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="pr-10"
                                {...form.register('confirmPassword')}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                onClick={toggleConfirmPasswordVisibility}
                                disabled={isLoading}
                                aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                {form.formState.errors.password && (
                    <p className="text-sm text-red-500 -mt-3">
                        {form.formState.errors.password.message}
                    </p>
                )}
                {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500 -mt-3">
                        {form.formState.errors.confirmPassword.message}
                    </p>
                )}

                <div className="flex items-start space-x-2">
                    <Controller
                        control={form.control}
                        name="agreeTerms"
                        render={({ field }) => (
                            <Checkbox
                                id="agreeTerms"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading}
                                className="mt-0.5"
                            />
                        )}
                    />
                    <Label
                        htmlFor="agreeTerms"
                        className="text-sm leading-relaxed cursor-pointer"
                    >
                        Tôi đồng ý với Điều khoản & Chính sách bảo mật
                    </Label>
                </div>
                {form.formState.errors.agreeTerms && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.agreeTerms.message}
                    </p>
                )}

                <Button
                    type="submit"
                    className="w-full h-12 font-bold bg-brand-coral hover:bg-brand-coral/90 text-white shadow-lg shadow-brand-coral/20"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Đang đăng ký...
                        </>
                    ) : (
                        'Đăng ký tài khoản'
                    )}
                </Button>

                <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-slate-800 text-gray-500">
                            Hoặc tiếp tục với
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                    disabled={isLoading}
                    onClick={handleGoogleLogin}
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Đăng ký với Google
                </Button>
            </form>

            <div className="mt-6 text-center border-t border-gray-100 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 mb-2">
                    Bạn là nhà tuyển dụng?{' '}
                    <Link href="/register/employer" className="text-brand-primary font-bold hover:underline">
                        Đăng ký Doanh nghiệp
                    </Link>
                </p>
                <p className="text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="text-brand-dark font-bold hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    )
})
