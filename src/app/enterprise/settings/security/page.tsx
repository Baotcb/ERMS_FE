import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/server-fetch'
import { SecurityPageView } from '@/features/core/user-profile'

export const metadata = {
    title: 'Bảo mật - ERMS',
    description: 'Cài đặt bảo mật tài khoản',
}

export default async function SecurityPage() {
    const session = await getServerSession()
    if (!session.token) redirect('/login')

    return <SecurityPageView />
}
