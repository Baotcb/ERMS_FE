
import { fetchEmployeeList } from '@/features/hr/api/server-utils'
import { EmployeeList } from './employee-list'

interface EmployeeListContainerProps {
    page: number
    searchParams?: Record<string, unknown>
}

export async function EmployeeListContainer({ page, searchParams }: EmployeeListContainerProps) {
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
