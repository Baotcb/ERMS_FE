'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { parseOAuthCallback, getRedirectUrlForRole, setAuthCookies } from '../utils';

/**
 * Hook to handle Google OAuth callback
 */
export function useGoogleCallback() {
  const router = useRouter();
  const { login: authLogin } = useAuth();

  useEffect(() => {
    const result = parseOAuthCallback();

    if (!result.success) {
      router.push(`/login?error=${encodeURIComponent(result.error)}`);
      return;
    }

    const { token, user, role } = result;
    authLogin(token, user, false);
    setAuthCookies({ token, role, displayName: user.fullName || user.email.split('@')[0] });
    router.push(getRedirectUrlForRole(role));
  }, [router, authLogin]);
}
