import { useMemo } from 'react';
import { format } from 'date-fns';
import { Search, Star, MessageSquare, TrendingUp } from 'lucide-react';
import type { CourseFeedbackDto } from '@/features/employee/api/feedback-service';
import { FeedbackReplySection } from './feedback-reply-section';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            ))}
            <span className="ml-1.5 text-sm font-bold text-gray-700">{rating}</span>
        </div>
    );
}

export function FeedbackTab({ 
    feedbacks, 
    localSearch,
    onSearchChange,
    courseFilter, 
    onCourseFilterChange,
    hideCourseFilter 
}: { 
    feedbacks: CourseFeedbackDto[];
    localSearch: string;
    onSearchChange: (val: string) => void;
    courseFilter: string;
    onCourseFilterChange: (v: string) => void;
    hideCourseFilter?: boolean;
}) {

    const courseOptions = useMemo(() => Array.from(new Set(feedbacks.map((f) => f.courseName))), [feedbacks]);

    const filtered = useMemo(() => {
        const q = localSearch.trim().toLowerCase();
        return feedbacks.filter((f) => {
            const matchSearch = !q || [f.employeeName, f.employeeEmail, f.courseName, f.trainerEmail, f.comment].some((v) => v?.toLowerCase().includes(q));
            const matchCourse = courseFilter === 'all' || f.courseName === courseFilter;
            return matchSearch && matchCourse;
        });
    }, [feedbacks, localSearch, courseFilter]);

    const stats = useMemo(() => {
        if (filtered.length === 0) return { total: 0, avgCourse: 0, avgTrainer: 0 };
        const avgCourse = filtered.reduce((s, f) => s + f.courseRating, 0) / filtered.length;
        const avgTrainer = filtered.reduce((s, f) => s + f.trainerRating, 0) / filtered.length;
        return { total: filtered.length, avgCourse: +avgCourse.toFixed(1), avgTrainer: +avgTrainer.toFixed(1) };
    }, [filtered]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-[#0F4C75] mb-3"><MessageSquare className="w-5 h-5" /> Tổng đánh giá</div>
                    <p className="text-3xl font-bold text-[#0F4C75]">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-amber-700 mb-3"><Star className="w-5 h-5 fill-amber-400" /> Điểm TB khóa học</div>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-amber-700">{stats.avgCourse}</p>
                        <span className="text-sm text-amber-600">/5</span>
                    </div>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-blue-700 mb-3"><TrendingUp className="w-5 h-5" /> Điểm TB giảng viên</div>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-blue-700">{stats.avgTrainer}</p>
                        <span className="text-sm text-blue-600">/5</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm mb-5">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr]">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <Input value={localSearch} onChange={(e) => onSearchChange(e.target.value)} placeholder="Tìm theo tên, email, khóa học, nhận xét..." className="pl-9" />
                    </div>
                    {!hideCourseFilter && (
                        <Select value={courseFilter} onValueChange={onCourseFilterChange}>
                            <SelectTrigger><SelectValue placeholder="Lọc theo khóa học" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả khóa học</SelectItem>
                                {courseOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* Feedback Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Chưa có đánh giá nào.</div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((f) => (
                        <div key={f.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-blue-200 transition-colors">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">{f.employeeName}</span>
                                        {f.isAnonymous && <Badge variant="outline" className="text-xs bg-gray-100">Ẩn danh</Badge>}
                                    </div>
                                    {f.employeeEmail && <p className="text-xs text-gray-500">{f.employeeEmail} • {f.departmentName}</p>}
                                    <p className="text-sm font-medium text-[#0F4C75]">{f.courseName} <span className="text-gray-400">({f.courseCode})</span></p>
                                    <p className="text-xs text-gray-400">Giảng viên: {f.trainerEmail}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Khóa học:</span> <StarDisplay rating={f.courseRating} />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Giảng viên:</span> <StarDisplay rating={f.trainerRating} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{format(new Date(f.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                                </div>
                            </div>
                            {f.comment && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-sm text-gray-700 italic">&ldquo;{f.comment}&rdquo;</p>
                                </div>
                            )}
                            <FeedbackReplySection feedbackId={f.id} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
