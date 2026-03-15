'use client'

import { useState, memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
    LayoutDashboard,
    CalendarDays,
    Menu,
    X,
    BookOpenCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AvatarDropdown } from '@/components/common/avatar-dropdown'
import { useEnterpriseInfo } from '@/features/enterprise'
import { useAuth } from '@/features/core/auth/hooks/use-auth'

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
    {
        label: 'Khóa học của tôi',
        href: '/enterprise/employee/learning',
        icon: <BookOpenCheck className="w-5 h-5" />,
    },
]

const TRAINER_NAV_ITEMS: NavItem[] = [
    {
        label: 'Nhiệm vụ giảng dạy',
        href: '/enterprise/employee/teaching',
        icon: <GraduationCap className="w-5 h-5" />,
    },
]

export const EmployeeSidebar = memo(function EmployeeSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const { enterpriseInfo } = useEnterpriseInfo()

    const sidebarContent = (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            <div className="p-6 border-b border-gray-100">
                <Link href="/enterprise/employee/dashboard" className="flex items-center gap-3">
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
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                    )}
                    <div>
                        <h1 className="font-bold text-[#0F4C75] text-lg">ERMS</h1>
                        <p className="text-xs text-gray-400">Employee Portal</p>
                    </div>
                </Link>
            </div>

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
                {(user?.isTrainer || user?.role === USER_ROLES.TRAINER) && (
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

            <div className="p-4 border-t border-gray-100">
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
                    'lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:z-auto',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {sidebarContent}
            </aside>
        </>
    )
})
