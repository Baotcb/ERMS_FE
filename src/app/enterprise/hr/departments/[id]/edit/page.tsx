import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DepartmentForm } from '@/features/hr/components/department/department-form'
import { getDepartmentById } from '@/features/hr/api/department-service'

export const metadata: Metadata = {
    title: 'Chỉnh sửa phòng ban - HR Management',
    description: 'Cập nhật thông tin phòng ban',
}

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditDepartmentPage({ params }: Props) {
    const { id } = await params
    const department = await getDepartmentById(parseInt(id)).catch(() => null)

    if (!department) {
        notFound()
    }

    return <DepartmentForm initialData={department} isEdit />
}
