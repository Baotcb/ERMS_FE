import { logger } from '@/lib/logger'

interface GoogleTokenResponse {
    id_token: string;
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    refresh_token?: string;
    error?: string;
    error_description?: string;
}

/**
 * Exchange OAuth authorization code for tokens
 * This must be called from a server-side environment (Route Handler/Server Action)
 */
export async function exchangeCodeForTokens(code: string): Promise<string> {
    // Basic validation to ensure server-side execution
    if (typeof window !== 'undefined') {
        throw new Error('This function must be called from the server')
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
            grant_type: 'authorization_code',
        }),
    });

    const data: GoogleTokenResponse = await response.json();

    if (!response.ok) {
        logger.error('Google token exchange error:', data);
        throw new Error(data.error_description || 'Failed to exchange code for tokens');
    }

    return data.id_token;
}
