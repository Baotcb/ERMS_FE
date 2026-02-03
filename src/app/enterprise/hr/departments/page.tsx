import { Metadata } from 'next'
import { Suspense } from 'react'
import { DepartmentListContainer } from '@/features/hr/components/department/department-container'
import { ListSkeleton } from '@/components/common/skeletons/list-skeleton'

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

    return (
        <Suspense fallback={<ListSkeleton />}>
            <DepartmentListContainer page={page} searchParams={params} />
        </Suspense>
    )
}
