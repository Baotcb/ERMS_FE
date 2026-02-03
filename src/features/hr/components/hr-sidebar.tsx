'use client'

import { useState, useCallback, memo, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    ChevronDown,
    ChevronRight,
    Settings,
    LogOut,
    Menu,
    X,
    User,
    CalendarRange
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { logoutAction } from '@/features/core/auth/actions/auth'

interface NavItem {
    label: string
    href?: string
    icon: React.ReactNode
    children?: { label: string; href: string }[]
    roles?: string[] // Which roles can see this item. Empty = all roles
}

// Navigation items with role-based visibility
const NAV_ITEMS: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/enterprise/hr/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: [] // All roles
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
            { label: 'Chiến dịch tuyển dụng', href: '/enterprise/hr/recruitment-campaigns' }
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
    onToggle: () => void
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
                onClick={onToggle}
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

// Avatar Dropdown Component
const AvatarDropdown = memo(function AvatarDropdown() {
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const handleLogout = useCallback(async () => {
        await logoutAction()
        logout()
    }, [logout])

    const initials = useMemo(() => user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U',
        [user])

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center text-white font-semibold text-sm hover:shadow-lg transition-shadow cursor-pointer"
            >
                {initials}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800 truncate">{user?.fullName || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <Link
                            href="/enterprise/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            <span>Hồ sơ cá nhân</span>
                        </Link>
                        <Link
                            href="/enterprise/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            <span>Cài đặt</span>
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-1">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
})

export const HRSidebar = memo(function HRSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const [expandedItems, setExpandedItems] = useState<string[]>(['Nhân sự'])
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Get user role for filtering navigation (memoized)
    const userRole = useMemo(() => user?.role || '', [user?.role])

    // Filter navigation items based on user role (memoized)
    const visibleNavItems = useMemo(() => {
        return NAV_ITEMS.filter(item => {
            if (!item.roles || item.roles.length === 0) return true // Empty = visible to all
            return item.roles.includes(userRole)
        })
    }, [userRole])

    const toggleExpand = useCallback((label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((l) => l !== label)
                : [...prev, label]
        )
    }, [])

    // Memoize isItemActive function to prevent recreation
    const isItemActive = useCallback((item: NavItem): boolean => {
        if (item.href) {
            return pathname === item.href
        }
        return item.children?.some((child) => pathname === child.href) ?? false
    }, [pathname])

    const sidebarContent = (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <Link href="/enterprise/hr/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">HR</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-[#0F4C75] text-lg">ERMS</h1>
                        <p className="text-xs text-gray-400">HR Management</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {visibleNavItems.map((item) => (
                    <NavMenuItem
                        key={item.label}
                        item={item}
                        isActive={isItemActive(item)}
                        isExpanded={expandedItems.includes(item.label)}
                        onToggle={() => toggleExpand(item.label)}
                    />
                ))}
            </nav>

            {/* Footer with Avatar */}
            <div className="p-4 border-t border-gray-100">
                <AvatarDropdown />
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 h-screen w-72 z-40 transition-transform duration-300',
                    'lg:translate-x-0 lg:static lg:z-auto',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {sidebarContent}
            </aside>
        </>
    )
})

