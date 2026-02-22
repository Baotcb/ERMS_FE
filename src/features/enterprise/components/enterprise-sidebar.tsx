'use client'

import { useState, useCallback, memo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
    LayoutDashboard,
    Building2,
    Users,
    ChevronDown,
    ChevronRight,
    Settings,
    LogOut,
    Menu,
    X,
    User,
    GraduationCap,
    BarChart3,
    FileText,
    Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { useEnterpriseInfo } from '@/features/enterprise'

interface NavItem {
    label: string
    href?: string
    icon: React.ReactNode
    children?: { label: string; href: string }[]
    roles?: string[] // Roles that can see this item, empty = all
}

// All navigation items with role restrictions
const NAV_ITEMS: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: [] // Everyone can see
    },
    {
        label: 'Phòng ban',
        icon: <Building2 className="w-5 h-5" />,
        roles: ['HRManager', 'Director'],
        children: [
            { label: 'Danh sách', href: '/departments' },
            { label: 'Thêm mới', href: '/departments/create' }
        ]
    },
    {
        label: 'Nhân viên',
        icon: <Users className="w-5 h-5" />,
        roles: ['HRManager', 'Director'],
        children: [
            { label: 'Danh sách', href: '/employees' },
            { label: 'Thêm mới', href: '/employees/create' },
            { label: 'Import Excel', href: '/employees/import' }
        ]
    },
    {
        label: 'Đào tạo',
        icon: <GraduationCap className="w-5 h-5" />,
        roles: ['Trainer', 'HRManager', 'Director'],
        children: [
            { label: 'Khóa học', href: '/training/courses' },
            { label: 'Lịch đào tạo', href: '/training/schedule' }
        ]
    },
    {
        label: 'Báo cáo',
        icon: <BarChart3 className="w-5 h-5" />,
        roles: ['Director', 'DepartmentHead'],
        children: [
            { label: 'Tổng quan', href: '/reports/overview' },
            { label: 'Nhân sự', href: '/reports/hr' }
        ]
    },
    {
        label: 'Công việc',
        icon: <FileText className="w-5 h-5" />,
        roles: ['Employee'],
        children: [
            { label: 'Nhiệm vụ', href: '/tasks' },
            { label: 'Chấm công', href: '/attendance' }
        ]
    },
    {
        label: 'Lịch',
        href: '/calendar',
        icon: <Calendar className="w-5 h-5" />,
        roles: [] // Everyone
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

// Avatar Dropdown Component
const AvatarDropdown = memo(function AvatarDropdown() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = useCallback(() => {
        logout()
        router.push('/login')
    }, [logout, router])

    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U'

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
                        {user?.role && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-[#0F4C75]/10 text-[#0F4C75] text-xs rounded-full">
                                {user.role}
                            </span>
                        )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            <span>Hồ sơ cá nhân</span>
                        </Link>
                        <Link
                            href="/settings"
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

export const EnterpriseSidebar = memo(function EnterpriseSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const [expandedItems, setExpandedItems] = useState<string[]>(['Phòng ban', 'Nhân viên'])
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const { enterpriseInfo } = useEnterpriseInfo()

    const userRole = user?.role || ''

    // Filter nav items based on user role
    const visibleNavItems = NAV_ITEMS.filter(item => {
        if (!item.roles || item.roles.length === 0) return true
        return item.roles.includes(userRole)
    })

    const toggleExpand = useCallback((label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((l) => l !== label)
                : [...prev, label]
        )
    }, [])

    const isItemActive = (item: NavItem): boolean => {
        if (item.href) {
            return pathname === item.href
        }
        return item.children?.some((child) => pathname === child.href) ?? false
    }

    const sidebarContent = (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <Link href="/dashboard" className="flex items-center gap-3">
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
                            <span className="text-white font-bold text-sm">ER</span>
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-[#0F4C75] text-lg">ERMS</h1>
                        <p className="text-xs text-gray-400">Enterprise Portal</p>
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
                        onToggle={toggleExpand}
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
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                    onClick={() => setIsMobileOpen(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsMobileOpen(false) } }}
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
