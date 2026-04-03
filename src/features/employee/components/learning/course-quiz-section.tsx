"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldAlert, ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/core/auth/hooks";
import type { Course } from "@/features/hr/types/course-types";
import type { CourseProgressDto } from "@/features/employee/types/learning-quiz-types";

import { useQuizEngine } from "@/features/employee/hooks/use-quiz-engine";
import { QuizPreExamPanel } from "./quiz/quiz-pre-exam-panel";
import { QuizExamSidebar } from "./quiz/quiz-exam-sidebar";
import { QuizQuestionArea } from "./quiz/quiz-question-area";

export function CourseQuizSection({
  initialCourse,
  initialProgress: _initialProgress = null,
  basePath,
}: {
  initialCourse: Course;
  initialProgress?: CourseProgressDto | null;
  basePath?: string;
}) {
  const currentBasePath = basePath || "/enterprise/employee/learning/course";
  const { user } = useAuth();
  
  const { state, refs, derived, actions } = useQuizEngine({ 
    initialCourse, 
    currentBasePath 
  });

  if (!state.examMode && !state.attemptId) {
    return (
      <QuizPreExamPanel
        course={initialCourse}
        currentBasePath={currentBasePath}
        config={{
          timeLimitMinutes: state.quizTimeLimitMinutes,
          passScore: state.quizPassScore,
          totalQuestions: state.quizTotalQuestions,
          maxAttempts: state.quizMaxAttempts,
          attemptCount: state.quizAttemptCount,
          isWorkshopConfirmed: state.isWorkshopConfirmed,
        }}
        result={state.result}
        isStarting={state.isStarting}
        onStartQuiz={actions.handleStartQuiz}
      />
    );
  }

  return (
    <div
      ref={refs.examContainerRef}
      className="exam-overlay !p-0 flex flex-col"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    >
      {/* Top Bar */}
      <div className="quiz-topbar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#BBE1FA]" />
          </div>
          <div>
            <p className="quiz-topbar__course-name">{initialCourse.courseName}</p>
            <p className="quiz-topbar__module-name">Kiểm tra cuối khóa</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.handleSaveAndExit}
            disabled={state.isSaving}
            className="text-white/60 hover:text-white hover:bg-white/10 text-xs gap-1.5"
          >
            {state.isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />} Lưu & Thoát
          </Button>
          <Avatar className="w-8 h-8 border-2 border-white/20">
            <AvatarFallback className="bg-[#3282B8] text-white text-xs font-bold">
              {(user?.fullName || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Anti-cheat banner */}
      <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center justify-center gap-2 text-xs text-red-700 font-medium">
        <ShieldAlert className="w-3.5 h-3.5" />
        Chế độ thi — cấm copy/paste. Mọi hành vi gian lận đều bị ghi nhận.
      </div>

      {/* Progress Strip */}
      <div className="quiz-progress-strip">
        <span className="text-sm font-bold text-[#0F4C75] whitespace-nowrap">
          Câu {state.currentQuestionIndex + 1} / {derived.quizQuestions.length}
        </span>
        <div className="quiz-progress-strip__bar">
          <div
            className="quiz-progress-strip__fill"
            style={{ width: `${derived.progressPercent}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">
          {derived.progressPercent}% Hoàn thành
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          <QuizExamSidebar
            quizHasTimeLimit={state.quizHasTimeLimit}
            quizRemainingSeconds={state.quizRemainingSeconds}
            answeredCount={derived.answeredCount}
            totalQuestions={derived.quizQuestions.length}
            quizPassScore={state.quizPassScore}
            questions={derived.quizQuestions}
            answers={state.answers}
            currentQuestionIndex={state.currentQuestionIndex}
            showSubmitConfirm={state.showSubmitConfirm}
            isSubmitting={state.isSubmitting}
            onSetCurrentQuestionIndex={state.setCurrentQuestionIndex}
            onSetShowSubmitConfirm={state.setShowSubmitConfirm}
            onSubmitQuiz={() => actions.handleSubmitQuiz(false)}
          />

          <QuizQuestionArea
            currentQuestion={derived.currentQuestion as any}
            currentQuestionIndex={state.currentQuestionIndex}
            totalQuestions={derived.quizQuestions.length}
            selectedAnswer={derived.currentQuestion ? state.answers[derived.currentQuestion.id] : undefined}
            onAnswerSelect={(qId, value) => state.setAnswers((prev: any) => ({ ...prev, [qId]: value }))}
            onPrevious={() => state.setCurrentQuestionIndex((p: number) => Math.max(0, p - 1))}
            onNext={() => state.setCurrentQuestionIndex((p: number) => Math.min(derived.quizQuestions.length - 1, p + 1))}
          />
        </div>
      </div>
    </div>
  );
}
