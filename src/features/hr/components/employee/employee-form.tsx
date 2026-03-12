'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDepartments, type Department } from '@/features/hr/api/department-service'
import {
    type CreateEmployeeData,
    type Employee,
    type UpdateEmployeeData,
} from '@/features/hr/api/employee-service'
import { useCreateEmployee, useUpdateEmployee } from '@/features/hr/hooks/use-employees'
import { useToast } from '@/hooks/use-toast'
import { createEmployeeSchema, updateEmployeeSchema, type EmployeeFormValues } from './employee-form-schema'
import { EmployeePersonalInfo } from './employee-personal-info'
import { EmployeeJobInfo } from './employee-job-info'

interface EmployeeFormProps {
    initialData?: Employee
    isEdit?: boolean
    onSuccess?: () => void
    onCancel?: () => void
}

const managedRoles = ['Employee', 'Trainer', 'DepartmentHead', 'Director'] as const

function getManagedRole(roles?: string[]): EmployeeFormValues['role'] {
    const matched = roles?.find((role) => managedRoles.includes(role as (typeof managedRoles)[number]))
    return (matched as EmployeeFormValues['role']) || ''
}

function createDefaultValues(initialData?: Employee, isEdit: boolean = false): EmployeeFormValues {
    const existingRole = getManagedRole(initialData?.roles)

    return {
        fullName: initialData?.fullName || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        password: '',
        departmentId: initialData?.departmentId?.toString() || '',
        position: initialData?.position || '',
        employmentType: initialData?.employmentType || 'FullTime',
        hireDate: initialData?.hireDate ? new Date(initialData.hireDate) : new Date(),
        status: initialData?.status || 'Active',
        role: isEdit ? existingRole : 'Employee',
    }
}

export function EmployeeForm({ initialData, isEdit = false, onSuccess, onCancel }: EmployeeFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [departments, setDepartments] = useState<Department[]>([])

    const existingManagedRole = getManagedRole(initialData?.roles)
    const hasUnmanagedRoleOnEdit = Boolean(
        isEdit && initialData?.roles && initialData.roles.length > 0 && !existingManagedRole
    )

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(isEdit ? updateEmployeeSchema : createEmployeeSchema) as Resolver<EmployeeFormValues>,
        defaultValues: createDefaultValues(initialData, isEdit),
    })

    const { handleSubmit, reset } = form
    const { trigger: createEmployeeFn } = useCreateEmployee()
    const { trigger: updateEmployeeFn } = useUpdateEmployee()

    useEffect(() => {
        reset(createDefaultValues(initialData, isEdit))
    }, [initialData, isEdit, reset])

    useEffect(() => {
        let cancelled = false

        const loadDepartments = async () => {
            try {
                const departmentResponse = await getDepartments({ pageSize: 100 })
                if (cancelled) return

                let loadedDepartments = departmentResponse.items
                if (initialData?.departmentId && !loadedDepartments.find((department) => department.id === initialData.departmentId)) {
                    loadedDepartments = [
                        {
                            id: initialData.departmentId,
                            departmentName: initialData.departmentName || 'Current Department',
                            departmentCode: '',
                            description: '',
                            managerId: null,
                            managerName: null,
                            parentDepartmentId: null,
                            parentDepartmentName: null,
                            isActive: true,
                            createdAt: '',
                            employeeCount: 0,
                        },
                        ...loadedDepartments,
                    ]
                }

                setDepartments(loadedDepartments)
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to load departments', error)
                }
            }
        }

        loadDepartments()

        return () => {
            cancelled = true
        }
    }, [initialData?.departmentId, initialData?.departmentName])

    const onSubmit = async (data: EmployeeFormValues) => {
        setIsLoading(true)
        try {
            if (!isEdit && !data.password) {
                form.setError('password', { message: 'Mật khẩu là bắt buộc' })
                setIsLoading(false)
                return
            }

            if (!data.role) {
                form.setError('role', { message: 'Vui lòng chọn vai trò trước khi lưu' })
                setIsLoading(false)
                return
            }

            const isDirectorRole = data.role === 'Director'
            const parsedDepartmentId = data.departmentId ? parseInt(data.departmentId, 10) : null
            const departmentId = Number.isNaN(parsedDepartmentId) ? null : parsedDepartmentId

            if (isEdit && initialData) {
                const updatePayload: UpdateEmployeeData = {
                    role: data.role,
                    departmentId: isDirectorRole ? null : departmentId,
                    position: data.position || undefined,
                    employmentType: data.employmentType,
                    status: data.status,
                }

                await updateEmployeeFn({
                    id: initialData.id,
                    data: updatePayload,
                })

                toast({
                    title: 'Thành công',
                    description: 'Cập nhật nhân viên thành công',
                })
            } else {
                const createPayload: CreateEmployeeData = {
                    fullName: data.fullName || '',
                    email: data.email || '',
                    phone: data.phone || undefined,
                    password: data.password || '',
                    role: data.role,
                    departmentId: isDirectorRole ? null : departmentId,
                    position: data.position || undefined,
                    employmentType: data.employmentType,
                    hireDate: data.hireDate ? data.hireDate.toISOString() : undefined,
                }

                await createEmployeeFn(createPayload)

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

            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <EmployeePersonalInfo isEdit={isEdit} />

                    {isEdit && (
                        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Họ tên, email, số điện thoại và ngày vào làm là thông tin chỉ đọc trong chế độ chỉnh sửa.
                        </p>
                    )}

                    {hasUnmanagedRoleOnEdit && (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Vai trò hiện tại của tài khoản không nằm trong nhóm role quản lý tại màn này. Vui lòng chọn role phù hợp trước khi lưu để tránh thay đổi quyền ngoài ý muốn.
                        </p>
                    )}

                    <EmployeeJobInfo
                        isEdit={isEdit}
                        departments={departments}
                    />

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
            </FormProvider>
        </div>
    )
}
