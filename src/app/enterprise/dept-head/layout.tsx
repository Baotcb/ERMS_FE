import { DeptHeadSidebar } from '@/features/dept-head/components/dept-head-sidebar'

export default function DeptHeadLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <DeptHeadSidebar />
            <main className="flex-1 p-8 overflow-x-hidden">
                {children}
            </main>
        </div>
    )
}
