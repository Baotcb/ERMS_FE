"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  AlertTriangle,
  RotateCcw,
  Star,
  Award,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/features/hr/types/course-types";
import { learningQuizService } from "@/features/employee/api/learning-quiz-service";
import { apiClient } from "@/lib/api-client";
import { CertificateExportDialog } from "./certificate-export-dialog";
import type { CertificateData } from "./certificate-export-dialog";
import { CourseNavBar } from "./course-nav-bar";
import { QuizReviewAnswers } from "./quiz/quiz-review-answers";
import type {
  CourseProgressDto,
  QuizReviewItemDto,
} from "@/features/employee/types/learning-quiz-types";

interface QuizResult {
  score: number;
  isPassed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  attemptCount: number;
  maxAttempts: number | null;
  completedAt: string | null;
  attemptId?: string;
}

interface UserProfile {
  fullName?: string;
  email?: string;
  departmentName?: string;
  enterpriseName?: string;
  enterpriseLogoUrl?: string;
}

export function CourseResultPage({
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
  const { toast } = useToast();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);
  const [reviewItems, setReviewItems] = useState<QuizReviewItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCertDialog, setShowCertDialog] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [quizData, profileRes, progressData] = await Promise.all([
          learningQuizService.getQuizResult(initialCourse.id),
          apiClient
            .get("/api/User/profile")
            .then((r) => (r.ok ? (r.json() as Promise<UserProfile>) : null))
            .catch(() => null),
          learningQuizService
            .getCourseProgress(initialCourse.id)
            .catch(() => null),
        ]);

        if (!quizData) {
          router.replace(`${currentBasePath}/${initialCourse.id}/quiz`);
          return;
        }

        setResult(quizData);
        if (profileRes) setProfile(profileRes);
        if (progressData) setProgress(progressData);

        // Trigger Confetti if passed
        if (quizData.isPassed) {
          const duration = 3 * 1000;
          const end = Date.now() + duration;
          const frame = () => {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              zIndex: 9999,
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              zIndex: 9999,
            });
            if (Date.now() < end) requestAnimationFrame(frame);
          };
          frame();
        }

        // Fetch review data if attemptId is present
        if (quizData.attemptId) {
          try {
            const reviewData = await learningQuizService.getQuizReview(
              quizData.attemptId,
            );
            if (reviewData && reviewData.items) {
              setReviewItems(reviewData.items);
            }
          } catch {
            // Quiz review is optional — silently ignore
          }
        }
      } catch (error) {
        toast({
          title: "Lỗi",
          description:
            error instanceof Error ? error.message : "Không thể tải kết quả.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [initialCourse.id, router, toast, currentBasePath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3282B8]" />
      </div>
    );
  }

  if (!result) return null;

  const canRetry =
    !isClosed &&
    (result.maxAttempts === null || result.attemptCount < result.maxAttempts);
  const totalLessons = progress?.totalLessons ?? 0;
  const completedLessons = progress?.completedLessons ?? 0;

  const certData: CertificateData = {
    learnerName: profile?.fullName || "",
    learnerEmail: profile?.email || "",
    departmentName: profile?.departmentName || "",
    courseName: initialCourse.courseName,
    courseCode: initialCourse.courseCode,
    trainerName: "",
    score: result.score,
    completionDate: result.completedAt
      ? new Date(result.completedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    companyName: profile?.enterpriseName || "",
    companyLogoUrl: profile?.enterpriseLogoUrl || "",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
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

      {/* Result Card */}
      <div
        className={`result-card ${result.isPassed ? "result-card--pass" : "result-card--fail"}`}
      >
        <div className="space-y-4">
          <div
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${result.isPassed ? "bg-green-100" : "bg-amber-100"}`}
          >
            {result.isPassed ? (
              <Trophy className="w-10 h-10 text-green-600" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            )}
          </div>

          <h2
            className={`text-2xl font-black ${result.isPassed ? "text-green-700" : "text-amber-700"}`}
          >
            {result.isPassed ? "Chúc mừng bạn đã đạt!" : "Chưa đạt yêu cầu"}
          </h2>

          <div
            className={`text-6xl font-black ${result.isPassed ? "text-green-600" : "text-amber-600"}`}
          >
            {result.score}%
          </div>

          <p className="text-gray-500 text-sm">
            {result.correctAnswers}/{result.totalQuestions} câu đúng • Lượt thi:{" "}
            {result.attemptCount}
          </p>
        </div>
      </div>

      {/* Answer Review Section */}
      {reviewItems.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <QuizReviewAnswers items={reviewItems} />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        {result.isPassed && (
          <Button
            onClick={() => setShowCertDialog(true)}
            className="bg-gradient-to-r from-[#0F4C75] to-[#3282B8] text-white rounded-xl px-6 py-5 font-bold gap-2 shadow-lg"
          >
            <Award className="w-5 h-5" /> Xuất chứng chỉ
          </Button>
        )}

        {!result.isPassed && canRetry && (
          <Button
            onClick={() =>
              router.push(`${currentBasePath}/${initialCourse.id}/quiz`)
            }
            variant="outline"
            className="rounded-xl px-6 py-5 font-bold gap-2 border-[#0F4C75] text-[#0F4C75]"
          >
            <RotateCcw className="w-4 h-4" /> Làm lại bài thi
          </Button>
        )}

        <Button
          onClick={() =>
            router.push(`${currentBasePath}/${initialCourse.id}/review`)
          }
          variant="outline"
          className="rounded-xl px-6 py-5 font-bold gap-2"
        >
          <Star className="w-4 h-4" /> Đánh giá khóa học
        </Button>
      </div>

      {/* Certificate Dialog */}
      <CertificateExportDialog
        open={showCertDialog}
        onOpenChange={setShowCertDialog}
        data={certData}
      />
    </div>
  );
}
