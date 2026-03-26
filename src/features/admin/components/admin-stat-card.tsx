'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type AdminStatCardColor =
  | 'blue'
  | 'green'
  | 'red'
  | 'amber'
  | 'indigo'
  | 'gray'

interface AdminStatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: string
  color?: AdminStatCardColor
  href?: string
}

const COLOR_MAP: Record<
  AdminStatCardColor,
  { iconBg: string; iconText: string; trendText: string }
> = {
  blue: {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    trendText: 'text-blue-600',
  },
  green: {
    iconBg: 'bg-green-50',
    iconText: 'text-green-600',
    trendText: 'text-green-600',
  },
  red: {
    iconBg: 'bg-red-50',
    iconText: 'text-red-600',
    trendText: 'text-red-600',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    trendText: 'text-amber-600',
  },
  indigo: {
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-600',
    trendText: 'text-indigo-600',
  },
  gray: {
    iconBg: 'bg-gray-100',
    iconText: 'text-gray-600',
    trendText: 'text-gray-500',
  },
}

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'indigo',
  href,
}: AdminStatCardProps) {
  const styles = COLOR_MAP[color]
  const content = (
    <>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        {trend ? (
          <p className={cn('mt-1 text-xs font-medium', styles.trendText)}>{trend}</p>
        ) : null}
      </div>

      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
          styles.iconBg
        )}
      >
        <Icon className={cn('h-5 w-5', styles.iconText)} aria-hidden="true" />
      </div>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          'flex justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md'
        )}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="flex justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {content}
    </div>
  )
}
