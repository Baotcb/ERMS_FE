'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, MessageSquare, Search, Star, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { feedbackService, type CourseFeedbackDto } from '@/features/employee/api/feedback-service';

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

export default function FeedbackSummaryPage() {
    const [feedbacks, setFeedbacks] = useState<CourseFeedbackDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');

    useEffect(() => {
        feedbackService.getAllFeedbacks()
            .then(setFeedbacks)
            .catch(() => setFeedbacks([]))
            .finally(() => setLoading(false));
    }, []);

    const courseOptions = useMemo(
        () => Array.from(new Set(feedbacks.map((f) => f.courseName))),
        [feedbacks]
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return feedbacks.filter((f) => {
            const matchSearch = !q || [f.employeeName, f.employeeEmail, f.courseName, f.trainerEmail, f.comment]
                .some((v) => v?.toLowerCase().includes(q));
            const matchCourse = courseFilter === 'all' || f.courseName === courseFilter;
            return matchSearch && matchCourse;
        });
    }, [feedbacks, search, courseFilter]);

    const stats = useMemo(() => {
        if (filtered.length === 0) return { total: 0, avgCourse: 0, avgTrainer: 0 };
        const avgCourse = filtered.reduce((s, f) => s + f.courseRating, 0) / filtered.length;
        const avgTrainer = filtered.reduce((s, f) => s + f.trainerRating, 0) / filtered.length;
        return { total: filtered.length, avgCourse: +avgCourse.toFixed(1), avgTrainer: +avgTrainer.toFixed(1) };
    }, [filtered]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75]">Phản hồi đào tạo</h1>
                <p className="text-sm text-gray-500">Tổng hợp đánh giá từ học viên về chất lượng khóa học và giảng viên.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr]">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên, email, khóa học, nhận xét..." className="pl-9" />
                    </div>
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                        <SelectTrigger><SelectValue placeholder="Lọc theo khóa học" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả khóa học</SelectItem>
                            {courseOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Feedback Cards */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
            ) : filtered.length === 0 ? (
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
