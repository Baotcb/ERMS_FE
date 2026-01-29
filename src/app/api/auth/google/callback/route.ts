import { NextRequest, NextResponse } from 'next/server';
import { loginByGoogle, exchangeCodeForTokens } from '@/features/core/auth/api/auth-service';
import { parseJwt } from '@/utils/jwt';

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
        const fullName = String(decodedToken?.name || 'User');

        const response = NextResponse.redirect(new URL(role === 'Candidate' ? '/candidate/jobs' : '/offers', origin));

        const cookieOptions = {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        };

        // Set auth cookies correctly in the response object
        response.cookies.set('auth_token', authResult.token, cookieOptions);
        response.cookies.set('user_role', role, cookieOptions);
        response.cookies.set('user_name', encodeURIComponent(fullName), cookieOptions);

        return response;

    } catch (err) {
        console.error('Google Callback Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, origin));
    }
}
