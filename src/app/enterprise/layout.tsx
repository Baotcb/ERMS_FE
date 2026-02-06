import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { HRSidebar } from '@/features/hr'
import { DeptHeadSidebar } from '@/features/dept-head/components/dept-head-sidebar'

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
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    )
}
