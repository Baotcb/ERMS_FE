'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useEffect } from 'react'
import { Shield } from 'lucide-react'
import { ADMIN_NAV_ITEMS } from '@/features/admin/constants'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/use-app-store'

type SidebarContentProps = {
  collapsed?: boolean
  onNavigate: () => void
  pathname: string
}

function SidebarContent({
  collapsed = false,
  onNavigate,
  pathname,
}: SidebarContentProps) {
  return (
    <div className="admin-shell flex h-full flex-col rounded-[28px] border border-white/10 p-3 shadow-[0_20px_45px_rgba(15,23,42,0.2)]">
      <div
        className={cn(
          'rounded-2xl border border-white/10 bg-white/[0.04]',
          collapsed
            ? 'flex justify-center px-2 py-3'
            : 'flex items-center gap-3 px-3 py-3'
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] text-teal-200 ring-1 ring-white/10">
          <Shield className="h-5 w-5" aria-hidden="true" />
        </div>

        {collapsed ? (
          <span className="sr-only">ERMS Admin</span>
        ) : (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-wide text-white">
              ERMS Admin
            </p>
            <p className="truncate text-[11px] text-slate-400">
              Quản trị nền tảng
            </p>
          </div>
        )}
      </div>

      <nav
        className="mt-4 flex-1 space-y-1 overflow-y-auto"
        aria-label="Admin navigation"
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.title : undefined}
              className={cn(
                'group relative flex rounded-2xl text-sm transition-[background-color,color,transform] duration-200',
                collapsed
                  ? 'justify-center px-2 py-3'
                  : 'items-start gap-3 px-3 py-3.5',
                isActive
                  ? 'bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
              )}
            >
              {isActive ? (
                <span
                  className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-teal-300"
                  aria-hidden="true"
                />
              ) : null}

              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  collapsed ? '' : 'mt-0.5',
                  isActive
                    ? 'text-teal-200'
                    : 'text-slate-500 transition-colors group-hover:text-slate-200'
                )}
                aria-hidden="true"
              />

              {collapsed ? (
                <span className="sr-only">{item.title}</span>
              ) : (
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  {item.description ? (
                    <p
                      className={cn(
                        'mt-0.5 text-xs leading-5',
                        isActive ? 'text-slate-200/80' : 'text-slate-400'
                      )}
                    >
                      {item.description}
                    </p>
                  ) : null}
                </div>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

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

  return (
    <>
      {isMobileSidebarOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-slate-950/55 backdrop-blur-[2px] lg:hidden"
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
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-[18rem] overscroll-y-contain px-3 pb-3 transition-transform duration-300 lg:hidden',
          isMobileSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full pointer-events-none'
        )}
        aria-hidden={!isMobileSidebarOpen}
        inert={!isMobileSidebarOpen}
      >
        <SidebarContent pathname={pathname} onNavigate={closeMobileSidebar} />
      </aside>

      <aside
        id="admin-sidebar-desktop"
        className={cn(
          'sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 overflow-hidden transition-[width] duration-300 lg:block',
          isSidebarOpen ? 'w-[18rem]' : 'w-20'
        )}
        aria-label={isSidebarOpen ? 'Admin sidebar' : 'Admin sidebar collapsed'}
      >
        <SidebarContent
          collapsed={!isSidebarOpen}
          pathname={pathname}
          onNavigate={closeMobileSidebar}
        />
      </aside>
    </>
  )
})
