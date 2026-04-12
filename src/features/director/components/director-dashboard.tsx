'use client'

import { memo, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { apiClient } from '@/lib/api-client'
import {
    DashboardListWidget,
    DashboardChartWidget
} from '@/components/common/dashboard/widget-containers'
import type { RecruitmentPlan, PlanListResponse } from '@/features/dept-head/types/recruitment-plan-types'
import type { TrainingPlansResult } from '@/features/hr/types/training-plan-types'

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

    // Fetch Approved plans for budget stats
    const { data: approvedPlansData } = useSWR<PlanListResponse>(
        '/RecruitmentPlans/approved-dashboard',
        () => apiClient.get('/api/RecruitmentPlans?Status=Approved&Page=1&PageSize=50').then(res => res.json())
    )

    // Fetch Approved training plans for budget stats
    const { data: approvedTrainingPlansData } = useSWR<TrainingPlansResult>(
        '/TrainingPlan/approved-dashboard',
        () => apiClient.get('/api/TrainingPlan?status=Approved&page=1&pageSize=50').then(res => res.json())
    )

    // Fetch Published job postings count
    const { data: publishedJobsData } = useSWR(
        '/JobPostings/published-count',
        () => apiClient.get('/api/JobPostings?Status=Published&Page=1&PageSize=1').then(res => res.json())
    )

    // Compute total budget from approved plans
    const totalBudget = useMemo(() => {
        if (!approvedPlansData?.items) return 0
        return approvedPlansData.items.reduce((sum, plan) => sum + (plan.totalBudget || 0), 0)
    }, [approvedPlansData])

    const formatBudget = (amount: number) => {
        if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Tỷ`
        if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)} Triệu`
        return new Intl.NumberFormat('vi-VN').format(amount)
    }

    // Build activities from recent pending plans
    const activities: ActivityItem[] = useMemo(() => {
        const items: ActivityItem[] = []
        const pendingItems = pendingPlansData?.items || []
        for (const plan of pendingItems.slice(0, 5)) {
            const createdDate = new Date(plan.createdAt)
            const now = new Date()
            const diffMs = now.getTime() - createdDate.getTime()
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
            const timeText = diffDays > 0 ? `${diffDays} ngày trước` : diffHours > 0 ? `${diffHours} giờ trước` : 'Vừa xong'

            items.push({
                id: plan.id,
                title: `Kế hoạch "${plan.planName}" cần phê duyệt (${plan.createdByName})`,
                time: timeText,
                type: 'warning',
            })
        }
        if (items.length === 0) {
            items.push({ id: 'empty', title: 'Không có hoạt động nào gần đây', time: '', type: 'info' })
        }
        return items
    }, [pendingPlansData])

    // Build budget chart data from approved plans (group by department)
    const CHART_COLORS = ['#0F4C75', '#3282B8', '#BBE1FA', '#1B262C', '#6A8CAF', '#2E86AB']
    const budgetData = useMemo(() => {
        if (!approvedPlansData?.items?.length) return []
        const deptMap = new Map<string, number>()
        for (const plan of approvedPlansData.items) {
            const dept = plan.departmentName || 'Khác'
            deptMap.set(dept, (deptMap.get(dept) || 0) + (plan.totalBudget || 0))
        }
        return Array.from(deptMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([label, value], i) => ({
                label,
                value: Math.round(value / 1_000_000),
                color: CHART_COLORS[i % CHART_COLORS.length],
            }))
    }, [approvedPlansData])

    // Build training budget chart data from approved training plans
    const trainingBudgetData = useMemo(() => {
        if (!approvedTrainingPlansData?.items?.length) return []
        const planMap = new Map<string, number>()
        for (const plan of approvedTrainingPlansData.items) {
            const label = plan.planName || 'Khác'
            planMap.set(label, (planMap.get(label) || 0) + (plan.totalBudget || 0))
        }
        return Array.from(planMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([label, value], i) => ({
                label,
                value: Math.round(value / 1_000_000),
                color: CHART_COLORS[(i + 3) % CHART_COLORS.length],
            }))
    }, [approvedTrainingPlansData])

    const pendingPlans = pendingPlansData?.items || []

    return (
        <div className="flex flex-col gap-6 min-h-[calc(100vh-6rem)]">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75] leading-tight">Dashboard</h1>
                <p className="text-gray-500 text-sm">Tổng quan dành cho Giám đốc</p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <StatCard
                    title="Kế hoạch chờ duyệt"
                    value={pendingPlansData?.totalCount?.toString() || '0'}
                    subtext="Cần xử lý ngay"
                    color="border-l-yellow-500"
                />
                <StatCard
                    title="Tổng ngân sách"
                    value={totalBudget > 0 ? formatBudget(totalBudget) : '—'}
                    subtext={`${approvedPlansData?.totalCount ?? 0} kế hoạch đã duyệt`}
                    color="border-l-blue-500"
                />
                <StatCard
                    title="Vị trí đang tuyển"
                    value={publishedJobsData?.totalCount?.toString() ?? '0'}
                    subtext="Tin tuyển dụng đang mở"
                    color="border-l-green-500"
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

                {/* Training Budget Chart */}
                <DashboardChartWidget
                    title="Phân bổ ngân sách đào tạo"
                    subtitle="Theo kế hoạch (Đơn vị: Triệu VNĐ)"
                    data={trainingBudgetData}
                />

                {/* Another chart placeholder */}
                {publishedJobsData?.totalCount > 0 && (
                    <DashboardChartWidget
                        title="Tổng quan tuyển dụng"
                        subtitle={`${publishedJobsData.totalCount} vị trí đang tuyển`}
                        data={[{ label: 'Đang tuyển', value: publishedJobsData.totalCount, color: '#0F4C75' }]}
                    />
                )}
            </div>
        </div>
    )
})
