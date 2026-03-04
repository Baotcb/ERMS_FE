import { HRSidebar } from '@/features/hr'

export default function HRLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen" style={{ backgroundColor: '#F0F9FF' }}>
            <HRSidebar />
            <main className="flex-1 p-8 overflow-x-hidden">
                {children}
            </main>
        </div>
    )
}
