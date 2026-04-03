import { ShieldCheck, Timer, Clock, AlertTriangle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LearnerQuizQuestionDto } from "@/features/employee/types/learning-quiz-types";

interface QuizExamSidebarProps {
  quizHasTimeLimit: boolean;
  quizRemainingSeconds: number | null;
  answeredCount: number;
  totalQuestions: number;
  quizPassScore: number | null;
  questions: LearnerQuizQuestionDto[];
  answers: Record<string, string>;
  currentQuestionIndex: number;
  showSubmitConfirm: boolean;
  isSubmitting: boolean;
  onSetCurrentQuestionIndex: (index: number) => void;
  onSetShowSubmitConfirm: (show: boolean) => void;
  onSubmitQuiz: () => void;
}

export function QuizExamSidebar({
  quizHasTimeLimit,
  quizRemainingSeconds,
  answeredCount,
  totalQuestions,
  quizPassScore,
  questions,
  answers,
  currentQuestionIndex,
  showSubmitConfirm,
  isSubmitting,
  onSetCurrentQuestionIndex,
  onSetShowSubmitConfirm,
  onSubmitQuiz,
}: QuizExamSidebarProps) {
  // Timer derivations
  const timerMinutes = quizRemainingSeconds !== null ? Math.floor(quizRemainingSeconds / 60) : 0;
  const timerSeconds = quizRemainingSeconds !== null ? quizRemainingSeconds % 60 : 0;
  const timerClass =
    quizRemainingSeconds !== null && quizRemainingSeconds <= 60
      ? "text-red-400"
      : quizRemainingSeconds !== null && quizRemainingSeconds <= 300
        ? "text-amber-400"
        : "text-white";

  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <aside className="quiz-sidebar sticky top-[120px]">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-[#BBE1FA]" />
        </div>
        <h3 className="text-lg font-bold italic text-white">Kiểm tra kiến thức</h3>
        <p className="text-xs text-white/50">Hoàn thành tất cả câu hỏi để đánh giá kiến thức của bạn.</p>
      </div>

      {/* Timer */}
      {quizHasTimeLimit && quizRemainingSeconds !== null && (
        <div className="quiz-sidebar__stat-box">
          <div className="flex items-center justify-center gap-2 text-white/60 text-xs font-semibold mb-1">
            <Timer className="w-3.5 h-3.5" /> Thời gian còn lại
          </div>
          <p className={`text-4xl font-black tracking-tight ${timerClass}`}>
            {timerMinutes}:{String(timerSeconds).padStart(2, "0")}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="quiz-sidebar__stat-box">
          <p className="quiz-sidebar__stat-label">Đã trả lời</p>
          <p className="quiz-sidebar__stat-value">
            {answeredCount}/{totalQuestions}
          </p>
        </div>
        <div className="quiz-sidebar__stat-box">
          <p className="quiz-sidebar__stat-label">Điểm đạt</p>
          <p className="quiz-sidebar__stat-value">{quizPassScore ?? 80}%</p>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-white/60">Tiến độ</span>
          <span className="text-white">{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3282B8] to-[#BBE1FA] transition-all duration-400"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Navigator */}
      <div>
        <p className="text-xs font-semibold text-white/60 mb-2 flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> Điều hướng câu hỏi
        </p>
        <div className="quiz-navigator">
          {questions.map((q, idx) => {
            const isAnswered = Boolean(answers[q.id]);
            const isCurrent = idx === currentQuestionIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSetCurrentQuestionIndex(idx)}
                className={`quiz-nav-btn ${isCurrent ? "quiz-nav-btn--current" : isAnswered ? "quiz-nav-btn--answered" : ""}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-white/40 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-white/15 inline-block" /> Đã trả lời
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-transparent border border-white/15 inline-block" /> Chưa trả lời
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-[#3282B8] inline-block" /> Đang xem
          </span>
        </div>
      </div>

      {/* Warning when not all answered */}
      {answeredCount < totalQuestions && totalQuestions > 0 && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2.5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-200 leading-relaxed">
            Bạn cần trả lời <strong className="text-amber-100">{totalQuestions - answeredCount}</strong> câu nữa trước khi nộp bài.
          </p>
        </div>
      )}

      {/* Submit Button + Inline Confirm (works in fullscreen) */}
      {!showSubmitConfirm ? (
        <Button
          onClick={() => onSetShowSubmitConfirm(true)}
          disabled={isSubmitting || answeredCount < totalQuestions}
          className="w-full bg-white text-[#0F4C75] hover:bg-white/90 rounded-xl py-5 font-bold text-sm shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Nộp bài ({answeredCount}/{totalQuestions})
        </Button>
      ) : (
        <div className="rounded-xl border border-white/20 bg-white/10 p-4 space-y-3">
          <p className="text-sm font-bold text-white">Xác nhận nộp bài?</p>
          <p className="text-xs text-white/60 leading-relaxed">
            Bạn đã trả lời {answeredCount}/{totalQuestions} câu hỏi.
            Sau khi nộp bài, bạn sẽ không thể thay đổi câu trả lời.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onSetShowSubmitConfirm(false)}
              className="flex-1 rounded-xl bg-white/20 text-white hover:bg-white/30 border-0 font-semibold text-xs"
            >
              Kiểm tra lại
            </Button>
            <Button
              size="sm"
              onClick={() => onSubmitQuiz()}
              disabled={isSubmitting}
              className="flex-1 bg-white text-[#0F4C75] hover:bg-white/90 rounded-xl font-bold text-xs"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Đồng ý, nộp bài
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
