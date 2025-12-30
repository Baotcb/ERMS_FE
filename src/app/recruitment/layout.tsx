import { Navbar } from "@/components/common/navbar"
import { Footer } from "@/components/common/footer"

export default function RecruitmentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            {/* Reusing Footer from Landing Page if available or just simple copyright */}
            <div className="py-6 text-center text-sm text-slate-500 bg-white border-t">
                © {new Date().getFullYear()} ERMS Recruitment. All rights reserved.
            </div>
        </div>
    )
}
