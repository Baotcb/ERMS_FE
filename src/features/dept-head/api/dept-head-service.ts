export interface ProposalItem {
    id: string
    title: string
    position: string
    quantity: number
    status: 'urgent' | 'highlight' | 'normal'
    date: string
}

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
    return [
        { id: '1', title: 'Bổ sung nhân sự team Mobile', position: 'Flutter Dev', quantity: 2, status: 'urgent', date: '02/02/2026' },
        { id: '2', title: 'Thay thế nhân sự nghỉ thai sản', position: 'Kế toán viên', quantity: 1, status: 'highlight', date: '01/02/2026' },
        { id: '3', title: 'Mở rộng team Sales HCM', position: 'Sales Executive', quantity: 5, status: 'normal', date: '28/01/2026' },
    ]
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
