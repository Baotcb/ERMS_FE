'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo } from 'react'
import {
    BookOpen,
    CheckSquare,
    CreditCard,
    FileText,
    GraduationCap,
    LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/use-app-store'

interface SidebarItem {
    title: string
    href?: string
    icon: React.ElementType
    children?: { label: string; href: string }[]
}

const SIDEBAR_ITEMS: SidebarItem[] = [
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
            { label: 'Duyệt kế hoạch', href: '/enterprise/director/training-approval' },
        ],
    },
]

export const DirectorSidebar = memo(function DirectorSidebar() {
    const pathname = usePathname()
    const isSidebarOpen = useAppStore((state) => state.isSidebarOpen)
    const isMobileSidebarOpen = useAppStore((state) => state.isMobileSidebarOpen)
    const setMobileSidebarOpen = useAppStore((state) => state.setMobileSidebarOpen)

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

    const dynamicSidebarItems = useMemo<SidebarItem[]>(() => {
        return SIDEBAR_ITEMS.map((item) => {
            if (item.title !== 'Đào tạo' || !item.children) {
                return item
            }

            const children = [...item.children]

            return {
                ...item,
                children,
            }
        })
<<<<<<< HEAD
    }, [])
=======
    }, [user])
>>>>>>> dev

    const sidebarContent = (
        <div className="flex h-full flex-col border-r border-gray-200 bg-white">
            <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Director navigation">
                {dynamicSidebarItems.map((item) => {
                    const Icon = item.icon
                    const hasChildren = Boolean(item.children?.length)
                    const isActive = item.href
                        ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                        : false

                    if (hasChildren) {
                        return (
                            <div key={item.title} className="space-y-1">
                                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600">
                                    <Icon className="h-5 w-5 text-gray-400" />
                                    {item.title}
                                </div>
                                <div className="ml-8 space-y-1">
                                    {item.children?.map((child) => {
                                        const isChildActive =
                                            pathname === child.href ||
                                            pathname.startsWith(`${child.href}/`)

                                        return (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                onClick={closeMobileSidebar}
                                                className={cn(
                                                    'block rounded-lg px-3 py-2 text-sm transition-all duration-200',
                                                    isChildActive
                                                        ? 'bg-blue-50 text-[#0F4C75]'
                                                        : 'text-gray-500 hover:bg-gray-50 hover:text-[#0F4C75]'
                                                )}
                                            >
                                                {child.label}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href!}
                            onClick={closeMobileSidebar}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-blue-50 text-[#0F4C75] shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#0F4C75]'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'h-5 w-5',
                                    isActive ? 'text-[#0F4C75]' : 'text-gray-400'
                                )}
                            />
                            {item.title}
                        </Link>
                    )
                })}
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
                id="director-sidebar-mobile"
                className={cn(
                    'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 overscroll-y-contain transition-transform duration-300',
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
                id="director-sidebar-desktop"
                className={cn(
                    'sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 overflow-hidden transition-all duration-300 lg:block',
                    isSidebarOpen ? 'w-64' : 'w-0 pointer-events-none'
                )}
                aria-hidden={!isSidebarOpen}
                inert={!isSidebarOpen}
            >
                <div className="h-full w-64">{sidebarContent}</div>
            </aside>
        </>
    )
})
