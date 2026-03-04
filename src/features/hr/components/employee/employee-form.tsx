'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDepartments } from '@/features/hr/api/department-service'
import { CreateEmployeeData } from '@/features/hr/api/employee-service'
import { useCreateEmployee, useUpdateEmployee } from '@/features/hr/hooks/use-employees'
import type { Department } from '@/features/hr/api/department-service'
import type { Employee } from '@/features/hr/api/employee-service'
import { useToast } from '@/hooks/use-toast'
import { employeeSchema, type EmployeeFormValues } from './employee-form-schema'
import { EmployeePersonalInfo } from './employee-personal-info'
import { EmployeeJobInfo } from './employee-job-info'

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
            status: initialData?.status || 'Active',
        },
    })

    const { handleSubmit } = form

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [deptRes] = await Promise.all([
                    getDepartments({ pageSize: 100 }),
                ])

                let loadedDepartments = deptRes.items;
                // Ensure current department is in the list
                if (initialData?.departmentId && !loadedDepartments.find(d => d.id === initialData.departmentId)) {
                    const currentDept = {
                        id: initialData.departmentId,
                        departmentName: initialData.departmentName || 'Current Department',
                        departmentCode: '', // Unknown if not fetched
                        description: '',
                        managerId: null,
                        managerName: null,
                        parentDepartmentId: null,
                        parentDepartmentName: null,
                        isActive: true,
                        createdAt: '',
                        updatedAt: '',
                        employeeCount: 0
                    } as Department

                    loadedDepartments = [currentDept, ...loadedDepartments]
                }

                setDepartments(loadedDepartments)
            } catch (error) {
                console.error('Failed to load options', error)
            }
        }
        loadOptions()
    }, [initialData?.id, initialData?.departmentId, initialData?.departmentName])

    const { trigger: createEmployeeFn } = useCreateEmployee()
    const { trigger: updateEmployeeFn } = useUpdateEmployee()

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

            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <EmployeePersonalInfo isEdit={isEdit} />

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
