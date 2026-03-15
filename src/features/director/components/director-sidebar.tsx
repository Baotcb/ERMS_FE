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
    FileText,
    GraduationCap
} from 'lucide-react'
import { AvatarDropdown } from '@/components/common/avatar-dropdown'
import { useEnterpriseInfo } from '@/features/enterprise'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { canAccessTeachingWorkspace } from '@/features/hr/utils/teaching-access'
import { canAccessLearningWorkspace } from '@/features/hr/utils/learning-access'

interface SidebarItem {
    title: string
    href?: string
    icon: React.ElementType
    children?: { label: string; href: string }[]
}

const sidebarItems: SidebarItem[] = [
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
    {
        title: 'Đào tạo',
        icon: GraduationCap,
        children: [
            { label: 'Duyệt kế hoạch', href: '/enterprise/director/training-approval' }
        ]
    },
]

export function DirectorSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()

    const { enterpriseInfo } = useEnterpriseInfo()

    const dynamicSidebarItems: SidebarItem[] = sidebarItems.map((item) => {
            if (item.title !== 'Đào tạo' || !item.children) {
                return item
            }

            let children = item.children

            if (canAccessTeachingWorkspace(user)) {
                const hasTrainerLink = children.some((child) => child.href === '/enterprise/director/teaching')
                if (!hasTrainerLink) {
                    children = [...children, { label: 'Khóa học giảng dạy', href: '/enterprise/director/teaching' }]
                }
            }

            if (canAccessLearningWorkspace(user)) {
                const hasLearningLink = children.some((child) => child.href === '/enterprise/director/learning')
                if (!hasLearningLink) {
                    children = [...children, { label: 'Khóa học của tôi', href: '/enterprise/director/learning' }]
                }
            }

            return {
                ...item,
                children,
            }
        })

    return (
        <div className="flex bg-white h-screen flex-col w-64 border-r border-gray-200">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-100">
                <Link href="/enterprise/director/dashboard" className="flex items-center gap-3">
                    {enterpriseInfo?.logoUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg border border-gray-100 flex-shrink-0 bg-white flex items-center justify-center">
                            <Image
                                src={enterpriseInfo.logoUrl}
                                alt={enterpriseInfo.enterpriseName || "Enterprise Logo"}
                                width={32}
                                height={32}
                                className="object-contain"
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
                {dynamicSidebarItems.map((item) => {
                    const Icon = item.icon
                    const hasChildren = 'children' in item && item.children && item.children.length > 0
                    const isActive = item.href ? (pathname === item.href || pathname?.startsWith(item.href + '/')) : false

                    if (hasChildren) {
                        return (
                            <div key={item.title} className="space-y-1">
                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600">
                                    <Icon className="w-5 h-5 text-gray-400" />
                                    {item.title}
                                </div>
                                <div className="ml-8 space-y-1">
                                    {item.children?.map((child) => (
                                        <Link
                                            key={child.href}
                                            href={child.href}
                                            className={cn(
                                                "block px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                                pathname === child.href
                                                    ? "bg-blue-50 text-[#0F4C75]"
                                                    : "text-gray-500 hover:bg-gray-50 hover:text-[#0F4C75]"
                                            )}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href!}
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
