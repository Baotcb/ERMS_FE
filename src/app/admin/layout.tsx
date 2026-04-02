import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminNavbar } from '@/features/admin/components/admin-navbar'
import { AdminSidebar } from '@/features/admin/components/admin-sidebar'
import { getServerSession } from '@/lib/server-fetch'
import {
  DEFAULT_ENTERPRISE_DASHBOARD,
  ROLE_DASHBOARD_MAP,
  USER_ROLES,
} from '@/utils/constants'

export const metadata: Metadata = {
  title: 'ERMS Admin',
  description: 'Quản trị nền tảng ERMS',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session.token) {
    redirect('/login')
  }

  if (session.role !== USER_ROLES.ADMIN) {
    const fallbackRoute =
      ROLE_DASHBOARD_MAP[session.role || ''] || DEFAULT_ENTERPRISE_DASHBOARD
    redirect(fallbackRoute)
  }

  return (
    <div className="admin-theme admin-canvas relative flex min-h-screen flex-col">
      <a
        href="#admin-main-content"
        className="absolute left-3 top-3 z-[60] -translate-y-16 rounded-full bg-[color:var(--admin-shell)] px-4 py-2 text-sm font-medium text-white shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/80"
      >
        Skip to main content
      </a>
      <AdminNavbar />
      <div className="flex min-h-0 flex-1 gap-3 px-3 pb-3 pt-3 sm:gap-4 sm:px-4 sm:pb-4 sm:pt-4 xl:px-5 xl:pb-5 xl:pt-5">
        <AdminSidebar />
        <main
          id="admin-main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-y-auto px-1 pb-2 focus:outline-none sm:px-2 sm:pb-3 xl:px-3 xl:pb-4"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
