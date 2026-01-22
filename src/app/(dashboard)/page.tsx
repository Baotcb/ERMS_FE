/**
 * Dashboard Page
 * Main dashboard view for admin/employer users
 */

import { DashboardStats } from '@/features/dashboard'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tổng quan</h1>
      <DashboardStats />
    </div>
  )
}
