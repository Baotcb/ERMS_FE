import { Footer } from "@/components/layout/footer";
import { CandidateNavbar } from "@/components/layout/candidate-navbar";

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-brand-light font-sans text-slate-900 flex flex-col">
            <CandidateNavbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
