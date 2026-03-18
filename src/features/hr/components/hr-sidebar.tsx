'use client'

import { useState, useCallback, memo, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    ChevronDown,
    ChevronRight,
    type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { useAppStore } from '@/stores/use-app-store'
import {
    HR_NAV_ITEMS,
    filterItemsByRole,
    type HRNavItem,
} from './hr-navigation-config'

const NavMenuItem = memo(function NavMenuItem({
    item,
    isActive,
    isExpanded,
    onToggle,
    pathname,
    onNavigate,
}: {
    item: HRNavItem
    isActive: boolean
    isExpanded: boolean
    onToggle: (label: string) => void
    pathname: string
    onNavigate: () => void
}) {
    const hasChildren = item.children && item.children.length > 0
    const Icon = item.icon as LucideIcon

    if (!hasChildren && item.href) {
        return (
            <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                    'hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75]',
                    isActive ? 'bg-[#0F4C75] text-white shadow-md' : 'text-gray-600'
                )}
            >
                <Icon className="w-5 h-5" aria-hidden="true" />
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
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">{item.label}</span>
                </div>
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                ) : (
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                )}
            </button>

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
                            onClick={onNavigate}
                            className={cn(
                                'block rounded-lg px-3 py-1.5 text-[13px] transition-all duration-200',
                                pathname === child.href
                                    ? 'bg-[#BBE1FA]/30 font-medium text-[#0F4C75]'
                                    : 'text-gray-500 hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75]'
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

export const HRSidebar = memo(function HRSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const isSidebarOpen = useAppStore((s) => s.isSidebarOpen)
    const isMobileSidebarOpen = useAppStore((s) => s.isMobileSidebarOpen)
    const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen)
    const [expandedItems, setExpandedItems] = useState<string[]>(['Nhân sự', 'Đào tạo'])

    const userRole = useMemo(() => user?.role || '', [user?.role])

    const visibleNavItems = useMemo(() => {
        return filterItemsByRole(HR_NAV_ITEMS, userRole)
    }, [userRole])

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

    const isItemActive = useCallback((item: HRNavItem): boolean => {
        if (item.href) {
            return pathname === item.href
        }
        return item.children?.some((child) => pathname === child.href) ?? false
    }, [pathname])

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

    const sidebarNav = (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            <nav className="flex-1 space-y-1.5 overflow-y-auto p-3" aria-label="HR navigation">
                {visibleNavItems.map((item) => (
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
            {/* Mobile overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-x-0 bottom-0 top-14 z-40 bg-black/50 lg:hidden"
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                    onClick={() => setMobileSidebarOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setMobileSidebarOpen(false)
                        }
                    }}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                id="hr-sidebar-mobile"
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
                {sidebarNav}
            </aside>

            {/* Desktop sidebar — collapsible via navbar hamburger */}
            <aside
                id="hr-sidebar-desktop"
                className={cn(
                    'hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)] shrink-0 transition-all duration-300 overflow-hidden',
                    isSidebarOpen ? 'w-64 xl:w-72' : 'w-0 pointer-events-none'
                )}
                aria-hidden={!isSidebarOpen}
                inert={!isSidebarOpen}
            >
                <div className="w-64 xl:w-72 h-full">
                    {sidebarNav}
                </div>
            </aside>
        </>
    )
})
