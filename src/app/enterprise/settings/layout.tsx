import { redirect } from 'next/navigation';
import { DeptHeadSidebar } from '@/features/dept-head/components/dept-head-sidebar';
import { DirectorSidebar } from '@/features/director/components/director-sidebar';
import { EmployeeSidebar } from '@/features/employee';
import { HRSidebar } from '@/features/hr';
import { getServerSession } from '@/lib/server-fetch';
import { cn } from '@/lib/utils';
import { USER_ROLES } from '@/utils/constants';

function EnterpriseRoleSidebar({ role }: { role?: string | null }) {
  if (role === USER_ROLES.DIRECTOR) {
    return <DirectorSidebar />;
  }

  if (role === USER_ROLES.EMPLOYEE) {
    return <EmployeeSidebar />;
  }

  if (role === USER_ROLES.DEPARTMENT_HEAD || role === USER_ROLES.TRAINER) {
    return <DeptHeadSidebar />;
  }

  return <HRSidebar />;
}

export default async function EnterpriseSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session.token) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EnterpriseRoleSidebar role={session.role} />

      <main
        className={cn(
          'enterprise-scale flex-1 overflow-y-auto',
          session.role === USER_ROLES.DIRECTOR ? 'h-screen' : 'overflow-x-hidden'
        )}
      >
        <div className="mx-auto max-w-4xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h1>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý thông tin cá nhân và bảo mật cho tài khoản của bạn.
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
