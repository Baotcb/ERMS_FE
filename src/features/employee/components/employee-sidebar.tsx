'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useEffect } from 'react'
import { CalendarDays, GraduationCap, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/use-app-store'
import { USER_ROLES } from '@/utils/constants'

interface NavItem {
    label: string
    href: string
    icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/enterprise/employee/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        label: 'Lịch phỏng vấn',
        href: '/enterprise/employee/interviews',
        icon: <CalendarDays className="h-5 w-5" />,
    },
]

const TRAINER_NAV_ITEMS: NavItem[] = [
    {
        label: 'Nhiệm vụ giảng dạy',
        href: '/enterprise/employee/teaching',
        icon: <GraduationCap className="h-5 w-5" />,
    },
]

export const EmployeeSidebar = memo(function EmployeeSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
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

    const sidebarContent = (
        <div className="flex h-full flex-col bg-white border-r border-gray-200">
            <nav className="flex-1 space-y-2 overflow-y-auto p-4" aria-label="Employee navigation">
                <div className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(`${item.href}/`)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileSidebar}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200',
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
                    })}
                </div>

                {(user?.isTrainer || user?.role === USER_ROLES.TRAINER) && (
                    <div className="mt-8 space-y-1 border-t border-gray-100 pt-6">
                        <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Giảng vụ
                        </p>
                        {TRAINER_NAV_ITEMS.map((item) => {
                            const isActive =
                                pathname === item.href || pathname.startsWith(`${item.href}/`)

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeMobileSidebar}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200',
                                        'hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75]',
                                        isActive
                                            ? 'bg-[#3282B8] text-white shadow-md'
                                            : 'text-gray-600'
                                    )}
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                )}
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
                id="employee-sidebar-mobile"
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
                id="employee-sidebar-desktop"
                className={cn(
                    'hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)] shrink-0 overflow-hidden transition-all duration-300',
                    isSidebarOpen ? 'w-72' : 'w-0 pointer-events-none'
                )}
                aria-hidden={!isSidebarOpen}
                inert={!isSidebarOpen}
            >
                <div className="h-full w-72">
                    {sidebarContent}
                </div>
            </aside>
        </>
    )
})
