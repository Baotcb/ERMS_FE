'use client'

import { memo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, Menu, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/use-app-store'
import { useEnterpriseInfo } from '@/features/enterprise'
import { NavbarSettingsDropdown } from './navbar-settings-dropdown'

export interface NavQuickAction {
    href: string
    icon: LucideIcon
    label: string
}

interface EnterpriseNavbarProps {
    /** Link khi click logo, mặc định '/enterprise' */
    dashboardHref?: string
    /** Các nút action role-specific (ví dụ: Đăng tin, Tìm CV cho HR) */
    quickActions?: NavQuickAction[]
}

const NavAction = memo(function NavAction({ href, icon: Icon, label }: NavQuickAction) {
    return (
        <Link
            href={href}
            aria-label={label}
            title={label}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-[#BBE1FA]/20 hover:text-[#0F4C75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C75]/30"
        >
            <Icon className="w-4 h-4" aria-hidden="true" />
            <span className="hidden xl:inline">{label}</span>
        </Link>
    )
})

export const EnterpriseNavbar = memo(function EnterpriseNavbar({
    dashboardHref = '/enterprise',
    quickActions = [],
}: EnterpriseNavbarProps) {
    const toggleSidebar = useAppStore((s) => s.toggleSidebar)
    const toggleMobileSidebar = useAppStore((s) => s.toggleMobileSidebar)
    const { enterpriseInfo } = useEnterpriseInfo()

    const handleMenuClick = useCallback(() => {
        if (window.matchMedia('(min-width: 1024px)').matches) {
            toggleSidebar()
            return
        }
        toggleMobileSidebar()
    }, [toggleMobileSidebar, toggleSidebar])

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleMenuClick}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#0F4C75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C75]/30"
                    aria-label="Ẩn/hiện sidebar"
                >
                    <Menu className="w-5 h-5" aria-hidden="true" />
                </button>

                <Link href={dashboardHref} className="flex items-center gap-2">
                    {enterpriseInfo?.logoUrl ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-white flex items-center justify-center">
                            <Image
                                src={enterpriseInfo.logoUrl}
                                alt={enterpriseInfo.enterpriseName || 'Logo'}
                                width={28}
                                height={28}
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">E</span>
                        </div>
                    )}
                    <span className="font-bold text-[#0F4C75] text-base hidden sm:inline">
                        ERMS
                    </span>
                </Link>
            </div>

            {/* Right: Quick Actions + Notification + Settings */}
            <div className="flex items-center gap-1">
                {quickActions.map((action) => (
                    <NavAction
                        key={action.href}
                        href={action.href}
                        icon={action.icon}
                        label={action.label}
                    />
                ))}

                {quickActions.length > 0 ? <div className="mx-1 h-6 w-px bg-gray-200" /> : null}

                {/* Notification bell */}
                <button
                    type="button"
                    className={cn(
                        'relative flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                        'text-gray-500 hover:bg-gray-100 hover:text-[#0F4C75]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C75]/30'
                    )}
                    aria-label="Thông báo"
                >
                    <Bell className="w-5 h-5" aria-hidden="true" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                </button>

                {/* Settings dropdown */}
                <NavbarSettingsDropdown />
            </div>
        </header>
    )
})
