'use client'

import { memo, useMemo } from 'react'
import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { EnterpriseNavbar } from '@/components/layout/enterprise-navbar'
import { HR_QUICK_ACTIONS, filterItemsByRole } from './hr-navigation-config'

export const HRNavbar = memo(function HRNavbar() {
    const { user } = useAuth()

    const quickActions = useMemo(() => {
        return filterItemsByRole(HR_QUICK_ACTIONS, user?.role)
    }, [user?.role])

    return (
        <EnterpriseNavbar
            dashboardHref="/enterprise/hr/dashboard"
            quickActions={quickActions}
        />
    )
})
