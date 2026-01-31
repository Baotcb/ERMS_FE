import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-fetch';
import { SecurityPageView } from '@/features/core/user-profile';

export default async function SecurityPage() {
  const session = await getServerSession();
  if (!session.token) redirect('/login');
  return <SecurityPageView />;
}
