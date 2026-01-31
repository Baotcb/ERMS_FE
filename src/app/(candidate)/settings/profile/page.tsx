import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-fetch';
import { getProfileServer } from '@/lib/server';
import { ProfileFormView } from '@/features/core/user-profile';

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session.token) redirect('/login');
  const profile = await getProfileServer().catch(() => null);
  return <ProfileFormView initialData={profile} user={session.user} />;
}
