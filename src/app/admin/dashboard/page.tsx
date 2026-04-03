import type { Metadata } from 'next'
import AdminDashboardPageContent from '@/features/admin/components/admin-dashboard-page'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Admin Portal',
}

export default function AdminDashboardPage() {
  return <AdminDashboardPageContent />
}
