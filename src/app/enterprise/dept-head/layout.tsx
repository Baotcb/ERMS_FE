import { DeptHeadSidebar } from '@/features/dept-head/components/dept-head-sidebar'
import { EnterpriseNavbar } from '@/components/layout/enterprise-navbar'

export default function DeptHeadLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F0F9FF' }}>
            <EnterpriseNavbar dashboardHref="/enterprise/dept-head/dashboard" />
            <div className="flex flex-1 min-h-0">
                <DeptHeadSidebar />
                <main className="enterprise-scale min-w-0 flex-1 overflow-x-hidden p-4 md:p-5 xl:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
