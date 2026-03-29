import type React from 'react'
import type { LucideIcon } from 'lucide-react'
import { AdminPanel } from './admin-panel'

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <AdminPanel
      variant="subtle"
      className="flex min-h-[240px] flex-col items-center justify-center gap-4 px-6 py-10 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl admin-accent-soft">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-lg font-semibold text-[color:var(--admin-shell)]">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
      </div>

      {action ? <div className="pt-2">{action}</div> : null}
    </AdminPanel>
  )
}
