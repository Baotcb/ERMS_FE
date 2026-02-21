import { DirectorSidebar } from "@/features/director/components/director-sidebar"

export default function DirectorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <DirectorSidebar />
            <main className="flex-1 overflow-y-auto h-screen">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
