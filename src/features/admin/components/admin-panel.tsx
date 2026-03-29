import * as React from 'react'
import { cn } from '@/lib/utils'

type AdminPanelVariant = 'default' | 'subtle' | 'ghost'

const panelVariantClasses: Record<AdminPanelVariant, string> = {
  default: 'admin-panel',
  subtle: 'admin-panel-subtle',
  ghost: 'admin-panel-ghost',
}

export function AdminPanel({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode
  variant?: AdminPanelVariant
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6',
        panelVariantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  )
}
