/**
 * Authentication Hook
 * Wrapper around global auth store
 */

'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function useAuth() {
    const store = useAuthStore()

    // Initialize on mount
    const initialized = useRef(false)

    useEffect(() => {
        if (!initialized.current) {
            store.initialize()
            initialized.current = true
        }
    }, [store])

    return store
}
