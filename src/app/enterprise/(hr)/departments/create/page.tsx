import { Metadata } from 'next'
import { DepartmentForm } from '@/features/hr/components/department/department-form'

export const metadata: Metadata = {
    title: 'Thêm phòng ban - HR Management',
    description: 'Tạo mới phòng ban',
}

export default function CreateDepartmentPage() {
    return <DepartmentForm />
}
