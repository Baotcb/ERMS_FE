import {
  ShieldCheck,
  Clock,
  Target,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import type { Course } from "@/features/hr/types/course-types";
import type { LearnerQuizResultDto } from "@/features/employee/types/learning-quiz-types";

interface QuizPreExamPanelProps {
  course: Course;
  currentBasePath: string;
  config: {
    timeLimitMinutes: number | null;
    passScore: number | null;
    totalQuestions: number | null;
    maxAttempts: number | null;
    attemptCount: number;
    isWorkshopConfirmed: boolean | null;
  };
  result: LearnerQuizResultDto | null;
  isStarting: boolean;
  onStartQuiz: () => void;
}

export function QuizPreExamPanel({
  course,
  currentBasePath,
  config,
  result,
  isStarting,
  onStartQuiz,
}: QuizPreExamPanelProps) {
  const router = useRouter();
  const isWorkshop = course.isOnline === false;
  const isReadyToStart = !isWorkshop || config.isWorkshopConfirmed === true;

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-start justify-center pt-12 px-4">
      <div className="quiz-confirm-panel space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center mx-auto shadow-lg">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-[#0F3B64]">Kiểm tra cuối khóa</h2>
          <p className="text-sm text-gray-500 mt-1">{course.courseName}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#0F4C75] font-bold mb-0.5">
              <Clock className="w-4 h-4" />{" "}
              {config.timeLimitMinutes ? `${config.timeLimitMinutes} phút` : "Không giới hạn"}
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Thời gian</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#0F4C75] font-bold mb-0.5">
              <Target className="w-4 h-4" /> {config.passScore ?? 80}%
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Điểm đạt</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center">
            <div className="text-[#0F4C75] font-bold mb-0.5">
              {config.totalQuestions ?? "—"} câu
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Số câu hỏi</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center">
            <div className="text-[#0F4C75] font-bold mb-0.5">
              {config.maxAttempts
                ? `${config.maxAttempts - config.attemptCount} lượt`
                : "Không giới hạn"}
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Lượt còn lại</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-left space-y-1.5">
          <p className="text-xs font-bold text-amber-800">Lưu ý quan trọng:</p>
          <ul className="text-xs text-amber-700 space-y-1 list-disc pl-4">
            <li>Không copy/paste trong lúc thi</li>
            <li>Rời tab sẽ bị hệ thống ghi nhận</li>
            {config.timeLimitMinutes ? <li>Hết giờ sẽ tự động nộp bài</li> : null}
          </ul>
        </div>

        {isWorkshop && config.isWorkshopConfirmed === false && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-800">Bài kiểm tra chưa mở</p>
            <p className="text-xs text-red-600 mt-1">
              Đây là khóa học Workshop offline. Bạn cần đợi bộ phận Đào tạo (HR) xác nhận
              Workshop đã diễn ra thành công mới có thể bắt đầu làm bài kiểm tra.
            </p>
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 flex flex-col items-center justify-center space-y-3">
            <div>
              <p className="text-sm font-bold text-blue-900 text-center">
                Lần thi trước: {result.score ?? 0} điểm ({result.correctAnswers ?? 0}/
                {result.totalQuestions ?? 0} câu đúng)
              </p>
              <p className="text-[11px] text-blue-700 font-medium text-center mt-0.5">
                {result.isPassed ? "🎉 Đạt yêu cầu" : "❌ Chưa đạt yêu cầu"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`${currentBasePath}/${course.id}/result`)}
              className="w-full bg-white text-blue-700 hover:bg-blue-100 border-blue-200 rounded-xl text-xs font-semibold h-9"
            >
              Xem chi tiết bài làm trước
            </Button>
          </div>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={
                isStarting ||
                !isReadyToStart ||
                (config.maxAttempts !== null && config.attemptCount >= config.maxAttempts)
              }
              className="w-full bg-gradient-to-r from-[#0F4C75] to-[#3282B8] hover:opacity-90 text-white rounded-xl px-8 py-6 font-bold text-base shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isStarting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="w-5 h-5 mr-2" />
              )}
              Bắt đầu làm bài
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#0F4C75] font-bold">
                Xác nhận bắt đầu thi
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Thời gian làm bài sẽ đếm ngược liên tục. Bạn có chắc chắn muốn bắt đầu lúc này?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:justify-end mt-4">
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl font-semibold">
                  Cần chuẩn bị thêm
                </Button>
              </DialogTrigger>
              <Button
                onClick={onStartQuiz}
                disabled={isStarting}
                className="bg-[#0F4C75] text-white rounded-xl shadow-lg font-bold"
              >
                {isStarting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Đồng ý, bắt đầu ngay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {config.maxAttempts !== null && config.attemptCount >= config.maxAttempts && (
          <p className="text-xs text-red-500 font-medium">Bạn đã dùng hết số lượt làm bài.</p>
        )}
      </div>
    </div>
  );
}
