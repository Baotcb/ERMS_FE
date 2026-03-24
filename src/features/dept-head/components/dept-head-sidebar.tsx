'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
    Briefcase,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    GraduationCap,
    LayoutDashboard,
} from 'lucide-react'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { canAccessLearningWorkspace } from '@/features/hr/utils/learning-access'
import { canAccessTeachingWorkspace } from '@/features/hr/utils/teaching-access'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/use-app-store'
import { USER_ROLES } from '@/utils/constants'

interface NavItem {
    label: string
    href?: string
    icon: React.ReactNode
    children?: { label: string; href: string }[]
}

const NAV_ITEMS: NavItem[] = [
    {
        icon: <LayoutDashboard className="h-5 w-5" />,
        label: 'Dashboard',
        href: '/enterprise/dept-head/dashboard',
    },
    {
        icon: <Briefcase className="h-5 w-5" />,
        label: 'Tuyển dụng',
        children: [
            { label: 'Chiến dịch tuyển dụng', href: '/enterprise/dept-head/recruitment' },
            { label: 'Đề xuất nhân sự', href: '/enterprise/dept-head/shortlisted' },
            { label: 'Phỏng vấn', href: '/enterprise/dept-head/interviews' },
        ],
    },
    {
        icon: <GraduationCap className="h-5 w-5" />,
        label: 'Đào tạo',
        children: [
            { label: 'Yêu cầu của tôi', href: '/enterprise/dept-head/training' },
            { label: 'Kế hoạch đào tạo', href: '/enterprise/dept-head/training/plans' },
            { label: 'Khóa học khả dụng', href: '/enterprise/dept-head/training/courses' },
            { label: 'Phân công đào tạo', href: '/enterprise/dept-head/training/assign' },
        ],
    },
    {
        icon: <ClipboardList className="h-5 w-5" />,
        label: 'Đánh giá',
        href: '/enterprise/dept-head/evaluation',
    },
]

const NavMenuItem = memo(function NavMenuItem({
    item,
    isActive,
    isExpanded,
    onToggle,
    pathname,
    onNavigate,
}: {
    item: NavItem
    isActive: boolean
    isExpanded: boolean
    onToggle: (label: string) => void
    pathname: string
    onNavigate: () => void
}) {
    const hasChildren = Boolean(item.children?.length)

    if (!hasChildren && item.href) {
        return (
            <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200',
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
                    'flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 transition-all duration-200',
                    'hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75]',
                    isExpanded ? 'bg-[#BBE1FA]/30 text-[#0F4C75]' : 'text-gray-600'
                )}
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                </div>
                {isExpanded ? (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                ) : (
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
            </button>

            <div
                className={cn(
                    'overflow-hidden transition-all duration-300',
                    isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <div className="ml-8 mt-1 space-y-1">
                    {item.children?.map((child) => {
                        const isChildActive =
                            pathname === child.href || pathname.startsWith(`${child.href}/`)

                        return (
                            <Link
                                key={child.href}
                                href={child.href}
                                onClick={onNavigate}
                                className={cn(
                                    'block rounded-lg px-4 py-2 text-sm transition-all duration-200',
                                    isChildActive
                                        ? 'bg-[#BBE1FA]/30 font-medium text-[#0F4C75]'
                                        : 'text-gray-500 hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75]'
                                )}
                            >
                                {child.label}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
})

export const DeptHeadSidebar = memo(function DeptHeadSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const isSidebarOpen = useAppStore((state) => state.isSidebarOpen)
    const isMobileSidebarOpen = useAppStore((state) => state.isMobileSidebarOpen)
    const setMobileSidebarOpen = useAppStore((state) => state.setMobileSidebarOpen)
    const [expandedItems, setExpandedItems] = useState<string[]>(['Tuyển dụng', 'Đào tạo'])

    const toggleExpand = useCallback((label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((itemLabel) => itemLabel !== label)
                : [...prev, label]
        )
    }, [])

    const closeMobileSidebar = useCallback(() => {
        setMobileSidebarOpen(false)
    }, [setMobileSidebarOpen])

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)')
        const handleViewportChange = (event: MediaQueryListEvent) => {
            if (event.matches) {
                setMobileSidebarOpen(false)
            }
        }

        mediaQuery.addEventListener('change', handleViewportChange)

        if (mediaQuery.matches) {
            setMobileSidebarOpen(false)
        }

        return () => {
            mediaQuery.removeEventListener('change', handleViewportChange)
        }
    }, [setMobileSidebarOpen])

    const isItemActive = useCallback(
        (item: NavItem): boolean => {
            if (item.href) {
                return pathname === item.href || pathname.startsWith(`${item.href}/`)
            }

            return (
                item.children?.some(
                    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
                ) ?? false
            )
        },
        [pathname]
    )

    const navItems = useMemo<NavItem[]>(() => {
        return NAV_ITEMS.map((item) => {
            if (item.label !== 'Đào tạo' || !item.children) {
                return item
            }

            const children = [...item.children]

            if (
                canAccessTeachingWorkspace(user, USER_ROLES.DEPARTMENT_HEAD) &&
                !children.some((child) => child.href === '/enterprise/dept-head/teaching')
            ) {
                children.push({
                    label: 'Khóa học giảng dạy',
                    href: '/enterprise/dept-head/teaching',
                })
            }

            if (
                canAccessLearningWorkspace(user, USER_ROLES.DEPARTMENT_HEAD) &&
                !children.some((child) => child.href === '/enterprise/dept-head/learning')
            ) {
                children.push({
                    label: 'Khóa học của tôi',
                    href: '/enterprise/dept-head/learning',
                })
            }

            return {
                ...item,
                children,
            }
        })
    }, [user?.isTrainer, user?.role])

    const sidebarContent = (
        <div className="flex h-full flex-col border-r border-gray-200 bg-white">
            <nav
                className="flex-1 space-y-2 overflow-y-auto p-4"
                aria-label="Department head navigation"
            >
                {navItems.map((item) => (
                    <NavMenuItem
                        key={item.label}
                        item={item}
                        isActive={isItemActive(item)}
                        isExpanded={expandedItems.includes(item.label)}
                        onToggle={toggleExpand}
                        pathname={pathname}
                        onNavigate={closeMobileSidebar}
                    />
                ))}
            </nav>
        </div>
    )

    return (
        <>
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-x-0 bottom-0 top-14 z-40 bg-black/50 lg:hidden"
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                    onClick={closeMobileSidebar}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            closeMobileSidebar()
                        }
                    }}
                />
            )}

            <aside
                id="dept-head-sidebar-mobile"
                className={cn(
                    'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-72 overscroll-y-contain transition-transform duration-300',
                    'lg:hidden',
                    isMobileSidebarOpen
                        ? 'translate-x-0'
                        : '-translate-x-full pointer-events-none'
                )}
                aria-hidden={!isMobileSidebarOpen}
                inert={!isMobileSidebarOpen}
            >
                {sidebarContent}
            </aside>

            <aside
                id="dept-head-sidebar-desktop"
                className={cn(
                    'sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 overflow-hidden transition-all duration-300 lg:block',
                    isSidebarOpen ? 'w-72' : 'w-0 pointer-events-none'
                )}
                aria-hidden={!isSidebarOpen}
                inert={!isSidebarOpen}
            >
                <div className="h-full w-72">{sidebarContent}</div>
            </aside>
        </>
    )
})
