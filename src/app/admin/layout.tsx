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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <AdminNavbar />
      <div className="flex min-h-0 flex-1">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-5 xl:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
