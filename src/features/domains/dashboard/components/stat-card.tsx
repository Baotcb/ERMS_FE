/**
 * Stat Card Component
 * Displays a single statistic with title and value
 */

import { memo } from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  className?: string
}

export const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  className = '',
}: StatCardProps) {
  return (
    <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-600">{title}</h3>
        {Icon && <Icon className="w-6 h-6 text-brand-primary" />}
      </div>
      <p className="text-3xl font-bold mt-2 text-slate-900">{value}</p>
    </div>
  )
})
