import { apiClient } from '@/lib/api-client'
import { logger } from '@/lib/logger'
import type { Department } from './department-service'

// Cache departments: managerName → departmentName
let deptCachePromise: Promise<Record<string, string>> | null = null
async function getDeptNameMap(): Promise<Record<string, string>> {
    if (!deptCachePromise) {
        deptCachePromise = (async () => {
            try {
                const res = await apiClient.get('/api/Departments?pageSize=100')
                if (!res.ok) return {}
                const data = await res.json() as { items: Department[] }
                const map: Record<string, string> = {}
                for (const d of data.items || []) {
                    if (d.managerName) map[d.managerName] = d.departmentName
                }
                return map
            } catch { return {} }
        })()
    }
    return deptCachePromise
}

export interface DashboardStats {
    totalEmployees: number
    totalDepartments: number
    newHires: number
    turnoverRate: number
}

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
    departmentName?: string
    planDetails?: RecruitmentPlanDetail[]
    [key: string]: unknown
}

interface ApiResponse {
    items?: RecruitmentPlan[]
    [key: string]: unknown
}

export interface RequestItem {
    id: string
    title: string
    requester: string
    date: string
    status: 'urgent' | 'important' | 'normal'
    type: 'request'
    avatar?: string
    project?: string
    planDetailId?: string
    position?: string
    quantity?: number
    location?: string
    deadline?: string
    requiredSkills?: string
}

export interface TaskItem {
    id: string
    title: string
    project: string
    dueDate: string | null
    assignee: string
    avatar?: string
    link?: string
}

export interface CandidateItem {
    id: string
    name: string
    position: string
    status: 'interview' | 'offer' | 'screening'
    priority: 'urgent' | 'normal'
    avatar?: string
}

export interface ChartData {
    label: string
    value: number
    color: string
}

// TODO: Replace with actual API call when backend endpoint is available
export async function getDashboardStats(): Promise<DashboardStats> {
    return {
        totalEmployees: 0,
        totalDepartments: 0,
        newHires: 0,
        turnoverRate: 0
    }
}

