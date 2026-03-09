'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronUp, LogOut, Settings, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { logoutAction } from '@/features/core/auth/actions/auth'
import { USER_ROLES } from '@/utils/constants'

function getRoleLabel(role?: string) {
    switch (role) {
        case USER_ROLES.ADMIN:
            return 'Admin'
        case USER_ROLES.HR_MANAGER:
            return 'HR Manager'
        case USER_ROLES.HR:
            return 'HR'
        case USER_ROLES.DIRECTOR:
            return 'Director'
        case USER_ROLES.DEPARTMENT_HEAD:
            return 'Dept Head'
        case USER_ROLES.EMPLOYEE:
            return 'Employee'
        case USER_ROLES.TRAINER:
            return 'Trainer'
        default:
            return 'Enterprise user'
    }
}

export const AvatarDropdown = memo(function AvatarDropdown() {
    const { user, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null)
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

    const initials = user?.fullName
        ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U'

    const roleLabel = getRoleLabel(user?.role)
    const canRenderAvatarImage = Boolean(user?.avatarUrl) && failedImageSrc !== user?.avatarUrl

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-left transition-all hover:border-[#0F4C75]/20 hover:bg-slate-50"
            >
                <Avatar className="h-11 w-11 shrink-0 border border-white shadow-sm">
                    {canRenderAvatarImage ? (
                        <AvatarImage
                            src={user?.avatarUrl}
                            alt={user?.fullName || 'User avatar'}
                            className="object-cover"
                            onError={() => setFailedImageSrc(user?.avatarUrl || null)}
                        />
                    ) : null}
                    <AvatarFallback className="bg-[#0F4C75] text-white">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                        {user?.fullName || 'Nguoi dung'}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                        {roleLabel}
                    </p>
                </div>
                <ChevronUp className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border border-gray-100 bg-white py-2 shadow-xl z-50">
                    <div className="py-1">
                        <Link
                            href="/enterprise/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <User className="h-4 w-4" />
                            <span>Hồ sơ cá nhân</span>
                        </Link>
                        <Link
                            href="/enterprise/settings/security"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <Settings className="h-4 w-4" />
                            <span>Bảo mật</span>
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-red-600 transition-colors hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
})
