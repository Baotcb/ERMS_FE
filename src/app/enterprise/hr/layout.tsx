import { HRSidebar } from '@/features/hr'

export default function HRLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen" style={{ backgroundColor: '#F0F9FF' }}>
            <HRSidebar />
            <main className="enterprise-scale flex-1 overflow-x-hidden p-4 md:p-5 xl:p-6">
                {children}
            </main>
        </div>
    )
}
