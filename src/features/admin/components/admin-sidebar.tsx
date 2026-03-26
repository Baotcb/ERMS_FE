'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useEffect } from 'react'
import { Shield } from 'lucide-react'
import { ADMIN_NAV_ITEMS } from '@/features/admin/constants'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/use-app-store'

export const AdminSidebar = memo(function AdminSidebar() {
  const pathname = usePathname()
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen)
  const isMobileSidebarOpen = useAppStore((state) => state.isMobileSidebarOpen)
  const setMobileSidebarOpen = useAppStore((state) => state.setMobileSidebarOpen)

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false)
  }, [setMobileSidebarOpen])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileSidebarOpen(false)
      }
    }

    mediaQuery.addEventListener('change', handleViewportChange)

    if (mediaQuery.matches) {
      setMobileSidebarOpen(false)
    }

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange)
    }
  }, [setMobileSidebarOpen])

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
          <Shield className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            ERMS Admin
          </p>
          <p className="truncate text-[11px] text-gray-500">
            Quản trị nền tảng
          </p>
        </div>
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto p-3"
        aria-label="Admin navigation"
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileSidebar}
              className={cn(
                'flex items-start gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-700'
              )}
            >
              <item.icon
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0',
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                )}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-medium">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {isMobileSidebarOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 top-14 z-40 bg-black/50 lg:hidden"
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              closeMobileSidebar()
            }
          }}
        />
      ) : null}

      <aside
        id="admin-sidebar-mobile"
        className={cn(
          'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-72 overscroll-y-contain transition-transform duration-300 lg:hidden',
          isMobileSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full pointer-events-none'
        )}
        aria-hidden={!isMobileSidebarOpen}
        inert={!isMobileSidebarOpen}
      >
        {sidebarContent}
      </aside>

      <aside
        id="admin-sidebar-desktop"
        className={cn(
          'sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 overflow-hidden transition-all duration-300 lg:block',
          isSidebarOpen ? 'w-72' : 'w-0 pointer-events-none'
        )}
        aria-hidden={!isSidebarOpen}
        inert={!isSidebarOpen}
      >
        <div className="h-full w-72">{sidebarContent}</div>
      </aside>
    </>
  )
})
