import { Metadata } from 'next'
import { DepartmentList } from '@/features/hr/components/department'
import { fetchDepartmentList } from '@/features/hr'

export const metadata: Metadata = {
    title: 'Phòng ban - HR Management',
    description: 'Quản lý phòng ban doanh nghiệp',
}

interface Props {
    searchParams: Promise<{ page?: string; enterpriseId?: string }>
}

export default async function DepartmentsPage({ searchParams }: Props) {
    const params = await searchParams
    const page = parseInt(params.page || '1', 10)

    const data = await fetchDepartmentList(page)

    return (
        <DepartmentList
            initialDepartments={data.items}
            totalCount={data.totalCount}
            currentPage={data.page}
            totalPages={data.totalPages}
        />
    )
}
