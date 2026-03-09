import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/server-fetch'
import { getProfileServer } from '@/lib/server'
import { ProfileFormView } from '@/features/core/user-profile'

export const metadata = {
    title: 'Hồ sơ cá nhân - ERMS',
    description: 'Quản lý thông tin cá nhân',
}

export default async function ProfilePage() {
    const session = await getServerSession()
    if (!session.token) redirect('/login')
    const profile = await getProfileServer().catch(() => null)
    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <ProfileFormView initialData={profile} user={session.user} />
        </div>
    )
}
