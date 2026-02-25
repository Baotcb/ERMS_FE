import { EmployeeSidebar } from '@/features/employee'

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <EmployeeSidebar />
            <main className="flex-1 p-8 overflow-x-hidden">
                {children}
            </main>
        </div>
    )
}
