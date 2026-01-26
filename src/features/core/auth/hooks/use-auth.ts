/**
 * Authentication Hook
 * Wrapper around global auth store
 *
 * NOTE: Auth state is hydrated by AuthProvider from server session.
 * This hook simply returns the store state without re-initializing
 * to prevent overwriting server-hydrated data.
 */

'use client'

import { useAuthStore } from '@/stores/auth-store'

export function useAuth() {
    return useAuthStore()
}
