import { redirect } from 'next/navigation';

/**
 * Google Login Initiation Page
 * This is a Server Component that handles the redirect to Google OAuth.
 * It replaces the previous /api/auth/google API route to align with project standards.
 */
export default async function GoogleLoginPage() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        console.error('Missing Google configuration');
        redirect('/login?error=Configuration+Error');
    }

    const scope = 'openid email profile';
    const responseType = 'code';

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', clientId);
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.append('response_type', responseType);
    googleAuthUrl.searchParams.append('scope', scope);
    googleAuthUrl.searchParams.append('access_type', 'offline');
    googleAuthUrl.searchParams.append('prompt', 'consent');

    redirect(googleAuthUrl.toString());
}
