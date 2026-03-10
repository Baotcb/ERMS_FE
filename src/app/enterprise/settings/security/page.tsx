import { SecurityPageView } from '@/features/core/user-profile';

export const metadata = {
  title: 'Bảo mật - ERMS',
  description: 'Đổi mật khẩu cho tài khoản enterprise.',
};

export default function SecurityPage() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      <SecurityPageView />
    </div>
  );
}
