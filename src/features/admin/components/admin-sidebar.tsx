'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useEffect, useId, useRef } from 'react'
import { Shield } from 'lucide-react'
import { ADMIN_NAV_ITEMS } from '@/features/admin/constants'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/use-app-store'

const MOBILE_DRAWER_FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(MOBILE_DRAWER_FOCUSABLE_SELECTORS)
  ).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true'
  )
}

type SidebarContentProps = {
  collapsed?: boolean
  isMobile?: boolean
  onNavigate: () => void
  pathname: string
}

function SidebarContent({
  collapsed = false,
  isMobile = false,
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
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex rounded-2xl text-sm transition-[background-color,color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--admin-shell)]',
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
                <>
                  <span className="sr-only">{item.title}</span>
                  <span
                    className={cn(
                      'pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-20 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_18px_32px_rgba(15,23,42,0.35)] ring-1 ring-white/10 transition-all duration-150',
                      !isMobile &&
                        'lg:block lg:-translate-x-2 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-x-0 lg:group-focus-visible:opacity-100'
                    )}
                    aria-hidden="true"
                  >
                    {item.title}
                  </span>
                </>
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
  const mobileSidebarRef = useRef<HTMLElement>(null)
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)
  const wasMobileSidebarOpenRef = useRef(false)
  const mobileSidebarTitleId = useId()

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

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return
    }

    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const focusableElements = mobileSidebarRef.current
      ? getFocusableElements(mobileSidebarRef.current)
      : []

    if (focusableElements[0]) {
      focusableElements[0].focus()
      return
    }

    mobileSidebarRef.current?.focus()
  }, [isMobileSidebarOpen])

  useEffect(() => {
    if (!isMobileSidebarOpen && wasMobileSidebarOpenRef.current) {
      const menuTrigger = document.getElementById('admin-shell-menu-trigger')

      if (menuTrigger instanceof HTMLElement) {
        menuTrigger.focus()
      } else {
        previouslyFocusedElementRef.current?.focus()
      }
    }

    wasMobileSidebarOpenRef.current = isMobileSidebarOpen
  }, [isMobileSidebarOpen])

  const handleMobileSidebarKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMobileSidebar()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = getFocusableElements(event.currentTarget)

      if (focusableElements.length === 0) {
        event.preventDefault()
        event.currentTarget.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    },
    [closeMobileSidebar]
  )

  return (
    <>
      {isMobileSidebarOpen ? (
        <button
          type="button"
          tabIndex={-1}
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-slate-950/55 backdrop-blur-[2px] lg:hidden"
          aria-label="Close admin navigation"
          onClick={closeMobileSidebar}
        />
      ) : null}

      <aside
        ref={mobileSidebarRef}
        id="admin-sidebar-mobile"
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-[18rem] overscroll-y-contain px-3 pb-3 transition-transform duration-300 lg:hidden',
          isMobileSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full pointer-events-none'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={mobileSidebarTitleId}
        aria-hidden={!isMobileSidebarOpen}
        inert={!isMobileSidebarOpen}
        tabIndex={-1}
        onKeyDown={handleMobileSidebarKeyDown}
      >
        <span id={mobileSidebarTitleId} className="sr-only">
          Admin navigation
        </span>
        <SidebarContent
          isMobile
          pathname={pathname}
          onNavigate={closeMobileSidebar}
        />
      </aside>

      <aside
        id="admin-sidebar-desktop"
        className={cn(
          'sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 overflow-visible transition-[width] duration-300 lg:block',
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
