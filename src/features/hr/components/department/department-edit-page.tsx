'use client'

import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { useDepartment } from '@/features/hr/hooks/use-departments'
import { DepartmentForm } from './department-form'

function DepartmentEditLoadingState() {
    return (
        <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

function DepartmentEditEmptyState({ message }: { message: string }) {
    return <div className="p-6 text-center text-slate-500">{message}</div>
}

export function DepartmentEditPage() {
    const params = useParams<{ id: string }>()
    const departmentId = parseInt(params.id)
    const { department, isLoading } = useDepartment(departmentId)

    if (isLoading) {
        return <DepartmentEditLoadingState />
    }

    if (!department) {
        return <DepartmentEditEmptyState message="Không tìm thấy phòng ban" />
    }

    return <DepartmentForm initialData={department} isEdit />
}
