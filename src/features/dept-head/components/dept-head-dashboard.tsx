'use client'
import { memo, useEffect, useReducer } from 'react'
import { Badge } from '@/components/ui/badge'
import {
    DashboardListWidget,
    DashboardChartWidget
} from '@/components/common/dashboard/widget-containers'
import {
    getProposals,
    getShortlistedPositions,
    getTrainingRequests,
    getRecruitmentProgress,
    getTrainingCompletion,
    ProposalItem,
    ShortlistedPosition,
    TrainingRequest,
    ChartData
} from '../api/dept-head-service'

// Row Components specific to DeptHead Dashboard
function ProposalItemRow({ item }: { item: ProposalItem }) {
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200'
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200' // Draft
        }
    }

    const getStatusLabel = (s: string) => {
        switch (s) {
            case 'Pending': return 'Chờ duyệt'
            case 'Approved': return 'Đã duyệt'
            case 'Rejected': return 'Từ chối'
            default: return 'Nháp'
        }
    }

    return (
        <div className="flex flex-col gap-3 group cursor-pointer border-b border-gray-50 pb-4 last:border-0 last:pb-0 hover:bg-gray-50 p-3 rounded -mx-3 transition-colors">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-[#0F4C75] transition-colors">
                    {item.title}
                </p>
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 h-auto ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                        {item.position}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>{item.date}</span>
                </div>
                <span className="font-medium text-[#0F4C75]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.budget)}
                </span>
            </div>
        </div>
    )
}

function ShortlistedPositionRow({ item }: { item: ShortlistedPosition }) {
    const priorityStyles: Record<string, string> = {
        Urgent: 'bg-red-100 text-red-600',
        High: 'bg-yellow-100 text-yellow-600',
        Normal: 'bg-gray-100 text-gray-600',
    }
    const priorityLabels: Record<string, string> = {
        Urgent: 'Khẩn cấp',
        High: 'Cao',
        Normal: 'Bình thường',
    }

    return (
        <div className="flex items-center gap-3 group cursor-pointer border-b border-gray-50 pb-3 last:border-0 last:pb-0">
            <div className="w-8 h-8 rounded-lg bg-[#BBE1FA]/30 text-[#0F4C75] flex items-center justify-center text-xs font-bold">
                {item.quantity}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-[#0F4C75] transition-colors">
                    {item.positionTitle}
                </p>
                <p className="text-xs text-gray-400 line-clamp-1">{item.planName}</p>
            </div>
            <Badge variant="secondary" className={`text-[10px] whitespace-nowrap ${priorityStyles[item.priority] || ''}`}>
                {priorityLabels[item.priority] || item.priority}
            </Badge>
        </div>
    )
}

function TrainingRequestRow({ item }: { item: TrainingRequest }) {
    return (
        <div className="flex items-start gap-3 group cursor-pointer border-b border-gray-50 pb-3 last:border-0 last:pb-0">
            <div className={`mt-1 w-2 h-2 rounded-full ${item.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[#0F4C75] transition-colors">{item.title}</p>
                <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">{item.type}</span>
                    <span className="text-xs text-gray-500 font-medium">{item.attendees} Học viên</span>
                </div>
            </div>
        </div>
    )
}

type DashboardData = {
    proposals: ProposalItem[]
    positions: ShortlistedPosition[]
    trainingRequests: TrainingRequest[]
    recruitmentData: ChartData[]
    trainingData: ChartData[]
}

const initialDashboardData: DashboardData = {
    proposals: [],
    positions: [],
    trainingRequests: [],
    recruitmentData: [],
    trainingData: [],
}

export const DeptHeadDashboard = memo(function DeptHeadDashboard() {
    const [data, dispatch] = useReducer((_: DashboardData, next: DashboardData) => next, initialDashboardData)

    useEffect(() => {
        const loadData = async () => {
            const [proposals, positions, trainingRequests, recruitmentData, trainingData] = await Promise.all([
                getProposals(),
                getShortlistedPositions(),
                getTrainingRequests(),
                getRecruitmentProgress(),
                getTrainingCompletion()
            ])
            dispatch({ proposals, positions, trainingRequests, recruitmentData, trainingData })
        }
        loadData()
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75] leading-tight">Dashboard</h1>
                <p className="text-gray-500 text-sm">Quản lý Phòng ban</p>
            </div>

            {/* Top Row: 3 Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DashboardListWidget
                    title="Đề xuất nhân sự"
                    subtitle="Trạng thái: Đang xử lý"
                    items={data.proposals}
                    renderItem={(item) => <ProposalItemRow item={item} />}
                />

                <DashboardListWidget
                    title="Vị trí đang tuyển"
                    subtitle="Kế hoạch đã duyệt"
                    items={data.positions}
                    renderItem={(item) => <ShortlistedPositionRow item={item} />}
                />

                <DashboardListWidget
                    title="Yêu cầu đào tạo"
                    subtitle="Qúy 1/2026"
                    items={data.trainingRequests}
                    renderItem={(item) => <TrainingRequestRow item={item} />}
                />
            </div>

            {/* Bottom Row: 2 Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardChartWidget
                    title="Tiến độ Tuyển dụng"
                    subtitle="Phễu ứng viên (Funnel)"
                    data={data.recruitmentData}
                />

                <DashboardChartWidget
                    title="Hoàn thành Đào tạo"
                    subtitle="Theo Nhân viên"
                    data={data.trainingData}
                />
            </div>
        </div>
    )
})
