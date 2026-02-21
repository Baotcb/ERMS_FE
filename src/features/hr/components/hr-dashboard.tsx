'use client'
import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    DashboardListWidget,
    DashboardChartWidget,
    RequestItemRow,
    TaskItemRow,
    CandidateItemRow
} from './dashboard-widgets'
import {
    RequestItem,
    TaskItem,
    CandidateItem,
    ChartData
} from '../api/dashboard-service'

interface HRDashboardProps {
    initialRequests?: RequestItem[]
    initialTasks?: TaskItem[]
    initialCandidates?: CandidateItem[]
    initialRecruitmentData?: ChartData[]
    initialTrainingData?: ChartData[]
}

export const HRDashboard = memo(function HRDashboard({
    initialRequests = [],
    initialTasks = [],
    initialCandidates = [],
    initialRecruitmentData = [],
    initialTrainingData = []
}: HRDashboardProps) {
    const router = useRouter()

    const [requests] = useState<RequestItem[]>(initialRequests)
    const [tasks] = useState<TaskItem[]>(initialTasks)
    const [candidates] = useState<CandidateItem[]>(initialCandidates)
    const [recruitmentData] = useState<ChartData[]>(initialRecruitmentData)
    const [trainingData] = useState<ChartData[]>(initialTrainingData)

    const handleRequestClick = (item: RequestItem) => {
        const params = new URLSearchParams()
        if (item.planDetailId) params.append('planDetailId', item.planDetailId)
        if (item.title) params.append('jobTitle', item.title)
        if (item.quantity) params.append('quantity', item.quantity.toString())
        if (item.location) params.append('location', item.location)
        if (item.deadline) params.append('applicationDeadline', item.deadline)
        if (item.requiredSkills) params.append('requirements', item.requiredSkills)
        params.append('autoOpen', 'true')
        router.push(`/enterprise/hr/job-postings?${params.toString()}`)
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75] leading-tight">Dashboard</h1>
                <p className="text-gray-500 text-sm">Tổng quan hoạt động HR</p>
            </div>

            {/* Top Row: 3 Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <DashboardListWidget
                    title="Danh sách Yêu cầu Tuyển dụng & Đào tạo"
                    subtitle="Phòng ban: Tất cả &bull; Chờ duyệt (Click để tạo tin)"
                    items={requests}
                    renderItem={(item) => (
                        <RequestItemRow
                            title={item.title}
                            date={item.date}
                            requester={item.requester}
                            status={item.status}
                            project={item.project}
                            onClick={() => handleRequestClick(item)}
                        />
                    )}
                />

                <DashboardListWidget
                    title="Danh sách Nhiệm vụ (Tasks)"
                    subtitle="Cá nhân & Team &bull; Hôm nay"
                    items={tasks}
                    renderItem={(item) => (
                        <TaskItemRow
                            title={item.title}
                            project={item.project}
                            assignee={item.assignee}
                            link={item.link}
                        />
                    )}
                />

                <DashboardListWidget
                    title="Danh sách Ứng viên tiềm năng"
                    subtitle="Trạng thái: Chờ phỏng vấn / Offer"
                    items={candidates}
                    renderItem={(item) => (
                        <CandidateItemRow
                            title={`${item.name} - ${item.position}`}
                            group="ỨNG VIÊN"
                            status={item.priority}
                        />
                    )}
                />
            </div>

            {/* Bottom Row: 2 Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DashboardChartWidget
                    title="Hiệu suất Tuyển dụng (Theo phòng ban)"
                    subtitle="Tỷ lệ đạt mục tiêu tuyển dụng (%)"
                    data={recruitmentData}
                />

                <DashboardChartWidget
                    title="Hiệu suất Đào tạo (Theo loại hình)"
                    subtitle="Tỷ lệ hoàn thành khóa học (%)"
                    data={trainingData}
                />
            </div>
        </div>
    )
})
