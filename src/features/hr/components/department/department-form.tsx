'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getDepartments, createDepartment, updateDepartment } from '@/features/hr/api/department-service'
import { getEmployees } from '@/features/hr/api/employee-service'
import type { Department } from '@/features/hr/api/department-service'
import type { Employee } from '@/features/hr/api/employee-service'
import { useToast } from '@/hooks/use-toast'

const departmentSchema = z.object({
    departmentName: z.string().min(1, 'Tên phòng ban là bắt buộc'),
    departmentCode: z.string().optional(),
    description: z.string().optional(),
    managerId: z.string().optional(),
    parentDepartmentId: z.string().optional(), // Select value is string, convert to number on submit
    isActive: z.boolean().default(true),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

interface DepartmentFormProps {
    initialData?: Department
    isEdit?: boolean
    onSuccess?: () => void
    onCancel?: () => void
}

export function DepartmentForm({ initialData, isEdit = false, onSuccess, onCancel }: DepartmentFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [departments, setDepartments] = useState<Department[]>([])
    const [managers, setManagers] = useState<Employee[]>([])

    const form = useForm<DepartmentFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(departmentSchema) as any,
        defaultValues: {
            departmentName: initialData?.departmentName || '',
            departmentCode: initialData?.departmentCode || '',
            description: initialData?.description || '',
            managerId: initialData?.managerId || '',
            parentDepartmentId: initialData?.parentDepartmentId?.toString() || '',
            isActive: initialData?.isActive ?? true,
        },
    })

    const { register, handleSubmit, formState: { errors }, setValue, watch } = form

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [deptRes, empRes] = await Promise.all([
                    getDepartments({ pageSize: 100 }), // Fetch all departments for parent selection
                    getEmployees({ pageSize: 100 }) // Fetch employees for manager selection
                ])
                setDepartments(deptRes.items.filter(d => d.id !== initialData?.id)) // Exclude self from parent options
                setManagers(empRes.items)
            } catch (error) {
                console.error('Failed to load options', error)
            }
        }
        loadOptions()
    }, [initialData?.id])

    const onSubmit = async (data: DepartmentFormValues) => {
        setIsLoading(true)
        try {
            const payload = {
                ...data,
                parentDepartmentId: data.parentDepartmentId ? parseInt(data.parentDepartmentId) : undefined,
                managerId: data.managerId || undefined, // Handle empty string
            }

            if (isEdit && initialData) {
                await updateDepartment(initialData.id, { ...payload, id: initialData.id })
                toast({
                    title: 'Thành công',
                    description: 'Cập nhật phòng ban thành công',
                })
            } else {
                await createDepartment(payload)
                toast({
                    title: 'Thành công',
                    description: 'Tạo phòng ban thành công',
                })
            }

            router.refresh()
            if (onSuccess) {
                onSuccess()
            } else {
                // Fallback for standalone page usage if any
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
                    {isEdit ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="departmentName">Tên phòng ban <span className="text-red-500">*</span></Label>
                        <Input
                            id="departmentName"
                            placeholder="Ví dụ: Phòng Kỹ thuật"
                            {...register('departmentName')}
                            className={errors.departmentName ? 'border-red-500' : ''}
                        />
                        {errors.departmentName && (
                            <p className="text-sm text-red-500">{errors.departmentName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="departmentCode">Mã phòng ban</Label>
                        <Input
                            id="departmentCode"
                            placeholder="Ví dụ: DEPT-01 (Tự động nếu để trống)"
                            {...register('departmentCode')}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Phòng ban cha</Label>
                        <Select
                            onValueChange={(value) => setValue('parentDepartmentId', value)}
                            defaultValue={watch('parentDepartmentId')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn phòng ban cha (nếu có)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Không có</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.departmentName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Người quản lý</Label>
                        <Select
                            onValueChange={(value) => setValue('managerId', value)}
                            defaultValue={watch('managerId')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn người quản lý" />
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

                <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                        id="description"
                        placeholder="Mô tả chức năng, nhiệm vụ..."
                        {...register('description')}
                        className="min-h-[100px]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onCancel || (() => router.back())}>
                        Hủy
                    </Button>
                    <Button type="submit" className="bg-[#0F4C75] hover:bg-[#0F4C75]/90" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isEdit ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
