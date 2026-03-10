'use client'

import { useState, useCallback, memo, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
    LayoutDashboard,
    CalendarDays,
    Settings,
    LogOut,
    Menu,
    X,
    User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { logoutAction } from '@/features/core/auth/actions/auth'
import { useEnterpriseInfo } from '@/features/enterprise'

interface NavItem {
    label: string
    href: string
    icon: React.ReactNode
}

import { GraduationCap } from 'lucide-react'
import { USER_ROLES } from '@/utils/constants'

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/enterprise/employee/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        label: 'Lịch phỏng vấn',
        href: '/enterprise/employee/interviews',
        icon: <CalendarDays className="w-5 h-5" />,
    },
]

const TRAINER_NAV_ITEMS: NavItem[] = [
    {
        label: 'Nhiệm vụ giảng dạy',
        href: '/enterprise/employee/teaching',
        icon: <GraduationCap className="w-5 h-5" />,
    },
]

// Avatar Dropdown Component
const AvatarDropdown = memo(function AvatarDropdown() {
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

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
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center text-white font-semibold text-sm hover:shadow-lg transition-shadow cursor-pointer"
            >
                {initials}
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800 truncate">{user?.fullName || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

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

export const EmployeeSidebar = memo(function EmployeeSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const { enterpriseInfo } = useEnterpriseInfo()

    const sidebarContent = (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <Link href="/enterprise/employee/dashboard" className="flex items-center gap-3">
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
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-[#0F4C75] text-lg">ERMS</h1>
                        <p className="text-xs text-gray-400">Employee Portal</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
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
                    })}
                </div>

                {/* Trainer Section */}
                {user?.role === USER_ROLES.TRAINER && (
                    <div className="mt-8 pt-6 border-t border-gray-100 space-y-1">
                        <p className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Giảng vụ
                        </p>
                        {TRAINER_NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
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
                    'lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:z-auto',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {sidebarContent}
            </aside>
        </>
    )
})
