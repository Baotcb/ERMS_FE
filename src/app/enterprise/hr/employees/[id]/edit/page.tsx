'use client'

import { useParams } from 'next/navigation'
import { EmployeeForm } from '@/features/hr/components/employee/employee-form'
import { useEmployee } from '@/features/hr/hooks/use-employees'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditEmployeePage() {
    const params = useParams<{ id: string }>()
    const { employee, error, isLoading } = useEmployee(params.id)

    if (isLoading) {
        return (
            <div className="space-y-4 p-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 text-center text-slate-500">
                {error.message}
            </div>
        )
    }

    if (!employee) {
        return (
            <div className="p-6 text-center text-slate-500">
                Không tìm thấy nhân viên
            </div>
        )
    }

    return <EmployeeForm key={employee.id} initialData={employee} isEdit />
}
