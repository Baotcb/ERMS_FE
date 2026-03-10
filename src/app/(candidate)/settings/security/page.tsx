import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-fetch';
import { SecurityPageView } from '@/features/core/user-profile';

export default async function SecurityPage() {
  const session = await getServerSession();
  if (!session.token) redirect('/login');
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SecurityPageView />
    </div>
  );
}
