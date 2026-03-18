'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, LogOut, Shield, User } from 'lucide-react'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { logoutAction } from '@/features/core/auth/actions/auth'
import { cn } from '@/lib/utils'

function UserAvatar({ avatarUrl, name }: { avatarUrl?: string | null; name?: string }) {
    const initials = (name || 'U').charAt(0).toUpperCase()
    const [imgError, setImgError] = useState(false)

    if (avatarUrl && !imgError) {
        return (
            <Image
                src={avatarUrl}
                alt={name || 'Avatar'}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
                onError={() => setImgError(true)}
            />
        )
    }

    return (
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[10px]">
            {initials}
        </div>
    )
}

export const HRNavbarSettingsDropdown = memo(function HRNavbarSettingsDropdown() {
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

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Pill-shaped toggle: Avatar + Chevron */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    'flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1 transition-colors',
                    'bg-[#1B2A4A] hover:bg-[#243556]',
                    isOpen && 'bg-[#243556]'
                )}
                aria-label="Cài đặt tài khoản"
                aria-expanded={isOpen}
            >
                <UserAvatar avatarUrl={user?.avatarUrl} name={user?.fullName} />
                <ChevronDown className={cn(
                    'w-3.5 h-3.5 text-white/70 transition-transform',
                    isOpen && 'rotate-180'
                )} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl z-50">
                    <Link
                        href="/enterprise/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <User className="h-4 w-4" />
                        <span>Hồ sơ cá nhân</span>
                    </Link>
                    <Link
                        href="/enterprise/settings/security"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <Shield className="h-4 w-4" />
                        <span>Bảo mật</span>
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            )}
        </div>
    )
})