export async function getRequests(token?: string): Promise<RequestItem[]> {
    try {
        const headers: HeadersInit = {}
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await apiClient.get('/api/RecruitmentPlans?Status=Approved&Page=1&PageSize=5', {
            headers,
        })

        if (!response.ok) {
            logger.error('Failed to fetch requests:', response.statusText)
            return []
        }

        const data = await response.json() as ApiResponse

        if (!data.items || !Array.isArray(data.items)) {
            logger.warn('Invalid data format or empty items', data)
            return []
        }

        const requestItems: RequestItem[] = []

        // Chỉ fetch details cho plans CHƯA có planDetails
        // (tránh N+1: nếu BE trả planDetails sẵn thì dùng luôn)
        const plansNeedingDetails = data.items.filter(
            p => !p.planDetails || !Array.isArray(p.planDetails) || p.planDetails.length === 0
        )
        const plansWithDetails = data.items.filter(
            p => p.planDetails && Array.isArray(p.planDetails) && p.planDetails.length > 0
        )

        // Batch fetch cho plans thiếu details (vẫn parallel nhưng giới hạn)
        const fetchedDetailsMap: Record<string, RecruitmentPlanDetail[]> = {}
        if (plansNeedingDetails.length > 0) {
            const results = await Promise.allSettled(
                plansNeedingDetails.map(async (plan) => {
                    const res = await apiClient.get(`/api/plan-details?recruitmentPlanId=${plan.id}`, { headers })
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

        // Process: plans có sẵn details + plans vừa fetch
        const allPlans = [...plansWithDetails, ...plansNeedingDetails]
        const deptMap = await getDeptNameMap()

        for (const plan of allPlans) {
            const details = plan.planDetails && Array.isArray(plan.planDetails) && plan.planDetails.length > 0
                ? plan.planDetails
                : (fetchedDetailsMap[plan.id] || [])

            const creatorName = plan.createdByName || ''
            const deptName = deptMap[creatorName] || plan.campaignName || 'Phòng ban'

            if (details.length > 0) {
                // Chỉ hiển thị planDetail status 'Approved' — chưa có JobPosting, sẵn sàng tạo tin
                // 'Recruiting' = đã có JobPosting active, không cần tạo thêm
                const approvedDetails = details.filter((d) => d.status === 'Approved')
                approvedDetails.forEach((detail) => {
                    const isUrgent = detail.priority === 'Urgent' || detail.priority === 'High'
                    const title = detail.positionTitle || `Tuyển dụng ${detail.quantity} vị trí`

                    requestItems.push({
                        id: detail.id,
                        title: title,
                        requester: deptName,
                        date: new Date(detail.createdAt || plan.createdAt || new Date()).toLocaleDateString('vi-VN'),
                        status: isUrgent ? 'urgent' : 'important',
                        type: 'request',
                        avatar: deptName.substring(0, 2).toUpperCase(),
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
                    requester: deptName,
                    date: new Date(plan.createdAt || new Date()).toLocaleDateString('vi-VN'),
                    status: 'important',
                    type: 'request',
                    avatar: deptName.substring(0, 2).toUpperCase(),
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
    } catch (error) {
        logger.error('Error fetching requests:', error)
        return []
    }
}

// TODO: Replace with actual API call when backend endpoint is available
export async function getTasks(): Promise<TaskItem[]> {
    return []
}

// Lấy danh sách ứng viên tiềm năng từ API thật
// Fetch applications ở giai đoạn phỏng vấn hoặc offer
interface EnterpriseApplicationDto {
    applicationId: string
    stage: string
    status: string
    appliedAt: string
    candidateId: string
    candidateName: string
    candidateEmail?: string
    jobPostingId: string
    jobTitle: string
    overallScore?: number
}

interface ApplicationsResponse {
    items: EnterpriseApplicationDto[]
    totalCount: number
}

export async function getCandidates(): Promise<CandidateItem[]> {
    try {
        // Fetch ứng viên đang ở giai đoạn phỏng vấn hoặc offer
        const stages = ['Shortlisted', 'InterviewScheduled', 'Interviewing', 'OfferProcessing', 'Offered']
        const results = await Promise.allSettled(
            stages.map(async stage => {
                const res = await apiClient.get(`/api/Applications/enterprise?stageFilter=${stage}&pageNumber=1&pageSize=5`)
                if (!res.ok) return [] as EnterpriseApplicationDto[]
                const data = await res.json() as ApplicationsResponse
                return data.items || []
            })
        )

        const allCandidates: CandidateItem[] = []
        results.forEach(r => {
            if (r.status !== 'fulfilled') return
            (r.value as EnterpriseApplicationDto[]).forEach(app => {
                const isInterview = ['Shortlisted', 'InterviewScheduled', 'Interviewing'].includes(app.stage)
                const isOffer = ['OfferProcessing', 'Offered'].includes(app.stage)
                allCandidates.push({
                    id: app.applicationId,
                    name: app.candidateName,
                    position: app.jobTitle,
                    status: isOffer ? 'offer' : isInterview ? 'interview' : 'screening',
                    priority: app.overallScore && app.overallScore >= 80 ? 'urgent' : 'normal'
                })
            })
        })

        // Giới hạn 10 ứng viên, ưu tiên offer trước
        return allCandidates
            .sort((a, b) => {
                const order = { offer: 0, interview: 1, screening: 2 }
                return (order[a.status] ?? 2) - (order[b.status] ?? 2)
            })
            .slice(0, 10)
    } catch {
        return []
    }
}

// Tỉ lệ hoàn thành tuyển dụng theo phòng ban
// (Recruiting + Closed) / Total × 100
const CHART_COLORS = ['#3282B8', '#0F4C75', '#1B9AAA', '#06D6A0', '#EF476F', '#FFD166', '#BBE1FA']

export async function getRecruitmentPerformance(): Promise<ChartData[]> {
    try {
        const response = await apiClient.get('/api/RecruitmentPlans?Status=Approved&Page=1&PageSize=50')
        if (!response.ok) return []

        const data = await response.json() as ApiResponse
        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) return []

        // Fetch details cho tất cả plans
        const detailResults = await Promise.allSettled(
            data.items.map(async (plan: RecruitmentPlan) => {
                const res = await apiClient.get(`/api/plan-details?recruitmentPlanId=${plan.id}`)
                if (!res.ok) return { departmentName: plan.departmentName || plan.createdByName || 'Khác', details: [] as RecruitmentPlanDetail[] }
                const d = await res.json()
                return {
                    departmentName: plan.departmentName || plan.createdByName || 'Khác',
                    details: (Array.isArray(d) ? d : (d.items || [])) as RecruitmentPlanDetail[]
                }
            })
        )

        // Group theo phòng ban
        const grouped: Record<string, { total: number; done: number }> = {}
        detailResults.forEach((r) => {
            if (r.status !== 'fulfilled' || !r.value) return
            const { departmentName, details } = r.value as { departmentName: string; details: RecruitmentPlanDetail[] }
            if (!grouped[departmentName]) grouped[departmentName] = { total: 0, done: 0 }
            details.forEach((d: RecruitmentPlanDetail) => {
                const qty = d.quantity || 1
                grouped[departmentName].total += qty
                if (d.status === 'Recruiting' || d.status === 'Closed') {
                    grouped[departmentName].done += qty
                }
            })
        })

        return Object.entries(grouped)
            .filter(([, v]) => v.total > 0)
            .map(([label, v], i) => ({
                label,
                value: Math.round((v.done / v.total) * 100),
                color: CHART_COLORS[i % CHART_COLORS.length]
            }))
            .sort((a, b) => b.value - a.value)
    } catch {
        return []
    }
}

// TODO: Replace with actual API call when backend endpoint is available
export async function getTrainingPerformance(): Promise<ChartData[]> {
    return []
}
