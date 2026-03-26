'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Search, Star, TrendingUp } from 'lucide-react';

import { feedbackService, type CourseFeedbackDto } from '@/features/employee/api/feedback-service';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                />
            ))}
            <span className="ml-1.5 text-sm font-bold text-gray-700">{rating}</span>
        </div>
    );
}

export default function HRTrainingFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<CourseFeedbackDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');

    useEffect(() => {
        feedbackService
            .getAllFeedbacks()
            .then(setFeedbacks)
            .catch(() => setFeedbacks([]))
            .finally(() => setLoading(false));
    }, []);

    const courseOptions = useMemo(() => Array.from(new Set(feedbacks.map((feedback) => feedback.courseName))), [feedbacks]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return feedbacks.filter((feedback) => {
            const matchSearch =
                !q ||
                [feedback.employeeName, feedback.employeeEmail, feedback.courseName, feedback.trainerEmail, feedback.comment].some((value) =>
                    value?.toLowerCase().includes(q),
                );
            const matchCourse = courseFilter === 'all' || feedback.courseName === courseFilter;
            return matchSearch && matchCourse;
        });
    }, [feedbacks, search, courseFilter]);

    const stats = useMemo(() => {
        if (filtered.length === 0) return { total: 0, avgCourse: 0, avgTrainer: 0 };

        const avgCourse = filtered.reduce((sum, feedback) => sum + feedback.courseRating, 0) / filtered.length;
        const avgTrainer = filtered.reduce((sum, feedback) => sum + feedback.trainerRating, 0) / filtered.length;
        return { total: filtered.length, avgCourse: +avgCourse.toFixed(1), avgTrainer: +avgTrainer.toFixed(1) };
    }, [filtered]);

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75]">Phản hồi đào tạo</h1>
                <p className="text-sm text-gray-500">Tổng hợp đánh giá từ học viên về chất lượng khóa học và giảng viên.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3 text-[#0F4C75]">
                        <MessageSquare className="h-5 w-5" /> Tổng đánh giá
                    </div>
                    <p className="text-3xl font-bold text-[#0F4C75]">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3 text-amber-700">
                        <Star className="h-5 w-5 fill-amber-400" /> Điểm TB khóa học
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-amber-700">{stats.avgCourse}</p>
                        <span className="text-sm text-amber-600">/5</span>
                    </div>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3 text-blue-700">
                        <TrendingUp className="h-5 w-5" /> Điểm TB giảng viên
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-blue-700">{stats.avgTrainer}</p>
                        <span className="text-sm text-blue-600">/5</span>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr]">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên, email, khóa học, nhận xét..."
                            className="pl-9"
                        />
                    </div>
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Lọc theo khóa học" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả khóa học</SelectItem>
                            {courseOptions.map((courseName) => (
                                <SelectItem key={courseName} value={courseName}>
                                    {courseName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-gray-500">Đang tải dữ liệu...</div>
            ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-gray-500">Chưa có đánh giá nào.</div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((feedback) => (
                        <div key={feedback.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-blue-200">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">{feedback.employeeName}</span>
                                        {feedback.isAnonymous && <Badge variant="outline" className="bg-gray-100 text-xs">Ẩn danh</Badge>}
                                    </div>
                                    {feedback.employeeEmail && <p className="text-xs text-gray-500">{feedback.employeeEmail} • {feedback.departmentName}</p>}
                                    <p className="text-sm font-medium text-[#0F4C75]">{feedback.courseName} <span className="text-gray-400">({feedback.courseCode})</span></p>
                                    <p className="text-xs text-gray-400">Giảng viên: {feedback.trainerEmail}</p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Khóa học:</span> <StarDisplay rating={feedback.courseRating} />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Giảng viên:</span> <StarDisplay rating={feedback.trainerRating} />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">{format(new Date(feedback.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                                </div>
                            </div>
                            {feedback.comment && (
                                <div className="mt-3 border-t border-gray-100 pt-3">
                                    <p className="text-sm italic text-gray-700">&ldquo;{feedback.comment}&rdquo;</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
