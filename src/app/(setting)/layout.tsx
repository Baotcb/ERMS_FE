import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-fetch';
import { CandidateNavbar } from '@/components/layout/candidate-navbar';
import { SettingsSidebar } from '@/components/layout/settings-sidebar';

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session.token) redirect('/login');

  return (
    <div className="min-h-screen bg-brand-light font-sans text-slate-900">
      <CandidateNavbar />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <SettingsSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
