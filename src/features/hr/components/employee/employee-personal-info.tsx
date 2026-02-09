import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { EmployeeFormValues } from './employee-form-schema'

interface EmployeePersonalInfoProps {
    isEdit: boolean
}

export function EmployeePersonalInfo({ isEdit }: EmployeePersonalInfoProps) {
    const { register, formState: { errors } } = useFormContext<EmployeeFormValues>()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-1 h-6 bg-[#0F4C75] rounded-full" />
                <h3 className="text-lg font-semibold text-gray-800">Thông tin cá nhân & Tài khoản</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input
                        id="fullName"
                        placeholder="Nguyễn Văn A"
                        {...register('fullName')}
                        className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && (
                        <p className="text-sm text-red-500">{errors.fullName.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="employee@company.com"
                        {...register('email')}
                        className={errors.email ? 'border-red-500' : ''}
                        disabled={isEdit}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!isEdit && (
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
                        <Input
                            id="password"
                            type="password"
                            {...register('password')}
                            className={errors.password ? 'border-red-500' : ''}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                        id="phone"
                        placeholder="0912345678"
                        {...register('phone')}
                    />
                </div>
            </div>
        </div>
    )
}
