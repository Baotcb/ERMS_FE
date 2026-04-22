"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardCheck,
  Trophy,
  Star,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Course } from "@/features/hr/types/course-types";
import { feedbackService } from "@/features/employee/api/feedback-service";
import { learningQuizService } from "@/features/employee/api/learning-quiz-service";
import { CourseFeedbackForm } from "./quiz/course-feedback-form";
import { CourseNavBar } from "./course-nav-bar";
import type { CourseProgressDto } from "@/features/employee/types/learning-quiz-types";
import { FeedbackReplySection } from "./quiz/feedback-reply-section";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const STEPS_WITH_QUIZ = [
  { label: "Bài học", icon: BookOpen },
  { label: "Kiểm tra", icon: ClipboardCheck },
  { label: "Kết quả", icon: Trophy },
  { label: "Đánh giá", icon: Star },
];

const STEPS_WITHOUT_QUIZ = [
  { label: "Bài học", icon: BookOpen },
  { label: "Đánh giá", icon: Star },
];

export function CourseReviewPage({
  initialCourse,
  basePath,
  isClosed = false,
}: {
  initialCourse: Course;
  basePath?: string;
  isClosed?: boolean;
}) {
  const currentBasePath = basePath || "/enterprise/employee/learning/course";
  const router = useRouter();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    feedbackId: number;
    courseRating: number;
    trainerRating: number;
    comment: string | null;
    isAnonymous: boolean;
    createdAt: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);
  const [isQuizNotPassed, setIsQuizNotPassed] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [feedbackCheck, progressData, quizResult] = await Promise.all([
          feedbackService.checkFeedback(initialCourse.id),
          learningQuizService
            .getCourseProgress(initialCourse.id)
            .catch(() => null),
          initialCourse.hasFinalQuiz
            ? learningQuizService
                .getQuizResult(initialCourse.id)
                .catch(() => null)
            : Promise.resolve(null),
        ]);
        setHasSubmitted(feedbackCheck.hasSubmitted);
        if (feedbackCheck.feedbackData) {
          setFeedbackData(feedbackCheck.feedbackData);
        }
        if (progressData) setProgress(progressData);
        if (initialCourse.hasFinalQuiz && !quizResult?.isPassed) {
          setIsQuizNotPassed(true);
        }
      } catch {
        /* ignore */
      } finally {
        setIsChecking(false);
      }
    };
    void init();
  }, [initialCourse.id, initialCourse.hasFinalQuiz]);

  const totalLessons = progress?.totalLessons ?? 0;
  const completedLessons = progress?.completedLessons ?? 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
      <CourseNavBar
        courseId={initialCourse.id}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        isAllLessonsComplete={
          totalLessons > 0 && completedLessons >= totalLessons
        }
        hasQuizResult
        hasLessons={totalLessons > 0}
        basePath={currentBasePath}
        hasFinalQuiz={initialCourse.hasFinalQuiz}
      />

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-medium p-8 text-white shadow-xl">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(187,225,250,0.15) 0%, transparent 40%)",
          }}
        />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[3px] text-brand-secondary/70 mb-2">
            Đánh giá khóa học
          </p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {initialCourse.courseName}
          </h1>
          <p className="text-sm text-white/60 mt-2">
            Mã khóa: {initialCourse.courseCode}
          </p>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress Stepper + Course Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Progress Stepper */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[2px] text-gray-400 mb-4">
              Lộ trình học
            </p>
            <div className="space-y-1">
              {(initialCourse.hasFinalQuiz
                ? STEPS_WITH_QUIZ
                : STEPS_WITHOUT_QUIZ
              ).map((step, idx, arr) => {
                const isActive = idx === arr.length - 1; // Last step (Đánh giá) is current
                const isCompleted = idx < arr.length - 1;
                const Icon = step.icon;
                return (
                  <div
                    key={step.label}
                    className="flex items-center gap-3 relative"
                  >
                    {/* Vertical line */}
                    {idx < arr.length - 1 && (
                      <div
                        className={`absolute left-[15px] top-[32px] w-[2px] h-[20px] ${isCompleted ? "bg-green-400" : "bg-gray-200"}`}
                      />
                    )}
                    {/* Circle */}
                    <div
                      className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isCompleted
                          ? "bg-green-100 text-green-600"
                          : isActive
                            ? "bg-brand-primary text-white shadow-md"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    {/* Label */}
                    <span
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-brand-primary font-bold"
                          : isCompleted
                            ? "text-green-700"
                            : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course Summary Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <p className="text-xs font-bold uppercase tracking-[2px] text-gray-400">
              Thông tin khóa học
            </p>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Mã khóa</span>
                <span className="font-semibold text-brand-primary">
                  {initialCourse.courseCode}
                </span>
              </div>
              {totalLessons > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Bài học</span>
                  <span className="font-semibold text-brand-primary">
                    {completedLessons}/{totalLessons}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Tiến độ</span>
                <span className="font-semibold text-green-600">
                  {progress?.progressPercentage ?? 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Feedback Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
            {isChecking ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-brand-medium" />
                <span className="ml-2 text-sm text-gray-500">
                  Đang kiểm tra...
                </span>
              </div>
            ) : isClosed && !hasSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-black text-brand-primary">
                  Không thể đánh giá
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Kế hoạch đào tạo chứa khóa học này đã kết thúc. Bạn không thể
                  gửi thêm đánh giá mới vào lúc này.
                </p>
              </div>
            ) : isQuizNotPassed ? (
              /* Not Passed Quiz State */
              <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto flex items-center justify-center">
                  <Star className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-black text-brand-primary">
                  Chưa đủ điều kiện đánh giá
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Bạn cần phải hoàn thành và vượt qua bài kiểm tra cuối khóa để
                  có thể đánh giá khóa học này.
                </p>
                <button
                  onClick={() =>
                    router.push(`${currentBasePath}/${initialCourse.id}/quiz`)
                  }
                  className="text-sm text-brand-medium hover:text-brand-primary font-medium mt-4 inline-block transition"
                >
                  ← Đi đến bài kiểm tra
                </button>
              </div>
            ) : hasSubmitted && feedbackData ? (
              /* Already Submitted State with Feedback Details */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h3 className="text-xl font-black text-brand-primary">
                      Đánh giá của bạn
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Cảm ơn bạn đã chia sẻ trải nghiệm!
                    </p>
                  </div>
                  {feedbackData.isAnonymous && (
                    <Badge variant="outline" className="bg-gray-100">
                      Đã gửi ẩn danh
                    </Badge>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-4">
                  <div className="flex gap-6">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Khóa học
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= feedbackData.courseRating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Giảng viên
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= feedbackData.trainerRating ? "fill-blue-500 text-blue-500" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {feedbackData.comment && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap italic">
                        &ldquo;{feedbackData.comment}&rdquo;
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 pt-2">
                    Gửi lúc:{" "}
                    {feedbackData.createdAt
                      ? format(
                          new Date(feedbackData.createdAt),
                          "dd/MM/yyyy HH:mm",
                        )
                      : "Vừa xong"}
                  </p>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    Thảo luận phản hồi
                  </h4>
                  <FeedbackReplySection feedbackId={feedbackData.feedbackId} />
                </div>

                <div className="pt-4 border-t border-gray-100 text-center">
                  <button
                    onClick={() =>
                      router.push(
                        initialCourse.hasFinalQuiz
                          ? `${currentBasePath}/${initialCourse.id}/result`
                          : `${currentBasePath}/${initialCourse.id}`,
                      )
                    }
                    className="text-sm text-brand-medium hover:text-brand-primary font-medium inline-block transition"
                  >
                    ←{" "}
                    {initialCourse.hasFinalQuiz
                      ? "Quay lại kết quả"
                      : "Quay lại bài học"}
                  </button>
                </div>
              </div>
            ) : (
              /* Feedback Form */
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-brand-primary">
                    Chia sẻ trải nghiệm của bạn
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Đánh giá giúp chúng tôi cải thiện chất lượng đào tạo.
                  </p>
                </div>
                <CourseFeedbackForm
                  courseId={initialCourse.id}
                  onSubmitted={async () => {
                    const res = await feedbackService.checkFeedback(
                      initialCourse.id,
                    );
                    if (res.hasSubmitted && res.feedbackData) {
                      setFeedbackData(res.feedbackData);
                    }
                    setHasSubmitted(true);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
