import { SettingsPage as SettingsPageView } from '@/features/core/user-profile/components/settings-page'

export const metadata = {
    title: 'Hồ sơ cá nhân - ERMS',
    description: 'Cập nhật thông tin cá nhân cho tài khoản enterprise.',
}

export default function SettingsRoutePage() {
    return <SettingsPageView />
}
