import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getRecruitmentPlans } from '@/features/hr/api/recruitment-plan-service'
import { RecruitmentPlanList } from '@/features/hr/components/recruitment-plan/recruitment-plan-list'

export const metadata: Metadata = {
    title: 'Kế hoạch tuyển dụng | ERMS',
    description: 'Quản lý kế hoạch tuyển dụng nhân sự',
}

interface PageProps {
    searchParams?: Promise<{
        page?: string
        search?: string
        status?: string
    }>
}

export default async function RecruitmentPlansPage(props: PageProps) {
    const searchParams = await props.searchParams
    const page = Number(searchParams?.page) || 1
    const search = searchParams?.search || ''
    const status = searchParams?.status || ''

    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    const result = await getRecruitmentPlans({
        page,
        pageSize: 10,
        search,
        status
    }, token)

    return (
        <div className="container mx-auto py-6">
            <RecruitmentPlanList
                data={result.items}
                totalCount={result.totalCount}
                page={result.page}
                pageSize={result.pageSize}
                totalPages={result.totalPages}
            />
        </div>
    )
}
