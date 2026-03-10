import { NextRequest, NextResponse } from 'next/server';
import { loginByGoogle } from '@/features/core/auth/api/auth-service';
import { exchangeCodeForTokens } from '@/features/core/auth/utils/google-auth';
import { config } from '@/config';
import { parseJwt } from '@/utils/jwt';
import { STORAGE_KEYS } from '@/utils/constants';

/**
 * Google Callback API Route
 * Re-implemented as a Route Handler because only Route Handlers (or Server Actions) 
 * can modify cookies during a GET/Redirect in Next.js.
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    const origin = request.nextUrl.origin;

    if (error) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, origin));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=No+code+received', origin));
    }

    try {
        // 1. Exchange code for IdToken (Server-side)
        const idToken = await exchangeCodeForTokens(code);

        // 2. Authenticate with our Backend
        const authResult = await loginByGoogle({ idToken });

        // 3. Prepare response and set cookies
        const decodedToken = parseJwt(authResult.token);
        const role = String(decodedToken?.role || decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Candidate');

        // Try to get name from multiple possible claims
        let fullName = String(
            decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
            decodedToken?.name ||
            decodedToken?.unique_name ||
            'User'
        );
        let avatarUrl = '';

        // Fetch full profile to get correct display name (consistent with regular login)
        try {
            const res = await fetch(`${config.apiUrl}/api/User/profile`, {
                headers: { Authorization: `Bearer ${authResult.token}` },
            });
            if (res.ok) {
                const profile = await res.json();
                if (profile?.fullName) {
                    fullName = profile.fullName;
                }
                avatarUrl = profile?.avatarUrl || '';
            }
        } catch (e) {
            console.error('Failed to fetch profile in Google callback', e);
        }

        const response = NextResponse.redirect(new URL(role === 'Candidate' ? '/' : '/offers', origin));

        const cookieOptions = {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        };

        // Set auth cookies correctly in the response object
        response.cookies.set(STORAGE_KEYS.AUTH_TOKEN, authResult.token, cookieOptions);
        response.cookies.set(STORAGE_KEYS.USER_ROLE, role, cookieOptions);
        response.cookies.set(STORAGE_KEYS.USER_NAME, encodeURIComponent(fullName), cookieOptions);
        if (avatarUrl) {
            response.cookies.set(STORAGE_KEYS.USER_AVATAR, encodeURIComponent(avatarUrl), cookieOptions);
        } else {
            response.cookies.delete(STORAGE_KEYS.USER_AVATAR);
        }

        return response;

    } catch (err) {
        console.error('Google Callback Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, origin));
    }
}
