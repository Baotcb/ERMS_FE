import { Metadata } from 'next'
import { EmployeeImport } from '@/features/hr/components/employee/employee-import'

export const metadata: Metadata = {
    title: 'Import nhân viên - HR Management',
    description: 'Nhập dữ liệu nhân viên từ Excel',
}

export default function ImportEmployeePage() {
    return <EmployeeImport />
}
