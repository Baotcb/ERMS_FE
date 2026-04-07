'use client'

import { PLAN_BADGE_COLORS } from '../constants'

export function CurrentPlanBadge({ planCode, planName }: { planCode: string; planName: string }) {
    const colorClass = PLAN_BADGE_COLORS[planCode.toUpperCase() as keyof typeof PLAN_BADGE_COLORS]
        ?? PLAN_BADGE_COLORS.FREE
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
            {planName}
        </span>
    )
}
