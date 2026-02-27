import { useData, type Fetcher } from '@/lib/swr/hooks'
import { apiClient } from '@/lib/api-client'
import type {
    RequestItem,
    TaskItem,
    CandidateItem,
    ChartData
} from '../api/dashboard-service'
import {
    getTasks,
    getCandidates,
    getRecruitmentPerformance,
    getTrainingPerformance
} from '../api/dashboard-service'

// --- Interfaces cho API response ---
interface RecruitmentPlanDetail {
    id: string
    positionTitle?: string
    quantity?: number
    status?: string
    priority?: string
    requestedByName?: string
    createdByName?: string
    createdAt?: string
    requiredSkills?: string
    [key: string]: unknown
}

interface RecruitmentPlan {
    id: string
    planName?: string
    planCode?: string
    campaignName?: string
    createdByName?: string
    createdAt?: string
    endDate?: string
    planDetails?: RecruitmentPlanDetail[]
    [key: string]: unknown
}

interface PlansApiResponse {
    items?: RecruitmentPlan[]
    [key: string]: unknown
}

// --- SWR Keys ---
export const dashboardKeys = {
    all: ['dashboard'] as const,
    requests: () => [...dashboardKeys.all, 'requests'] as const,
    tasks: () => [...dashboardKeys.all, 'tasks'] as const,
    candidates: () => [...dashboardKeys.all, 'candidates'] as const,
    recruitmentChart: () => [...dashboardKeys.all, 'recruitment-chart'] as const,
    trainingChart: () => [...dashboardKeys.all, 'training-chart'] as const,
}

// --- Fetcher: lấy danh sách yêu cầu tuyển dụng ---
async function fetchRequests(): Promise<RequestItem[]> {
    try {
        const response = await apiClient.get('/api/RecruitmentPlans?Status=Approved&Page=1&PageSize=5')

        if (!response.ok) return []

        const data = await response.json() as PlansApiResponse
        if (!data.items || !Array.isArray(data.items)) return []

        const requestItems: RequestItem[] = []

        // Fetch plan details cho plans không có sẵn
        const plansNeedingDetails = data.items.filter(
            p => !p.planDetails || !Array.isArray(p.planDetails) || p.planDetails.length === 0
        )
        const plansWithDetails = data.items.filter(
            p => p.planDetails && Array.isArray(p.planDetails) && p.planDetails.length > 0
        )

        let fetchedDetailsMap: Record<string, RecruitmentPlanDetail[]> = {}
        if (plansNeedingDetails.length > 0) {
            const results = await Promise.allSettled(
                plansNeedingDetails.map(async (plan) => {
                    const res = await apiClient.get(`/api/plan-details?recruitmentPlanId=${plan.id}`)
                    if (!res.ok) return { planId: plan.id, details: [] as RecruitmentPlanDetail[] }
                    const d = await res.json()
                    return {
                        planId: plan.id,
                        details: (Array.isArray(d) ? d : (d.items || [])) as RecruitmentPlanDetail[]
                    }
                })
            )
            results.forEach(r => {
                if (r.status === 'fulfilled' && r.value) {
                    fetchedDetailsMap[r.value.planId] = r.value.details
                }
            })
        }

        // Process all plans
        const allPlans = [...plansWithDetails, ...plansNeedingDetails]
        for (const plan of allPlans) {
            const details = plan.planDetails && Array.isArray(plan.planDetails) && plan.planDetails.length > 0
                ? plan.planDetails
                : (fetchedDetailsMap[plan.id] || [])

            if (details.length > 0) {
                // Chỉ hiển thị planDetail status 'Approved' — chưa có JobPosting, sẵn sàng tạo tin
                const approvedDetails = details.filter((d) => d.status === 'Approved')
                approvedDetails.forEach((detail) => {
                    const isUrgent = detail.priority === 'Urgent' || detail.priority === 'High'
                    const title = detail.positionTitle || `Tuyển dụng ${detail.quantity} vị trí`

                    requestItems.push({
                        id: detail.id,
                        title,
                        requester: detail.requestedByName || plan.createdByName || 'Phòng ban',
                        date: new Date(detail.createdAt || plan.createdAt || new Date()).toLocaleDateString('vi-VN'),
                        status: isUrgent ? 'urgent' : 'important',
                        type: 'request',
                        avatar: (detail.requestedByName || plan.createdByName || 'U').substring(0, 2).toUpperCase(),
                        project: plan.planCode || plan.campaignName,
                        planDetailId: detail.id,
                        position: title,
                        quantity: detail.quantity,
                        location: 'Hà Nội',
                        deadline: plan.endDate,
                        requiredSkills: detail.requiredSkills || ''
                    })
                })
            } else {
                requestItems.push({
                    id: plan.id,
                    title: `Kế hoạch: ${plan.planName}`,
                    requester: plan.createdByName || 'Phòng ban',
                    date: new Date(plan.createdAt || new Date()).toLocaleDateString('vi-VN'),
                    status: 'important',
                    type: 'request',
                    avatar: (plan.createdByName || 'U').substring(0, 2).toUpperCase(),
                    project: plan.planCode || plan.campaignName,
                    planDetailId: undefined,
                    position: plan.planName,
                    quantity: 1,
                    location: 'Hà Nội',
                    deadline: plan.endDate
                })
            }
        }

        return requestItems
    } catch {
        return []
    }
}

// --- Hooks ---

export function useDashboardRequests() {
    const key = dashboardKeys.requests().join('/')
    return useData<RequestItem[]>(key, {
        fetcher: fetchRequests as unknown as Fetcher<RequestItem[]>,
    })
}

export function useDashboardTasks() {
    const key = dashboardKeys.tasks().join('/')
    return useData<TaskItem[]>(key, {
        fetcher: getTasks as unknown as Fetcher<TaskItem[]>,
    })
}

export function useDashboardCandidates() {
    const key = dashboardKeys.candidates().join('/')
    return useData<CandidateItem[]>(key, {
        fetcher: getCandidates as unknown as Fetcher<CandidateItem[]>,
    })
}

export function useDashboardRecruitmentChart() {
    const key = dashboardKeys.recruitmentChart().join('/')
    return useData<ChartData[]>(key, {
        fetcher: getRecruitmentPerformance as unknown as Fetcher<ChartData[]>,
    })
}

export function useDashboardTrainingChart() {
    const key = dashboardKeys.trainingChart().join('/')
    return useData<ChartData[]>(key, {
        fetcher: getTrainingPerformance as unknown as Fetcher<ChartData[]>,
    })
}
