import { Metadata } from "next"
import Image from "next/image"

import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "@/components/settings/sidebar-nav"
import { Navbar } from "@/components/layout/navbar"

export const metadata: Metadata = {
    title: "Cài đặt tài khoản",
    description: "Quản lý thông tin cá nhân và bảo mật.",
}

const sidebarNavItems = [
    {
        title: "Hồ sơ cá nhân",
        href: "/settings/profile",
    },
    {
        title: "Đổi mật khẩu",
        href: "/settings/security",
    },
]

interface SettingsLayoutProps {
    children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="container mx-auto flex-1 items-start gap-10 py-8 md:grid md:grid-cols-[220px_minmax(0,1fr)]">
                <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
                    <div className="h-full py-6 pr-6 lg:py-8">
                        <SidebarNav items={sidebarNavItems} />
                    </div>
                </aside>
                <main className="flex w-full flex-col overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
