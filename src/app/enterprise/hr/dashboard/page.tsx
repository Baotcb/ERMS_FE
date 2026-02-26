import { HRDashboard } from '@/features/hr/components/hr-dashboard'
import { cookies } from 'next/headers'
import {
    getRequests,
    getTasks,
    getCandidates,
    getRecruitmentPerformance,
    getTrainingPerformance
} from '@/features/hr/api/dashboard-service'

export default async function HRDashboardPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    const [initialRequests, initialTasks, initialCandidates, initialRecruitmentData, initialTrainingData] = await Promise.all([
        getRequests(token),
        getTasks(),
        getCandidates(),
        getRecruitmentPerformance(),
        getTrainingPerformance()
    ])

    return (
        <HRDashboard
            initialRequests={initialRequests}
            initialTasks={initialTasks}
            initialCandidates={initialCandidates}
            initialRecruitmentData={initialRecruitmentData}
            initialTrainingData={initialTrainingData}
        />
    )
}
