'use client'

import { useState, useCallback, memo, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    ClipboardList,
    Briefcase,
    Settings,
    ChevronDown,
    ChevronRight,
    LogOut,
    User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { logoutAction } from '@/features/core/auth/actions/auth'

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
            { label: 'Đề xuất nhân sự', href: '/enterprise/dept-head/proposals' },
            { label: 'Chiến dịch tuyển dụng', href: '/enterprise/dept-head/recruitment' },
            { label: 'Kế hoạch tuyển dụng', href: '/enterprise/dept-head/recruitment-plans' },
        ]
    },
    {
        icon: <GraduationCap className="w-5 h-5" />,
        label: 'Đào tạo',
        href: '/enterprise/dept-head/training'
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

// Avatar Dropdown Component - Copied and adapted from HRSidebar
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
                        <p className="font-semibold text-gray-800 truncate">{user?.fullName || 'Trưởng phòng'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'manager@erms.com'}</p>
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

export function DeptHeadSidebar() {
    const pathname = usePathname()
    const [expandedItems, setExpandedItems] = useState<string[]>(['Tuyển dụng'])

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

    return (
        <aside className="w-72 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col z-40 shrink-0">
            {/* Logo area */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#0F4C75]">ERMS</h1>
                        <p className="text-xs text-gray-400 font-medium">Department Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {NAV_ITEMS.map((item) => (
                    <NavMenuItem
                        key={item.label}
                        item={item}
                        isActive={isItemActive(item)}
                        isExpanded={expandedItems.includes(item.label)}
                        onToggle={() => toggleExpand(item.label)}
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
