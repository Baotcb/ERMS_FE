'use client'

import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { USER_ROLES } from '@/utils/constants'

export function useAdminGuard() {
    const { user } = useAuth()

    const isAdmin = user?.role === USER_ROLES.ADMIN

    const assertAdmin = () => {
        if (!isAdmin) {
            throw new Error('Chỉ Admin mới có quyền thực hiện thao tác này.')
        }
    }

    return {
        user,
        isAdmin,
        assertAdmin,
    }
}
