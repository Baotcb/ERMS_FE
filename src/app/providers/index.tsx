/**
 * Main Providers Component
 * Combines all SSR-compatible providers
 */

import { getServerSession } from '@/lib/server-fetch';
import { AuthProvider } from './auth-provider';

import { SWRProvider } from './swr-provider';

export async function Providers({ children }: { children: React.ReactNode }) {
  // Get auth state from server
  const session = await getServerSession();

  const serverAuthData = {
    user: session.user,
    isAuthenticated: session.token !== null,
  };

  return (
    <AuthProvider serverAuthData={serverAuthData}>
      <SWRProvider>
        {children}
      </SWRProvider>
    </AuthProvider>
  );
}
