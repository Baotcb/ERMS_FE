import { EmployeeSidebar } from '@/features/employee'
import { EnterpriseNavbar } from '@/components/layout/enterprise-navbar'

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F0F9FF' }}>
            <EnterpriseNavbar dashboardHref="/enterprise/employee/dashboard" />
            <div className="flex flex-1 min-h-0">
                <EmployeeSidebar />
                <main className="enterprise-scale min-w-0 flex-1 overflow-x-hidden p-4 md:p-5 xl:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
