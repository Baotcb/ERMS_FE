"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { feedbackService } from "@/features/employee/api/feedback-service";

interface CourseFeedbackFormProps {
  courseId: string;
  onSubmitted: () => void;
}

const RATING_LABELS = [
  "",
  "Rất không hài lòng",
  "Không hài lòng",
  "Bình thường",
  "Hài lòng",
  "Rất hài lòng",
];

export function CourseFeedbackForm({
  courseId,
  onSubmitted,
}: CourseFeedbackFormProps) {
  const { toast } = useToast();
  const [courseRating, setCourseRating] = useState(0);
  const [trainerRating, setTrainerRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (courseRating === 0 || trainerRating === 0) {
      toast({
        title: "Vui lòng chọn sao",
        description: "Hãy đánh giá cả khóa học và giảng viên.",
        variant: "destructive",
      });
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
      toast({
        title: "Cảm ơn bạn!",
        description: "Đánh giá của bạn đã được ghi nhận.",
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Không thể gửi đánh giá.";
      toast({ title: "Lỗi", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StarRatingField
          label="Chất lượng khóa học"
          value={courseRating}
          onChange={setCourseRating}
        />
        <StarRatingField
          label="Giảng viên"
          value={trainerRating}
          onChange={setTrainerRating}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#0F4C75]">
          Nhận xét (tùy chọn)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ ý kiến của bạn về khóa học và giảng viên..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3282B8]/30 focus:border-[#3282B8] transition"
          rows={5}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="rounded border-gray-300 text-[#0F4C75] focus:ring-[#3282B8]"
          />
          <span className="text-sm text-gray-600">Gửi đánh giá ẩn danh</span>
        </label>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#0F4C75] to-[#3282B8] hover:from-[#1B262C] hover:to-[#0F4C75] text-white font-bold rounded-xl py-5 shadow-lg transition-all"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Gửi đánh giá
      </Button>
    </div>
  );
}

/* ─── Star Rating Sub-Component with Hover Preview ─── */

function StarRatingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[#0F4C75]">{label}</label>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="relative group transition-transform duration-150 hover:scale-110 active:scale-125"
          >
            <Star
              className={`w-8 h-8 transition-colors duration-150 ${
                star <= displayValue
                  ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                  : "text-gray-300 group-hover:text-amber-200"
              }`}
            />
          </button>
        ))}
        <span
          className={`ml-3 text-sm font-medium transition-opacity duration-150 ${displayValue > 0 ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-amber-500">{displayValue}/5</span>
          <span className="text-gray-400 ml-1">
            — {RATING_LABELS[displayValue]}
          </span>
        </span>
      </div>
    </div>
  );
}
