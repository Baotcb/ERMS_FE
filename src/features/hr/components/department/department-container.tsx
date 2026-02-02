
import { fetchDepartmentList } from '@/features/hr/api/server-utils'
import { DepartmentList } from './department-list'

interface DepartmentListContainerProps {
    page: number
    searchParams?: Record<string, unknown>
}

export async function DepartmentListContainer({ page, searchParams }: DepartmentListContainerProps) {
    // We can extend this to handle search filtering on server side if params are passed
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
