'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, ArrowLeft, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { getDepartments } from '@/features/hr/api/department-service'
import { getEmployees, CreateEmployeeData } from '@/features/hr/api/employee-service'
import { useCreateEmployee, useUpdateEmployee } from '@/features/hr/hooks/use-employees'
import type { Department } from '@/features/hr/api/department-service'
import type { Employee } from '@/features/hr/api/employee-service'
import { useToast } from '@/hooks/use-toast'

const employeeSchema = z.object({
    fullName: z.string().min(1, 'Họ tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(), // Required for create, optional for update
    departmentId: z.string().min(1, 'Phòng ban là bắt buộc'),
    position: z.string().optional(),
    employmentType: z.string().default('FullTime'),
    hireDate: z.date().optional(),
    managerId: z.string().optional(),
    status: z.string().default('Active'),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

interface EmployeeFormProps {
    initialData?: Employee
    isEdit?: boolean
    onSuccess?: () => void
    onCancel?: () => void
}

export function EmployeeForm({ initialData, isEdit = false, onSuccess, onCancel }: EmployeeFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [departments, setDepartments] = useState<Department[]>([])
    const [managers, setManagers] = useState<Employee[]>([])

    const form = useForm<EmployeeFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(employeeSchema) as any,
        defaultValues: {
            fullName: initialData?.fullName || '',
            email: initialData?.email || '',
            phone: initialData?.phone || '',
            password: '',
            departmentId: initialData?.departmentId?.toString() || '',
            position: initialData?.position || '',
            employmentType: initialData?.employmentType || 'FullTime',
            hireDate: initialData?.hireDate ? new Date(initialData.hireDate) : new Date(),
            managerId: initialData?.managerId?.toString() || '',
            status: initialData?.status || 'Active',
        },
    })

    const { register, handleSubmit, formState: { errors }, setValue, watch } = form

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [deptRes, empRes] = await Promise.all([
                    getDepartments({ pageSize: 100 }),
                    getEmployees({ pageSize: 100 })
                ])
                setDepartments(deptRes.items)
                setManagers(empRes.items.filter(e => e.id !== initialData?.id))
            } catch (error) {
                console.error('Failed to load options', error)
            }
        }
        loadOptions()
    }, [initialData?.id])

    const { trigger: createEmployeeFn, isMutating: isCreating } = useCreateEmployee()
    const { trigger: updateEmployeeFn, isMutating: isUpdating } = useUpdateEmployee()

    const onSubmit = async (data: EmployeeFormValues) => {
        setIsLoading(true)
        try {
            // Validate password for create
            if (!isEdit && !data.password) {
                form.setError('password', { message: 'Mật khẩu là bắt buộc' })
                setIsLoading(false)
                return
            }

            // Clean payload - convert empty strings to undefined
            const cleanData = {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone || undefined,
                departmentId: parseInt(data.departmentId),
                position: data.position || undefined,
                employmentType: data.employmentType,
                hireDate: data.hireDate ? data.hireDate.toISOString() : undefined,
                managerId: data.managerId || undefined,
                // Only include password if provided
                ...(data.password ? { password: data.password } : {}),
            }

            if (isEdit && initialData) {
                await updateEmployeeFn({
                    id: initialData.id,
                    data: {
                        ...cleanData,
                        id: initialData.id,
                        status: data.status, // Status is allowed in update
                    }
                })
                toast({
                    title: 'Thành công',
                    description: 'Cập nhật nhân viên thành công',
                })
            } else {
                if (!cleanData.password) throw new Error("Mật khẩu là bắt buộc")
                // Explicitly cast to CreateEmployeeData to ensure we only send what's expected
                await createEmployeeFn(cleanData as CreateEmployeeData)
                toast({
                    title: 'Thành công',
                    description: 'Thêm nhân viên thành công',
                })
            }

            if (onSuccess) {
                onSuccess()
            } else {
                router.back()
            }
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Có lỗi xảy ra',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-[#0F4C75]">
                    {isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                {!isEdit && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="space-y-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                placeholder="0912345678"
                                {...register('phone')}
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Phòng ban <span className="text-red-500">*</span></Label>
                        <Select
                            onValueChange={(value) => setValue('departmentId', value)}
                            defaultValue={watch('departmentId')}
                        >
                            <SelectTrigger className={errors.departmentId ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Chọn phòng ban" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.departmentName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.departmentId && (
                            <p className="text-sm text-red-500">{errors.departmentId.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Người quản lý</Label>
                        <Select
                            onValueChange={(value) => setValue('managerId', value)}
                            defaultValue={watch('managerId')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn quản lý trực tiếp" />
                            </SelectTrigger>
                            <SelectContent>
                                {managers.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="position">Chức vụ</Label>
                        <Input
                            id="position"
                            placeholder="Ví dụ: Nhân viên kinh doanh"
                            {...register('position')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Loại hợp đồng</Label>
                        <Select
                            onValueChange={(value) => setValue('employmentType', value)}
                            defaultValue={watch('employmentType')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại hợp đồng" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FullTime">Toàn thời gian</SelectItem>
                                <SelectItem value="PartTime">Bán thời gian</SelectItem>
                                <SelectItem value="Contract">Hợp đồng</SelectItem>
                                <SelectItem value="Intern">Thực tập</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Ngày vào làm</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !watch('hireDate') && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {watch('hireDate') ? format(watch('hireDate')!, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={watch('hireDate')}
                                    onSelect={(date) => setValue('hireDate', date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {isEdit && (
                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select
                                onValueChange={(value) => setValue('status', value)}
                                defaultValue={watch('status')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Đang hoạt động</SelectItem>
                                    <SelectItem value="Inactive">Ngừng hoạt động</SelectItem>
                                    <SelectItem value="OnLeave">Nghỉ phép</SelectItem>
                                    <SelectItem value="Terminated">Đã nghỉ việc</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onCancel || (() => router.back())}>
                        Hủy
                    </Button>
                    <Button type="submit" className="bg-[#0F4C75] hover:bg-[#0F4C75]/90" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isEdit ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
