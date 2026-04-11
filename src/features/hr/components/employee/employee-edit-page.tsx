'use client'

import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmployee } from '@/features/hr/hooks/use-employees'
import { EmployeeForm } from './employee-form'

function EmployeeEditLoadingState() {
    return (
        <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

function EmployeeEditEmptyState({ message }: { message: string }) {
    return <div className="p-6 text-center text-slate-500">{message}</div>
}

export function EmployeeEditPage() {
    const params = useParams<{ id: string }>()
    const { employee, error, isLoading } = useEmployee(params.id)

    if (isLoading) {
        return <EmployeeEditLoadingState />
    }

    if (error) {
        return <EmployeeEditEmptyState message={error.message} />
    }

    if (!employee) {
        return <EmployeeEditEmptyState message="Không tìm thấy nhân viên" />
    }

    return <EmployeeForm key={employee.id} initialData={employee} isEdit />
}
