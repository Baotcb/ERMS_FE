'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    CheckSquare,
    CreditCard,
    BookOpen,
    FileText
} from 'lucide-react'
import { AvatarDropdown } from '@/components/common/avatar-dropdown'
import { useEnterpriseInfo } from '@/features/enterprise'

const sidebarItems = [
    {
        title: 'Tổng quan',
        href: '/enterprise/director/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Quản lý gói dịch vụ',
        href: '/enterprise/director/subscription',
        icon: CreditCard,
    },
    {
        title: 'Danh sách kế hoạch',
        href: '/enterprise/director/recruitment-plans',
        icon: CheckSquare,
    },
    {
        title: 'Báo cáo đào tạo',
        href: '/enterprise/director/training-report',
        icon: BookOpen,
    },
    {
        title: 'Báo cáo tuyển dụng',
        href: '/enterprise/director/recruitment-report',
        icon: FileText,
    },
]

export function DirectorSidebar() {
    const pathname = usePathname()

    const { enterpriseInfo } = useEnterpriseInfo()

    return (
        <div className="flex bg-white h-screen flex-col w-64 border-r border-gray-200">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-100">
                <Link href="/enterprise/director/dashboard" className="flex items-center gap-3">
                    {enterpriseInfo?.logoUrl ? (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-gray-100 flex-shrink-0 bg-white">
                            <Image
                                src={enterpriseInfo.logoUrl}
                                alt={enterpriseInfo.enterpriseName || "Enterprise Logo"}
                                fill
                                sizes="40px"
                                className="object-contain p-1"
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-white font-bold text-lg">GD</span>
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-[#0F4C75] text-lg">ERMS</h1>
                        <p className="text-xs text-gray-400 font-medium">Director Portal</p>
                    </div>
                </Link>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-blue-50 text-[#0F4C75] shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0F4C75]"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-[#0F4C75]" : "text-gray-400 group-hover:text-[#0F4C75]")} />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>

            {/* Profile Section */}
            <div className="p-4 border-t border-gray-100">
                <AvatarDropdown />
            </div>
        </div>
    )
}
