'use client'

import { useState, useCallback, memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
    LayoutDashboard,
    GraduationCap,
    ClipboardList,
    Briefcase,
    ChevronDown,
    ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/core/auth/hooks/use-auth'

interface NavItem {
    label: string
    href?: string
    icon: React.ReactNode
    children?: { label: string; href: string }[]
}

const NAV_ITEMS: NavItem[] = [
    {
        icon: <LayoutDashboard className="w-5 h-5" />,
        label: 'Dashboard',
        href: '/enterprise/dept-head/dashboard'
    },
    {
        icon: <Briefcase className="w-5 h-5" />,
        label: 'Tuyển dụng',
        children: [
            { label: 'Chiến dịch tuyển dụng', href: '/enterprise/dept-head/recruitment' },
            { label: 'Đề xuất nhân sự', href: '/enterprise/dept-head/shortlisted' },
            { label: 'Phỏng vấn', href: '/enterprise/dept-head/interviews' },
        ]
    },
    {
        icon: <GraduationCap className="w-5 h-5" />,
        label: 'Đào tạo',
        children: [
            { label: 'Yêu cầu của tôi', href: '/enterprise/dept-head/training' },
            { label: 'Kế hoạch đào tạo', href: '/enterprise/dept-head/training/plans' },
            { label: 'Khóa học khả dụng', href: '/enterprise/dept-head/training/courses' },
            { label: 'Phân công đào tạo', href: '/enterprise/dept-head/training/assign' },
        ]
    },
    {
        icon: <ClipboardList className="w-5 h-5" />,
        label: 'Đánh giá',
        href: '/enterprise/dept-head/evaluation'
    }
]

const NavMenuItem = memo(function NavMenuItem({
    item,
    isActive,
    isExpanded,
    onToggle
}: {
    item: NavItem
    isActive: boolean
    isExpanded: boolean
    onToggle: (label: string) => void
}) {
    const hasChildren = item.children && item.children.length > 0

    if (!hasChildren && item.href) {
        return (
            <Link
                href={item.href}
                className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    'hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75]',
                    isActive
                        ? 'bg-[#0F4C75] text-white shadow-md'
                        : 'text-gray-600'
                )}
            >
                {item.icon}
                <span className="font-medium">{item.label}</span>
            </Link>
        )
    }

    return (
        <div>
            <button
                onClick={() => onToggle(item.label)}
                className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    'hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75]',
                    isExpanded ? 'bg-[#BBE1FA]/30 text-[#0F4C75]' : 'text-gray-600'
                )}
            >
                <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                </div>
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                ) : (
                    <ChevronRight className="w-4 h-4" />
                )}
            </button>

            {/* Submenu */}
            <div
                className={cn(
                    'overflow-hidden transition-all duration-300',
                    isExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <div className="ml-8 mt-1 space-y-1">
                    {item.children?.map((child) => (
                        <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                                'block px-4 py-2 rounded-lg text-sm transition-all duration-200',
                                'hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75]',
                                'text-gray-500 hover:text-[#0F4C75]'
                            )}
                        >
                            {child.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
})

// Avatar Dropdown imported from shared component
import { AvatarDropdown } from '@/components/common/avatar-dropdown'
import { useEnterpriseInfo } from '@/features/enterprise'
import { canAccessTeachingWorkspace } from '@/features/hr/utils/teaching-access'
import { canAccessLearningWorkspace } from '@/features/hr/utils/learning-access'

export function DeptHeadSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const [expandedItems, setExpandedItems] = useState<string[]>(['Tuyển dụng', 'Đào tạo'])

    const { enterpriseInfo } = useEnterpriseInfo()

    const toggleExpand = useCallback((label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((l) => l !== label)
                : [...prev, label]
        )
    }, [])

    const isItemActive = useCallback((item: NavItem): boolean => {
        if (item.href) {
            return pathname === item.href
        }
        return item.children?.some((child) => pathname === child.href) ?? false
    }, [pathname])

    const navItems = NAV_ITEMS.map((item) => {
            if (item.label !== 'Đào tạo' || !item.children) {
                return item
            }

            let children = item.children

            if (canAccessTeachingWorkspace(user)) {
                const hasTrainerLink = children.some((child) => child.href === '/enterprise/dept-head/teaching')
                if (!hasTrainerLink) {
                    children = [...children, { label: 'Khóa học giảng dạy', href: '/enterprise/dept-head/teaching' }]
                }
            }

            if (canAccessLearningWorkspace(user)) {
                const hasLearningLink = children.some((child) => child.href === '/enterprise/dept-head/learning')
                if (!hasLearningLink) {
                    children = [...children, { label: 'Khóa học của tôi', href: '/enterprise/dept-head/learning' }]
                }
            }

            return {
                ...item,
                children,
            }
        })

    return (
        <aside className="w-72 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col z-40 shrink-0">
            {/* Logo area */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
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
                            <span className="text-white font-bold text-lg">DH</span>
                        </div>
                    )}

                    <div>
                        <h1 className="text-xl font-bold text-[#0F4C75]">ERMS</h1>
                        <p className="text-xs text-gray-400 font-medium">Department Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map((item) => (
                    <NavMenuItem
                        key={item.label}
                        item={item}
                        isActive={isItemActive(item)}
                        isExpanded={expandedItems.includes(item.label)}
                        onToggle={toggleExpand}
                    />
                ))}
            </nav>

            {/* Profile Section with AvatarDropdown */}
            <div className="p-4 border-t border-gray-100">
                <AvatarDropdown />
            </div>
        </aside>
    )
}
