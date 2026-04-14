'use client';

import { MetricCard } from '@/components/ui/metric-card';
import { Archive, CheckCircle2, DollarSign, BookOpen, BarChart3 } from 'lucide-react';

interface StatusBar {
    label: string;
    value: number;
    color: string;
}

interface TrainingReportDashboardProps {
    pendingPlansLength: number;
    approvedPlansLength: number;
    closedPlansLength: number;
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

function ProgressRing({ value, size = 80, strokeWidth = 8, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-gray-100"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
            />
        </svg>
    );
}

export function TrainingReportDashboard({
    pendingPlansLength,
    approvedPlansLength,
    closedPlansLength,
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

            {/* Row 1: Core metrics - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <MetricCard
                    title="Kế hoạch đào tạo"
                    value={totalPlans}
                    icon={BarChart3}
                    subtext={`Chờ duyệt ${pendingPlansLength} · Đã duyệt ${approvedPlansLength} · Đã đóng ${closedPlansLength}`}
                />

                <MetricCard
                    title="Tổng ngân sách"
                    value={new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(totalBudget)}
                    icon={DollarSign}
                    subtext="Tính trên kế hoạch Đã duyệt + Đã đóng"
                />

                <MetricCard
                    title="Khóa học đang triển khai"
                    value={`${publishedCoursesLength}/${totalCourses}`}
                    icon={BookOpen}
                    subtext={`Tỷ lệ triển khai ${publishedRate}%`}
                />
            </div>

            {/* Row 2: Analytics metrics - 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard
                    title="Kế hoạch đã đóng"
                    value={closedPlansLength}
                    icon={Archive}
                    theme="default"
                    subtext="Kế hoạch đã hoàn tất vòng đời"
                />

                <MetricCard
                    title="Tỷ lệ hoàn thành khóa học"
                    value={`${completionReadyRate}%`}
                    icon={CheckCircle2}
                    theme={completionReadyRate >= 80 ? 'green' : completionReadyRate >= 50 ? 'amber' : 'red'}
                    subtext={`${completionReadyCourses}/${publishedCoursesLength} khóa có nội dung hoàn chỉnh`}
                />
            </div>

            {/* Row 3: Charts & Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-[#0F4C75]">Phân bố trạng thái kế hoạch</h2>
                    <div className="space-y-3">
                        {statusBars.map((item) => {
                            const widthPercent = Math.round((item.value / maxStatusValue) * 100);
                            const percentage = totalPlans > 0 ? Math.round((item.value / totalPlans) * 100) : 0;

                            return (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span className="flex items-center gap-2">
                                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${item.color}`} />
                                            {item.label}
                                        </span>
                                        <span className="font-semibold text-[#0F4C75]">
                                            {item.value} <span className="text-xs font-normal text-gray-400">({percentage}%)</span>
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.color} transition-all duration-700 ease-out`}
                                            style={{ width: `${widthPercent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Course Insights */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
                    <h2 className="text-lg font-bold text-[#0F4C75]">Chỉ số triển khai khóa học</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <MetricCard theme="blue" className="p-4" title="Tổng lượt ghi danh" value={totalEnrollments} />
                        <MetricCard theme="blue" className="p-4" title="TB học viên/khóa" value={averageEnrollments} />
                    </div>

                    {/* Visual Insight: Completion ring */}
                    <div className="flex justify-center pt-2">
                        <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 bg-gray-50/50 w-48">
                            <div className="relative">
                                <ProgressRing value={completionReadyRate} color="#16a34a" />
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-green-700">
                                    {completionReadyRate}%
                                </span>
                            </div>
                            <span className="text-xs font-semibold text-gray-500 text-center">Hoàn thành khóa học</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
