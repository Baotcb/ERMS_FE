/**
 * Dashboard Page
 * Main dashboard view for admin/employer users
 */

import { DashboardStats } from '@/features/domains/dashboard/components'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardStats />
    </div>
  )
}
