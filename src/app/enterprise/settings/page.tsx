import { getProfileServer } from '@/lib/server';
import { getServerSession } from '@/lib/server-fetch';
import { ProfileFormView } from '@/features/core/user-profile';

export const metadata = {
  title: 'Hồ sơ cá nhân - ERMS',
  description: 'Cập nhật thông tin cá nhân cho tài khoản enterprise.',
};

export default async function SettingsPage() {
  const [session, profile] = await Promise.all([
    getServerSession(),
    getProfileServer().catch(() => null),
  ]);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      <ProfileFormView initialData={profile} user={session.user} />
    </div>
  );
}
