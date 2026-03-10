'use client'

import { useCallback, startTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { ROLE_DASHBOARD_MAP, USER_ROLES } from '@/utils/constants'
import { useAuth } from './use-auth'

interface RequireCandidateOptions {
  action?: string
  redirectTo?: string
}

export function useCandidateAccess() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { isAuthenticated, isLoading, user } = useAuth()

  const isCandidate = user?.role === USER_ROLES.CANDIDATE

  const requireCandidate = useCallback((options: RequireCandidateOptions = {}) => {
    const actionLabel = options.action || 'thực hiện thao tác này'
    const redirectTarget = options.redirectTo || pathname || '/'

    if (isLoading) {
      return false
    }

    if (!isAuthenticated) {
      toast({
        title: 'Bạn cần đăng nhập',
        description: `Vui lòng đăng nhập để ${actionLabel}.`,
      })

      startTransition(() => {
        router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`)
      })

      return false
    }

    if (!isCandidate) {
      const dashboard = ROLE_DASHBOARD_MAP[user?.role || ''] || '/unauthorized'

      toast({
        title: 'Chức năng dành cho ứng viên',
        description: 'Tài khoản hiện tại không có quyền dùng tính năng này.',
        variant: 'destructive',
      })

      startTransition(() => {
        router.push(dashboard)
      })

      return false
    }

    return true
  }, [isAuthenticated, isCandidate, isLoading, pathname, router, toast, user?.role])

  return {
    isAuthenticated,
    isCandidate,
    isLoading,
    requireCandidate,
  }
}
