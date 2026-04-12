import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'
import { RecruitmentPlan } from '../types/recruitment-plan-types'
import { trainingService } from './training-service'

export interface ProposalItem {
    id: string
    title: string
    position: string
    quantity: number // We'll store 0 if not available, or maybe budget?
    status: string // Allow any string for flexibility with backend statuses
    date: string
    budget: number // Added budget for display
}

export interface ShortlistedPosition {
    id: string
    positionTitle: string
    quantity: number
    priority: 'Normal' | 'High' | 'Urgent'
    planName: string
    planId: string
    status?: string
}

export interface TrainingRequest {
    id: string
    title: string
    type: string
    attendees: number
    status: 'pending' | 'approved'
}

export interface ChartData {
    label: string
    value: number
    color: string
}

export interface DepartmentTrainingResultItem {
    id: string
    employeeName: string
    employeeEmail: string
    departmentName: string
    courseName: string
    courseCode: string
    assignedAt: string
    completedAt: string | null
    progressPercentage: number
    totalLessons: number
    completedLessons: number
    quizScore: number | null
    attemptCount: number
    learningStatus: 'InProgress' | 'Completed' | 'NotStarted'
    evaluationStatus: 'Passed' | 'Failed' | 'Pending'
    note?: string
}

interface PlanDetailDto {
    id: string
    recruitmentPlanId: string
    positionTitle: string
    quantity: number
    priority: string
    status?: string
}

export async function getProposals(): Promise<ProposalItem[]> {
    try {
        const res = await apiClient.get('/api/RecruitmentPlans?Page=1&PageSize=5')
        if (!res.ok) {
            console.error('Failed to fetch proposals:', res.statusText)
            return []
        }
        const data = await res.json()

        return (data.items || []).map((plan: RecruitmentPlan) => ({
            id: plan.id,
            title: plan.planName,
            position: plan.planCode,
            quantity: 0,
            status: plan.status,
            date: format(new Date(plan.createdAt), 'dd/MM/yyyy'),
            budget: plan.totalBudget
        }))
    } catch (error) {
        console.error('Failed to fetch proposals', error)
        return []
    }
}

/**
 * Lấy danh sách vị trí tuyển dụng từ kế hoạch đã duyệt (Approved)
 * Backend: GET /api/RecruitmentPlans (DeptHead có quyền)
 *        + GET /api/plan-details?recruitmentPlanId={id}
 */
export async function getShortlistedPositions(): Promise<ShortlistedPosition[]> {
    try {
        // 1. Lấy danh sách plans đã duyệt
        const plansRes = await apiClient.get('/api/RecruitmentPlans?Page=1&PageSize=10&Status=Approved')
        if (!plansRes.ok) return []
        const plansData = await plansRes.json()
        const plans: RecruitmentPlan[] = plansData.items || []

        if (plans.length === 0) return []

        // 2. Lấy plan details của từng plan (tối đa 3 plans gần nhất)
        const recentPlans = plans.slice(0, 3)
        const detailsPromises = recentPlans.map(async (plan) => {
            try {
                const res = await apiClient.get(`/api/plan-details?recruitmentPlanId=${plan.id}`)
                if (!res.ok) return []
                const details: PlanDetailDto[] = await res.json()
                return details
                    .filter((d) => d.status === 'Approved')
                    .map((d) => ({
                        id: d.id,
                        positionTitle: d.positionTitle,
                        quantity: d.quantity,
                        priority: d.priority as ShortlistedPosition['priority'],
                        planName: plan.planName,
                        planId: plan.id,
                        status: d.status,
                    }))
            } catch {
                return []
            }
        })

        const allDetails = await Promise.all(detailsPromises)
        return allDetails.flat().slice(0, 5) // Tối đa 5 vị trí cho dashboard
    } catch (error) {
        console.error('Failed to fetch shortlisted positions', error)
        return []
    }
}

export async function getTrainingRequests(): Promise<TrainingRequest[]> {
    try {
        const result = await trainingService.getRequests({ page: 1, pageSize: 5 });
        return (result.items || []).map((req) => ({
            id: req.id,
            title: req.subject,
            type: req.departmentName || 'Chung',
            attendees: req.estimatedParticipants || 0,
            status: (req.status?.toLowerCase() === 'approved' ? 'approved' : 'pending') as 'pending' | 'approved',
        }));
    } catch {
        return [];
    }
}

export async function getRecruitmentProgress(): Promise<ChartData[]> {
    return [
        { label: 'CV Nhận được', value: 45, color: '#3282B8' },
        { label: 'Đạt sơ loại', value: 20, color: '#BBE1FA' },
        { label: 'Phỏng vấn', value: 12, color: '#0F4C75' },
        { label: 'Offer', value: 5, color: '#3282B8' },
        { label: 'Onboard', value: 3, color: '#0F4C75' },
    ]
}

export async function getTrainingCompletion(): Promise<ChartData[]> {
    try {
        const res = await apiClient.get('/api/Course/department-training-results')
        if (!res.ok) return []
        const data: DepartmentTrainingResultItem[] = await res.json()
        
        // Group by employeeName and calculate average progress
        const employeeMap = new Map<string, { totalProgress: number, count: number }>()
        
        data.forEach(item => {
            const name = item.employeeName || 'Unknown'
            if (!employeeMap.has(name)) {
                employeeMap.set(name, { totalProgress: 0, count: 0 })
            }
            const record = employeeMap.get(name)!
            record.totalProgress += item.progressPercentage
            record.count += 1
        })
        
        const colors = ['#0F4C75', '#3282B8', '#BBE1FA', '#1A5F7A', '#57C5B6', '#159895']
        
        const chartData = Array.from(employeeMap.entries()).map(([name, record], index) => ({
            label: name,
            value: Math.round(record.totalProgress / record.count),
            color: colors[index % colors.length]
        }))
        
        // Return top 5 or let UI handle? We'll return top 5 employees by highest progress
        return chartData.sort((a, b) => b.value - a.value).slice(0, 5)
    } catch (error) {
        console.error('Failed to fetch training completion', error)
        return []
    }
}
