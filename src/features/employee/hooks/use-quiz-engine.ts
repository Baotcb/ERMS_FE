import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/core/auth/hooks";
import type { Course } from "@/features/hr/types/course-types";
import type {
  LearnerQuizQuestionDto,
  LearnerQuizResultDto,
} from "@/features/employee/types/learning-quiz-types";
import { learningQuizService } from "@/features/employee/api/learning-quiz-service";
import { workshopService } from "@/features/hr/api/workshop-service";
import { quizService } from "@/features/hr/api/quiz-service";
import { parseOptions } from "../components/learning/quiz/quiz-helpers";

export function useQuizEngine({
  initialCourse,
  currentBasePath,
}: {
  initialCourse: Course;
  currentBasePath: string;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  // ─── State ───
  const [attemptId, setAttemptId] = useState("");
  const [questions, setQuestions] = useState<LearnerQuizQuestionDto[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [result, setResult] = useState<LearnerQuizResultDto | null>(null);

  const [quizMaxAttempts, setQuizMaxAttempts] = useState<number | null>(null);
  const [quizAttemptCount, setQuizAttemptCount] = useState(0);
  const [quizPassScore, setQuizPassScore] = useState<number | null>(null);
  const [quizTimeLimitMinutes, setQuizTimeLimitMinutes] = useState<number | null>(null);
  const [quizTotalQuestions, setQuizTotalQuestions] = useState<number | null>(null);

  const [examMode, setExamMode] = useState(false);
  const examContainerRef = useRef<HTMLDivElement>(null);

  const [isWorkshopConfirmed, setIsWorkshopConfirmed] = useState<boolean | null>(null);

  // Cooldown timer
  const [cooldownRemainingSeconds, setCooldownRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!result?.nextAvailableTime) {
      setCooldownRemainingSeconds(null);
      return;
    }
    const updateCooldown = () => {
      const now = new Date().getTime();
      // Ensure backend time is treated as UTC by appending Z if missing
      const timeStr = result.nextAvailableTime!;
      const normalizedTimeStr = timeStr.endsWith("Z") ? timeStr : `${timeStr}Z`;
      const availableAt = new Date(normalizedTimeStr).getTime();
      const diff = Math.floor((availableAt - now) / 1000);
      
      if (diff <= 0) {
        setCooldownRemainingSeconds(null);
      } else {
        setCooldownRemainingSeconds(diff);
      }
    };
    
    updateCooldown();
    const inv = setInterval(updateCooldown, 1000);
    return () => clearInterval(inv);
  }, [result?.nextAvailableTime]);

  // Quiz timer
  const [quizRemainingSeconds, setQuizRemainingSeconds] = useState<number | null>(null);
  const [quizHasTimeLimit, setQuizHasTimeLimit] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => stopTimer, [stopTimer]);

  const startTimer = useCallback(
    (minutes?: number) => {
      stopTimer();
      if (minutes && minutes > 0) {
        setQuizHasTimeLimit(true);
        if (typeof window === "undefined") {
          setQuizRemainingSeconds(minutes * 60);
          return;
        }
        const timerKey = `quiz_timer_${user?.id || "anon"}_${initialCourse.id}`;
        const savedStartedAt = sessionStorage.getItem(timerKey);
        let remainingSec: number;
        if (savedStartedAt) {
          const elapsed = Math.floor((Date.now() - Number(savedStartedAt)) / 1000);
          remainingSec = Math.max(0, minutes * 60 - elapsed);
        } else {
          sessionStorage.setItem(timerKey, String(Date.now()));
          remainingSec = minutes * 60;
        }
        if (remainingSec <= 0) {
          setQuizRemainingSeconds(0);
          return;
        }
        setQuizRemainingSeconds(remainingSec);
        timerRef.current = setInterval(() => {
          setQuizRemainingSeconds((prev) => {
            if (prev === null || prev <= 0) {
              stopTimer();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setQuizHasTimeLimit(false);
        setQuizRemainingSeconds(null);
      }
    },
    [stopTimer, user?.id, initialCourse.id],
  );

  // ─── Derived ───
  const quizQuestions = useMemo(
    () => questions.map((q) => ({ ...q, parsedOptions: parseOptions(q.options) })),
    [questions],
  );
  const answeredCount = useMemo(
    () => quizQuestions.filter((q) => Boolean(answers[q.id])).length,
    [answers, quizQuestions],
  );
  const currentQuestion = quizQuestions[currentQuestionIndex] || null;
  const progressPercent =
    quizQuestions.length > 0
      ? Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100)
      : 0;

  // ─── Anti-cheat ───
  useEffect(() => {
    if (!examMode) return;
    const blockEvent = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const blockKeyboard = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey &&
          ["c", "v", "a", "p", "s", "x", "u"].includes(e.key.toLowerCase())) ||
        e.key === "PrintScreen" ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const handleVisibility = () => {
      if (document.hidden)
        toast({
          title: "⚠️ Cảnh báo",
          description: "Bạn đã rời khỏi tab thi. Hệ thống đã ghi nhận.",
          variant: "destructive",
        });
    };
    document.addEventListener("copy", blockEvent, true);
    document.addEventListener("cut", blockEvent, true);
    document.addEventListener("paste", blockEvent, true);
    document.addEventListener("contextmenu", blockEvent, true);
    document.addEventListener("selectstart", blockEvent, true);
    document.addEventListener("keydown", blockKeyboard, true);
    document.addEventListener("visibilitychange", handleVisibility);
    try {
      examContainerRef.current?.requestFullscreen?.();
    } catch {
      /* browser may block */
    }
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => {
      document.removeEventListener("copy", blockEvent, true);
      document.removeEventListener("cut", blockEvent, true);
      document.removeEventListener("paste", blockEvent, true);
      document.removeEventListener("contextmenu", blockEvent, true);
      document.removeEventListener("selectstart", blockEvent, true);
      document.removeEventListener("keydown", blockKeyboard, true);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handler);
    };
  }, [examMode, toast]);

  const exitExamMode = useCallback(() => {
    setExamMode(false);
    try {
      if (document.fullscreenElement) document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }, []);

  // ─── Data Loading ───
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // Existing result
      try {
        const existingResult = await learningQuizService.getQuizResult(initialCourse.id);
        if (!cancelled && existingResult) {
          setResult(existingResult as LearnerQuizResultDto);
          setQuizAttemptCount(existingResult.attemptCount);
          setQuizMaxAttempts(existingResult.maxAttempts);
        }
      } catch {
        /* no result yet */
      }
      // Restore in-progress quiz
      if (!cancelled) {
        try {
          const storedAttempt = sessionStorage.getItem(
            `quiz_attempt_${user?.id || "anon"}_${initialCourse.id}`,
          );
          if (storedAttempt) {
            const parsed = JSON.parse(storedAttempt) as {
              attemptId: string;
              timeLimitMinutes?: number;
            };
            setAttemptId(parsed.attemptId);
            const qs = await learningQuizService.getQuizQuestions(parsed.attemptId);
            setQuestions(qs);
            // Restore saved answers
            const savedAnswers = sessionStorage.getItem(
              `quiz_answers_${user?.id || "anon"}_${initialCourse.id}`,
            );
            if (savedAnswers) {
              try {
                setAnswers(JSON.parse(savedAnswers) as Record<string, string>);
              } catch {
                /* ignore */
              }
            }
            if (parsed.timeLimitMinutes) startTimer(parsed.timeLimitMinutes);
            setExamMode(true);
          }
        } catch {
          /* ignore */
        }
      }
      // Quiz config
      try {
        const config = await quizService.getCourseQuiz(initialCourse.id);
        if (!cancelled) {
          if (config.maxAttempts) setQuizMaxAttempts(config.maxAttempts);
          setQuizPassScore(config.passingScore ?? null);
          setQuizTimeLimitMinutes(config.timeLimitMinutes ?? null);
          setQuizTotalQuestions(config.totalQuestions ?? null);
        }
      } catch {
        /* ignore */
      }

      // Workshop confirmation check
      if (initialCourse.isOnline === false) {
        try {
          const confirmation = await workshopService.getWorkshopConfirmation(initialCourse.id);
          if (!cancelled) setIsWorkshopConfirmed(!!confirmation);
        } catch {
          if (!cancelled) setIsWorkshopConfirmed(false);
        }
      } else {
        if (!cancelled) setIsWorkshopConfirmed(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [initialCourse.id, initialCourse.isOnline, user?.id, startTimer]);

  // Persist answers to sessionStorage on every change
  useEffect(() => {
    if (!attemptId || Object.keys(answers).length === 0) return;
    sessionStorage.setItem(
      `quiz_answers_${user?.id || "anon"}_${initialCourse.id}`,
      JSON.stringify(answers),
    );
  }, [answers, attemptId, user?.id, initialCourse.id]);

  // ─── Actions ───
  const handleStartQuiz = async () => {
    if (!initialCourse.hasFinalQuiz) {
      toast({ title: "Khóa học không có bài thi", variant: "destructive" });
      return;
    }
    setIsStarting(true);
    try {
      const startResult = await learningQuizService.startQuiz(initialCourse.id);
      setAttemptId(startResult.attemptId);
      const qs = await learningQuizService.getQuizQuestions(startResult.attemptId);
      setQuestions(qs);
      setAnswers({});
      setResult(null);
      setCurrentQuestionIndex(0);
      const timeLimitMinutes = startResult.timeLimitMinutes ?? 0;
      sessionStorage.setItem(
        `quiz_attempt_${user?.id || "anon"}_${initialCourse.id}`,
        JSON.stringify({ attemptId: startResult.attemptId, timeLimitMinutes }),
      );
      if (timeLimitMinutes > 0) startTimer(timeLimitMinutes);
      if (startResult.maxAttempts) setQuizMaxAttempts(startResult.maxAttempts);
      if (startResult.passingScore) setQuizPassScore(startResult.passingScore);
      if (startResult.totalQuestions) setQuizTotalQuestions(startResult.totalQuestions);
      setQuizAttemptCount((p) => p + 1);
      setExamMode(true);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể bắt đầu bài thi.",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitQuiz = async (force = false) => {
    if (!attemptId || quizQuestions.length === 0) {
      toast({ title: "Chưa có lượt làm bài", variant: "destructive" });
      return;
    }
    if (!force && answeredCount !== quizQuestions.length) {
      toast({
        title: "Chưa hoàn tất",
        description: "Vui lòng trả lời tất cả câu hỏi.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const answered = quizQuestions.filter((q) => answers[q.id]);
      const results = await Promise.allSettled(
        answered.map((q) =>
          learningQuizService.submitAnswer(attemptId, {
            questionId: q.id,
            selectedAnswer: answers[q.id],
          }),
        ),
      );
      const failedCount = results.filter((r) => r.status === "rejected").length;
      if (failedCount > 0)
        toast({
          title: "Cảnh báo",
          description: `${failedCount} câu trả lời không gửi được.`,
          variant: "destructive",
        });
      await learningQuizService.submitQuiz(attemptId);
      sessionStorage.removeItem(`quiz_attempt_${user?.id || "anon"}_${initialCourse.id}`);
      sessionStorage.removeItem(`quiz_timer_${user?.id || "anon"}_${initialCourse.id}`);
      sessionStorage.removeItem(`quiz_answers_${user?.id || "anon"}_${initialCourse.id}`);
      exitExamMode();
      router.push(`${currentBasePath}/${initialCourse.id}/result`);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể nộp bài thi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Save answers to backend (for Save & Exit) ───
  const handleSaveAndExit = async () => {
    if (!attemptId) {
      exitExamMode();
      router.push(`${currentBasePath}/${initialCourse.id}`);
      return;
    }
    setIsSaving(true);
    try {
      const answered = quizQuestions.filter((q) => answers[q.id]);
      if (answered.length > 0) {
        await Promise.allSettled(
          answered.map((q) =>
            learningQuizService.submitAnswer(attemptId, {
              questionId: q.id,
              selectedAnswer: answers[q.id],
            }),
          ),
        );
      }
      toast({
        title: "✓ Đã lưu tiến độ",
        description: `${answered.length}/${quizQuestions.length} câu trả lời đã được lưu. Bạn có thể quay lại tiếp tục.`,
      });
    } catch {
      /* ignore save errors */
    } finally {
      setIsSaving(false);
      exitExamMode();
      router.push(`${currentBasePath}/${initialCourse.id}`);
    }
  };

  // Timer auto-submit
  const attemptIdRef = useRef(attemptId);
  const resultRef = useRef(result);
  const isSubmittingRef = useRef(isSubmitting);
  const handleSubmitQuizRef = useRef(handleSubmitQuiz);
  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);
  useEffect(() => {
    resultRef.current = result;
  }, [result]);
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);
  useEffect(() => {
    handleSubmitQuizRef.current = handleSubmitQuiz;
  });
  useEffect(() => {
    if (
      quizRemainingSeconds === 0 &&
      attemptIdRef.current &&
      !resultRef.current &&
      !isSubmittingRef.current
    ) {
      void handleSubmitQuizRef.current(true);
    }
  }, [quizRemainingSeconds]);

  return {
    state: {
      attemptId,
      answers,
      setAnswers,
      currentQuestionIndex,
      setCurrentQuestionIndex,
      isStarting,
      isSubmitting,
      isSaving,
      showSubmitConfirm,
      setShowSubmitConfirm,
      result,
      quizMaxAttempts,
      quizAttemptCount,
      quizPassScore,
      quizTimeLimitMinutes,
      quizTotalQuestions,
      examMode,
      isWorkshopConfirmed,
      quizRemainingSeconds,
      quizHasTimeLimit,
      cooldownRemainingSeconds,
    },
    refs: {
      examContainerRef,
    },
    derived: {
      quizQuestions,
      answeredCount,
      currentQuestion,
      progressPercent,
    },
    actions: {
      handleStartQuiz,
      handleSubmitQuiz,
      handleSaveAndExit,
      exitExamMode,
    },
  };
}
