'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Star, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { feedbackService, type TrainerFeedbackDto } from '@/features/employee/api/feedback-service';

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

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-12 text-right text-gray-500">{label}</span>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-gray-500 text-xs">{count}</span>
        </div>
    );
}

export default function TrainerFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<TrainerFeedbackDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        feedbackService.getTrainerFeedbacks()
            .then(setFeedbacks)
            .catch(() => setFeedbacks([]))
            .finally(() => setLoading(false));
    }, []);

    const stats = useMemo(() => {
        if (feedbacks.length === 0) return { total: 0, avgTrainer: 0, avgCourse: 0, distribution: [0, 0, 0, 0, 0] };
        const avgTrainer = feedbacks.reduce((s, f) => s + f.trainerRating, 0) / feedbacks.length;
        const avgCourse = feedbacks.reduce((s, f) => s + f.courseRating, 0) / feedbacks.length;
        const distribution = [0, 0, 0, 0, 0];
        feedbacks.forEach((f) => { distribution[f.trainerRating - 1]++; });
        return { total: feedbacks.length, avgTrainer: +avgTrainer.toFixed(1), avgCourse: +avgCourse.toFixed(1), distribution };
    }, [feedbacks]);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75]">Đánh giá từ học viên</h1>
                <p className="text-sm text-gray-500">Phản hồi của học viên về các khóa học bạn giảng dạy.</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
            ) : feedbacks.length === 0 ? (
                <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center space-y-3 shadow-sm">
                    <div className="text-4xl">📭</div>
                    <h3 className="text-lg font-bold text-gray-700">Chưa có đánh giá nào</h3>
                    <p className="text-sm text-gray-500">Đánh giá sẽ xuất hiện khi học viên hoàn thành khóa học và gửi phản hồi.</p>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3 text-[#0F4C75] mb-3"><MessageSquare className="w-5 h-5" /> Tổng đánh giá</div>
                            <p className="text-3xl font-bold text-[#0F4C75]">{stats.total}</p>
                        </div>
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
                            <div className="flex items-center gap-3 text-amber-700 mb-3"><Star className="w-5 h-5 fill-amber-400" /> Điểm TB giảng viên</div>
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-bold text-amber-700">{stats.avgTrainer}</p>
                                <span className="text-sm text-amber-600">/5</span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
                            <div className="flex items-center gap-3 text-blue-700 mb-3"><TrendingUp className="w-5 h-5" /> Điểm TB khóa học</div>
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-bold text-blue-700">{stats.avgCourse}</p>
                                <span className="text-sm text-blue-600">/5</span>
                            </div>
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-[#0F4C75] mb-3">Phân bố đánh giá giảng viên</h3>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <RatingBar key={star} label={`${star} ⭐`} count={stats.distribution[star - 1]} total={stats.total} />
                            ))}
                        </div>
                    </div>

                    {/* Feedback List */}
                    <div className="space-y-3">
                        {feedbacks.map((f) => (
                            <div key={f.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-blue-200 transition-colors">
                                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{f.employeeName}</span>
                                        </div>
                                        <p className="text-sm font-medium text-[#0F4C75]">{f.courseName} <span className="text-gray-400">({f.courseCode})</span></p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>Giảng viên:</span> <StarDisplay rating={f.trainerRating} />
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>Khóa học:</span> <StarDisplay rating={f.courseRating} />
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
                </>
            )}
        </div>
    );
}
