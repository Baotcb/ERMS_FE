
"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { User, Shield, Bell, ChevronLeft } from "lucide-react";
import { CandidateNavbar } from "@/components/layout/candidate-navbar";
import { useAuth } from "@/features/core/auth/hooks/use-auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProfileLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-light">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Return null while redirecting to avoid flashing content
    }

    return (
        <div className="min-h-screen bg-brand-light font-sans text-slate-900">
            <CandidateNavbar />
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                                <h2 className="font-bold text-brand-dark">Cài đặt tài khoản</h2>
                            </div>
                            <nav className="p-2 flex flex-col gap-1">
                                <Link
                                    href="/profile"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === "/profile"
                                        ? "bg-brand-primary/10 text-brand-primary"
                                        : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    <User className="w-4 h-4" />
                                    Thông tin cá nhân
                                </Link>
                                <Link
                                    href="/security"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === "/security"
                                        ? "bg-brand-primary/10 text-brand-primary"
                                        : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    <Shield className="w-4 h-4" />
                                    Bảo mật & Mật khẩu
                                </Link>
                                <Link
                                    href="#"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <Bell className="w-4 h-4" />
                                    Cài đặt thông báo
                                </Link>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
