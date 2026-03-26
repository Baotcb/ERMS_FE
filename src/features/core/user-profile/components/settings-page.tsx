import { getProfileServer } from '@/lib/server'
import { getServerSession } from '@/lib/server-fetch'
import { ProfileFormView } from './profile-form-view'

export async function SettingsPage() {
    const [session, profile] = await Promise.all([
        getServerSession(),
        getProfileServer().catch(() => null),
    ])

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <ProfileFormView initialData={profile} user={session.user} />
        </div>
    )
}
