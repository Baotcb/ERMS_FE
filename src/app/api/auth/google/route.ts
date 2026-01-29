import { NextRequest, NextResponse } from 'next/server';

/**
 * Google Login Initiation API Route
 * Re-implemented as a Route Handler to ensure technical compatibility with redirects.
 */
export async function GET(request: NextRequest) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    const origin = request.nextUrl.origin;

    if (!clientId || !redirectUri) {
        console.error('Missing Google configuration');
        return NextResponse.redirect(new URL('/login?error=Configuration+Error', origin));
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

    return NextResponse.redirect(googleAuthUrl.toString());
}
