import { cookies } from 'next/headers'
import { getDepartments, Department } from './department-service'
import { getEmployees, Employee } from './employee-service'

// Wrapper for Server Components
export async function fetchDepartmentList(page: number) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        const data = await getDepartments({ page, pageSize: 20 }, token)
        return {
            items: data.items,
            totalCount: data.totalCount,
            page: data.page,
            pageSize: data.pageSize,
            totalPages: data.totalPages
        }
    } catch (error) {
        console.error('Fetch departments error:', error)
        return {
            items: [] as Department[],
            totalCount: 0,
            page: 1,
            pageSize: 20,
            totalPages: 1
        }
    }
}

export async function fetchEmployeeList(page: number) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        const data = await getEmployees({ page, pageSize: 20 }, token)
        return {
            items: data.items,
            totalCount: data.totalCount,
            page: data.page,
            pageSize: data.pageSize,
            totalPages: data.totalPages
        }
    } catch (error) {
        console.error('Fetch employees error:', error)
        return {
            items: [] as Employee[],
            totalCount: 0,
            page: 1,
            pageSize: 20,
            totalPages: 1
        }
    }
}
