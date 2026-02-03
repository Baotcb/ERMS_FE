import { Metadata } from 'next'
import { Suspense } from 'react'
import { EmployeeListContainer } from '@/features/hr/components/employee/employee-container'
import { ListSkeleton } from '@/components/common/skeletons/list-skeleton'

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

    return (
        <Suspense fallback={<ListSkeleton />}>
            <EmployeeListContainer page={page} searchParams={params} />
        </Suspense>
    )
}
