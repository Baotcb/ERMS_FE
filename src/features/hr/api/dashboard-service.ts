
export interface DashboardStats {
    totalEmployees: number
    totalDepartments: number
    newHires: number
    turnoverRate: number
}

// New Interfaces
export interface RequestItem {
    id: string
    title: string
    requester: string
    date: string
    status: 'urgent' | 'important' | 'normal'
    type: 'request' // approval
    avatar?: string
}

export interface TaskItem {
    id: string
    title: string
    project: string
    dueDate: string | null
    assignee: string
    avatar?: string
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

export async function getDashboardStats(): Promise<DashboardStats> {
    // Mock data for now as backend doesn't have stats endpoint yet
    return {
        totalEmployees: 156,
        totalDepartments: 12,
        newHires: 8,
        turnoverRate: 3.2
    }
}


export async function getRequests(): Promise<RequestItem[]> {
    return [
        { id: '1', title: 'Đề xuất tuyển dụng 05 Senior Backend Dev', requester: 'Phòng Kỹ thuật', date: '02/02/2026', status: 'urgent', type: 'request' },
        { id: '2', title: 'Đề xuất đào tạo hội nhập nhân viên mới Q1', requester: 'Phòng Nhân sự', date: '01/02/2026', status: 'important', type: 'request' },
        { id: '3', title: 'Yêu cầu tuyển dụng Thực tập sinh Marketing', requester: 'Phòng Marketing', date: '30/01/2026', status: 'normal', type: 'request' },
        { id: '4', title: 'Đề xuất mua tài khoản Udemy Business', requester: 'Phòng Đào tạo', date: '28/01/2026', status: 'important', type: 'request' },
    ]
}

export async function getTasks(): Promise<TaskItem[]> {
    return [
        { id: '1', title: 'Sàng lọc CV vị trí Business Analyst', project: 'Tuyển dụng', dueDate: '05/02/2026', assignee: 'HR Executive' },
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
