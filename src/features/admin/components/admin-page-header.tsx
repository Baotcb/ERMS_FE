import * as React from 'react'
import { cn } from '@/lib/utils'

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--admin-shell)]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className={cn('flex shrink-0 flex-wrap items-center gap-2')}>
          {actions}
        </div>
      ) : null}
    </header>
  )
}
