'use client'

import { useState, useCallback, memo, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
    LayoutDashboard,
    Users,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    CalendarRange,
    CalendarCheck,
    FileText,
    GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AvatarDropdown } from '@/components/common/avatar-dropdown'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { useEnterpriseInfo } from '@/features/enterprise'

interface NavItem {
    label: string
    href?: string
    icon: React.ReactNode
    children?: { label: string; href: string }[]
    roles?: string[]
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/enterprise/hr/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: []
    },
    {
        label: 'Nhân sự',
        icon: <Users className="w-5 h-5" />,
        roles: ['HRManager', 'Director', 'DepartmentHead'],
        children: [
            { label: 'Phòng ban', href: '/enterprise/hr/departments' },
            { label: 'Nhân viên', href: '/enterprise/hr/employees' }
        ]
    },
    {
        label: 'Tuyển dụng',
        icon: <CalendarRange className="w-5 h-5" />,
        roles: ['HRManager', 'Director'],
        children: [
            { label: 'Tin tuyển dụng', href: '/enterprise/hr/job-postings' },
            { label: 'Chiến dịch tuyển dụng', href: '/enterprise/hr/recruitment-campaigns' }
        ]
    },
    {
        label: 'Phỏng vấn',
        href: '/enterprise/hr/interviews',
        icon: <CalendarCheck className="w-5 h-5" />,
        roles: ['HRManager']
    },
    {
        label: 'Quản lý Offer',
        href: '/enterprise/hr/offers',
        icon: <FileText className="w-5 h-5" />,
        roles: ['HRManager']
    },
    {
        label: 'Đào tạo',
        icon: <GraduationCap className="w-5 h-5" />,
        roles: ['HRManager', 'HR', 'Director', 'Admin'],
        children: [
            { label: 'Kế hoạch đào tạo', href: '/enterprise/hr/training/plans' },
            { label: 'Danh sách khóa học', href: '/enterprise/hr/training/courses' },
            { label: 'Yêu cầu đào tạo', href: '/enterprise/hr/training/requests' },
            { label: 'Thông báo & Mở lịch', href: '/enterprise/hr/training/schedule' },
            { label: 'Khóa học của tôi', href: '/enterprise/hr/learning' },
            { label: 'Quản lý Workshop', href: '/enterprise/hr/training/workshop' }
        ]
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
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                    'hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75]',
                    isActive ? 'bg-[#0F4C75] text-white shadow-md' : 'text-gray-600'
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
                type="button"
                onClick={() => onToggle(item.label)}
                className={cn(
                    'w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                    'hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75]',
                    isExpanded ? 'bg-[#BBE1FA]/30 text-[#0F4C75]' : 'text-gray-600'
                )}
            >
                <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <div
                className={cn(
                    'overflow-hidden transition-all duration-300',
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <div className="ml-8 mt-1 space-y-1">
                    {item.children?.map((child) => (
                        <Link
                            key={child.href}
                            href={child.href}
                            className="block px-3 py-1.5 rounded-lg text-[13px] text-gray-500 transition-all duration-200 hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75]"
                        >
                            {child.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
})

export const HRSidebar = memo(function HRSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const [expandedItems, setExpandedItems] = useState<string[]>(['Nhân sự', 'Đào tạo'])
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const { enterpriseInfo } = useEnterpriseInfo()

    const userRole = useMemo(() => user?.role || '', [user?.role])

    const visibleNavItems = useMemo(() => {
        return NAV_ITEMS.filter((item) => {
            if (!item.roles || item.roles.length === 0) return true
            return item.roles.includes(userRole)
        })
    }, [userRole])

    const toggleExpand = useCallback((label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((itemLabel) => itemLabel !== label)
                : [...prev, label]
        )
    }, [])

    const isItemActive = useCallback((item: NavItem): boolean => {
        if (item.href) {
            return pathname === item.href
        }
        return item.children?.some((child) => pathname === child.href) ?? false
    }, [pathname])

    const sidebarContent = (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            <div className="p-5 border-b border-gray-100">
                <Link href="/enterprise/hr/dashboard" className="flex items-center gap-3">
                    {enterpriseInfo?.logoUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg border border-gray-100 flex-shrink-0 bg-white flex items-center justify-center">
                            <Image
                                src={enterpriseInfo.logoUrl}
                                alt={enterpriseInfo.enterpriseName || 'Enterprise Logo'}
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-white font-bold text-lg">HR</span>
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-[#0F4C75] text-lg">ERMS</h1>
                        <p className="text-xs text-gray-400">HR Management</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                {visibleNavItems.map((item) => (
                    <NavMenuItem
                        key={item.label}
                        item={item}
                        isActive={isItemActive(item)}
                        isExpanded={expandedItems.includes(item.label)}
                        onToggle={toggleExpand}
                    />
                ))}
            </nav>

            <div className="p-3 border-t border-gray-100">
                <AvatarDropdown />
            </div>
        </div>
    )

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                    onClick={() => setIsMobileOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setIsMobileOpen(false)
                        }
                    }}
                />
            )}

            <aside
                className={cn(
                    'fixed top-0 left-0 h-screen w-72 z-40 transition-transform duration-300',
                    'lg:w-64 xl:w-72',
                    'lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:z-auto',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {sidebarContent}
            </aside>
        </>
    )
})
