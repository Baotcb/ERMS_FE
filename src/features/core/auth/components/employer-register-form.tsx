/**
 * Employer Register Form Component
 * Form for enterprise registration with business fields
 */

'use client'

import { useState, useCallback, memo } from 'react'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Building2, User, Phone, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, LoadingSpinner } from '@/components/common'
import { employerRegisterSchema, type EmployerRegisterFormData } from '../schemas/auth-schemas'

export const EmployerRegisterForm = memo(function EmployerRegisterForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)

    const form = useForm<EmployerRegisterFormData>({
        resolver: zodResolver(employerRegisterSchema),
        defaultValues: {
            companyName: '',
            taxCode: '',
            contactName: '',
            phone: '',
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
        async (data: EmployerRegisterFormData) => {
            setSuccess(null)
            setIsLoading(true)

            // Mock submission
            setTimeout(() => {
                setSuccess('Đăng ký doanh nghiệp thành công! Vui lòng kiểm tra email để xác thực.')
                setIsLoading(false)
                // In production: Redirect to login or verification page
            }, 1500)
        },
        []
    )

    return (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-coral" />

            <div className="mb-6 text-center lg:text-left">
                <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-6 h-6 text-brand-primary" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Đăng ký Doanh nghiệp
                    </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tìm kiếm nhân tài và xây dựng đội ngũ xuất sắc cùng ERMS.
                </p>
            </div>

            {success && <Alert type="success" message={success} className="mb-6" />}

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="companyName">Tên Doanh nghiệp</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="companyName"
                                    placeholder="Công ty TNHH..."
                                    className="pl-9"
                                    {...form.register('companyName')}
                                    disabled={isLoading}
                                />
                            </div>
                            {form.formState.errors.companyName && (
                                <p className="text-sm text-red-500 mt-1">{form.formState.errors.companyName.message}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="taxCode">Mã số thuế</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="taxCode"
                                    placeholder="0123456789"
                                    className="pl-9"
                                    {...form.register('taxCode')}
                                    disabled={isLoading}
                                />
                            </div>
                            {form.formState.errors.taxCode && (
                                <p className="text-sm text-red-500 mt-1">{form.formState.errors.taxCode.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="contactName">Người liên hệ</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="contactName"
                                    placeholder="Họ và tên"
                                    className="pl-9"
                                    {...form.register('contactName')}
                                    disabled={isLoading}
                                />
                            </div>
                            {form.formState.errors.contactName && (
                                <p className="text-sm text-red-500 mt-1">{form.formState.errors.contactName.message}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="phone"
                                    placeholder="0901234567"
                                    className="pl-9"
                                    {...form.register('phone')}
                                    disabled={isLoading}
                                />
                            </div>
                            {form.formState.errors.phone && (
                                <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="email" className="mb-1">Email công việc</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="hr@company.com"
                            {...form.register('email')}
                            disabled={isLoading}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="password">Mật khẩu</Label>
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
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
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
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {form.formState.errors.confirmPassword && (
                                <p className="text-sm text-red-500 mt-1">{form.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>
                </div>

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
                    <Label htmlFor="agreeTerms" className="text-sm leading-relaxed cursor-pointer">
                        Tôi đồng ý với Điều khoản & Chính sách bảo mật dành cho Doanh nghiệp
                    </Label>
                </div>
                {form.formState.errors.agreeTerms && (
                    <p className="text-sm text-red-500">{form.formState.errors.agreeTerms.message}</p>
                )}

                <Button
                    type="submit"
                    className="w-full h-12 font-bold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Đang xử lý...
                        </>
                    ) : (
                        'Đăng ký Doanh nghiệp'
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center border-t border-gray-100 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 mb-2">
                    Bạn là ứng viên tìm việc?{' '}
                    <Link href="/register" className="text-brand-coral font-bold hover:underline">
                        Đăng ký Ứng viên
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
