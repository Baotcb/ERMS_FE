import { apiClient } from '@/lib/api-client'
import { logger } from '@/lib/logger'

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
// Currently returns hardcoded mock data
export async function getDashboardStats(): Promise<DashboardStats> {
    return {
        totalEmployees: 156,
        totalDepartments: 12,
        newHires: 8,
        turnoverRate: 3.2
    }
}

export async function getRequests(): Promise<RequestItem[]> {
    try {
        const response = await apiClient.get('/api/RecruitmentPlans?Status=Approved&Page=1&PageSize=5')

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

        await Promise.all(data.items.map(async (plan: RecruitmentPlan) => {
            let details = plan.planDetails

            if (!details || !Array.isArray(details) || details.length === 0) {
                try {
                    const detailsResponse = await apiClient.get(`/api/plan-details?recruitmentPlanId=${plan.id}`)
                    if (detailsResponse.ok) {
                        const detailsData = await detailsResponse.json()
                        details = Array.isArray(detailsData) ? detailsData : (detailsData.items || [])
                    }
                } catch (err) {
                    logger.error(`Failed to fetch details for plan ${plan.id}`, err)
                }
            }

            if (details && Array.isArray(details) && details.length > 0) {
                const approvedDetails = details.filter((d) => d.status === 'Approved')
                approvedDetails.forEach((detail) => {
                    const isUrgent = detail.priority === 'Urgent' || detail.priority === 'High'
                    const status = isUrgent ? 'urgent' : 'important'
                    const title = detail.positionTitle || `Tuyển dụng ${detail.quantity} vị trí`

                    requestItems.push({
                        id: detail.id,
                        title: title,
                        requester: detail.requestedByName || plan.createdByName || 'Phòng ban',
                        date: new Date(detail.createdAt || plan.createdAt || new Date()).toLocaleDateString('vi-VN'),
                        status: status,
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
        }))

        return requestItems
    } catch (error) {
        logger.error('Error fetching requests:', error)
        return []
    }
}

export async function getTasks(): Promise<TaskItem[]> {
    return [
        { id: '1', title: 'Sàng lọc CV vị trí Business Analyst', project: 'Tuyển dụng', dueDate: '05/02/2026', assignee: 'HR Executive' },
        { id: '5', title: 'Tạo tin tuyển dụng: Senior Java Dev (Đã duyệt)', project: 'Tuyển dụng', dueDate: 'Hôm nay', assignee: 'HR Manager', link: '/enterprise/hr/job-postings/create?planId=123' },
        { id: '6', title: 'Tạo tin tuyển dụng: QC Manual (Đã duyệt)', project: 'Tuyển dụng', dueDate: 'Hôm nay', assignee: 'HR Executive', link: '/enterprise/hr/job-postings/create?planId=124' },
        { id: '2', title: 'Gửi thư mời nhận việc cho Nguyễn Văn A', project: 'Tuyển dụng', dueDate: '03/02/2026', assignee: 'HR Manager' },
        { id: '3', title: 'Chuẩn bị tài liệu đào tạo tuần 1', project: 'Đào tạo', dueDate: '04/02/2026', assignee: 'Trainer' },
        { id: '4', title: 'Đánh giá thử việc nhân viên QC', project: 'Đánh giá', dueDate: '10/02/2026', assignee: 'HR Executive' },
    ]
}

export async function getCandidates(): Promise<CandidateItem[]> {
    return [
        { id: '1', name: 'Trần Minh Quang', position: 'Senior Java Dev', status: 'interview', priority: 'urgent' },
        { id: '2', name: 'Nguyễn Thị Lan', position: 'Content Creator', status: 'screening', priority: 'normal' },
        { id: '3', name: 'Lê Hoàng Nam', position: 'BA Leader', status: 'offer', priority: 'urgent' },
        { id: '4', name: 'Phạm Thu Thủy', position: 'Tester', status: 'interview', priority: 'normal' },
    ]
}

export async function getRecruitmentPerformance(): Promise<ChartData[]> {
    return [
        { label: 'IT Software', value: 85, color: '#3282B8' },
        { label: 'Marketing', value: 60, color: '#BBE1FA' },
        { label: 'Sales', value: 45, color: '#0F4C75' },
        { label: 'Kế toán', value: 90, color: '#3282B8' },
        { label: 'Vận hành', value: 70, color: '#BBE1FA' },
        { label: 'HR', value: 95, color: '#0F4C75' },
    ]
}

export async function getTrainingPerformance(): Promise<ChartData[]> {
    return [
        { label: 'Hội nhập', value: 100, color: '#0F4C75' },
        { label: 'Kỹ năng mềm', value: 75, color: '#0F4C75' },
        { label: 'Chuyên môn', value: 60, color: '#0F4C75' },
        { label: 'Leadership', value: 40, color: '#0F4C75' },
        { label: 'Tiếng Anh', value: 30, color: '#0F4C75' },
        { label: 'An toàn LĐ', value: 90, color: '#0F4C75' },
    ]
}
