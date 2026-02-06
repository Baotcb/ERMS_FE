import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'
import { RecruitmentPlan } from '../types/recruitment-plan-types'

export interface ProposalItem {
    id: string
    title: string
    position: string
    quantity: number // We'll store 0 if not available, or maybe budget?
    status: string // Allow any string for flexibility with backend statuses
    date: string
    budget: number // Added budget for display
}

// ... existing interfaces ...

export interface ShortlistedCandidate {
    id: string
    name: string
    position: string
    status: 'interview' | 'offer' | 'screening'
    priority: 'urgent' | 'normal'
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

export async function getProposals(): Promise<ProposalItem[]> {
    try {
        const res = await apiClient.get('/api/RecruitmentPlans?Page=1&PageSize=5')
        const data = await res.json()

        return data.items.map((plan: RecruitmentPlan) => ({
            id: plan.id,
            title: plan.planName,
            position: plan.planCode,
            quantity: 0, // Plan list doesn't have total qty usually
            status: plan.status,
            date: format(new Date(plan.createdAt), 'dd/MM/yyyy'),
            budget: plan.totalBudget
        }))
    } catch (error) {
        console.error('Failed to fetch proposals', error)
        return []
    }
}

export async function getShortlistedCandidates(): Promise<ShortlistedCandidate[]> {
    return [
        { id: '1', name: 'Nguyễn Văn A', position: 'Flutter Dev', status: 'interview', priority: 'urgent' },
        { id: '2', name: 'Trần Thị B', position: 'Kế toán viên', status: 'screening', priority: 'normal' },
        { id: '3', name: 'Lê Văn C', position: 'Sales Executive', status: 'offer', priority: 'urgent' },
        { id: '4', name: 'Phạm Thị D', position: 'Flutter Dev', status: 'interview', priority: 'normal' },
    ]
}

export async function getTrainingRequests(): Promise<TrainingRequest[]> {
    return [
        { id: '1', title: 'Đào tạo kỹ năng bán hàng B2B', type: 'Kỹ năng mềm', attendees: 10, status: 'pending' },
        { id: '2', title: 'Cập nhật luật thuế 2026', type: 'Chuyên môn', attendees: 3, status: 'approved' },
        { id: '3', title: 'Onboarding nhân viên mới T2', type: 'Hội nhập', attendees: 5, status: 'pending' },
    ]
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
    return [
        { label: 'Team A', value: 80, color: '#0F4C75' },
        { label: 'Team B', value: 65, color: '#3282B8' },
        { label: 'Team C', value: 90, color: '#BBE1FA' },
        { label: 'Team D', value: 45, color: '#0F4C75' },
    ]
}
