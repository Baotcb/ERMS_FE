'use client'

import Link from 'next/link'
import { memo, startTransition, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Menu, Search, Shield } from 'lucide-react'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/use-app-store'

export const AdminNavbar = memo(function AdminNavbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen)
  const isMobileSidebarOpen = useAppStore((state) => state.isMobileSidebarOpen)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const toggleMobileSidebar = useAppStore((state) => state.toggleMobileSidebar)
  const [keyword, setKeyword] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isDesktopViewport, setIsDesktopViewport] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const syncViewport = (matches: boolean) => {
      setIsDesktopViewport(matches)
    }

    syncViewport(mediaQuery.matches)

    const handleViewportChange = (event: MediaQueryListEvent) => {
      syncViewport(event.matches)
    }

    mediaQuery.addEventListener('change', handleViewportChange)

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange)
    }
  }, [])

  const handleMenuClick = useCallback(() => {
    if (isDesktopViewport) {
      toggleSidebar()
      return
    }

    toggleMobileSidebar()
  }, [isDesktopViewport, toggleMobileSidebar, toggleSidebar])

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

  const controlledSidebarId = isDesktopViewport
    ? 'admin-sidebar-desktop'
    : 'admin-sidebar-mobile'
  const isMenuExpanded = isDesktopViewport ? isSidebarOpen : isMobileSidebarOpen

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-white/10 bg-[linear-gradient(180deg,rgba(18,25,38,0.96),rgba(26,35,51,0.92))] px-3 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur xl:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          id="admin-shell-menu-trigger"
          type="button"
          onClick={handleMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-300 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/40"
          aria-label="Toggle sidebar"
          aria-haspopup={isDesktopViewport ? undefined : 'dialog'}
          aria-controls={controlledSidebarId}
          aria-expanded={isMenuExpanded}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.08] text-teal-200 ring-1 ring-white/10">
            <Shield className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="hidden font-bold tracking-wide text-white sm:inline">
            ERMS
          </span>
          <span className="hidden rounded-full bg-teal-400/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.24em] text-teal-100 ring-1 ring-teal-300/20 sm:inline-flex">
            ADMIN
          </span>
        </Link>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="hidden flex-1 items-center justify-center px-2 md:flex lg:px-4"
      >
        <div className="relative w-full max-w-xl rounded-full bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-sm transition-[background-color,box-shadow] focus-within:bg-white/[0.08] focus-within:ring-teal-300/30">
          <label htmlFor="admin-shell-search" className="sr-only">
            Search enterprises in admin
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="admin-shell-search"
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm doanh nghiệp, mã DN..."
            aria-label="Search enterprises"
            className="h-11 w-full rounded-full bg-transparent pl-11 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-400"
          />
        </div>
      </form>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold text-slate-100">
            {user?.fullName || 'Admin'}
          </p>
          <p className="text-[11px] text-slate-400">Platform Administrator</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors',
            'hover:bg-white/[0.06] hover:text-white',
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
