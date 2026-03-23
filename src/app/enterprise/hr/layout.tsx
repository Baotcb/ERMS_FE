import { HRSidebar } from '@/features/hr'
import { HRNavbar } from '@/features/hr/components/hr-navbar'

export default function HRLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F0F9FF' }}>
            <HRNavbar />
            <div className="flex flex-1">
                <HRSidebar />
                <main className="enterprise-scale flex-1 overflow-x-hidden p-4 md:p-5 xl:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
