'use client'

import { memo } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api-client'
import {
    DashboardListWidget,
    DashboardChartWidget
} from '@/components/common/dashboard/widget-containers'
import type { RecruitmentPlan, PlanListResponse } from '@/features/dept-head/types/recruitment-plan-types'

// Types for Dashboard
interface ActivityItem {
    id: string
    title: string
    time: string
    type: 'info' | 'success' | 'warning'
}



// Row Components
function PendingPlanRow({ plan }: { plan: RecruitmentPlan }) {
    const router = useRouter()
    return (
        <div
            className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 hover:border-blue-100 hover:shadow-sm cursor-pointer transition-all duration-200"
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/enterprise/director/recruitment-plans/${plan.id}`)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/enterprise/director/recruitment-plans/${plan.id}`) } }}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {plan.planCode}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                        {format(new Date(plan.createdAt), 'dd/MM/yyyy')}
                    </span>
                </div>
                <h4 className="text-base font-semibold text-gray-800 line-clamp-1 group-hover:text-[#0F4C75]">
                    {plan.planName}
                </h4>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Ngân sách:</span>
                        <span className="font-medium text-[#0F4C75]">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.totalBudget)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Tạo bởi:</span>
                        <span>{plan.createdByName}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-[#0F4C75]"
                >
                    <Eye className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}

function ActivityRow({ item }: { item: ActivityItem }) {
    return (
        <div className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
            <div className={`mt-1.5 w-2 h-2 rounded-full ${item.type === 'success' ? 'bg-green-500' :
                item.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
            <div className="flex-1">
                <p className="text-sm text-gray-700">{item.title}</p>
                <span className="text-xs text-gray-400">{item.time}</span>
            </div>
        </div>
    )
}

function StatCard({ title, value, subtext, color }: { title: string, value: string, subtext: string, color: string }) {
    return (
        <div className={`p-4 rounded-lg bg-white border border-l-4 shadow-sm ${color}`}>
            <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-800">{value}</h3>
            <p className="text-xs text-gray-400 mt-1">{subtext}</p>
        </div>
    )
}

export const DirectorDashboard = memo(function DirectorDashboard() {

    // Fetch Pending plans
    const { data: pendingPlansData } = useSWR<PlanListResponse>(
        '/RecruitmentPlans/pending-dashboard',
        () => apiClient.get('/api/RecruitmentPlans?Status=Pending&Page=1&PageSize=5').then(res => res.json())
    )

    // Fetch Total Budget (Mocked or aggregated)
    // For now, let's just use placeholder data for charts/stats

    // Mock Activities
    const activities: ActivityItem[] = [
        { id: '1', title: 'HR Manager đã duyệt danh sách ứng viên Marketing', time: '2 giờ trước', type: 'success' },
        { id: '2', title: 'Cần phê duyệt ngân sách điều chỉnh cho IT Dept', time: '5 giờ trước', type: 'warning' },
        { id: '3', title: 'Báo cáo tuyển dụng Q1/2026 đã sẵn sàng', time: '1 ngày trước', type: 'info' },
    ]

    // Mock Chart Data
    const budgetData = [
        { label: 'IT', value: 450, color: '#0F4C75' },
        { label: 'Marketing', value: 300, color: '#3282B8' },
        { label: 'Sales', value: 250, color: '#BBE1FA' },
        { label: 'HR', value: 100, color: '#1B262C' },
    ]

    const pendingPlans = pendingPlansData?.items || []

    return (
        <div className="flex flex-col gap-6 min-h-[calc(100vh-6rem)]">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75] leading-tight">Dashboard</h1>
                <p className="text-gray-500 text-sm">Tổng quan dành cho Giám đốc</p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Kế hoạch chờ duyệt"
                    value={pendingPlansData?.totalCount?.toString() || '0'}
                    subtext="Cần xử lý ngay"
                    color="border-l-yellow-500"
                />
                <StatCard
                    title="Tổng ngân sách (Q1)"
                    value="2.4 Tỷ"
                    subtext="Đã phê duyệt"
                    color="border-l-blue-500"
                />
                <StatCard
                    title="Vị trí đang tuyển"
                    value="15"
                    subtext="Trên 5 phỏng ban"
                    color="border-l-green-500"
                />
                <StatCard
                    title="Gói dịch vụ"
                    value="Premium"
                    subtext="Còn 240 ngày"
                    color="border-l-purple-500"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Pending Plans List (Takes up 2 cols) */}
                <div className="lg:col-span-2 h-full">
                    <DashboardListWidget
                        title="Kế hoạch tuyển dụng chờ duyệt"
                        subtitle="Danh sách cần phê duyệt"
                        items={pendingPlans}
                        renderItem={(plan) => <PendingPlanRow plan={plan} />}
                        onRefresh={() => window.location.href = '/enterprise/director/recruitment-plans'}
                    />
                </div>

                {/* Activities / Notifications (Takes up 1 col) */}
                <div className="h-full">
                    <DashboardListWidget
                        title="Hoạt động gần đây"
                        subtitle="Thông báo hệ thống"
                        items={activities}
                        renderItem={(item) => <ActivityRow item={item} />}
                    />
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                <DashboardChartWidget
                    title="Phân bổ ngân sách tuyển dụng"
                    subtitle="Theo phòng ban (Đơn vị: Triệu VNĐ)"
                    data={budgetData}
                />

                {/* Another chart placeholder */}
                <DashboardChartWidget
                    title="Hiệu quả tuyển dụng"
                    subtitle="Tỷ lệ lấp đầy vị trí (%)"
                    data={[
                        { label: 'T1', value: 65, color: '#0F4C75' },
                        { label: 'T2', value: 78, color: '#3282B8' },
                        { label: 'T3', value: 85, color: '#BBE1FA' },
                    ]}
                />
            </div>
        </div>
    )
})
