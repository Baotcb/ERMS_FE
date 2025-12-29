// Navbar removed as it is inherited from parent recruitment layout


export default function RecruitmentAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Ideally we would check for HR role here too, but SecureGate handles basic auth 
    // and Navbar handles role-based menu. 
    // Detailed Role Guard could be added here if needed.
    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Navbar inherited from parent */}

            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
