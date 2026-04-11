'use client';

import { MetricCard } from '@/components/ui/metric-card';

interface StatusBar {
    label: string;
    value: number;
    color: string;
}

interface TrainingReportDashboardProps {
    pendingPlansLength: number;
    approvedPlansLength: number;
    totalPlans: number;
    totalBudget: number;
    totalCourses: number;
    publishedCoursesLength: number;
    publishedRate: number;
    completionReadyRate: number;
    completionReadyCourses: number;
    statusBars: StatusBar[];
    maxStatusValue: number;
    totalEnrollments: number;
    averageEnrollments: number;
}

export function TrainingReportDashboard({
    pendingPlansLength,
    approvedPlansLength,
    totalPlans,
    totalBudget,
    totalCourses,
    publishedCoursesLength,
    publishedRate,
    completionReadyRate,
    completionReadyCourses,
    statusBars,
    maxStatusValue,
    totalEnrollments,
    averageEnrollments
}: TrainingReportDashboardProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-[#0F4C75]">Báo cáo đào tạo</h1>
                <p className="text-sm text-gray-500 mt-1">Tổng hợp nhanh tình hình kế hoạch và triển khai đào tạo toàn doanh nghiệp.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard
                    title="Kế hoạch đào tạo"
                    value={totalPlans}
                    subtext={`Chờ duyệt ${pendingPlansLength} | Đã duyệt ${approvedPlansLength}`}
                />

                <MetricCard
                    title="Ngân sách đã duyệt"
                    value={new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(totalBudget)}
                    subtext="Tính trên các kế hoạch Đã duyệt"
                />

                <MetricCard
                    title="Khóa học đang triển khai"
                    value={`${publishedCoursesLength}/${totalCourses}`}
                    subtext={`Tỷ lệ triển khai ${publishedRate}%`}
                />

                <MetricCard
                    title="Mức sẵn sàng học"
                    value={`${completionReadyRate}%`}
                    subtext="Khóa đang triển khai đã có ít nhất 1 bài học"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-[#0F4C75]">Phân bố trạng thái kế hoạch</h2>
                    <div className="space-y-3">
                        {statusBars.map((item) => {
                            const widthPercent = Math.round((item.value / maxStatusValue) * 100);

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
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-[#0F4C75]">Chỉ số triển khai khóa học</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <MetricCard theme="blue" className="p-4" title="Tổng lượt ghi danh" value={totalEnrollments} />
                        <MetricCard theme="blue" className="p-4" title="TB học viên/khóa" value={averageEnrollments} />
                        <MetricCard theme="blue" className="p-4 sm:col-span-2" title="Khóa đã có nội dung học" value={`${completionReadyCourses}/${publishedCoursesLength}`} />
                    </div>
                </div>
            </div>
        </div>
    );
}
