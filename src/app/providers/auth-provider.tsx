/**
 * Auth Provider for SSR
 * Hydrates client-side auth state from server-side session
 *
 * This provider runs BEFORE any component that uses useAuth(),
 * ensuring the Zustand store is populated with server data immediately.
 */

'use client';

import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useSavedJobsStore } from '@/features/jobs/stores/use-saved-jobs-store';
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
  const user = serverAuthData.user;
  const authSignature = useMemo(
    () => `${serverAuthData.isAuthenticated}:${user?.id ?? ''}:${user?.role ?? ''}:${user?.fullName ?? ''}:${user?.avatarUrl ?? ''}`,
    [serverAuthData.isAuthenticated, user?.avatarUrl, user?.fullName, user?.id, user?.role]
  );

  // Keep client auth state aligned with the latest server session snapshot.
  useIsomorphicLayoutEffect(() => {
    useSavedJobsStore.setState({
      savedJobIds: new Set<string>(),
      isLoaded: false,
    });

    if (user && serverAuthData.isAuthenticated) {
      useAuthStore.setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [authSignature, serverAuthData.isAuthenticated]);

  return <>{children}</>;
}
