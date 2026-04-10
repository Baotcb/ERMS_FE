import { useData, type Fetcher } from '@/lib/swr/hooks'
import { apiClient } from '@/lib/api-client'

// --- Interfaces ---
export interface ApprovedPlanDetail {
    id: string
    positionTitle: string
    quantity: number
    priority: string
    requiredSkills?: string
    planName: string
    planCode?: string
    endDate?: string
}

interface RecruitmentPlanDetail {
    id: string
    positionTitle?: string
    quantity?: number
    status?: string
    priority?: string
    requiredSkills?: string
    [key: string]: unknown
}

interface RecruitmentPlan {
    id: string
    planName?: string
    planCode?: string
    endDate?: string
    planDetails?: RecruitmentPlanDetail[]
    [key: string]: unknown
}

interface PlansApiResponse {
    items?: RecruitmentPlan[]
    [key: string]: unknown
}

interface JobPostingItem {
    planDetailId?: string
    [key: string]: unknown
}

interface JobPostingsResponse {
    items?: JobPostingItem[]
    [key: string]: unknown
}

// Lấy set planDetailId đã có Job Posting (Draft/Published/Closed)
async function getUsedPlanDetailIds(): Promise<Set<string>> {
    try {
        const response = await apiClient.get(
            '/api/job-postings?pageNumber=1&pageSize=200'
        )
        if (!response.ok) return new Set()

        const data = (await response.json()) as JobPostingsResponse
        const ids = new Set<string>()
        if (data.items && Array.isArray(data.items)) {
            data.items.forEach((jp) => {
                if (jp.planDetailId) ids.add(jp.planDetailId)
            })
        }
        return ids
    } catch {
        return new Set()
    }
}

// Fetcher: lấy PlanDetail chưa có Job Posting từ các plan đã duyệt
async function fetchApprovedPlanDetails(): Promise<ApprovedPlanDetail[]> {
    // Fetch song song: plans + job postings đã tồn tại
    const [plansResponse, usedIds] = await Promise.all([
        apiClient.get('/api/RecruitmentPlans?Status=Approved&Page=1&PageSize=50'),
        getUsedPlanDetailIds(),
    ])

    if (!plansResponse.ok) return []

    const data = (await plansResponse.json()) as PlansApiResponse
    if (!data.items || !Array.isArray(data.items)) return []

    // Tách plans có/chưa có planDetails
    const plansWithDetails = data.items.filter(
        (p) =>
            p.planDetails &&
            Array.isArray(p.planDetails) &&
            p.planDetails.length > 0
    )
    const plansNeedingDetails = data.items.filter(
        (p) =>
            !p.planDetails ||
            !Array.isArray(p.planDetails) ||
            p.planDetails.length === 0
    )

    // Batch fetch cho plans thiếu details
    const fetchedDetailsMap: Record<string, RecruitmentPlanDetail[]> = {}
    if (plansNeedingDetails.length > 0) {
        const results = await Promise.allSettled(
            plansNeedingDetails.map(async (plan) => {
                const res = await apiClient.get(
                    `/api/plan-details?recruitmentPlanId=${plan.id}`
                )
                if (!res.ok)
                    return {
                        planId: plan.id,
                        details: [] as RecruitmentPlanDetail[],
                    }
                const d = await res.json()
                return {
                    planId: plan.id,
                    details: (
                        Array.isArray(d) ? d : d.items || []
                    ) as RecruitmentPlanDetail[],
                }
            })
        )
        results.forEach((r) => {
            if (r.status === 'fulfilled' && r.value) {
                fetchedDetailsMap[r.value.planId] = r.value.details
            }
        })
    }

    // Gộp & lọc: status = Approved + chưa có Job Posting
    const allPlans = [...plansWithDetails, ...plansNeedingDetails]
    const approvedDetails: ApprovedPlanDetail[] = []

    for (const plan of allPlans) {
        const details =
            plan.planDetails &&
            Array.isArray(plan.planDetails) &&
            plan.planDetails.length > 0
                ? plan.planDetails
                : fetchedDetailsMap[plan.id] || []

        // Lọc: Approved + chưa tồn tại Job Posting nào
        const available = details.filter(
            (d) => d.status === 'Approved' && !usedIds.has(d.id)
        )

        available.forEach((detail) => {
            approvedDetails.push({
                id: detail.id,
                positionTitle:
                    detail.positionTitle ||
                    `Tuyển dụng ${detail.quantity} vị trí`,
                quantity: detail.quantity || 1,
                priority: detail.priority || 'Normal',
                requiredSkills: detail.requiredSkills,
                planName: plan.planName || '',
                planCode: plan.planCode,
                endDate: plan.endDate,
            })
        })
    }

    return approvedDetails
}

// --- Hook ---
export function useApprovedPlanDetails() {
    return useData<ApprovedPlanDetail[]>('approved-plan-details', {
        fetcher: fetchApprovedPlanDetails as unknown as Fetcher<
            ApprovedPlanDetail[]
        >,
    })
}
