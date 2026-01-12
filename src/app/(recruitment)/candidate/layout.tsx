
import { CandidateNavbar } from "@/components/layout/candidate-navbar";

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-brand-light font-sans text-slate-900">
            <CandidateNavbar />
            <main>
                {children}
            </main>
            <footer className="bg-white border-t border-slate-200 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
                    <p className="mb-2">© 2026 ERMS Recruitment System. All rights reserved.</p>
                    <p>Designed for recruitment excellence.</p>
                </div>
            </footer>
        </div>
    );
}
