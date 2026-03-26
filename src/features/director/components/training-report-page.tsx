import { trainingServerService } from '@/features/hr/api/training-server-service'
import type { Course } from '@/features/hr/types/course-types'
import type { TrainingPlan } from '@/features/hr/types/training-plan-types'

async function getAllPlans(status?: string): Promise<TrainingPlan[]> {
    const pageSize = 50
    const allItems: TrainingPlan[] = []
    let page = 1

    while (true) {
        const response = await trainingServerService.getPlans({ page, pageSize, status }).catch(() => ({ items: [], totalCount: 0 }))
        allItems.push(...(response.items || []))

        if (!response.items || response.items.length < pageSize || allItems.length >= (response.totalCount || 0)) {
            break
        }

        page += 1
    }

    return allItems
}

async function getAllCourses(status?: string): Promise<Course[]> {
    const pageSize = 50
    const allItems: Course[] = []
    let page = 1

    while (true) {
        const response = await trainingServerService
            .getAllCourses({ page, pageSize, status })
            .catch(() => ({ items: [], totalCount: 0, page: 1, pageSize, totalPages: 0 }))
        allItems.push(...(response.items || []))

        if (!response.items || response.items.length < pageSize || allItems.length >= (response.totalCount || 0)) {
            break
        }

        page += 1
    }

    return allItems
}

export default async function TrainingReportPage() {
    const [pendingPlans, approvedPlans, rejectedPlans, allCourses, publishedCourses] = await Promise.all([
        getAllPlans('Pending'),
        getAllPlans('Approved'),
        getAllPlans('Rejected'),
        getAllCourses(),
        getAllCourses('Published'),
    ])

    const totalPlans = pendingPlans.length + approvedPlans.length + rejectedPlans.length
    const totalBudget = approvedPlans.reduce((sum, plan) => sum + (plan.totalBudget || 0), 0)
    const totalCourses = allCourses.length
    const publishedRate = totalCourses > 0 ? Math.round((publishedCourses.length / totalCourses) * 100) : 0

    const totalEnrollments = publishedCourses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0)
    const averageEnrollments = publishedCourses.length > 0 ? Math.round(totalEnrollments / publishedCourses.length) : 0

    const completionReadyCourses = publishedCourses.filter((course) => (course.lessonCount || 0) > 0).length
    const completionReadyRate = publishedCourses.length > 0
        ? Math.round((completionReadyCourses / publishedCourses.length) * 100)
        : 0

    const statusBars = [
        { label: 'Pending', value: pendingPlans.length, color: 'bg-yellow-500' },
        { label: 'Approved', value: approvedPlans.length, color: 'bg-green-500' },
        { label: 'Rejected', value: rejectedPlans.length, color: 'bg-red-500' },
    ]

    const maxStatusValue = Math.max(1, ...statusBars.map((item) => item.value))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#0F4C75]">Báo cáo đào tạo</h1>
                <p className="text-sm text-gray-500 mt-1">Tổng hợp nhanh tình hình kế hoạch và triển khai đào tạo toàn doanh nghiệp.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kế hoạch đào tạo</p>
                    <p className="text-3xl font-bold text-[#0F4C75] mt-2">{totalPlans}</p>
                    <p className="text-xs text-gray-500 mt-2">Pending {pendingPlans.length} | Approved {approvedPlans.length}</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngân sách đã duyệt</p>
                    <p className="text-3xl font-bold text-[#0F4C75] mt-2">{new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(totalBudget)}</p>
                    <p className="text-xs text-gray-500 mt-2">Tính trên các kế hoạch Approved</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Khóa học xuất bản</p>
                    <p className="text-3xl font-bold text-[#0F4C75] mt-2">{publishedCourses.length}/{totalCourses}</p>
                    <p className="text-xs text-gray-500 mt-2">Tỷ lệ xuất bản {publishedRate}%</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mức sẵn sàng học</p>
                    <p className="text-3xl font-bold text-[#0F4C75] mt-2">{completionReadyRate}%</p>
                    <p className="text-xs text-gray-500 mt-2">Khóa published đã có ít nhất 1 bài học</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-[#0F4C75]">Phân bố trạng thái kế hoạch</h2>
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
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-[#0F4C75]">Chỉ số triển khai khóa học</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tổng lượt ghi danh</p>
                            <p className="text-2xl font-bold text-[#0F4C75] mt-2">{totalEnrollments}</p>
                        </div>
                        <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">TB học viên/khóa</p>
                            <p className="text-2xl font-bold text-[#0F4C75] mt-2">{averageEnrollments}</p>
                        </div>
                        <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4 sm:col-span-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Khóa đã có nội dung học</p>
                            <p className="text-2xl font-bold text-[#0F4C75] mt-2">{completionReadyCourses}/{publishedCourses.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
