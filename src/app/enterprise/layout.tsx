import { Metadata } from 'next'
import { HRSidebar } from '@/features/hr'

export const metadata: Metadata = {
    title: 'Enterprise Portal - ERMS',
    description: 'Cổng quản lý doanh nghiệp ERMS',
}

export default function EnterpriseLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <HRSidebar />
            <main className="flex-1 p-8 lg:ml-0">
                {children}
            </main>
        </div>
    )
}
