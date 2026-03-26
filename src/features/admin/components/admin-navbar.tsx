'use client'

import Link from 'next/link'
import { memo, startTransition, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Menu, Search, Shield } from 'lucide-react'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/use-app-store'

export const AdminNavbar = memo(function AdminNavbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const toggleMobileSidebar = useAppStore((state) => state.toggleMobileSidebar)
  const [keyword, setKeyword] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleMenuClick = useCallback(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      toggleSidebar()
      return
    }

    toggleMobileSidebar()
  }, [toggleMobileSidebar, toggleSidebar])

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const normalizedKeyword = keyword.trim()
      const destination = normalizedKeyword
        ? `/admin/enterprises?search=${encodeURIComponent(normalizedKeyword)}`
        : '/admin/enterprises'

      startTransition(() => {
        router.push(destination)
      })
    },
    [keyword, router]
  )

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await fetch('/api/auth/session/logout', {
        method: 'POST',
      })
    } finally {
      logout()
      window.location.href = '/login'
    }
  }, [isLoggingOut, logout])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={handleMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
          aria-label="Ẩn/hiện sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Shield className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="hidden font-bold text-gray-900 sm:inline">ERMS</span>
          <span className="hidden rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 sm:inline-flex">
            ADMIN
          </span>
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="hidden flex-1 items-center md:flex">
        <div className="relative w-full max-w-xl">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm doanh nghiệp, mã DN..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white"
          />
        </div>
      </form>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold text-gray-900">
            {user?.fullName || 'Admin'}
          </p>
          <p className="text-[11px] text-gray-500">Platform Administrator</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors',
            'hover:border-red-200 hover:bg-red-50 hover:text-red-600',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </span>
        </button>
      </div>
    </header>
  )
})
