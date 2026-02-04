'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, MapPin, Globe, Phone, Mail, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, LoadingSpinner, ImageUpload } from '@/components/common'
import { registerEnterpriseSchema, type RegisterEnterpriseData } from '../schemas/auth-schemas'
import { registerEnterprise } from '../api/auth-service'

export function EnterpriseRegisterForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<RegisterEnterpriseData>({
        resolver: zodResolver(registerEnterpriseSchema),
        defaultValues: {
            enterpriseName: '',
            taxCode: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            logoUrl: '',
        },
    })

    const onSubmit = async (data: RegisterEnterpriseData) => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await registerEnterprise(data)
            router.push(`/register/hr?enterpriseId=${result.enterpriseId}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đăng ký thất bại')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-coral" />

            <div className="mb-8 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Thông tin Doanh nghiệp
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Bước 1: Thiết lập hồ sơ công ty để bắt đầu tuyển dụng.
                </p>
            </div>

            {error && <Alert type="error" message={error} className="mb-6" />}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-5">
                    {/* Enterprise Name */}
                    <div className="space-y-2">
                        <Label htmlFor="enterpriseName">Tên doanh nghiệp <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input id="enterpriseName" placeholder="Công ty Cổ phần..." className="pl-9" {...form.register('enterpriseName')} disabled={isLoading} />
                        </div>
                        {form.formState.errors.enterpriseName && (
                            <p className="text-sm text-red-500">{form.formState.errors.enterpriseName.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tax Code */}
                        <div className="space-y-2">
                            <Label htmlFor="taxCode">Mã số thuế</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input id="taxCode" placeholder="0101234567" className="pl-9" {...form.register('taxCode')} disabled={isLoading} />
                            </div>
                            {form.formState.errors.taxCode && (
                                <p className="text-sm text-red-500">{form.formState.errors.taxCode.message}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input id="phone" placeholder="024 1234 5678" className="pl-9" {...form.register('phone')} disabled={isLoading} />
                            </div>
                            {form.formState.errors.phone && (
                                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email công ty</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input id="email" type="email" placeholder="contact@company.com" className="pl-9" {...form.register('email')} disabled={isLoading} />
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Địa chỉ trụ sở</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input id="address" placeholder="Tầng 1, Tòa nhà X, ..." className="pl-9" {...form.register('address')} disabled={isLoading} />
                        </div>
                        {form.formState.errors.address && (
                            <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
                        )}
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input id="website" placeholder="https://company.com" className="pl-9" {...form.register('website')} disabled={isLoading} />
                        </div>
                        {form.formState.errors.website && (
                            <p className="text-sm text-red-500">{form.formState.errors.website.message}</p>
                        )}
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-2">
                        <Label>Logo doanh nghiệp</Label>
                        <ImageUpload
                            onUploadComplete={(url) => form.setValue('logoUrl', url)}
                            defaultImage={form.getValues('logoUrl')}
                            disabled={isLoading}
                        />
                        {form.formState.errors.logoUrl && (
                            <p className="text-sm text-red-500">{form.formState.errors.logoUrl.message}</p>
                        )}
                    </div>
                </div>

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
                        'Tiếp tục: Tạo tài khoản HR'
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center border-t border-gray-100 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 mb-2">
                    Bạn là ứng viên?{' '}
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
}
