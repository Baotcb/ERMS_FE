'use client'
import { memo } from 'react'
import { useRouter } from 'next/navigation'
import {
    DashboardListWidget,
    DashboardChartWidget,
    RequestItemRow,
    TaskItemRow,
    CandidateItemRow
} from './dashboard-widgets'
import type { RequestItem } from '../api/dashboard-service'
import {
    useDashboardRequests,
    useDashboardTasks,
    useDashboardCandidates,
    useDashboardRecruitmentChart,
    useDashboardTrainingChart
} from '../hooks/use-dashboard'

export const HRDashboard = memo(function HRDashboard() {
    const router = useRouter()

    const { data: requests = [] } = useDashboardRequests()
    const { data: tasks = [] } = useDashboardTasks()
    const { data: candidates = [] } = useDashboardCandidates()
    const { data: recruitmentData = [] } = useDashboardRecruitmentChart()
    const { data: trainingData = [] } = useDashboardTrainingChart()

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
        <div className="flex flex-col h-[calc(100vh-7rem)] gap-3">
            {/* Header */}
            <div className="shrink-0">
                <h1 className="text-2xl font-bold text-[#0F4C75] leading-tight">Dashboard</h1>
                <p className="text-gray-500 text-sm">Tổng quan hoạt động HR</p>
            </div>

            {/* Top Row: 3 Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-[2] min-h-0">
                <DashboardListWidget
                    title="Danh sách Yêu cầu Tuyển dụng"
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
                    title="Danh sách Yêu cầu Đào tạo"
                    subtitle="Phòng ban: Tất cả &bull; Chờ duyệt"
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
                            group={item.status === 'offer' ? 'Offer' : item.status === 'interview' ? 'Phỏng vấn' : 'Sàng lọc'}
                            status={item.priority}
                        />
                    )}
                />
            </div>

            {/* Bottom Row: 2 Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-[3] min-h-0">
                <DashboardChartWidget
                    title="Hiệu suất Tuyển dụng (Theo phòng ban)"
                    subtitle="Tỷ lệ hoàn thành tuyển dụng (%)"
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
