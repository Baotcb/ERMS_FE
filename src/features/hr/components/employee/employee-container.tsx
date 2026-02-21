
import { fetchEmployeeList } from '@/features/hr/api/server-utils'
import { EmployeeList } from './employee-list'

interface EmployeeListContainerProps {
    page: number
    searchParams?: Record<string, unknown>
}

// searchParams is currently unused but might be needed for future filtering
// keeping it commented out or removing it to fix lint
export async function EmployeeListContainer({ page }: EmployeeListContainerProps) {
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
