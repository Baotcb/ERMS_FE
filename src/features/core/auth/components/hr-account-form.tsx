'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, LoadingSpinner } from '@/components/common'
import { createHRAccountSchema, type CreateHRAccountData } from '../schemas/auth-schemas'
import { createHRAccount } from '../api/auth-service'

function HRAccountFormContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const enterpriseId = searchParams.get('enterpriseId')

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const form = useForm<CreateHRAccountData>({
        resolver: zodResolver(createHRAccountSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
        },
    })

    if (!enterpriseId) {
        return <Alert type="error" message="Missing Enterprise ID. Please start from step 1." />
    }

    const onSubmit = async (data: CreateHRAccountData) => {
        setIsLoading(true)
        setError(null)
        try {
            await createHRAccount({ ...data, enterpriseId })
            // Redirect to verify email page with email as query param
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Tạo tài khoản thất bại')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tạo tài khoản HR</h1>
                <p className="text-gray-500 dark:text-gray-400">Bước 2: Thiết lập tài khoản quản trị</p>
            </div>

            {error && <Alert type="error" message={error} className="mb-6" />}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input id="fullName" placeholder="Nguyễn Văn A" className="pl-9" {...form.register('fullName')} disabled={isLoading} />
                        </div>
                        {form.formState.errors.fullName && (
                            <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email đăng nhập</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input id="email" type="email" placeholder="hr@company.com" className="pl-9" {...form.register('email')} disabled={isLoading} />
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại cá nhân (Tùy chọn)</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input id="phone" placeholder="090..." className="pl-9" {...form.register('phone')} disabled={isLoading} />
                        </div>
                        {form.formState.errors.phone && (
                            <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="pl-9 pr-10"
                                    {...form.register('password')}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirm ? 'text' : 'password'}
                                    className="pl-9 pr-10"
                                    {...form.register('confirmPassword')}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {form.formState.errors.confirmPassword && (
                                <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={isLoading}>
                    {isLoading ? <LoadingSpinner className="mr-2" size="sm" /> : 'Hoàn tất Đăng ký'}
                </Button>
            </form>
        </div>
    )
}
export function HRAccountForm() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <HRAccountFormContent />
        </Suspense>
    )
}
