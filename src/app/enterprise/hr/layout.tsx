import { HRSidebar } from '@/features/hr'

export default function HRLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <HRSidebar />
            <main className="flex-1 p-8 overflow-x-hidden">
                {children}
            </main>
        </div>
    )
}
