import { Metadata } from 'next'
import { EmployeeForm } from '@/features/hr/components/employee/employee-form'

export const metadata: Metadata = {
    title: 'Thêm nhân viên - HR Management',
    description: 'Tạo mới hồ sơ nhân viên',
}

export default function CreateEmployeePage() {
    return <EmployeeForm />
}
