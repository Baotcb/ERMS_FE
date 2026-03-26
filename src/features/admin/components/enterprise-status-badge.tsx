'use client'

import type { EnterpriseStatus } from '@/features/admin/types'
import {
  ENTERPRISE_STATUS_COLORS,
  ENTERPRISE_STATUS_LABELS,
} from '@/features/admin/constants'
import { cn } from '@/lib/utils'

export function EnterpriseStatusBadge({
  status,
  size = 'sm',
}: {
  status: EnterpriseStatus
  size?: 'sm' | 'md'
}) {
  const colors = ENTERPRISE_STATUS_COLORS[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        colors.bg,
        colors.text,
        size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
      {ENTERPRISE_STATUS_LABELS[status]}
    </span>
  )
}
