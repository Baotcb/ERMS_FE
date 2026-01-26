import Link from 'next/link';
import { User, Shield, Bell } from 'lucide-react';

export function SettingsSidebar() {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
          <h2 className="font-bold text-brand-dark">Cài đặt tài khoản</h2>
        </div>
        <nav className="p-2 flex flex-col gap-1">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <User className="w-4 h-4" />
            Thông tin cá nhân
          </Link>
          <Link
            href="/security"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Bảo mật & Mật khẩu
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            Cài đặt thông báo
          </Link>
        </nav>
      </div>
    </aside>
  );
}
