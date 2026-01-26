/**
 * OAuth Callback Utilities
 * Handles parsing and processing OAuth callback responses
 */

import { parseJwt } from '@/utils/jwt';
import type { User } from '@/stores/auth-store';

interface OAuthCallbackResult {
  success: true;
  token: string;
  user: User;
  role: string;
}

interface OAuthCallbackError {
  success: false;
  error: string;
}

export type OAuthCallbackResponse = OAuthCallbackResult | OAuthCallbackError;

/**
 * Parse OAuth callback from URL parameters
 */
export function parseOAuthCallback(): OAuthCallbackResponse {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const error = params.get('error');

  if (error) {
    return {
      success: false,
      error: error || 'OAuth login failed',
    };
  }

  if (!token) {
    return {
      success: false,
      error: 'No token received',
    };
  }

  try {
    const decodedToken = parseJwt(token);

    const role = String(
      decodedToken?.role ||
        decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        'Candidate'
    );

    const userId = String(decodedToken?.nameid || decodedToken?.sub || 'unknown');

    const email = String(
      decodedToken?.email ||
        decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        ''
    );

    const fullName = String(decodedToken?.name || email.split('@')[0] || '');

    const user: User = {
      id: userId,
      email,
      fullName,
      role: role || undefined,
    };

    return {
      success: true,
      token,
      user,
      role,
    };
  } catch {
    return {
      success: false,
      error: 'Failed to parse token',
    };
  }
}

/**
 * Get redirect URL based on user role
 */
export function getRedirectUrlForRole(role: string): string {
  return role === 'Candidate' ? '/candidate/jobs' : '/offers';
}
