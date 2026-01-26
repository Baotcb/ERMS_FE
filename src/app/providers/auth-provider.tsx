/**
 * Auth Provider for SSR
 * Hydrates client-side auth state from server-side session
 *
 * This provider runs BEFORE any component that uses useAuth(),
 * ensuring the Zustand store is populated with server data immediately.
 */

'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/stores/auth-store';

interface ServerAuthData {
  user: User | null;
  isAuthenticated: boolean;
}

// Use useLayoutEffect on client, useEffect on server (SSR safety)
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function AuthProvider({
  serverAuthData,
  children,
}: {
  serverAuthData: ServerAuthData;
  children: React.ReactNode;
}) {
  const hasHydrated = useRef(false);

  // Hydrate store synchronously before first render to prevent flash
  useIsomorphicLayoutEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (serverAuthData.user && serverAuthData.isAuthenticated && token) {
      // Server says authenticated - use server data (has correct fullName from JWT)
      useAuthStore.setState({
        user: serverAuthData.user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else if (!token) {
      // No token cookie - ensure logged out state
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } else {
      // Has token but server didn't return user (edge case)
      // Mark as not loading so UI can proceed
      useAuthStore.setState({ isLoading: false });
    }
  }, [serverAuthData]);

  return <>{children}</>;
}
