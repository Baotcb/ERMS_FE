/**
 * Dashboard Stats Component
 * Displays overview statistics for the dashboard
 */

import { memo } from 'react'
import { Users, Briefcase, FileText, Calendar } from 'lucide-react'
import { StatCard } from './stat-card'

// Stats data - will be replaced with real API data
const DASHBOARD_STATS = [
  { id: 1, title: 'Tổng nhân viên', value: 0, icon: Users },
  { id: 2, title: 'Đang tuyển dụng', value: 0, icon: Briefcase },
  { id: 3, title: 'CV mới', value: 0, icon: FileText },
  { id: 4, title: 'Phỏng vấn hôm nay', value: 0, icon: Calendar },
] as const

export const DashboardStats = memo(function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {DASHBOARD_STATS.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </div>
  )
})
