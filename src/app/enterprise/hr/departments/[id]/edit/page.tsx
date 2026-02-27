'use client'

import { useParams } from 'next/navigation'
import { DepartmentForm } from '@/features/hr/components/department/department-form'
import { useDepartment } from '@/features/hr/hooks/use-departments'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditDepartmentPage() {
    const params = useParams<{ id: string }>()
    const departmentId = parseInt(params.id)
    const { department, isLoading } = useDepartment(departmentId)

    if (isLoading) {
        return (
            <div className="space-y-4 p-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!department) {
        return (
            <div className="p-6 text-center text-slate-500">
                Không tìm thấy phòng ban
            </div>
        )
    }

    return <DepartmentForm initialData={department} isEdit />
}
