import { cookies } from 'next/headers'
import { HRDashboard } from '@/features/hr/components/hr-dashboard'
import { DeptHeadDashboard } from '@/features/dept-head/components/dept-head-dashboard'

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const role = cookieStore.get('user_role')?.value

    const isHR = role === 'HRManager' || role === 'Director' || role === 'HR'

    return isHR ? <HRDashboard /> : <DeptHeadDashboard />
}
