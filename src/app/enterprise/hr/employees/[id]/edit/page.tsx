import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EmployeeForm } from '@/features/hr/components/employee/employee-form'
import { getEmployeeById } from '@/features/hr/api/employee-service'

export const metadata: Metadata = {
    title: 'Chỉnh sửa nhân viên - HR Management',
    description: 'Cập nhật hồ sơ nhân viên',
}

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditEmployeePage({ params }: Props) {
    const { id } = await params
    const employee = await getEmployeeById(id).catch(() => null)

    if (!employee) {
        notFound()
    }

    return <EmployeeForm initialData={employee} isEdit />
}
