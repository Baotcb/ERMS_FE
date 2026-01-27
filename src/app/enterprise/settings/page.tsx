import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/server-fetch'
import Link from 'next/link'
import { User, Shield, Bell, Palette } from 'lucide-react'

export const metadata = {
    title: 'Cài đặt - ERMS',
    description: 'Cài đặt tài khoản và ứng dụng',
}

const SETTINGS_MENU = [
    {
        label: 'Hồ sơ cá nhân',
        href: '/enterprise/profile',
        icon: User,
        description: 'Cập nhật thông tin cá nhân, ảnh đại diện',
    },
    {
        label: 'Bảo mật',
        href: '/enterprise/settings/security',
        icon: Shield,
        description: 'Đổi mật khẩu, xác thực hai yếu tố',
    },
    {
        label: 'Thông báo',
        href: '/enterprise/settings/notifications',
        icon: Bell,
        description: 'Quản lý email và push notifications',
    },
    {
        label: 'Giao diện',
        href: '/enterprise/settings/appearance',
        icon: Palette,
        description: 'Chế độ sáng/tối, ngôn ngữ',
    },
]

export default async function SettingsPage() {
    const session = await getServerSession()
    if (!session.token) redirect('/login')

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
                <p className="text-gray-500 mt-1">Quản lý tài khoản và tùy chỉnh ứng dụng</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {SETTINGS_MENU.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-100 hover:border-[#0F4C75]/30 hover:shadow-md transition-all group"
                    >
                        <div className="p-3 rounded-lg bg-[#0F4C75]/5 text-[#0F4C75] group-hover:bg-[#0F4C75] group-hover:text-white transition-colors">
                            <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#0F4C75]">
                                {item.label}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {item.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
