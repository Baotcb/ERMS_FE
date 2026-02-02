'use client'
import { memo, useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import {
    DashboardListWidget,
    DashboardChartWidget
} from '@/components/common/dashboard/widget-containers'
import {
    getProposals,
    getShortlistedCandidates,
    getTrainingRequests,
    getRecruitmentProgress,
    getTrainingCompletion,
    ProposalItem,
    ShortlistedCandidate,
    TrainingRequest,
    ChartData
} from '../api/dept-head-service'

// Row Components specific to DeptHead Dashboard
function ProposalItemRow({ item }: { item: ProposalItem }) {
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'urgent': return 'bg-red-100 text-red-600 border-red-200'
            case 'highlight': return 'bg-orange-100 text-orange-600 border-orange-200'
            default: return 'bg-green-100 text-green-600 border-green-200'
        }
    }

    return (
        <div className="flex items-start gap-3 group cursor-pointer border-b border-gray-50 pb-3 last:border-0 last:pb-0">
            <div className="mt-1 w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                {item.quantity}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[#0F4C75] transition-colors">
                    {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`text-[10px] px-1 py-0 h-4 ${getStatusColor(item.status)}`}>
                        {item.status === 'urgent' ? 'Khẩn cấp' : item.status === 'highlight' ? 'Ưu tiên' : 'Bình thường'}
                    </Badge>
                    <span className="text-xs text-gray-400 truncate">{item.position} &bull; {item.date}</span>
                </div>
            </div>
        </div>
    )
}

function ShortlistedCandidateRow({ item }: { item: ShortlistedCandidate }) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer border-b border-gray-50 pb-3 last:border-0 last:pb-0">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0F4C75] flex items-center justify-center text-xs font-bold">
                {item.name.substring(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-[#0F4C75] transition-colors">
                    {item.name}
                </p>
                <p className="text-xs text-gray-400">{item.position}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] whitespace-nowrap">
                {item.status === 'interview' ? 'Phỏng vấn' : item.status === 'offer' ? 'Offer' : 'Sơ loại'}
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

export const DeptHeadDashboard = memo(function DeptHeadDashboard() {
    // Local state for mock data
    const [proposals, setProposals] = useState<ProposalItem[]>([])
    const [candidates, setCandidates] = useState<ShortlistedCandidate[]>([])
    const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([])
    const [recruitmentData, setRecruitmentData] = useState<ChartData[]>([])
    const [trainingData, setTrainingData] = useState<ChartData[]>([])

    useEffect(() => {
        // Simulate fetching data
        const loadData = async () => {
            const [props, cands, trains, recPerf, trainPerf] = await Promise.all([
                getProposals(),
                getShortlistedCandidates(),
                getTrainingRequests(),
                getRecruitmentProgress(),
                getTrainingCompletion()
            ])
            setProposals(props)
            setCandidates(cands)
            setTrainingRequests(trains)
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
                <p className="text-gray-500 mt-1">Quản lý Phòng ban</p>
            </div>

            {/* Top Row: 3 Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px]">
                <DashboardListWidget
                    title="Đề xuất nhân sự"
                    subtitle="Trạng thái: Đang xử lý"
                    items={proposals}
                    renderItem={(item) => <ProposalItemRow item={item} />}
                />

                <DashboardListWidget
                    title="Ứng viên chờ phỏng vấn"
                    subtitle="Chiến dịch hiện tại"
                    items={candidates}
                    renderItem={(item) => <ShortlistedCandidateRow item={item} />}
                />

                <DashboardListWidget
                    title="Yêu cầu đào tạo"
                    subtitle="Qúy 1/2026"
                    items={trainingRequests}
                    renderItem={(item) => <TrainingRequestRow item={item} />}
                />
            </div>

            {/* Bottom Row: 2 Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <DashboardChartWidget
                    title="Tiến độ Tuyển dụng"
                    subtitle="Phễu ứng viên (Funnel)"
                    data={recruitmentData}
                />

                <DashboardChartWidget
                    title="Hoàn thành Đào tạo"
                    subtitle="Theo Team/Nhóm"
                    data={trainingData}
                />
            </div>
        </div>
    )
})
