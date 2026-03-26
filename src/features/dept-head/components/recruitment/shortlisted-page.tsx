'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Search, Users, Briefcase, ChevronRight, Loader2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'

interface PlanDetailItem {
    id: string
    recruitmentPlanId: string
    positionTitle: string
    quantity: number
    priority: 'Normal' | 'High' | 'Urgent'
    requiredSkills?: string
    status?: string
}

interface RecruitmentPlanItem {
    id: string
    planName: string
    planCode: string
    status: string
    campaignId: string
}

interface PlanListResponse {
    items: RecruitmentPlanItem[]
    totalCount: number
    page: number
    pageSize: number
}

function useDeptPlans() {
    return useSWR<PlanListResponse>(
        '/api/RecruitmentPlans?Page=1&PageSize=50&Status=Approved',
        async () => {
            const res = await apiClient.get('/api/RecruitmentPlans?Page=1&PageSize=50&Status=Approved')
            if (!res.ok) throw new Error('Không thể tải danh sách kế hoạch')
            return res.json()
        }
    )
}

function usePlanDetails(planId: string | null) {
    return useSWR<PlanDetailItem[]>(
        planId ? `/api/plan-details?recruitmentPlanId=${planId}` : null,
        async () => {
            const res = await apiClient.get(`/api/plan-details?recruitmentPlanId=${planId}`)
            if (!res.ok) throw new Error('Không thể tải chi tiết kế hoạch')
            return res.json()
        }
    )
}

const PRIORITY_STYLES: Record<string, string> = {
    Urgent: 'border-red-400 text-red-600 bg-red-50',
    High: 'border-yellow-400 text-yellow-600 bg-yellow-50',
    Normal: 'border-gray-300 text-gray-600 bg-gray-50',
}

const PRIORITY_LABELS: Record<string, string> = {
    Urgent: 'Khẩn cấp',
    High: 'Cao',
    Normal: 'Bình thường',
}

export default function ShortlistedPage() {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

    const { data: plansData, isLoading: plansLoading } = useDeptPlans()
    const { data: details, isLoading: detailsLoading } = usePlanDetails(selectedPlanId)

    const plans = plansData?.items ?? []
    const filteredPlans = plans.filter(p =>
        p.planName.toLowerCase().includes(search.toLowerCase()) ||
        p.planCode.toLowerCase().includes(search.toLowerCase())
    )

    if (!selectedPlanId && filteredPlans.length > 0) {
        setSelectedPlanId(filteredPlans[0].id)
    }

    const planDetails = Array.isArray(details) ? details : []
    const approvedDetails = planDetails.filter(d => ['Recruiting'].includes(d.status || ''))

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="border-b border-slate-200 pb-6">
                <h1 className="text-2xl font-bold text-[#0F4C75]">Ứng viên đã sơ tuyển</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Chọn vị trí tuyển dụng trong kế hoạch đã duyệt để xem danh sách ứng viên sơ tuyển
                </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm kế hoạch tuyển dụng..."
                        className="pl-9 bg-slate-50 border-slate-200"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {plansLoading && (
                <div className="flex items-center justify-center py-16 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Đang tải danh sách kế hoạch...
                </div>
            )}

            {!plansLoading && filteredPlans.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600">Chưa có kế hoạch đã duyệt</h3>
                    <p className="text-sm text-slate-400 mt-2">
                        Các kế hoạch tuyển dụng sau khi được duyệt sẽ hiển thị tại đây
                    </p>
                </div>
            )}

            {!plansLoading && filteredPlans.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-semibold text-slate-700">Kế hoạch đã duyệt</h2>
                            <p className="text-xs text-slate-400 mt-0.5">{filteredPlans.length} kế hoạch</p>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                            {filteredPlans.map(plan => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={`w-full text-left p-4 transition-colors hover:bg-slate-50 ${selectedPlanId === plan.id
                                        ? 'bg-[#BBE1FA]/20 border-l-4 border-l-[#0F4C75]'
                                        : 'border-l-4 border-l-transparent'
                                        }`}
                                >
                                    <p className="text-sm font-medium text-slate-800 line-clamp-1">
                                        {plan.planName}
                                    </p>
                                    <span className="text-xs text-slate-400 font-mono mt-1 block">
                                        {plan.planCode}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-semibold text-slate-700">
                                Vị trí tuyển dụng
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Nhấn vào vị trí để xem danh sách ứng viên đã sơ tuyển
                            </p>
                        </div>

                        {detailsLoading ? (
                            <div className="flex items-center justify-center py-16 text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Đang tải...
                            </div>
                        ) : approvedDetails.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">
                                    {selectedPlanId
                                        ? 'Kế hoạch này chưa có vị trí nào được duyệt'
                                        : 'Chọn một kế hoạch để xem các vị trí'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {approvedDetails.map(detail => (
                                    <button
                                        key={detail.id}
                                        onClick={() =>
                                            router.push(`/enterprise/dept-head/shortlisted/${detail.id}`)
                                        }
                                        className="w-full text-left p-5 transition-all group hover:bg-slate-50 cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#BBE1FA]/30 flex items-center justify-center flex-shrink-0">
                                                        <Briefcase className="w-5 h-5 text-[#0F4C75]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800 group-hover:text-[#0F4C75] transition-colors line-clamp-1">
                                                            {detail.positionTitle}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-[10px] px-1.5 py-0 ${PRIORITY_STYLES[detail.priority] || PRIORITY_STYLES.Normal}`}
                                                            >
                                                                {PRIORITY_LABELS[detail.priority] || 'Bình thường'}
                                                            </Badge>
                                                            <span className="text-xs text-slate-400">
                                                                Cần tuyển: {detail.quantity} người
                                                            </span>
                                                        </div>
                                                        {detail.requiredSkills && (
                                                            <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">
                                                                Kỹ năng: {detail.requiredSkills}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                                <Badge className="bg-[#BBE1FA]/30 text-[#0F4C75] border-[#BBE1FA] text-xs">
                                                    <Users className="w-3 h-3 mr-1" />
                                                    Xem ứng viên
                                                </Badge>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0F4C75] transition-colors" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
