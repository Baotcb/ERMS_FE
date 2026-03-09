import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Hồ sơ cá nhân - ERMS',
  description: 'Quản lý thông tin cá nhân',
}

export default function ProfilePage() {
  redirect('/enterprise/settings');
}
