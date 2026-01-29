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

    // Call server to set HttpOnly cookies
    fetch('/api/auth/session/external', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, user, role })
    }).then(() => {
      authLogin(token, user, false);
      // Deprecated: setAuthCookies({ token, role, displayName: user.fullName || user.email.split('@')[0] });
      router.push(getRedirectUrlForRole(role));
    }).catch(err => {
      console.error('Failed to set session', err)
      router.push('/login?error=session_failed')
    })
  }, [router, authLogin]);
}
