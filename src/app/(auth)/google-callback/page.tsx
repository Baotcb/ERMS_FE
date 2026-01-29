import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loginByGoogle, exchangeCodeForTokens } from '@/features/core/auth/api/auth-service';
import { parseJwt } from '@/utils/jwt';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Google Callback Page (Server Component)
 * Handles the OAuth callback from Google, exchanges code for tokens, 
 * and authenticates with the ERMS backend.
 * 
 * Replaces the previous /api/auth/google/callback route to align with project standards.
 */
export default async function GoogleCallbackPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const code = params.code as string | undefined;
    const error = params.error as string | undefined;

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
        redirect('/login?error=No+code+received');
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

        const cookieStore = await cookies();
        const cookieOptions = {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        };

        // Set auth cookies for the middleware and frontend
        cookieStore.set('auth_token', authResult.token, cookieOptions);
        cookieStore.set('user_role', role, cookieOptions);
        cookieStore.set('user_name', encodeURIComponent(fullName), cookieOptions);

        // 4. Redirect to appropriate dashboard
        redirect(role === 'Candidate' ? '/candidate/jobs' : '/offers');

    } catch (err) {
        console.error('Google Callback Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }

    // This part should not be reached due to redirects
    return null;
}
