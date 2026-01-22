export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar placeholder */}
            <aside className="w-64 bg-gray-900 text-white p-4">
                <h2 className="text-xl font-bold mb-6">ERMS</h2>
                <nav>
                    <ul className="space-y-2">
                        <li><a href="/dashboard" className="block py-2 px-4 rounded hover:bg-gray-800">Dashboard</a></li>
                    </ul>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-800">
                {children}
            </main>
        </div>
    )
}
