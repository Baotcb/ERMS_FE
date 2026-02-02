'use client'
import { memo, useState, useEffect } from 'react'
import {
    DashboardListWidget,
    DashboardChartWidget,
    RequestItemRow,
    TaskItemRow,
    CandidateItemRow
} from './dashboard-widgets'
import {
    getRequests,
    getTasks,
    getCandidates,
    getRecruitmentPerformance,
    getTrainingPerformance,
    RequestItem,
    TaskItem,
    CandidateItem,
    ChartData
} from '../api/dashboard-service'

export const HRDashboard = memo(function HRDashboard() {
    // Local state for mock data
    const [requests, setRequests] = useState<RequestItem[]>([])
    const [tasks, setTasks] = useState<TaskItem[]>([])
    const [candidates, setCandidates] = useState<CandidateItem[]>([])
    const [recruitmentData, setRecruitmentData] = useState<ChartData[]>([])
    const [trainingData, setTrainingData] = useState<ChartData[]>([])

    useEffect(() => {
        // Simulate fetching data
        const loadData = async () => {
            const [reqs, tsks, cands, recPerf, trainPerf] = await Promise.all([
                getRequests(),
                getTasks(),
                getCandidates(),
                getRecruitmentPerformance(),
                getTrainingPerformance()
            ])
            setRequests(reqs)
            setTasks(tsks)
            setCandidates(cands)
            setRecruitmentData(recPerf)
            setTrainingData(trainPerf)
        }
        loadData()
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#0F4C75]">Dashboard</h1>
                <p className="text-gray-500 mt-1">Tổng quan hoạt động HR</p>
            </div>

            {/* Top Row: 3 Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px]">
                <DashboardListWidget
                    title="Danh sách Yêu cầu Tuyển dụng & Đào tạo"
                    subtitle="Phòng ban: Tất cả &bull; Chờ duyệt"
                    items={requests}
                    renderItem={(item) => (
                        <RequestItemRow
                            title={item.title}
                            date={item.date}
                            requester={item.requester}
                            status={item.status}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
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
