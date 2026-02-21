import { HRDashboard } from '@/features/hr/components/hr-dashboard'
import {
    getRequests,
    getTasks,
    getCandidates,
    getRecruitmentPerformance,
    getTrainingPerformance
} from '@/features/hr/api/dashboard-service'

export default async function HRDashboardPage() {
    const [initialRequests, initialTasks, initialCandidates, initialRecruitmentData, initialTrainingData] = await Promise.all([
        getRequests(),
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
