'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Search, Star, TrendingUp } from 'lucide-react';

import { feedbackService, type TrainerFeedbackDto } from '@/features/employee/api/feedback-service';

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

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
    const pct = total > 0 ? (count / total) * 100 : 0;

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-12 text-right text-gray-500">{label}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-2.5">
                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-xs text-gray-500">{count}</span>
        </div>
    );
}

export default function EmployeeTeachingFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<TrainerFeedbackDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');

    useEffect(() => {
        feedbackService
            .getTrainerFeedbacks()
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
                [feedback.employeeName, feedback.courseName, feedback.comment].some((value) => value?.toLowerCase().includes(q));
            const matchCourse = courseFilter === 'all' || feedback.courseName === courseFilter;
            return matchSearch && matchCourse;
        });
    }, [feedbacks, search, courseFilter]);

    const stats = useMemo(() => {
        if (filtered.length === 0) {
            return { total: 0, avgTrainer: 0, avgCourse: 0, distribution: [0, 0, 0, 0, 0] };
        }

        const avgTrainer = filtered.reduce((sum, feedback) => sum + feedback.trainerRating, 0) / filtered.length;
        const avgCourse = filtered.reduce((sum, feedback) => sum + feedback.courseRating, 0) / filtered.length;
        const distribution = [0, 0, 0, 0, 0];

        filtered.forEach((feedback) => {
            distribution[feedback.trainerRating - 1]++;
        });

        return { total: filtered.length, avgTrainer: +avgTrainer.toFixed(1), avgCourse: +avgCourse.toFixed(1), distribution };
    }, [filtered]);

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75]">Đánh giá từ học viên</h1>
                <p className="text-sm text-gray-500">Phản hồi của học viên về các khóa học bạn giảng dạy.</p>
            </div>

            {loading ? (
                <div className="py-12 text-center text-gray-500">Đang tải dữ liệu...</div>
            ) : feedbacks.length === 0 ? (
                <div className="space-y-3 rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                    <div className="text-4xl">📭</div>
                    <h3 className="text-lg font-bold text-gray-700">Chưa có đánh giá nào</h3>
                    <p className="text-sm text-gray-500">Đánh giá sẽ xuất hiện khi học viên hoàn thành khóa học và gửi phản hồi.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-center gap-3 text-[#0F4C75]">
                                <MessageSquare className="h-5 w-5" /> Tổng đánh giá
                            </div>
                            <p className="text-3xl font-bold text-[#0F4C75]">{stats.total}</p>
                        </div>
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
                            <div className="mb-3 flex items-center gap-3 text-amber-700">
                                <Star className="h-5 w-5 fill-amber-400" /> Điểm TB giảng viên
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-bold text-amber-700">{stats.avgTrainer}</p>
                                <span className="text-sm text-amber-600">/5</span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
                            <div className="mb-3 flex items-center gap-3 text-blue-700">
                                <TrendingUp className="h-5 w-5" /> Điểm TB khóa học
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-bold text-blue-700">{stats.avgCourse}</p>
                                <span className="text-sm text-blue-600">/5</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 font-semibold text-[#0F4C75]">Phân bố đánh giá giảng viên</h3>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <RatingBar key={star} label={`${star} ⭐`} count={stats.distribution[star - 1]} total={stats.total} />
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr]">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên học viên, khóa học, nhận xét..." className="pl-9" />
                            </div>
                            <Select value={courseFilter} onValueChange={setCourseFilter}>
                                <SelectTrigger><SelectValue placeholder="Lọc theo khóa học" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả khóa học</SelectItem>
                                    {courseOptions.map((courseName) => <SelectItem key={courseName} value={courseName}>{courseName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">Không tìm thấy đánh giá phù hợp.</div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((feedback) => (
                                <div key={feedback.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-blue-200">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{feedback.employeeName}</span>
                                            </div>
                                            <p className="text-sm font-medium text-[#0F4C75]">{feedback.courseName} <span className="text-gray-400">({feedback.courseCode})</span></p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>Giảng viên:</span> <StarDisplay rating={feedback.trainerRating} />
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>Khóa học:</span> <StarDisplay rating={feedback.courseRating} />
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
                </>
            )}
        </div>
    );
}
