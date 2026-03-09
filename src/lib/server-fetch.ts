import { cookies } from 'next/headers';
import { config } from '@/config';
import { logger } from '@/lib/logger';
import { cache } from 'react';

export interface ServerFetchOptions extends RequestInit {
  requireAuth?: boolean;
  cache?: RequestCache;
}

export interface ServerErrorResponse {
  message: string;
  code?: string;
  field?: string;
  details?: unknown;
}

/**
 * Make authenticated API requests from server
 */
export async function serverFetch<T>(
  url: string,
  options: ServerFetchOptions = {}
): Promise<T> {
  const { requireAuth = false, ...fetchOptions } = options;

  // Build full URL
  const baseUrl = process.env.API_URL || config.apiUrl;
  if (!baseUrl) {
    throw new Error('API_URL is not configured. Please set API_URL environment variable.');
  }
  const fullUrl = `${baseUrl}${url}`;

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add authorization header if required
  if (requireAuth) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      throw new Error('Unauthorized: No token found');
    }

    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
      cache: fetchOptions.cache || (fetchOptions.method === 'GET' ? 'force-cache' : 'no-store'),
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!isJson) {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || response.statusText || 'Request failed');
      }
      return text as unknown as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as ServerErrorResponse;
      throw new Error(errorData.message || 'Request failed');
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Get's current user's session from cookies
 * Cached per request to prevent repeated JWT parsing
 */
export const getServerSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const userRole = cookieStore.get('user_role')?.value;
  const userName = cookieStore.get('user_name')?.value;
  const userAvatar = cookieStore.get('user_avatar')?.value;

  if (!token) {
    return { token: null, user: null, role: null };
  }

  // Basic token validation
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { token: null, user: null, role: null };
    }

    const payload = JSON.parse(atob(parts[1]));
    // Validate required fields
    if (!payload.exp || typeof payload.exp !== 'number') {
      return { token: null, user: null, role: null };
    }

    // Validate expiration with proper timestamp
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp < currentTime) {
      return { token: null, user: null, role: null };
    }

    const email =
      payload.email ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      '';

    // Only use user_name cookie - don't fallback to email prefix
    const fullName = userName
      ? decodeURIComponent(userName)
      : '';

    return {
      token,
      user: {
        id: payload.nameid || payload.sub || '',
        email,
        fullName,
        avatarUrl: userAvatar ? decodeURIComponent(userAvatar) : undefined,
        role:
          payload.role ||
          payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          userRole ||
          '',
      },
      role:
        payload.role ||
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        userRole ||
        '',
    };
  } catch (error) {
    logger.error('Token parsing failed', error);
    return { token: null, user: null, role: null };
  }
});


