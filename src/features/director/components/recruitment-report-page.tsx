import { getRecruitmentCampaigns } from '@/features/hr/api/recruitment-campaign-service'
import type { RecruitmentCampaign } from '@/features/hr/types/recruitment-campaign-types'
import { cookies } from 'next/headers'

async function getAllCampaigns(status?: string): Promise<RecruitmentCampaign[]> {
    const pageSize = 50
    const allItems: RecruitmentCampaign[] = []
    let page = 1

    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    while (true) {
        const response = await getRecruitmentCampaigns({ page, pageSize, status }, token).catch(() => ({
            items: [],
            totalCount: 0,
            page: 1,
            pageSize,
            totalPages: 0,
        }))
        allItems.push(...(response.items || []))

        if (!response.items || response.items.length < pageSize || allItems.length >= (response.totalCount || 0)) {
            break
        }

        page += 1
    }

    return allItems
}

export default async function RecruitmentReportPage() {
    const [draftCampaigns, openCampaigns, closedCampaigns] = await Promise.all([
        getAllCampaigns('Draft'),
        getAllCampaigns('Open'),
        getAllCampaigns('Closed'),
    ])

    const allCampaigns = [...draftCampaigns, ...openCampaigns, ...closedCampaigns]
    const totalCampaigns = allCampaigns.length

    // Budget calculations
    const totalBudgetCeiling = allCampaigns.reduce((sum, c) => sum + (c.totalBudgetCeiling || 0), 0)
    const totalUsedBudget = allCampaigns.reduce((sum, c) => sum + (c.usedBudget || 0), 0)
    const totalPendingBudget = allCampaigns.reduce((sum, c) => sum + (c.pendingBudget || 0), 0)
    const totalActualCost = allCampaigns.reduce((sum, c) => sum + (c.actualCost || 0), 0)

    // Positions calculations
    const totalMaxPositions = allCampaigns.reduce((sum, c) => sum + (c.maxTotalPositions || 0), 0)

    // Active campaigns (Open status)
    const activeCampaigns = openCampaigns.length
    const activeRate = totalCampaigns > 0 ? Math.round((activeCampaigns / totalCampaigns) * 100) : 0

    // Budget utilization rate
    const budgetUtilizationRate = totalBudgetCeiling > 0 ? Math.round((totalUsedBudget / totalBudgetCeiling) * 100) : 0

    const statusBars = [
        { label: 'Đang mở (Open)', value: openCampaigns.length, color: 'bg-green-500' },
        { label: 'Nháp (Draft)', value: draftCampaigns.length, color: 'bg-yellow-500' },
        { label: 'Đã đóng (Closed)', value: closedCampaigns.length, color: 'bg-gray-500' },
    ]

    const maxStatusValue = Math.max(1, ...statusBars.map((item) => item.value))

    const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(value)

    // Current year campaigns
    const currentYear = new Date().getFullYear()
    const campaignsThisYear = allCampaigns.filter((c) => c.fiscalYear === currentYear).length

    // Budget breakdown for Open campaigns
    const openBudgetCeiling = openCampaigns.reduce((sum, c) => sum + (c.totalBudgetCeiling || 0), 0)
    const openUsedBudget = openCampaigns.reduce((sum, c) => sum + (c.usedBudget || 0), 0)
    const openPendingBudget = openCampaigns.reduce((sum, c) => sum + (c.pendingBudget || 0), 0)
    const openRemainingBudget = openCampaigns.reduce((sum, c) => sum + (c.remainingBudget || 0), 0)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#0F4C75]">Báo cáo tuyển dụng</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Tổng quan hiệu quả chiến dịch tuyển dụng, ngân sách và tỷ lệ sử dụng nguồn lực.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chiến dịch tuyển dụng</p>
                    <p className="text-3xl font-bold text-[#0F4C75] mt-2">{totalCampaigns}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        Đang mở {openCampaigns.length} | Năm {currentYear}: {campaignsThisYear}
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngân sách tổng</p>
                    <p className="text-3xl font-bold text-[#0F4C75] mt-2">{formatCurrency(totalBudgetCeiling)}</p>
                    <p className="text-xs text-gray-500 mt-2">Đã sử dụng {formatCurrency(totalUsedBudget)}</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vị trí tuyển dụng</p>
                    <p className="text-3xl font-bold text-[#0F4C75] mt-2">{totalMaxPositions}</p>
                    <p className="text-xs text-gray-500 mt-2">Tổng số vị trí tối đa từ các chiến dịch</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hiệu suất ngân sách</p>
                    <p className="text-3xl font-bold text-[#0F4C75] mt-2">{budgetUtilizationRate}%</p>
                    <p className="text-xs text-gray-500 mt-2">Tỷ lệ ngân sách đã dùng / tổng dự toán</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-[#0F4C75]">Phân bố trạng thái chiến dịch</h2>
                    <div className="space-y-3">
                        {statusBars.map((item) => {
                            const widthPercent = Math.round((item.value / maxStatusValue) * 100)

                            return (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>{item.label}</span>
                                        <span className="font-semibold text-[#0F4C75]">{item.value}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${widthPercent}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Tỷ lệ chiến dịch đang hoạt động</span>
                            <span className="font-bold text-[#0F4C75]">{activeRate}%</span>
                        </div>
                    </div>
                </div>

                {/* Budget Overview for Open Campaigns */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-[#0F4C75]">Ngân sách chiến dịch đang mở</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tổng dự toán</p>
                            <p className="text-2xl font-bold text-[#0F4C75] mt-2">{formatCurrency(openBudgetCeiling)}</p>
                        </div>
                        <div className="rounded-xl bg-green-50/60 border border-green-100 p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Đã sử dụng</p>
                            <p className="text-2xl font-bold text-green-700 mt-2">{formatCurrency(openUsedBudget)}</p>
                        </div>
                        <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Đang chờ duyệt</p>
                            <p className="text-2xl font-bold text-amber-700 mt-2">{formatCurrency(openPendingBudget)}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50/60 border border-gray-200 p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Còn lại</p>
                            <p className="text-2xl font-bold text-gray-700 mt-2">{formatCurrency(openRemainingBudget)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Cost Analysis */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[#0F4C75] mb-4">Chi phí thực tế</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Tổng chi phí phát sinh</span>
                            <span className="font-semibold text-[#0F4C75]">{formatCurrency(totalActualCost)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">So với ngân sách</span>
                            <span
                                className={`font-semibold ${totalActualCost <= totalUsedBudget ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {totalUsedBudget > 0
                                    ? `${Math.round((totalActualCost / totalUsedBudget) * 100)}%`
                                    : '0%'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pending Budget */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[#0F4C75] mb-4">Ngân sách chờ duyệt</h2>
                    <p className="text-3xl font-bold text-amber-600">{formatCurrency(totalPendingBudget)}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        Các kế hoạch tuyển dụng đang chờ phê duyệt từ ban giám đốc
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[#0F4C75] mb-4">Thống kê nhanh</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Chiến dịch năm nay</span>
                            <span className="font-semibold text-[#0F4C75]">{campaignsThisYear}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Đang hoạt động</span>
                            <span className="font-semibold text-green-600">{openCampaigns.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Đã hoàn thành</span>
                            <span className="font-semibold text-gray-600">{closedCampaigns.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
