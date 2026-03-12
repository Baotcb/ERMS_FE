/**
 * Main Providers Component
 * Combines all SSR-compatible providers
 */

import { getServerSession } from '@/lib/server-fetch';
import { getProfileServer } from '@/lib/server/profile-service';
import { AuthProvider } from './auth-provider';

import { SWRProvider } from './swr-provider';

export async function Providers({ children }: { children: React.ReactNode }) {
  // Get auth state from server
  const session = await getServerSession();
  const profile = session.token ? await getProfileServer().catch(() => null) : null;

  const user = session.user
    ? {
        ...session.user,
        departmentId: profile?.departmentId,
        departmentName: profile?.departmentName,
      }
    : null;

  const serverAuthData = {
    user,
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
