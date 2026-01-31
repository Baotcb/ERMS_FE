import { Metadata } from 'next'
import { EmployeeList } from '@/features/hr/components/employee'
import { fetchEmployeeList } from '@/features/hr'

export const metadata: Metadata = {
    title: 'Nhân viên - HR Management',
    description: 'Quản lý nhân viên doanh nghiệp',
}

interface Props {
    searchParams: Promise<{ page?: string; enterpriseId?: string }>
}

export default async function EmployeesPage({ searchParams }: Props) {
    const params = await searchParams
    const page = parseInt(params.page || '1', 10)

    const data = await fetchEmployeeList(page)

    return (
        <EmployeeList
            initialEmployees={data.items}
            totalCount={data.totalCount}
            currentPage={data.page}
            totalPages={data.totalPages}
        />
    )
}
