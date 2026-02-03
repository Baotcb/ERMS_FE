import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { HRSidebar } from '@/features/hr'
import { DeptHeadSidebar } from '@/features/dept-head/components/dept-head-sidebar'

export const metadata: Metadata = {
    title: 'Enterprise Portal - ERMS',
    description: 'Cổng quản lý doanh nghiệp ERMS',
}

export default async function EnterpriseLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const role = cookieStore.get('user_role')?.value

    const isHR = role === 'HRManager' || role === 'Director' || role === 'HR'

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {isHR ? <HRSidebar /> : <DeptHeadSidebar />}
            <main className="flex-1 p-8 overflow-x-hidden">
                {children}
            </main>
        </div>
    )
}
