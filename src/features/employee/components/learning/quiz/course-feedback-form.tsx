'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { feedbackService } from '@/features/employee/api/feedback-service';

interface CourseFeedbackFormProps {
    courseId: string;
    onSubmitted: () => void;
}

export function CourseFeedbackForm({ courseId, onSubmitted }: CourseFeedbackFormProps) {
    const { toast } = useToast();
    const [courseRating, setCourseRating] = useState(0);
    const [trainerRating, setTrainerRating] = useState(0);
    const [comment, setComment] = useState('');
    const [anonymous, setAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (courseRating === 0 || trainerRating === 0) {
            toast({ title: 'Vui lòng chọn sao', description: 'Hãy đánh giá cả khóa học và giảng viên.', variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        try {
            await feedbackService.submitFeedback({
                courseId,
                courseRating,
                trainerRating,
                comment: comment || undefined,
                isAnonymous: anonymous,
            });
            onSubmitted();
            toast({ title: 'Cảm ơn bạn!', description: 'Đánh giá của bạn đã được ghi nhận.' });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Không thể gửi đánh giá.';
            toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="learning-card p-6 space-y-5">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Đánh giá</p>
                <h3 className="text-xl font-black text-[#0F3B64]">⭐ Đánh giá khóa học</h3>
                <p className="text-sm text-gray-500 mt-1">Chia sẻ trải nghiệm của bạn để cải thiện chất lượng đào tạo.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <StarRatingField label="Chất lượng khóa học" value={courseRating} onChange={setCourseRating} />
                <StarRatingField label="Giảng viên" value={trainerRating} onChange={setTrainerRating} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0F4C75]">Nhận xét (tùy chọn)</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ ý kiến của bạn về khóa học và giảng viên..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3282B8]/30 focus:border-[#3282B8]"
                    rows={3}
                />
            </div>

            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="rounded border-gray-300" />
                    <span className="text-sm text-gray-600">Gửi đánh giá ẩn danh</span>
                </label>
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#145DA0] hover:bg-[#0F4C75] text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Gửi đánh giá
            </Button>
        </div>
    );
}

/* ─── Star Rating Sub-Component ─── */

function StarRatingField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-[#0F4C75]">{label}</label>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => onChange(star)} className="feedback-star">
                        <Star className={`w-7 h-7 ${star <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                ))}
                <span className="ml-2 text-sm text-gray-500">{value > 0 ? `${value}/5` : ''}</span>
            </div>
        </div>
    );
}
